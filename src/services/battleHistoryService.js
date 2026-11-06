import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit as firestoreLimit, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { userService } from './userService';

/**
 * Service managing real-time Battle History documents stored in Firestore:
 * Path: users/{uid}/battleHistory/{battleId}
 */
export const battleHistoryService = {
  /**
   * Saves a completed battle record under users/{uid}/battleHistory/{battleId}
   * and updates the user's lifetime telemetry statistics idempotently.
   *
   * @param {string} userId - Firebase Auth UID
   * @param {Object} battleData - Complete battle payload
   * @returns {Promise<Object>} The saved battle record and status
   */
  async saveBattleResult(userId, battleData) {
    if (!userId || !battleData) {
      console.warn('[BattleHistoryService] Cannot save battle: Missing userId or battleData');
      return { success: false, reason: 'unauthenticated_or_invalid_payload' };
    }

    const battleId = battleData.battleId || `battle_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const battleDocRef = doc(db, 'users', userId, 'battleHistory', battleId);

    try {
      // 1. Idempotency Check: Verify if this battle has already been written
      const existingDocSnap = await getDoc(battleDocRef);
      if (existingDocSnap.exists()) {
        console.log(`[BattleHistoryService] Battle ${battleId} already saved. Skipping duplicate write.`);
        return {
          success: true,
          isDuplicate: true,
          battleId,
          data: existingDocSnap.data()
        };
      }

      // 2. Prepare standardized Firestore document payload
      const firestorePayload = {
        battleId,
        userId,
        battleSource: battleData.battleSource || 'firestore',
        categoryId: battleData.categoryId || 'python',
        categoryName: battleData.categoryName || 'Python',
        difficulty: battleData.difficulty || 'medium',
        totalQuestions: Number(battleData.totalQuestions) || 0,
        attemptedQuestions: Number(battleData.attemptedQuestions) || 0,
        correctAnswers: Number(battleData.correctAnswers) || 0,
        incorrectAnswers: Number(battleData.incorrectAnswers) || 0,
        score: Number(battleData.score) || 0,
        accuracy: Number(battleData.accuracy) || 0,
        maxStreak: Number(battleData.maxStreak) || 0,
        xpEarned: Number(battleData.xpEarned) || Number(battleData.score) || 0,
        completedAt: serverTimestamp()
      };

      // 3. Write document to subcollection
      await setDoc(battleDocRef, firestorePayload);

      // 4. Atomically update user's lifetime statistics in users/{uid}
      await userService.updateUserStatsAfterBattle(userId, {
        score: firestorePayload.score,
        totalScore: firestorePayload.score,
        accuracy: firestorePayload.accuracy,
        maxStreak: firestorePayload.maxStreak,
        xpEarned: firestorePayload.xpEarned,
        totalQuestions: firestorePayload.totalQuestions,
        correctAnswers: firestorePayload.correctAnswers
      }, {
        categoryId: firestorePayload.categoryId,
        categoryName: firestorePayload.categoryName,
        difficulty: firestorePayload.difficulty
      });

      return {
        success: true,
        isDuplicate: false,
        battleId,
        data: firestorePayload
      };
    } catch (error) {
      console.error(`[BattleHistoryService] Error saving battle ${battleId} for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Fetches real battle history list from users/{uid}/battleHistory ordered by completedAt DESC.
   *
   * @param {string} userId - Firebase Auth UID
   * @param {number} [maxCount=20] - Maximum records to retrieve
   * @returns {Promise<Array>} Array of formatted battle items
   */
  async getBattleHistory(userId, maxCount = 20) {
    if (!userId) return [];

    try {
      const historyCollectionRef = collection(db, 'users', userId, 'battleHistory');
      const q = query(
        historyCollectionRef,
        orderBy('completedAt', 'desc'),
        firestoreLimit(maxCount)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map(docSnap => formatBattleDoc(docSnap));
    } catch (error) {
      console.error(`[BattleHistoryService] Failed to fetch history for ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Subscribes to real-time battle history updates for a specific user.
   *
   * @param {string} userId - Firebase Auth UID
   * @param {Function} onUpdate - Callback receiving battle array
   * @param {Function} [onError] - Optional error handler
   * @param {number} [maxCount=20] - Max limit of battles
   * @returns {Function} Unsubscribe listener
   */
  subscribeToBattleHistory(userId, onUpdate, onError, maxCount = 20) {
    if (!userId) {
      onUpdate([]);
      return () => {};
    }

    const historyCollectionRef = collection(db, 'users', userId, 'battleHistory');
    const q = query(
      historyCollectionRef,
      orderBy('completedAt', 'desc'),
      firestoreLimit(maxCount)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate([]);
          return;
        }

        const battles = snapshot.docs.map(docSnap => formatBattleDoc(docSnap));
        onUpdate(battles);
      },
      (error) => {
        console.error(`[BattleHistoryService] Snapshot listener error for user ${userId}:`, error);
        if (onError) onError(error);
      }
    );
  }
};

/**
 * Normalizes Firestore battle document data and formats timestamps cleanly.
 */
function formatBattleDoc(docSnap) {
  const data = docSnap.data();
  let formattedDate = 'Recent';

  if (data.completedAt) {
    if (typeof data.completedAt.toDate === 'function') {
      const d = data.completedAt.toDate();
      formattedDate = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } else if (data.completedAt instanceof Date) {
      formattedDate = data.completedAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  return {
    id: docSnap.id,
    battleId: data.battleId || docSnap.id,
    userId: data.userId || '',
    battleSource: data.battleSource || 'firestore',
    categoryId: data.categoryId || 'general',
    categoryName: data.categoryName || 'General',
    difficulty: data.difficulty || 'medium',
    totalQuestions: data.totalQuestions || 0,
    attemptedQuestions: data.attemptedQuestions || 0,
    correctAnswers: data.correctAnswers || 0,
    incorrectAnswers: data.incorrectAnswers || 0,
    score: data.score || 0,
    accuracy: data.accuracy || 0,
    maxStreak: data.maxStreak || 0,
    xpEarned: data.xpEarned || data.score || 0,
    completedAt: data.completedAt || null,
    date: formattedDate
  };
}
