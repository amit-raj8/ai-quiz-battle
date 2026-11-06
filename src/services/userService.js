import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Deterministically generates a unique, human-readable Pilot ID (e.g. PLT-4B29E1).
 *
 * @param {string} uid - Firebase Auth UID
 * @returns {string} Unique Pilot ID
 */
export function generatePilotId(uid) {
  if (!uid) return 'PLT-ALPHA1';
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = ((hash << 5) - hash) + uid.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(4, '0');
  const tail = uid.replace(/[^a-zA-Z0-9]/g, '').slice(-2).toUpperCase();
  return `PLT-${hex.slice(0, 4)}${tail || 'X'}`;
}

/**
 * Service managing user profiles and telemetry statistics in Firebase Firestore.
 */
export const userService = {
  /**
   * Creates a user document in the "users" collection if it doesn't already exist.
   * If it already exists, updates lastLogin and metadata without resetting any statistics.
   * Uses user.uid as the Firestore document ID.
   *
   * @param {Object} user - The Firebase Auth User object
   * @param {Object} [additionalData={}] - Additional profile data such as custom displayName
   * @returns {Promise<Object>} The user profile data
   */
  async createOrUpdateUserDocument(user, additionalData = {}) {
    if (!user || !user.uid) return null;

    const pilotId = generatePilotId(user.uid);

    const fallbackData = {
      uid: user.uid,
      pilotId,
      displayName: additionalData.displayName?.trim() || user.displayName || user.email?.split('@')[0] || 'PILOT',
      email: user.email || '',
      photoURL: user.photoURL || null,
      totalBattles: 0,
      totalWins: 0,
      totalScore: 0,
      bestScore: 0,
      accuracy: 0,
      currentLevel: 1,
      xp: 0,
      maxBoost: 0
    };

    const userDocRef = doc(db, 'users', user.uid);
    
    try {
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        // 1. Initial creation for new user
        const newUserData = {
          ...fallbackData,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        };

        await setDoc(userDocRef, newUserData);
        return newUserData;
      } else {
        // 2. Existing user - update lastLogin and sync profile metadata without resetting existing stats
        const existingData = docSnap.data();
        const updatePayload = {
          lastLogin: serverTimestamp()
        };

        if (!existingData.pilotId) {
          updatePayload.pilotId = pilotId;
        }

        if (additionalData.displayName?.trim() && additionalData.displayName.trim() !== existingData.displayName) {
          updatePayload.displayName = additionalData.displayName.trim();
        } else if (!existingData.displayName && user.displayName) {
          updatePayload.displayName = user.displayName;
        }

        if (user.photoURL && user.photoURL !== existingData.photoURL) {
          updatePayload.photoURL = user.photoURL;
        }

        await updateDoc(userDocRef, updatePayload);
        return { ...existingData, ...updatePayload };
      }
    } catch (error) {
      console.warn('[Firestore] Notice during user profile sync (using fallback):', error.message || error);
      return fallbackData;
    }
  },

  /**
   * Fetches user document by UID from Firestore.
   *
   * @param {string} uid - Firebase Auth UID
   * @returns {Promise<Object|null>}
   */
  async getUserProfile(uid) {
    if (!uid) return null;
    try {
      const userDocRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.warn(`[Firestore] Failed to fetch user profile ${uid}:`, error.message || error);
      return null;
    }
  },

  /**
   * Subscribes to real-time updates for a user's Firestore document.
   *
   * @param {string} uid - Firebase Auth UID
   * @param {Function} onUpdate - Callback receiving the updated profile data
   * @param {Function} [onError] - Optional error callback
   * @returns {Function} Unsubscribe function
   */
  subscribeToUserProfile(uid, onUpdate, onError) {
    if (!uid) {
      onUpdate(null);
      return () => {};
    }
    const userDocRef = doc(db, 'users', uid);
    return onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data());
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        console.error(`[Firestore Error] Snapshot listener error for user ${uid}:`, error);
        if (onError) onError(error);
      }
    );
  },

  /**
   * Updates user statistics in Firestore after completing a quiz battle.
   * Preserves all existing statistics and calculates updated career metrics.
   *
   * @param {string} uid - Firebase Auth UID
   * @param {Object} summary - Battle summary metrics
   * @param {Object} [config={}] - Quiz battle configuration
   */
  async updateUserStatsAfterBattle(uid, summary, config = {}) {
    if (!uid || !summary) return null;

    try {
      const userDocRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) return null;

      const current = docSnap.data();
      const battleScore = Number(summary.totalScore ?? summary.score) || 0;
      const battleAccuracy = Number(summary.accuracy) || 0;
      const battleStreak = Number(summary.maxStreak) || 0;
      const battleXp = Number(summary.xpEarned ?? summary.totalScore ?? summary.score) || 0;

      const prevBattles = Number(current.totalBattles) || 0;
      const newTotalBattles = prevBattles + 1;
      const newTotalScore = (Number(current.totalScore) || 0) + battleScore;
      const newBestScore = Math.max(Number(current.bestScore) || 0, battleScore);
      const newMaxBoost = Math.max(Number(current.maxBoost) || 0, battleStreak);
      
      // Calculate weighted career accuracy
      const prevAcc = Number(current.accuracy) || 0;
      const newAccuracy = Math.round(((prevAcc * prevBattles) + battleAccuracy) / newTotalBattles);

      // XP & Level calculations (500 XP per level progression)
      const newXp = (Number(current.xp) || 0) + battleXp;
      const newCurrentLevel = Math.max(Number(current.currentLevel) || 1, Math.floor(newXp / 500) + 1);

      // Win calculation: Passing score / accuracy >= 50% counts as victory
      const isWin = summary.isWin !== undefined 
        ? Boolean(summary.isWin) 
        : (battleAccuracy >= 50 || (Number(summary.correctAnswers) >= Math.ceil(Number(summary.totalQuestions || 1) / 2)));
      const prevWins = Number(current.totalWins ?? current.wins ?? Math.max(0, Math.round(prevBattles * (prevAcc / 100)))) || 0;
      const newTotalWins = isWin ? prevWins + 1 : prevWins;

      const updates = {
        totalBattles: newTotalBattles,
        totalWins: newTotalWins,
        wins: newTotalWins,
        totalScore: newTotalScore,
        bestScore: newBestScore,
        maxBoost: newMaxBoost,
        accuracy: newAccuracy,
        xp: newXp,
        currentLevel: newCurrentLevel,
        lastLogin: serverTimestamp()
      };

      await updateDoc(userDocRef, updates);
      return updates;
    } catch (error) {
      console.error(`[Firestore Error] Failed to update stats for user ${uid}:`, error);
      return null;
    }
  }
};
