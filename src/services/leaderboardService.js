import { 
  collection, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { generatePilotId, cleanNumericPilotId } from './userService';

/**
 * Service managing real dynamic leaderboard standings from the Firestore "users" collection.
 */
export const leaderboardService = {
  /**
   * Fetches real user profiles from Firestore, sorted by totalScore in descending order.
   * Dynamically assigns rank (#1, #2, #3, etc.) and tags the currently authenticated user.
   *
   * @param {string} [currentUserId=null] - Firebase Auth UID of the current user
   * @param {string} [filterType='all'] - Optional filter ('all', 'top10', 'elite', 'veterans')
   * @returns {Promise<Array>} List of ranked players
   */
  async getLeaderboard(currentUserId = null, filterType = 'all') {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      if (snapshot.empty) {
        return [];
      }

      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        const accNum = typeof data.accuracy === 'number' ? Math.round(data.accuracy) : parseInt(data.accuracy, 10) || 0;
        const totalBattles = Number(data.totalBattles) || 0;
        const wins = Number(data.totalWins ?? data.wins ?? Math.max(0, Math.round(totalBattles * (accNum / 100)))) || 0;
        return {
          id: doc.id,
          uid: doc.id,
          pilotId: cleanNumericPilotId(data.pilotId, doc.id),
          name: data.displayName || data.email?.split('@')[0] || 'PILOT',
          displayName: data.displayName || data.email?.split('@')[0] || 'PILOT',
          email: data.email || '',
          avatar: data.photoURL || null,
          photoURL: data.photoURL || null,
          score: data.totalScore || 0,
          totalScore: data.totalScore || 0,
          accuracy: accNum,
          accuracyFormatted: `${accNum}%`,
          accuracyNumber: accNum,
          streak: data.maxBoost || 0,
          maxBoost: data.maxBoost || 0,
          level: data.currentLevel || 1,
          currentLevel: data.currentLevel || 1,
          totalBattles,
          totalWins: wins,
          wins,
          isCurrentPlayer: Boolean(currentUserId && doc.id === currentUserId)
        };
      });

      // Sort by totalScore DESC, then by maxBoost DESC, then by accuracy DESC
      users.sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.maxBoost !== a.maxBoost) return b.maxBoost - a.maxBoost;
        return b.accuracyNumber - a.accuracyNumber;
      });

      // Assign dynamic global ranks (#1, #2, #3...)
      const rankedUsers = users.map((user, idx) => ({
        ...user,
        rank: idx + 1
      }));

      // Apply filter if specified
      if (filterType === 'top10') {
        return rankedUsers.slice(0, 10);
      } else if (filterType === 'elite') {
        return rankedUsers.filter(u => u.currentLevel >= 5);
      } else if (filterType === 'veterans') {
        return rankedUsers.filter(u => u.currentLevel >= 10);
      }

      return rankedUsers;
    } catch (error) {
      console.warn('[LeaderboardService] Failed to fetch leaderboard (may be unauthenticated):', error);
      return [];
    }
  },

  /**
   * Subscribes to real-time updates for the leaderboard rankings.
   *
   * @param {string} [currentUserId=null] - Current user's UID
   * @param {Function} onUpdate - Callback receiving sorted ranked players array
   * @param {Function} [onError] - Optional error handler
   * @returns {Function} Unsubscribe listener
   */
  subscribeToLeaderboard(currentUserId = null, onUpdate, onError) {
    const usersRef = collection(db, 'users');
    return onSnapshot(
      usersRef,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate([]);
          return;
        }

        const users = snapshot.docs.map(doc => {
          const data = doc.data();
          const accNum = typeof data.accuracy === 'number' ? Math.round(data.accuracy) : parseInt(data.accuracy, 10) || 0;
          const totalBattles = Number(data.totalBattles) || 0;
          const wins = Number(data.totalWins ?? data.wins ?? Math.max(0, Math.round(totalBattles * (accNum / 100)))) || 0;
          return {
            id: doc.id,
            uid: doc.id,
            pilotId: cleanNumericPilotId(data.pilotId, doc.id),
            name: data.displayName || data.email?.split('@')[0] || 'PILOT',
            displayName: data.displayName || data.email?.split('@')[0] || 'PILOT',
            email: data.email || '',
            avatar: data.photoURL || null,
            photoURL: data.photoURL || null,
            score: data.totalScore || 0,
            totalScore: data.totalScore || 0,
            accuracy: accNum,
            accuracyFormatted: `${accNum}%`,
            accuracyNumber: accNum,
            streak: data.maxBoost || 0,
            maxBoost: data.maxBoost || 0,
            level: data.currentLevel || 1,
            currentLevel: data.currentLevel || 1,
            totalBattles,
            totalWins: wins,
            wins,
            isCurrentPlayer: Boolean(currentUserId && doc.id === currentUserId)
          };
        });

        // Sort descending by totalScore
        users.sort((a, b) => {
          if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
          if (b.maxBoost !== a.maxBoost) return b.maxBoost - a.maxBoost;
          return b.accuracyNumber - a.accuracyNumber;
        });

        // Assign dynamic ranks
        const rankedUsers = users.map((user, idx) => ({
          ...user,
          rank: idx + 1
        }));

        onUpdate(rankedUsers);
      },
      (error) => {
        console.warn('[LeaderboardService] Leaderboard snapshot error (may be unauthenticated):', error);
        onUpdate([]);
        if (onError) onError(error);
      }
    );
  },

  /**
   * Calculates the real global rank for a given user UID based on current Firestore users collection.
   *
   * @param {string} uid - User's UID
   * @returns {Promise<number|null>}
   */
  async getUserRank(uid) {
    if (!uid) return null;
    try {
      const rankedUsers = await this.getLeaderboard();
      const userIndex = rankedUsers.findIndex(u => u.uid === uid);
      return userIndex >= 0 ? userIndex + 1 : 1;
    } catch (error) {
      console.error(`[Firestore Error] Failed to calculate rank for user ${uid}:`, error);
      return null;
    }
  }
};
