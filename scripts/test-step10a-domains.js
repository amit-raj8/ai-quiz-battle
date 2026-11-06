import http from 'http';
import { getDomainCalibration, isTextDomainRelevant } from '../server/config/domainCalibration.js';

console.log('================================================================');
console.log('STEP 10A: MULTI-DOMAIN AI CALIBRATION VERIFICATION TEST SUITE');
console.log('================================================================\n');

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, error: e.message });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

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

async function runStep10aTests() {
  const baseUrl = 'http://localhost:5000/api/ai/generate-quiz';

  const domainsToTest = [
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'ai_ml', name: 'AI & Machine Learning' },
    { id: 'data_science', name: 'Data Science' },
    { id: 'technology', name: 'Technology' },
    { id: 'science', name: 'Science' }
  ];

  const difficulties = [
    { level: 'Easy', expectedPts: 100 },
    { level: 'Medium', expectedPts: 150 },
    { level: 'Hard', expectedPts: 200 }
  ];

  // ---------------------------------------------------------------------------
  // 1. TEST MULTI-DOMAIN GENERATIONS ACROSS EASY / MEDIUM / HARD
  // ---------------------------------------------------------------------------
  for (const domain of domainsToTest) {
    console.log(`\n================================================================`);
    console.log(`TESTING DOMAIN: ${domain.name.toUpperCase()} (${domain.id})`);
    console.log(`================================================================`);

    for (const diff of difficulties) {
      const testGenId = `test_10a_${domain.id}_${diff.level.toLowerCase()}_${Date.now()}`;
      console.log(`\n▶ [${domain.name} + ${diff.level} + 5 Stages] (genId: ${testGenId})`);

      const res = await postJson(baseUrl, {
        categoryId: domain.id,
        categoryName: domain.name,
        difficulty: diff.level,
        questionCount: 5,
        generationId: testGenId
      });

      assert(res.status === 200, `HTTP 200 received`);
      assert(res.data && res.data.success === true, `Response success is true`);
      assert(res.data.generationId === testGenId, `generationId preserved in response`);
      assert(res.data.difficulty === diff.level, `difficulty is "${diff.level}"`);
      assert(Array.isArray(res.data.questions) && res.data.questions.length === 5, `Received exactly 5 questions`);

      const questions = res.data.questions || [];
      const seenTexts = new Set();
      const domainConfig = getDomainCalibration(domain.id);

      questions.forEach((q, idx) => {
        const qNum = idx + 1;
        assert(typeof q.question === 'string' && q.question.trim().length > 0, `Q#${qNum}: Non-empty question text`);
        assert(Array.isArray(q.options) && q.options.length === 4, `Q#${qNum}: Exactly 4 options`);
        
        // Unique options check
        const uniqueOpts = new Set(q.options.map(o => String(o).trim().toLowerCase()));
        assert(uniqueOpts.size === 4, `Q#${qNum}: All 4 options are distinct & unique`);

        // Correct answer check
        assert(typeof q.correctAnswer === 'string' && q.options.includes(q.correctAnswer), `Q#${qNum}: correctAnswer matches one of 4 options`);

        // Explanation check
        assert(typeof q.explanation === 'string' && q.explanation.trim().length > 0, `Q#${qNum}: Technical explanation is non-empty`);

        // Points enforcement check
        assert(q.points === diff.expectedPts, `Q#${qNum}: Points strictly enforced to ${diff.expectedPts} PTS`);

        // Domain relevance check
        const combined = `${q.question} ${q.options.join(' ')} ${q.explanation}`;
        const isRelevant = isTextDomainRelevant(combined, domainConfig);
        assert(isRelevant, `Q#${qNum}: Question satisfies domain relevance for "${domain.name}"`);

        // Anti-duplicate in-batch check
        const normQ = q.question.trim().toLowerCase();
        assert(!seenTexts.has(normQ), `Q#${qNum}: No in-batch duplicate detected`);
        seenTexts.add(normQ);
      });

      if (questions.length > 0) {
        console.log(`   Sample Q1: "${questions[0].question}"`);
        console.log(`   Correct: "${questions[0].correctAnswer}" | Points: ${questions[0].points} PTS`);
      }

      // Small pacing delay to avoid burst rate limiting
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  // ---------------------------------------------------------------------------
  // 2. TEST DEDUPLICATION VS FRESH GENERATION
  // ---------------------------------------------------------------------------
  console.log(`\n================================================================`);
  console.log(`TESTING CACHE DEDUPLICATION & FRESH GENERATION BEHAVIOR`);
  console.log(`================================================================`);

  const sharedGenId = `shared_gen_${Date.now()}`;
  console.log(`\n▶ [Duplicate Request Test with identical generationId: ${sharedGenId}]`);

  const firstCall = await postJson(baseUrl, {
    categoryId: 'ai_ml',
    categoryName: 'AI & Machine Learning',
    difficulty: 'Medium',
    questionCount: 5,
    generationId: sharedGenId
  });

  const secondCall = await postJson(baseUrl, {
    categoryId: 'ai_ml',
    categoryName: 'AI & Machine Learning',
    difficulty: 'Medium',
    questionCount: 5,
    generationId: sharedGenId
  });

  assert(firstCall.status === 200 && secondCall.status === 200, 'Both requests returned HTTP 200');
  const identicalQ = firstCall.data.questions.every((q, i) => q.question === secondCall.data.questions[i]?.question);
  assert(identicalQ, 'Same generationId returned deduplicated question set');

  const distinctGenId = `distinct_gen_${Date.now()}`;
  console.log(`\n▶ [Fresh Generation Test with fresh generationId: ${distinctGenId}]`);

  const freshCall = await postJson(baseUrl, {
    categoryId: 'ai_ml',
    categoryName: 'AI & Machine Learning',
    difficulty: 'Medium',
    questionCount: 5,
    generationId: distinctGenId
  });

  assert(freshCall.status === 200, 'Fresh generation request returned HTTP 200');
  assert(freshCall.data.generationId === distinctGenId, 'Fresh generationId returned');

  // ---------------------------------------------------------------------------
  // 3. TEST PARAMETER VALIDATION & ERROR BEHAVIOR
  // ---------------------------------------------------------------------------
  console.log(`\n================================================================`);
  console.log(`TESTING SERVER PARAMETER VALIDATION & ERROR RESPONSES`);
  console.log(`================================================================`);

  // Invalid difficulty -> 400
  const badDiffRes = await postJson(baseUrl, {
    categoryId: 'python',
    categoryName: 'Python',
    difficulty: 'SuperHard',
    questionCount: 5
  });
  assert(badDiffRes.status === 400, 'Invalid difficulty returns HTTP 400');
  assert(badDiffRes.data.success === false, 'Error response contains success: false');

  // Invalid question count -> 400
  const badCountRes = await postJson(baseUrl, {
    categoryId: 'python',
    categoryName: 'Python',
    difficulty: 'Medium',
    questionCount: 99
  });
  assert(badCountRes.status === 400, 'Invalid questionCount (99) returns HTTP 400');

  // Missing category -> 400
  const missingCatRes = await postJson(baseUrl, {
    categoryId: '',
    categoryName: '',
    difficulty: 'Medium',
    questionCount: 5
  });
  assert(missingCatRes.status === 400, 'Missing category returns HTTP 400');

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`STEP 10A TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    console.error('❌ SOME STEP 10A DOMAIN TESTS FAILED');
    process.exit(1);
  } else {
    console.log('🎉 ALL STEP 10A MULTI-DOMAIN AI CALIBRATION TESTS PASSED WITH 100% SUCCESS!');
  }
}

runStep10aTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
