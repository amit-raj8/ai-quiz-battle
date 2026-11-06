/**
 * STEP P1 — Python Category End-to-End Test Suite
 *
 * Tests:
 * 1. Python + Easy + 5
 * 2. Python + Medium + 5
 * 3. Python + Hard + 5
 */

const BASE_URL = 'http://localhost:5000';

async function testPythonCase(difficulty, expectedPoints) {
  console.log(`\n======================================================`);
  console.log(`RUNNING TEST: Python + ${difficulty} + 5 stages`);
  console.log(`======================================================`);

  const response = await fetch(`${BASE_URL}/api/ai/generate-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      categoryId: 'python',
      categoryName: 'Python',
      difficulty: difficulty,
      questionCount: 5
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Endpoint returned status ${response.status}: ${errBody}`);
  }

  const data = await response.json();

  // Verification 1: Success flag & metadata
  if (!data.success) throw new Error('Response success flag is not true');
  if (data.categoryId !== 'python') throw new Error(`Expected categoryId "python", got "${data.categoryId}"`);
  if (data.categoryName !== 'Python') throw new Error(`Expected categoryName "Python", got "${data.categoryName}"`);
  if (data.difficulty.toLowerCase() !== difficulty.toLowerCase()) {
    throw new Error(`Expected difficulty "${difficulty}", got "${data.difficulty}"`);
  }
  console.log(`  ✅ Metadata valid: categoryId="python", categoryName="Python", difficulty="${data.difficulty}"`);

  // Verification 2: Exactly 5 questions
  const questions = data.questions;
  if (!Array.isArray(questions) || questions.length !== 5) {
    throw new Error(`Expected exactly 5 questions, received ${questions?.length}`);
  }
  console.log(`  ✅ Exactly 5 questions received`);

  // Verification 3: Check duplicates across questions
  const normalizedQuestions = questions.map(q => q.question.trim().toLowerCase().replace(/\s+/g, ' '));
  const uniqueQuestions = new Set(normalizedQuestions);
  if (uniqueQuestions.size !== 5) {
    throw new Error(`Duplicate questions detected in battle set (${uniqueQuestions.size}/5 unique)`);
  }
  console.log(`  ✅ No duplicate questions in generated set (5/5 unique)`);

  // Verification 4: Per-question structural, scoring & answer verification
  questions.forEach((q, idx) => {
    const qNum = idx + 1;

    // Question string
    if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
      throw new Error(`Question #${qNum} has empty or invalid question text`);
    }

    // Exactly 4 options
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question #${qNum} does not have exactly 4 options`);
    }

    // 4 Unique options
    const normalizedOptions = q.options.map(opt => opt.trim().toLowerCase().replace(/\s+/g, ' '));
    const uniqueOptions = new Set(normalizedOptions);
    if (uniqueOptions.size !== 4) {
      throw new Error(`Question #${qNum} contains duplicate options`);
    }

    // Valid correctAnswer matching one option verbatim
    if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
      throw new Error(`Question #${qNum} correctAnswer "${q.correctAnswer}" does not match options [${q.options.join(', ')}]`);
    }

    // Non-empty explanation
    if (!q.explanation || typeof q.explanation !== 'string' || !q.explanation.trim()) {
      throw new Error(`Question #${qNum} is missing explanation`);
    }

    // Points enforcement
    if (q.points !== expectedPoints) {
      throw new Error(`Question #${qNum} points mismatch: expected ${expectedPoints}, got ${q.points}`);
    }
  });

  console.log(`  ✅ All 5 questions have exactly 4 unique options each`);
  console.log(`  ✅ All 5 questions have valid correctAnswer matching an option`);
  console.log(`  ✅ All 5 questions have non-empty technical explanations`);
  console.log(`  ✅ Points strictly enforced: all questions = ${expectedPoints} PTS`);

  // Log sample question for transparency
  console.log(`  Sample Q1: "${questions[0].question}"`);
  console.log(`  Options: ${JSON.stringify(questions[0].options)}`);
  console.log(`  Correct: "${questions[0].correctAnswer}"`);
  console.log(`  Points: ${questions[0].points} PTS`);
}

async function runStepP1Suite() {
  console.log('======================================================');
  console.log('STARTING STEP P1: PYTHON CATEGORY END-TO-END VERIFICATION');
  console.log('======================================================');

  try {
    // 1. Python + Easy + 5
    await testPythonCase('Easy', 100);

    // 2. Python + Medium + 5
    await testPythonCase('Medium', 150);

    // 3. Python + Hard + 5
    await testPythonCase('Hard', 200);

    console.log('\n======================================================');
    console.log('🎉 ALL STEP P1 PYTHON CATEGORY TESTS PASSED WITH 100% SUCCESS!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ STEP P1 TEST SUITE FAILED:', err.message);
    process.exit(1);
  }
}

runStepP1Suite();
