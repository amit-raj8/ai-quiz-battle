import { userService } from './userService';
import { categoryService } from './categoryService';
import { questionService } from './questionService';
import { leaderboardService } from './leaderboardService';
import { battleHistoryService } from './battleHistoryService';

// Placeholder base URL for future FastAPI backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Service layer wrapping all data operations.
 * UI components interact strictly with this service.
 */
export const quizService = {
  /**
   * Fetch all available quiz categories from Firestore.
   */
  async getCategories() {
    return categoryService.getCategories();
  },

  /**
   * Fetch quiz questions by category, difficulty, and question count limit from Firestore.
   */
  async getQuestions({ categoryId = 'python', difficulty = 'medium', limit = 10 }) {
    return questionService.getQuestionsForBattle({ categoryId, difficulty, limit });
  },

  /**
   * Saves completed battle record to Firestore users/{uid}/battleHistory/{battleId}
   */
  async saveBattle(userId, battleData) {
    return battleHistoryService.saveBattleResult(userId, battleData);
  },

  /**
   * Retrieves player's battle history records from Firestore.
   */
  async getBattleHistory(userId, maxLimit = 20) {
    return battleHistoryService.getBattleHistory(userId, maxLimit);
  },

  /**
   * Subscribes to real-time player battle history records from Firestore.
   */
  subscribeToBattleHistory(userId, onUpdate, onError, maxLimit = 20) {
    return battleHistoryService.subscribeToBattleHistory(userId, onUpdate, onError, maxLimit);
  },

  /**
   * Submit completed quiz session results (legacy/auxiliary helper).
   */
  async submitResults(resultData) {
    return {
      success: true,
      message: 'Results saved successfully!',
      result: resultData
    };
  },

  /**
   * Fetch real dynamic leaderboard rankings from Firestore users collection.
   */
  async getLeaderboard(filterCategory = 'all', currentUserId = null) {
    return leaderboardService.getLeaderboard(currentUserId, filterCategory);
  },

  /**
   * Fetch player profile stats from Firestore.
   */
  async getUserProfile(uid) {
    if (!uid) return null;
    return userService.getUserProfile(uid);
  }
};

/**
 * Helper to simulate realistic async latency in mock mode.
 */
function simulateNetworkDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
