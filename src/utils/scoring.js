/**
 * Calculates score for a question answer.
 * 
 * @param {Object} params
 * @param {boolean} params.isCorrect - Whether the answer is correct
 * @param {number} params.streak - Current active streak before this question
 * @param {string} params.difficulty - 'easy', 'medium', or 'hard'
 * @param {number} params.timeRemainingSeconds - Seconds left on the timer (0 to 15)
 * @returns {Object} { basePoints, streakBonus, timeBonus, difficultyMultiplier, totalPoints, newStreak }
 */
export function calculateQuestionScore({
  isCorrect,
  streak = 0,
  difficulty = 'medium',
  timeRemainingSeconds = 0
}) {
  if (!isCorrect) {
    return {
      basePoints: 0,
      streakBonus: 0,
      timeBonus: 0,
      difficultyMultiplier: 1,
      totalPoints: 0,
      newStreak: 0
    };
  }

  const basePoints = 100;
  const newStreak = streak + 1;
  const streakBonus = 25 * newStreak;
  const timeBonus = Math.max(0, timeRemainingSeconds * 5);

  let difficultyMultiplier = 1;
  if (difficulty === 'medium') difficultyMultiplier = 1.5;
  if (difficulty === 'hard') difficultyMultiplier = 2;

  const totalPoints = Math.round((basePoints + streakBonus + timeBonus) * difficultyMultiplier);

  return {
    basePoints,
    streakBonus,
    timeBonus,
    difficultyMultiplier,
    totalPoints,
    newStreak
  };
}

/**
 * Summarizes quiz results across all answered questions.
 * 
 * @param {Array} questions - Array of questions
 * @param {Array} userAnswers - Array of user answer records { questionId, selectedIndex, isCorrect, timeSpent }
 * @param {number} totalScore - Accumulated score
 * @param {number} maxStreak - Maximum streak reached
 */
export function calculateQuizSummary(questions, userAnswers, totalScore, maxStreak) {
  const totalQuestions = questions.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  userAnswers.forEach((ans) => {
    if (ans.selectedIndex === null || ans.selectedIndex === undefined || ans.isTimeout) {
      unansweredCount++;
    } else if (ans.isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  // Handle any questions not reached/recorded
  const recordedCount = userAnswers.length;
  if (recordedCount < totalQuestions) {
    unansweredCount += (totalQuestions - recordedCount);
  }

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  let performanceMessage = 'Good Effort!';
  let performanceBadge = '🥉 Apprentice';

  if (accuracy === 100) {
    performanceMessage = 'Flawless Victory! Flawless Execution!';
    performanceBadge = '👑 Godlike';
  } else if (accuracy >= 80) {
    performanceMessage = 'Great Battle! Exceptional Knowledge!';
    performanceBadge = '🥇 Grandmaster';
  } else if (accuracy >= 60) {
    performanceMessage = 'Solid Performance! Keep Practicing!';
    performanceBadge = '🥈 Veteran';
  }

  const attemptedQuestions = correctCount + incorrectCount;
  const xpEarned = totalScore;

  return {
    totalQuestions,
    attemptedQuestions,
    correctCount,
    correctAnswers: correctCount,
    incorrectCount,
    incorrectAnswers: incorrectCount,
    unansweredCount,
    accuracy,
    totalScore,
    score: totalScore,
    maxStreak,
    xpEarned,
    performanceMessage,
    performanceBadge
  };
}
