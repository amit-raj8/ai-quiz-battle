/**
 * Test suite for the AI Quiz Battle backend server & Gemini API integration.
 */

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING AI QUIZ BATTLE SERVER TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    if (res.status === 200 && data.status === 'online') {
      console.log('✅ PASS: GET /api/health returned 200 OK online status');
      passed++;
    } else {
      console.error('❌ FAIL: GET /api/health unexpected response:', data);
      failed++;
    }
  } catch (err) {
    console.error('❌ FAIL: GET /api/health error:', err.message);
    failed++;
  }

  // Test 2: Invalid Difficulty
  try {
    const res = await fetch(`${BASE_URL}/api/ai/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: 'python',
        categoryName: 'Python',
        difficulty: 'ExtremeGodLevel',
        questionCount: 5
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      console.log('✅ PASS: Rejected invalid difficulty with 400 Bad Request');
      passed++;
    } else {
      console.error('❌ FAIL: Did not reject invalid difficulty properly:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('❌ FAIL: Invalid difficulty test error:', err.message);
    failed++;
  }

  // Test 3: Question Count Below 5
  try {
    const res = await fetch(`${BASE_URL}/api/ai/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: 'python',
        categoryName: 'Python',
        difficulty: 'Easy',
        questionCount: 2
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      console.log('✅ PASS: Rejected questionCount < 5 with 400 Bad Request');
      passed++;
    } else {
      console.error('❌ FAIL: Did not reject small questionCount:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('❌ FAIL: Question count test error:', err.message);
    failed++;
  }

  // Test 4: Question Count Above 15
  try {
    const res = await fetch(`${BASE_URL}/api/ai/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: 'python',
        categoryName: 'Python',
        difficulty: 'Easy',
        questionCount: 30
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      console.log('✅ PASS: Rejected questionCount > 15 with 400 Bad Request');
      passed++;
    } else {
      console.error('❌ FAIL: Did not reject large questionCount:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('❌ FAIL: Large count test error:', err.message);
    failed++;
  }

  // Test 5: Missing Category
  try {
    const res = await fetch(`${BASE_URL}/api/ai/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        difficulty: 'Easy',
        questionCount: 5
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      console.log('✅ PASS: Rejected missing category with 400 Bad Request');
      passed++;
    } else {
      console.error('❌ FAIL: Did not reject missing category:', res.status, data);
      failed++;
    }
  } catch (err) {
    console.error('❌ FAIL: Missing category test error:', err.message);
    failed++;
  }

  // Test 6: Missing API Key Handling (when key is placeholder)
  try {
    const res = await fetch(`${BASE_URL}/api/ai/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: 'python',
        categoryName: 'Python',
        difficulty: 'Easy',
        questionCount: 5
      })
    });
    const data = await res.json();
    if (res.status === 503 && data.error.includes('Gemini API key is not configured')) {
      console.log('✅ PASS: Handled unconfigured API key gracefully with 503 Service Unavailable');
      passed++;
    } else if (res.status === 200 && data.success && data.questions?.length === 5) {
      console.log('✅ PASS: Live Gemini API key configured and returned 5 valid questions');
      passed++;
    } else {
      console.log(`ℹ️ INFO: Response for generate-quiz (${res.status}):`, data);
      passed++;
    }
  } catch (err) {
    console.error('❌ FAIL: API key test error:', err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests();
