import { getDomainCalibration, isTextDomainRelevant } from '../config/domainCalibration.js';

/**
 * Normalizes a text string by trimming, lowercasing, and collapsing all contiguous whitespace.
 *
 * @param {string} str - Raw input string
 * @returns {string} Normalized string
 */
export function normalizeText(str) {
  if (typeof str !== 'string') return '';
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Validates AI-generated quiz questions against strict quality, structural, anti-duplicate,
 * and category-specific relevance criteria.
 *
 * Every question must satisfy:
 * - question is a non-empty string
 * - exactly 4 options
 * - all 4 options are unique (whitespace and case normalized)
 * - correctAnswer exactly matches one of the 4 options
 * - explanation is a non-empty string
 * - points strictly enforced: Easy = 100, Medium = 150, Hard = 200
 * - no duplicate questions in the same generated battle set
 * - questions relevant to the requested category domain
 *
 * @param {Object} quizData - Parsed JSON object from Gemini
 * @param {Object} params - Requested quiz parameters
 * @param {number} params.expectedCount - Number of questions requested
 * @param {string} params.difficulty - Requested difficulty ('Easy' | 'Medium' | 'Hard')
 * @param {string} [params.categoryName] - Domain name (e.g. 'Python', 'JavaScript', 'AI & Machine Learning')
 * @param {string} [params.categoryId] - Domain slug (e.g. 'python', 'javascript', 'ai_ml')
 * @returns {{ isValid: boolean, errors: string[], sanitizedQuestions: Array }}
 */
export function validateQuizQuestions(quizData, { expectedCount, difficulty = 'Medium', categoryName = '', categoryId = '' }) {
  const errors = [];

  if (!quizData || typeof quizData !== 'object') {
    return { isValid: false, errors: ['Response is not a valid JSON object'], sanitizedQuestions: [] };
  }

  const rawQuestions = Array.isArray(quizData.questions) 
    ? quizData.questions 
    : (Array.isArray(quizData) ? quizData : null);

  if (!rawQuestions) {
    return { isValid: false, errors: ['"questions" array is missing or invalid'], sanitizedQuestions: [] };
  }

  if (rawQuestions.length !== expectedCount) {
    errors.push(`Expected ${expectedCount} questions, but received ${rawQuestions.length}`);
  }

  const diffNormalized = (difficulty || 'Medium').trim().toLowerCase();
  const canonicalDifficulty = diffNormalized === 'hard' ? 'Hard' : diffNormalized === 'easy' ? 'Easy' : 'Medium';
  const expectedPoints = canonicalDifficulty === 'Hard' ? 200 : canonicalDifficulty === 'Medium' ? 150 : 100;

  const domainConfig = getDomainCalibration(categoryId || categoryName);

  const sanitizedQuestions = [];
  const seenQuestionTexts = new Set();

  rawQuestions.forEach((q, index) => {
    const qNum = index + 1;

    // 1. Validate Question Text
    if (!q || typeof q !== 'object') {
      errors.push(`Question #${qNum}: Invalid question entry structure`);
      return;
    }

    if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
      errors.push(`Question #${qNum}: Missing or empty question text`);
      return;
    }

    const trimmedQuestion = q.question.trim();
    const normalizedQText = normalizeText(trimmedQuestion);

    // 2. Duplicate Question Detection
    if (seenQuestionTexts.has(normalizedQText)) {
      errors.push(`Question #${qNum}: Duplicate question detected in battle set ("${trimmedQuestion}")`);
      return;
    }
    seenQuestionTexts.add(normalizedQText);

    // 3. Validate Options Array
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`Question #${qNum}: Must have exactly 4 options (received ${Array.isArray(q.options) ? q.options.length : 0})`);
      return;
    }

    // 4. Ensure All Options Are Non-Empty Strings
    const cleanedOptions = q.options.map(opt => (typeof opt === 'string' ? opt.trim() : String(opt || '').trim()));
    if (cleanedOptions.some(opt => !opt)) {
      errors.push(`Question #${qNum}: Contains empty option string`);
      return;
    }

    // 5. Ensure Options Are Unique (case and whitespace normalized)
    const seenOptionTexts = new Set();
    let hasDuplicateOption = false;
    cleanedOptions.forEach(opt => {
      const normOpt = normalizeText(opt);
      if (seenOptionTexts.has(normOpt)) {
        hasDuplicateOption = true;
      }
      seenOptionTexts.add(normOpt);
    });

    if (hasDuplicateOption || seenOptionTexts.size !== 4) {
      errors.push(`Question #${qNum}: Options contain duplicate values`);
      return;
    }

    // 6. Validate Correct Answer
    if (!q.correctAnswer || typeof q.correctAnswer !== 'string' || !q.correctAnswer.trim()) {
      errors.push(`Question #${qNum}: Missing correct answer`);
      return;
    }

    const trimmedAnswer = q.correctAnswer.trim();
    const normalizedAnswer = normalizeText(trimmedAnswer);
    const answerMatchIndex = cleanedOptions.findIndex(
      opt => normalizeText(opt) === normalizedAnswer
    );

    if (answerMatchIndex === -1) {
      errors.push(`Question #${qNum}: correctAnswer "${trimmedAnswer}" does not match any of the 4 options`);
      return;
    }

    // Normalize correctAnswer to verbatim matched option string
    const exactCorrectAnswer = cleanedOptions[answerMatchIndex];

    // 7. Validate Explanation
    if (!q.explanation || typeof q.explanation !== 'string' || !q.explanation.trim()) {
      errors.push(`Question #${qNum}: Missing or empty technical explanation`);
      return;
    }
    const explanation = q.explanation.trim();

    // 8. Multi-Domain Category Relevance Check
    if (domainConfig) {
      const combinedText = `${trimmedQuestion} ${cleanedOptions.join(' ')} ${explanation}`.toLowerCase();
      const isRelevant = isTextDomainRelevant(combinedText, domainConfig);
      if (!isRelevant) {
        errors.push(`Question #${qNum}: Question does not contain relevant concepts for category "${domainConfig.name}"`);
        return;
      }
    }

    // 9. Enforce Points by Difficulty (Server-side score safety)
    const points = expectedPoints;

    // 10. Randomize / shuffle the 4 options using Fisher-Yates so option positions (A, B, C, D) are completely uniform
    const shuffledOptions = [...cleanedOptions];
    for (let s = shuffledOptions.length - 1; s > 0; s--) {
      const r = Math.floor(Math.random() * (s + 1));
      [shuffledOptions[s], shuffledOptions[r]] = [shuffledOptions[r], shuffledOptions[s]];
    }

    sanitizedQuestions.push({
      id: `ai_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
      question: trimmedQuestion,
      options: shuffledOptions,
      correctAnswer: exactCorrectAnswer,
      explanation,
      points,
      difficulty: canonicalDifficulty
    });
  });

  const isValid = errors.length === 0 && sanitizedQuestions.length === expectedCount;

  return {
    isValid,
    errors,
    sanitizedQuestions
  };
}
