import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { generatePilotId } from './userService';

export const duelService = {
  /**
   * Creates a synchronized 1v1 Battle Room in Firestore.
   */
  async createDuelRoom({
    hostUser,
    guestUser,
    category,
    timePerQuestion = 15,
    questionCount = 5,
    difficulty = 'Medium',
    questions = []
  }) {
    if (!hostUser || !guestUser || !questions || questions.length === 0) {
      throw new Error('Incomplete duel room parameters.');
    }

    const roomId = `duel_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const roomRef = doc(db, 'battleRooms', roomId);

    const isBot = Boolean(guestUser.isBot);

    const payload = {
      roomId,
      category: {
        id: category.id || category.categoryId || 'aptitude',
        name: category.name || category.title || 'Aptitude & Reasoning'
      },
      difficulty,
      timePerQuestion: Number(timePerQuestion) || 15,
      questionCount: Number(questionCount) || questions.length,
      winRule: 'fastest_first_and_accuracy',
      status: isBot ? 'in_progress' : 'invited',
      questions,
      host: {
        uid: hostUser.uid,
        name: hostUser.displayName || 'PILOT HOST',
        pilotId: hostUser.pilotId || generatePilotId(hostUser.uid),
        photoURL: hostUser.photoURL || null,
        score: 0,
        streak: 0,
        currentQuestionIndex: 0,
        answers: [],
        totalTimeTaken: 0,
        completed: false
      },
      guest: {
        uid: guestUser.uid,
        name: guestUser.displayName || 'PILOT GUEST',
        pilotId: guestUser.pilotId || generatePilotId(guestUser.uid),
        photoURL: guestUser.photoURL || null,
        score: 0,
        streak: 0,
        currentQuestionIndex: 0,
        answers: [],
        totalTimeTaken: 0,
        completed: false,
        isBot
      },
      winnerUid: null,
      winnerName: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(roomRef, payload);
    return { roomId, payload };
  },

  /**
   * Subscribes to real-time updates for an active 1v1 Battle Room.
   */
  subscribeToRoom(roomId, onUpdate, onError) {
    if (!roomId) return () => {};

    const roomRef = doc(db, 'battleRooms', roomId);
    return onSnapshot(
      roomRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data());
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        console.warn(`[DuelService] Room listener warning for ${roomId}:`, error);
        if (onError) onError(error);
      }
    );
  },

  /**
   * Subscribes to real-time incoming 1v1 duel challenges for the current user.
   */
  subscribeToIncomingDuelInvites(currentUid, onUpdate) {
    if (!currentUid) {
      onUpdate([]);
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'battleRooms'),
        where('guest.uid', '==', currentUid),
        where('status', '==', 'invited')
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const invites = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          onUpdate(invites);
        },
        (error) => {
          console.warn('[DuelService] Incoming invites listener error:', error);
          onUpdate([]);
        }
      );
    } catch (error) {
      console.warn('[DuelService] Fallback for incoming duel invites:', error);
      onUpdate([]);
      return () => {};
    }
  },

  /**
   * Accepts an incoming duel invite, transitioning room to in_progress.
   */
  async acceptDuelInvite(roomId) {
    if (!roomId) return false;
    try {
      const roomRef = doc(db, 'battleRooms', roomId);
      await updateDoc(roomRef, {
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('[DuelService] Error accepting duel invite:', error);
      return false;
    }
  },

  /**
   * Declines an incoming duel invite.
   */
  async declineDuelInvite(roomId) {
    if (!roomId) return false;
    try {
      const roomRef = doc(db, 'battleRooms', roomId);
      await updateDoc(roomRef, {
        status: 'declined',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('[DuelService] Error declining duel invite:', error);
      return false;
    }
  },

  /**
   * Cancels a pending duel invite initiated by the host.
   */
  async cancelDuelInvite(roomId) {
    if (!roomId) return false;
    try {
      const roomRef = doc(db, 'battleRooms', roomId);
      await updateDoc(roomRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('[DuelService] Error cancelling duel invite:', error);
      return false;
    }
  },

  /**
   * Submits a player's answer in the live 1v1 battle room.
   * Calculates real-time speed bonuses and updates head-to-head match standings.
   */
  async submitDuelAnswer(roomId, playerRole, {
    questionIndex,
    selectedOptionIndex,
    isCorrect,
    timeRemainingSeconds,
    timeTakenSeconds,
    scoreGained
  }) {
    if (!roomId || !playerRole) return null;

    try {
      const roomRef = doc(db, 'battleRooms', roomId);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) return null;

      const roomData = snap.data();
      const currentHost = { ...roomData.host };
      const currentGuest = { ...roomData.guest };
      const target = playerRole === 'host' ? currentHost : currentGuest;

      const updatedScore = target.score + scoreGained;
      const updatedStreak = isCorrect ? target.streak + 1 : 0;
      const updatedTimeTaken = (target.totalTimeTaken || 0) + timeTakenSeconds;
      const updatedAnswers = [
        ...(target.answers || []),
        {
          questionIndex,
          selectedOptionIndex,
          isCorrect,
          timeTakenSeconds,
          scoreGained
        }
      ];

      const isCompleted = questionIndex + 1 >= roomData.questions.length;

      target.score = updatedScore;
      target.streak = updatedStreak;
      target.currentQuestionIndex = questionIndex + 1;
      target.totalTimeTaken = updatedTimeTaken;
      target.answers = updatedAnswers;
      target.completed = isCompleted;

      const updates = {
        [playerRole]: target,
        updatedAt: serverTimestamp()
      };

      // Check if both players have now completed the battle
      const other = playerRole === 'host' ? currentGuest : currentHost;
      if (isCompleted && (other.completed || other.isBot)) {
        updates.status = 'completed';

        // Winner determination: Highest Score, Tiebreaker: Lowest Time Taken
        if (currentHost.score > currentGuest.score) {
          updates.winnerUid = currentHost.uid;
          updates.winnerName = currentHost.name;
        } else if (currentGuest.score > currentHost.score) {
          updates.winnerUid = currentGuest.uid;
          updates.winnerName = currentGuest.name;
        } else {
          // Tiebreaker on speed: who took less total time
          if (currentHost.totalTimeTaken < currentGuest.totalTimeTaken) {
            updates.winnerUid = currentHost.uid;
            updates.winnerName = currentHost.name;
          } else if (currentGuest.totalTimeTaken < currentHost.totalTimeTaken) {
            updates.winnerUid = currentGuest.uid;
            updates.winnerName = currentGuest.name;
          } else {
            updates.winnerUid = 'tie';
            updates.winnerName = 'TIE MATCH';
          }
        }
      }

      await updateDoc(roomRef, updates);
      return { ...roomData, ...updates };
    } catch (error) {
      console.error('[DuelService] Error submitting duel answer:', error);
      return null;
    }
  }
};
