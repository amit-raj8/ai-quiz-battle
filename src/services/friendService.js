import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { generatePilotId } from './userService';

// Built-in training rival so solo users can test 1v1 Duels instantly
export const TRAINING_BOT_FRIEND = {
  uid: 'bot_cyber_rival_01',
  pilotId: 'PLT-NEXUS',
  displayName: 'CYBER-NEXUS [AI RIVAL]',
  photoURL: null,
  currentLevel: 5,
  totalBattles: 48,
  status: 'online',
  isBot: true
};

export const friendService = {
  /**
   * Search registered pilots by their Unique Pilot ID (e.g. PLT-XXXX) or display name.
   *
   * @param {string} queryText - Search term
   * @param {string} currentUserId - The searcher's UID (excluded from results)
   * @returns {Promise<Array>} List of matching pilots
   */
  async searchPilots(queryText, currentUserId) {
    if (!queryText || !queryText.trim()) return [];

    const cleanedQuery = queryText.trim().toLowerCase();

    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      if (snapshot.empty) return [];

      const results = [];

      snapshot.docs.forEach(docSnap => {
        if (docSnap.id === currentUserId) return; // Exclude self

        const data = docSnap.data();
        const pilotId = (data.pilotId || generatePilotId(docSnap.id)).toLowerCase();
        const displayName = (data.displayName || '').toLowerCase();
        const email = (data.email || '').toLowerCase();

        if (
          pilotId.includes(cleanedQuery) ||
          displayName.includes(cleanedQuery) ||
          email.includes(cleanedQuery)
        ) {
          results.push({
            uid: docSnap.id,
            pilotId: data.pilotId || generatePilotId(docSnap.id),
            displayName: data.displayName || data.email?.split('@')[0] || 'PILOT',
            photoURL: data.photoURL || null,
            currentLevel: data.currentLevel || 1,
            totalBattles: data.totalBattles || 0,
            status: 'online'
          });
        }
      });

      return results;
    } catch (error) {
      console.warn('[FriendService] Error searching pilots in Firestore:', error);
      return [];
    }
  },

  /**
   * Sends a friend request to a target pilot.
   *
   * @param {Object} currentUser - Current authenticated user profile
   * @param {Object} targetPilot - The user to send the request to
   * @returns {Promise<{ success: boolean, message?: string }>}
   */
  async sendFriendRequest(currentUser, targetPilot) {
    if (!currentUser || !currentUser.uid || !targetPilot || !targetPilot.uid) {
      return { success: false, message: 'Invalid pilot credentials.' };
    }

    if (currentUser.uid === targetPilot.uid) {
      return { success: false, message: 'You cannot send a friend request to yourself.' };
    }

    const requestId = `${currentUser.uid}_${targetPilot.uid}`;
    const requestDocRef = doc(db, 'friendRequests', requestId);

    try {
      // Check if already friends
      const friendDocRef = doc(db, 'users', currentUser.uid, 'friends', targetPilot.uid);
      const friendSnap = await getDoc(friendDocRef);
      if (friendSnap.exists()) {
        return { success: false, message: `Pilot ${targetPilot.displayName} is already in your friends list.` };
      }

      // Check if request already pending
      const reqSnap = await getDoc(requestDocRef);
      if (reqSnap.exists() && reqSnap.data().status === 'pending') {
        return { success: false, message: 'Friend request is already pending.' };
      }

      const payload = {
        requestId,
        fromUid: currentUser.uid,
        fromName: currentUser.displayName || 'PILOT',
        fromPilotId: currentUser.pilotId || generatePilotId(currentUser.uid),
        fromPhotoURL: currentUser.photoURL || null,
        toUid: targetPilot.uid,
        toName: targetPilot.displayName || 'PILOT',
        toPilotId: targetPilot.pilotId || generatePilotId(targetPilot.uid),
        toPhotoURL: targetPilot.photoURL || null,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await setDoc(requestDocRef, payload);
      return { success: true, message: `Friend request dispatched to ${targetPilot.displayName} (${payload.toPilotId})!` };
    } catch (error) {
      console.error('[FriendService] Error sending friend request:', error);
      return { success: false, message: 'Failed to dispatch friend request. Please check connection.' };
    }
  },

  /**
   * Accepts or declines an incoming friend request.
   *
   * @param {string} requestId - The request document ID
   * @param {'accepted' | 'declined'} decision - Decision
   * @param {Object} requestData - The friend request object
   */
  async respondToFriendRequest(requestId, decision, requestData) {
    if (!requestId || !requestData) return false;

    try {
      const requestDocRef = doc(db, 'friendRequests', requestId);

      if (decision === 'declined') {
        await setDoc(requestDocRef, { status: 'declined', respondedAt: serverTimestamp() }, { merge: true });
        return true;
      }

      if (decision === 'accepted') {
        await setDoc(requestDocRef, { status: 'accepted', respondedAt: serverTimestamp() }, { merge: true });

        // Create reciprocal friendship records in both users' collections
        const userAFriendRef = doc(db, 'users', requestData.fromUid, 'friends', requestData.toUid);
        const userBFriendRef = doc(db, 'users', requestData.toUid, 'friends', requestData.fromUid);

        await setDoc(userAFriendRef, {
          uid: requestData.toUid,
          pilotId: requestData.toPilotId,
          displayName: requestData.toName,
          photoURL: requestData.toPhotoURL || null,
          status: 'online',
          addedAt: serverTimestamp()
        });

        await setDoc(userBFriendRef, {
          uid: requestData.fromUid,
          pilotId: requestData.fromPilotId,
          displayName: requestData.fromName,
          photoURL: requestData.fromPhotoURL || null,
          status: 'online',
          addedAt: serverTimestamp()
        });

        return true;
      }
    } catch (error) {
      console.error('[FriendService] Error responding to friend request:', error);
      return false;
    }
  },

  /**
   * Subscribes to the current user's real-time friends list.
   *
   * @param {string} currentUid - User's Firebase UID
   * @param {Function} onUpdate - Callback receiving array of friends
   * @returns {Function} Unsubscribe callback
   */
  subscribeToFriends(currentUid, onUpdate) {
    if (!currentUid) {
      onUpdate([TRAINING_BOT_FRIEND]);
      return () => {};
    }

    try {
      const friendsRef = collection(db, 'users', currentUid, 'friends');
      return onSnapshot(
        friendsRef,
        (snapshot) => {
          const friends = [TRAINING_BOT_FRIEND];
          snapshot.docs.forEach(docSnap => {
            friends.push({
              uid: docSnap.id,
              ...docSnap.data()
            });
          });
          onUpdate(friends);
        },
        (error) => {
          console.warn('[FriendService] Snapshot listener warning for friends:', error);
          onUpdate([TRAINING_BOT_FRIEND]);
        }
      );
    } catch (error) {
      console.warn('[FriendService] Friends subscription fallback:', error);
      onUpdate([TRAINING_BOT_FRIEND]);
      return () => {};
    }
  },

  /**
   * Subscribes to incoming pending friend requests for the current user.
   *
   * @param {string} currentUid - User's Firebase UID
   * @param {Function} onUpdate - Callback receiving array of pending requests
   * @returns {Function} Unsubscribe callback
   */
  subscribeToFriendRequests(currentUid, onUpdate) {
    if (!currentUid) {
      onUpdate([]);
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'friendRequests'),
        where('toUid', '==', currentUid),
        where('status', '==', 'pending')
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const requests = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          onUpdate(requests);
        },
        (error) => {
          console.warn('[FriendService] Snapshot listener warning for requests:', error);
          onUpdate([]);
        }
      );
    } catch (error) {
      console.warn('[FriendService] Friend requests subscription fallback:', error);
      onUpdate([]);
      return () => {};
    }
  }
};
