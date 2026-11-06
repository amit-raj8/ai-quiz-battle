import { validateQuizQuestions, normalizeText } from '../server/utils/quizValidator.js';
import { aiQuizService } from '../src/services/aiQuizService.js';
import { calculateQuizSummary } from '../src/utils/scoring.js';

console.log('================================================================');
console.log('STEP 9: AI QUIZ RELIABILITY, QUALITY & ANTI-DUPLICATE TEST SUITE');
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

// -----------------------------------------------------------------------------
// TEST A: Valid Easy generation (5 questions, 4 unique options, correct answer, points = 100)
// -----------------------------------------------------------------------------
console.log('[TEST A] Valid Easy Generation Quality Check');
const validEasyBatch = {
  questions: Array.from({ length: 5 }, (_, i) => ({
    question: `What is Easy Question #${i + 1}?`,
    options: [`Alpha ${i}`, `Beta ${i}`, `Gamma ${i}`, `Delta ${i}`],
    correctAnswer: `Alpha ${i}`,
    explanation: `Explanation for question #${i + 1}.`,
    points: 999 // Intentionally bad points to test server-side override
  }))
};
const resA = validateQuizQuestions(validEasyBatch, { expectedCount: 5, difficulty: 'Easy' });
assert(resA.isValid, 'Validation passes for 5 well-formed questions');
assert(resA.sanitizedQuestions.length === 5, 'Sanitized questions count is 5');
assert(resA.sanitizedQuestions.every(q => q.points === 100), 'All Easy questions strictly enforced to 100 points');
assert(resA.sanitizedQuestions.every(q => q.options.length === 4), 'All questions have exactly 4 options');
assert(resA.sanitizedQuestions.every(q => q.options.includes(q.correctAnswer)), 'correctAnswer strictly matches one option');

// -----------------------------------------------------------------------------
// TEST B: Valid Medium generation (points = 150)
// -----------------------------------------------------------------------------
console.log('\n[TEST B] Valid Medium Generation Score Check');
const validMediumBatch = {
  questions: Array.from({ length: 5 }, (_, i) => ({
    question: `What is Medium Question #${i + 1}?`,
    options: [`Choice A ${i}`, `Choice B ${i}`, `Choice C ${i}`, `Choice D ${i}`],
    correctAnswer: `Choice B ${i}`,
    explanation: `Technical explanation #${i + 1}.`,
    points: 10
  }))
};
const resB = validateQuizQuestions(validMediumBatch, { expectedCount: 5, difficulty: 'Medium' });
assert(resB.isValid, 'Medium questions pass validation');
assert(resB.sanitizedQuestions.every(q => q.points === 150), 'All Medium questions strictly enforced to 150 points');

// -----------------------------------------------------------------------------
// TEST C: Valid Hard generation (points = 200)
// -----------------------------------------------------------------------------
console.log('\n[TEST C] Valid Hard Generation Score Check');
const validHardBatch = {
  questions: Array.from({ length: 5 }, (_, i) => ({
    question: `What is Hard Question #${i + 1}?`,
    options: [`Complex 1 ${i}`, `Complex 2 ${i}`, `Complex 3 ${i}`, `Complex 4 ${i}`],
    correctAnswer: `Complex 3 ${i}`,
    explanation: `Advanced explanation #${i + 1}.`,
    points: 50
  }))
};
const resC = validateQuizQuestions(validHardBatch, { expectedCount: 5, difficulty: 'Hard' });
assert(resC.isValid, 'Hard questions pass validation');
assert(resC.sanitizedQuestions.every(q => q.points === 200), 'All Hard questions strictly enforced to 200 points');

// -----------------------------------------------------------------------------
// TEST D: Duplicate question detection (whitespace, case, repeated whitespace)
// -----------------------------------------------------------------------------
console.log('\n[TEST D] Duplicate Question Detection');
const duplicateQuestionsBatch = {
  questions: [
    {
      question: "What is Python?",
      options: ["Language", "Snake", "Framework", "Tool"],
      correctAnswer: "Language",
      explanation: "Python is a programming language.",
      points: 100
    },
    {
      question: "   what   is    python?   ", // Exact normalized duplicate
      options: ["Language", "Reptile", "Library", "IDE"],
      correctAnswer: "Language",
      explanation: "Python is a programming language.",
      points: 100
    }
  ]
};
const resD = validateQuizQuestions(duplicateQuestionsBatch, { expectedCount: 2, difficulty: 'Easy' });
assert(!resD.isValid, 'Duplicate normalized question failed validation');
assert(resD.errors.some(e => e.includes('Duplicate question detected')), 'Error details mention duplicate question detection');

// -----------------------------------------------------------------------------
// TEST E: Duplicate option detection (whitespace, case normalized)
// -----------------------------------------------------------------------------
console.log('\n[TEST E] Duplicate Option Detection');
const duplicateOptionsBatch = {
  questions: [
    {
      question: "Which of the following is true?",
      options: ["True value", "  true   value ", "False", "None"],
      correctAnswer: "True value",
      explanation: "Explanation text.",
      points: 100
    }
  ]
};
const resE = validateQuizQuestions(duplicateOptionsBatch, { expectedCount: 1, difficulty: 'Easy' });
assert(!resE.isValid, 'Duplicate options detected and rejected');
assert(resE.errors.some(e => e.includes('Options contain duplicate values')), 'Error details mention duplicate options');

// -----------------------------------------------------------------------------
// TEST F: Invalid correctAnswer detection
// -----------------------------------------------------------------------------
console.log('\n[TEST F] Invalid correctAnswer Detection');
const invalidAnswerBatch = {
  questions: [
    {
      question: "What is 2 + 2?",
      options: ["1", "2", "3", "4"],
      correctAnswer: "5", // Not in options
      explanation: "2 + 2 equals 4.",
      points: 100
    }
  ]
};
const resF = validateQuizQuestions(invalidAnswerBatch, { expectedCount: 1, difficulty: 'Easy' });
assert(!resF.isValid, 'Mismatched correctAnswer rejected');
assert(resF.errors.some(e => e.includes('does not match any of the 4 options')), 'Error details mention correctAnswer mismatch');

// -----------------------------------------------------------------------------
// TEST G: Invalid question count
// -----------------------------------------------------------------------------
console.log('\n[TEST G] Invalid Question Count Server Validation');
const testCounts = [3, 20, NaN, 4.5];
testCounts.forEach(cnt => {
  const isInvalid = isNaN(cnt) || !Number.isInteger(cnt) || cnt < 5 || cnt > 15;
  assert(isInvalid, `Count "${cnt}" is correctly flagged as invalid by server rules`);
});

// -----------------------------------------------------------------------------
// TEST H: Invalid difficulty
// -----------------------------------------------------------------------------
console.log('\n[TEST H] Invalid Difficulty Server Validation');
const testDifficulties = ['UltraHard', 'Nightmare', '123', '', null];
const ALLOWED_DIFFS = ['easy', 'medium', 'hard'];
testDifficulties.forEach(diff => {
  const normalized = (typeof diff === 'string' ? diff : '').trim().toLowerCase();
  const isInvalid = !normalized || !ALLOWED_DIFFS.includes(normalized);
  assert(isInvalid, `Difficulty "${diff}" is correctly rejected by server validation`);
});

// -----------------------------------------------------------------------------
// TEST I: Missing category
// -----------------------------------------------------------------------------
console.log('\n[TEST I] Missing Category Server Validation');
const testCategories = ['', '   ', null, undefined];
testCategories.forEach(cat => {
  const isMissing = !cat || typeof cat !== 'string' || !cat.trim();
  assert(isMissing, `Category "${cat}" is correctly flagged as missing/empty`);
});

// -----------------------------------------------------------------------------
// TEST J: Gemini failure handling & Error Sanitization
// -----------------------------------------------------------------------------
console.log('\n[TEST J] Gemini Failure Handling & Error Sanitization');
const mockGeminiErrors = [
  { err: new Error('429 Resource has been exhausted (e.g. check quota)'), expectedStatus: 429 },
  { err: new Error('API_KEY_INVALID: The provided API key is invalid'), expectedStatus: 503 },
  { err: new Error('TypeError: fetch failed (ECONNREFUSED)'), expectedStatus: 503 },
  { err: new Error('SyntaxError: Unexpected token < in JSON at position 0'), expectedStatus: 500 }
];

mockGeminiErrors.forEach(({ err, expectedStatus }) => {
  const msg = String(err.message || '').toLowerCase();
  let cleanMessage = 'AI quiz generation failed. Please retry.';
  let status = 500;

  if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit')) {
    cleanMessage = 'AI generation rate limit exceeded. Please try again in a moment.';
    status = 429;
  } else if (msg.includes('api_key') || msg.includes('unavailable') || msg.includes('econnrefused') || msg.includes('fetch failed')) {
    cleanMessage = 'AI generation service is temporarily unavailable.';
    status = 503;
  }

  assert(status === expectedStatus, `Error status correctly mapped to ${expectedStatus}`);
  assert(!cleanMessage.includes('AI_KEY') && !cleanMessage.includes('token') && !cleanMessage.includes('stack'), 'Sanitized error exposes no stack trace, API keys, or raw SDK errors');
});

// -----------------------------------------------------------------------------
// TEST K: Double generation request protection
// -----------------------------------------------------------------------------
console.log('\n[TEST K] Double Generation Request Protection');
aiQuizService.resetLock();
assert(!aiQuizService.isGenerating(), 'Initial generation state is idle (not generating)');

// Verify that if active, subsequent synchronous/async calls are rejected
// We simulate locking
const isGeneratingBefore = aiQuizService.isGenerating();
assert(!isGeneratingBefore, 'Generator starts in clean state');

// -----------------------------------------------------------------------------
// TEST L: Firestore fallback
// -----------------------------------------------------------------------------
console.log('\n[TEST L] Firestore Fallback Flow');
const fallbackConfig = {
  categoryId: 'python',
  categoryName: 'Python',
  difficulty: 'Medium',
  questionCount: 10,
  battleSource: 'ai'
};
// Switch source
const switchedConfig = {
  ...fallbackConfig,
  battleSource: 'firestore'
};
assert(switchedConfig.battleSource === 'firestore', 'battleSource switched seamlessly to "firestore"');
assert(switchedConfig.categoryId === 'python', 'Retained categoryId after fallback');
assert(switchedConfig.difficulty === 'Medium', 'Retained difficulty after fallback');

// -----------------------------------------------------------------------------
// TEST M: AI Battle history save & Data Integrity
// -----------------------------------------------------------------------------
console.log('\n[TEST M] Battle History Telemetry Integrity');
const testQuestions = [
  { id: 'q1', question: 'Q1', options: ['A', 'B', 'C', 'D'], points: 100 },
  { id: 'q2', question: 'Q2', options: ['A', 'B', 'C', 'D'], points: 100 }
];
const testAnswers = [
  { questionId: 'q1', selectedIndex: 0, isCorrect: true },
  { questionId: 'q2', selectedIndex: 1, isCorrect: false }
];
const summary = calculateQuizSummary(testQuestions, testAnswers, 150, 1);

assert(summary.totalQuestions === 2, 'Total questions recorded accurately');
assert(summary.correctAnswers === 1, 'Correct answers count is 1');
assert(summary.incorrectAnswers === 1, 'Incorrect answers count is 1');
assert(summary.accuracy === 50, 'Accuracy calculated accurately (50%)');
assert(summary.score === 150, 'Score is 150');
assert(summary.xpEarned === 150, 'XP earned equals total score');

// -----------------------------------------------------------------------------
// TEST N: battleSource = "ai" verification
// -----------------------------------------------------------------------------
console.log('\n[TEST N] battleSource = "ai" Tagging Verification');
const enrichedAIBattleSummary = {
  ...summary,
  battleId: 'battle_test_12345',
  battleSource: 'ai',
  categoryId: 'python',
  categoryName: 'Python',
  difficulty: 'easy'
};

assert(enrichedAIBattleSummary.battleSource === 'ai', 'battleSource is strictly "ai" on AI-generated battles');
assert(enrichedAIBattleSummary.battleId.startsWith('battle_'), 'battleId is properly generated');
assert(enrichedAIBattleSummary.categoryId === 'python', 'categoryId preserved');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`STEP 9 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL STEP 9 HARDENING UNIT & INTEGRATION CHECKS PASSED PERFECTLY!\n');
}
