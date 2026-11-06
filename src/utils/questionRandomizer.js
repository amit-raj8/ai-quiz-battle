/**
 * Utility to completely randomize options for battle questions.
 * Eliminates positional bias (e.g. correct answers disproportionately appearing at Option B / Index 1).
 * Uses Fisher-Yates shuffle to ensure a strictly uniform 25% probability across options A, B, C, and D.
 */

/**
 * Shuffles the options array of a single question and updates correctAnswer / correctAnswerIndex.
 *
 * @param {Object} question - Question object with question, options, correctAnswer
 * @returns {Object} New question object with randomized options
 */
export function randomizeQuestionOptions(question) {
  if (!question || !Array.isArray(question.options) || question.options.length < 2) {
    return question;
  }

  // 1. Identify the verbatim correct answer string
  let correctText = '';
  if (typeof question.correctAnswer === 'string' && question.correctAnswer.trim()) {
    correctText = question.correctAnswer.trim();
  } else if (typeof question.correctAnswer === 'number' && question.options[question.correctAnswer] !== undefined) {
    correctText = String(question.options[question.correctAnswer]).trim();
  } else if (typeof question.correctAnswerIndex === 'number' && question.options[question.correctAnswerIndex] !== undefined) {
    correctText = String(question.options[question.correctAnswerIndex]).trim();
  } else {
    correctText = String(question.options[0]).trim();
  }

  // 2. Perform Fisher-Yates shuffle on options
  const shuffledOptions = [...question.options];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }

  // 3. Locate the new index of the correct answer in the randomized options array
  const newIndex = shuffledOptions.findIndex(
    opt => String(opt).trim().toLowerCase() === correctText.toLowerCase()
  );

  const finalCorrectIndex = newIndex >= 0 ? newIndex : 0;
  const finalCorrectAnswer = shuffledOptions[finalCorrectIndex];

  return {
    ...question,
    options: shuffledOptions,
    correctAnswer: finalCorrectAnswer,
    correctAnswerIndex: finalCorrectIndex
  };
}

/**
 * Maps over a list of battle questions and randomizes each question's answer options.
 *
 * @param {Array<Object>} questions - List of questions
 * @returns {Array<Object>} List of questions with randomized options
 */
export function randomizeQuestionsList(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.map(q => randomizeQuestionOptions(q));
}
