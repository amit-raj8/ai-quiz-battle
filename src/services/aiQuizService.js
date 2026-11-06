/**
 * Frontend Service communicating with the local backend Gemini AI endpoint:
 * POST /api/ai/generate-quiz
 *
 * NOTE: The Gemini API key is strictly server-side and never present here.
 */

import { randomizeQuestionsList } from '../utils/questionRandomizer.js';

let isGenerationInProgress = false;

export const aiQuizService = {
  /**
   * Checks whether an AI generation request is currently active.
   * @returns {boolean}
   */
  isGenerating() {
    return isGenerationInProgress;
  },

  /**
   * Resets the active generation lock (used during cleanup or error recovery).
   */
  resetLock() {
    isGenerationInProgress = false;
  },

  /**
   * Requests Gemini AI to generate validated, structured multiple-choice quiz questions.
   * Implements concurrency lock to guard against double-click or duplicate triggering.
   *
   * @param {Object} params
   * @param {string} params.categoryId - Domain slug (e.g. 'python', 'ai_ml')
   * @param {string} params.categoryName - Domain display name (e.g. 'Python', 'AI & Machine Learning')
   * @param {string} params.difficulty - 'Easy' | 'Medium' | 'Hard'
   * @param {number} params.questionCount - Number of stages (5 - 15)
   * @param {string} [params.generationId] - Unique identifier for this intentional battle generation
   * @returns {Promise<Array>} Array of normalized questions
   */
  async generateAIQuiz({ 
    categoryId = 'python', 
    categoryName = 'Python', 
    difficulty = 'Medium', 
    questionCount = 10,
    generationId = null
  }) {
    if (isGenerationInProgress) {
      console.warn('[AIQuizService] Generation already in progress. Blocking duplicate request.');
      const err = new Error('AI battle generation is currently in progress.');
      err.isDuplicateRequest = true;
      throw err;
    }

    isGenerationInProgress = true;

    const finalGenerationId = generationId || 
      (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s frontend safety timeout

      const response = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categoryId,
          categoryName,
          difficulty,
          questionCount,
          generationId: finalGenerationId
        }),
        signal: controller.signal
      }).catch((fetchErr) => {
        if (fetchErr.name === 'AbortError') {
          throw new Error('AI quiz generation request timed out. Please retry.');
        }
        throw new Error('AI generation service is temporarily unavailable. Please verify connection.');
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok || !data || !data.success) {
        let errorMsg = data?.error;
        if (!errorMsg) {
          if (response.status === 502 || response.status === 503) {
            errorMsg = 'AI Battle engine is temporarily busy or unreachable. Click Retry AI Generation to try again, or switch to Firestore Battle.';
          } else if (response.status === 504) {
            errorMsg = 'AI Battle generation timed out. Please click Retry AI Generation.';
          } else {
            errorMsg = `AI generation failed (status ${response.status}).`;
          }
        }
        console.error('[AIQuizService] Backend error:', errorMsg);
        throw new Error(errorMsg);
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('AI engine returned no battle questions.');
      }

      const diffNormalized = (difficulty || 'Medium').trim().toLowerCase();
      const expectedPoints = diffNormalized === 'hard' ? 200 : diffNormalized === 'easy' ? 100 : 150;
      const canonicalDiff = diffNormalized === 'hard' ? 'Hard' : diffNormalized === 'easy' ? 'Easy' : 'Medium';

      const rawQuestions = data.questions.map((q, idx) => ({
        id: q.id || `ai_${Date.now()}_${idx}`,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || 'Technical analysis unavailable.',
        points: expectedPoints, // Score safety: enforce canonical points per difficulty
        difficulty: canonicalDiff,
        categoryId: categoryId || 'general'
      }));

      return randomizeQuestionsList(rawQuestions);

    } catch (error) {
      console.error('[AIQuizService] Failed to generate AI quiz battle:', error.message || error);
      throw error;
    } finally {
      isGenerationInProgress = false;
    }
  }
};

