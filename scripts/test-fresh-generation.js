import http from 'http';

console.log('================================================================');
console.log('TEST SUITE: AI QUIZ FRESH QUESTION SET ON EVERY NEW BATTLE');
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

async function runTests() {
  const baseUrl = 'http://localhost:5000/api/ai/generate-quiz';

  // ---------------------------------------------------------------------------
  // TEST 1: Same category & difficulty with DIFFERENT generationIds -> Fresh questions
  // ---------------------------------------------------------------------------
  console.log('[TEST 1] Python + Easy + 5: Battle 1 vs Battle 2 (Different generationIds)');
  const genId1 = `battle_1_${Date.now()}`;
  const genId2 = `battle_2_${Date.now()}`;

  const res1 = await postJson(baseUrl, {
    categoryId: 'python',
    categoryName: 'Python',
    difficulty: 'Easy',
    questionCount: 5,
    generationId: genId1
  });

  assert(res1.status === 200 && res1.data.success, 'Battle 1 generated successfully (HTTP 200)');
  assert(res1.data.questions.length === 5, 'Battle 1 contains exactly 5 questions');

  const res2 = await postJson(baseUrl, {
    categoryId: 'python',
    categoryName: 'Python',
    difficulty: 'Easy',
    questionCount: 5,
    generationId: genId2
  });

  assert(res2.status === 200 && res2.data.success, 'Battle 2 generated successfully (HTTP 200)');
  assert(res2.data.questions.length === 5, 'Battle 2 contains exactly 5 questions');

  const qSet1 = new Set(res1.data.questions.map(q => q.question.trim().toLowerCase()));
  const qSet2 = new Set(res2.data.questions.map(q => q.question.trim().toLowerCase()));

  // Verify questions between Battle 1 and Battle 2 are not completely identical (fresh generation)
  let overlapCount = 0;
  for (const q of qSet2) {
    if (qSet1.has(q)) overlapCount++;
  }

  assert(overlapCount < 5, `Battle 2 generated fresh questions (Overlap: ${overlapCount}/5 questions)`);
  console.log(`     Battle 1 Q1: "${res1.data.questions[0].question}"`);
  console.log(`     Battle 2 Q1: "${res2.data.questions[0].question}"`);

  // ---------------------------------------------------------------------------
  // TEST 2: Accidental duplicate request with SAME generationId -> Reused / Cached
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 2] Duplicate / Concurrent Request Protection (SAME generationId)');
  const duplicateGenId = `dup_test_${Date.now()}`;

  const firstCall = await postJson(baseUrl, {
    categoryId: 'python',
    categoryName: 'Python',
    difficulty: 'Medium',
    questionCount: 5,
    generationId: duplicateGenId
  });

  assert(firstCall.status === 200, 'First call with duplicateGenId succeeded');

  const secondCall = await postJson(baseUrl, {
    categoryId: 'python',
    categoryName: 'Python',
    difficulty: 'Medium',
    questionCount: 5,
    generationId: duplicateGenId
  });

  assert(secondCall.status === 200, 'Second call with identical duplicateGenId succeeded');
  assert(secondCall.data.generationId === duplicateGenId, 'generationId preserved in duplicate response');
  
  // The questions for the exact same generationId should be identical (deduplicated)
  const isIdentical = firstCall.data.questions.every((q, idx) => 
    q.question === secondCall.data.questions[idx]?.question
  );
  assert(isIdentical, 'Same generationId safely returned deduplicated question set');

  // ---------------------------------------------------------------------------
  // TEST 3: Switching Categories (Python -> JavaScript)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 3] Category Switch: JavaScript Domain Generation');
  const jsGenId = `js_test_${Date.now()}`;
  const jsRes = await postJson(baseUrl, {
    categoryId: 'javascript',
    categoryName: 'JavaScript',
    difficulty: 'Medium',
    questionCount: 5,
    generationId: jsGenId
  });

  assert(jsRes.status === 200 && jsRes.data.success, 'JavaScript generation succeeded');
  assert(jsRes.data.categoryName === 'JavaScript', 'Response categoryName is JavaScript');
  assert(jsRes.data.questions.every(q => q.points === 150), 'Medium questions enforced to 150 PTS');

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`VERIFICATION COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
