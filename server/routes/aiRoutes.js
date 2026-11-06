import { Router } from 'express';
import { geminiService } from '../services/geminiService.js';

const router = Router();

const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard'];

/**
 * POST /api/ai/generate-quiz
 *
 * Endpoint to generate structured multiple-choice quiz questions using Gemini AI.
 * Strict parameter validation: accepts only categoryId, categoryName, difficulty, and questionCount.
 */
router.post('/generate-quiz', async (req, res) => {
  try {
    const { categoryId, categoryName, difficulty, questionCount } = req.body || {};

    // 1. Validate Category
    const catName = typeof categoryName === 'string' ? categoryName.trim() : '';
    const catId = typeof categoryId === 'string' ? categoryId.trim() : '';
    const finalCategoryName = catName || catId;

    if (!finalCategoryName || finalCategoryName.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing category. Must be a valid category name string (1-100 characters).'
      });
    }

    const finalCategoryId = catId || finalCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    // 2. Validate Difficulty
    const diffStr = (typeof difficulty === 'string' ? difficulty : '').trim().toLowerCase();
    if (!diffStr || !ALLOWED_DIFFICULTIES.includes(diffStr)) {
      return res.status(400).json({
        success: false,
        error: `Invalid difficulty "${difficulty}". Allowed values: Easy, Medium, Hard.`
      });
    }

    // 3. Validate Question Count
    const count = Number(questionCount);
    if (isNaN(count) || !Number.isInteger(count) || count < 5 || count > 15) {
      return res.status(400).json({
        success: false,
        error: 'Invalid questionCount. Must be an integer between 5 and 15.'
      });
    }

    const normalizedDifficulty = diffStr.charAt(0).toUpperCase() + diffStr.slice(1);
    const genId = typeof req.body?.generationId === 'string' ? req.body.generationId.trim().slice(0, 100) : '';

    // 4. Generate AI Questions via Gemini Service
    const result = await geminiService.generateQuizQuestions({
      categoryName: finalCategoryName,
      categoryId: finalCategoryId,
      difficulty: normalizedDifficulty,
      questionCount: count,
      generationId: genId
    });

    return res.status(200).json({
      success: true,
      generationId: result.generationId || genId,
      categoryId: finalCategoryId,
      categoryName: finalCategoryName,
      difficulty: normalizedDifficulty,
      questionCount: result.questions.length,
      questions: result.questions
    });

  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'An unexpected error occurred while generating quiz telemetry.';

    return res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
});

export default router;
