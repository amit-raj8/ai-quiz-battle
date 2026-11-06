/**
 * Live test verifying Easy, Medium, and Hard endpoint generation against the running server.
 */
async function testLive() {
  console.log('Testing Live Gemini Endpoints (Easy, Medium, Hard)...\n');

  // 1. Easy
  const easyRes = await fetch('http://localhost:5000/api/ai/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      categoryId: 'javascript',
      categoryName: 'JavaScript',
      difficulty: 'Easy',
      questionCount: 5
    })
  });
  const easyData = await easyRes.json();
  console.log('Easy generation success:', easyData.success);
  console.log('Easy question count:', easyData.questions?.length);
  console.log('Easy points check:', easyData.questions?.every(q => q.points === 100));
  if (!easyData.success || !easyData.questions?.every(q => q.points === 100)) {
    throw new Error('Easy generation failed validation');
  }

  // 2. Medium
  const medRes = await fetch('http://localhost:5000/api/ai/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      categoryId: 'python',
      categoryName: 'Python',
      difficulty: 'Medium',
      questionCount: 5
    })
  });
  const medData = await medRes.json();
  console.log('Medium generation success:', medData.success);
  console.log('Medium question count:', medData.questions?.length);
  console.log('Medium points check:', medData.questions?.every(q => q.points === 150));
  if (!medData.success || !medData.questions?.every(q => q.points === 150)) {
    throw new Error('Medium generation failed validation');
  }

  // 3. Hard
  const hardRes = await fetch('http://localhost:5000/api/ai/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      categoryId: 'cybersecurity',
      categoryName: 'Cybersecurity',
      difficulty: 'Hard',
      questionCount: 5
    })
  });
  const hardData = await hardRes.json();
  console.log('Hard generation success:', hardData.success);
  console.log('Hard question count:', hardData.questions?.length);
  console.log('Hard points check:', hardData.questions?.every(q => q.points === 200));
  if (!hardData.success || !hardData.questions?.every(q => q.points === 200)) {
    throw new Error('Hard generation failed validation');
  }

  console.log('\nAll Live Generation Tests (Easy=100, Medium=150, Hard=200) Passed Successfully!');
}

testLive().catch(err => {
  console.error('Live test error:', err);
  process.exit(1);
});
