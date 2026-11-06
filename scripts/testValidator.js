import { validateQuizQuestions } from '../server/utils/quizValidator.js';

console.log('====================================================');
console.log('RUNNING QUIZ VALIDATOR UNIT TESTS');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

// Test 1: Valid 5-Question Payload
const validPayload = {
  questions: [
    {
      question: "What is Python's list comprehension syntax?",
      options: ["[x for x in seq]", "(x for x in seq)", "{x: x in seq}", "<x for x in seq>"],
      correctAnswer: "[x for x in seq]",
      explanation: "Square brackets denote list comprehensions in Python.",
      points: 100
    },
    {
      question: "Which keyword defines an anonymous function in Python?",
      options: ["def", "lambda", "anon", "fn"],
      correctAnswer: "lambda",
      explanation: "Lambda functions in Python are small anonymous functions.",
      points: 100
    },
    {
      question: "What does the 'len()' function return?",
      options: ["Length of an object", "Memory address", "Type of object", "Byte size"],
      correctAnswer: "Length of an object",
      explanation: "len() returns the number of items in a container.",
      points: 100
    },
    {
      question: "Which of the following is immutable?",
      options: ["tuple", "list", "dict", "set"],
      correctAnswer: "tuple",
      explanation: "Tuples cannot be modified after instantiation.",
      points: 100
    },
    {
      question: "What operator is used for floor division in Python?",
      options: ["//", "/", "%", "**"],
      correctAnswer: "//",
      explanation: "// performs integer floor division.",
      points: 100
    }
  ]
};

const res1 = validateQuizQuestions(validPayload, { expectedCount: 5, difficulty: 'Easy' });
if (res1.isValid && res1.sanitizedQuestions.length === 5) {
  console.log('✅ PASS: Valid 5-question payload passed validation');
  passed++;
} else {
  console.error('❌ FAIL: Valid payload failed validation:', res1.errors);
  failed++;
}

// Test 2: Only 3 options provided
const invalidOptionsPayload = {
  questions: [
    {
      question: "Invalid options count question?",
      options: ["Opt 1", "Opt 2", "Opt 3"],
      correctAnswer: "Opt 1",
      explanation: "Expl",
      points: 100
    }
  ]
};

const res2 = validateQuizQuestions(invalidOptionsPayload, { expectedCount: 1, difficulty: 'Easy' });
if (!res2.isValid && res2.errors.some(e => e.includes('Must have exactly 4 options'))) {
  console.log('✅ PASS: Caught 3-option violation properly');
  passed++;
} else {
  console.error('❌ FAIL: Failed to catch 3-option violation:', res2);
  failed++;
}

// Test 3: Duplicate options provided
const duplicateOptionsPayload = {
  questions: [
    {
      question: "Duplicate options question?",
      options: ["Same", "same", "Opt 3", "Opt 4"],
      correctAnswer: "Same",
      explanation: "Expl",
      points: 100
    }
  ]
};

const res3 = validateQuizQuestions(duplicateOptionsPayload, { expectedCount: 1, difficulty: 'Easy' });
if (!res3.isValid && res3.errors.some(e => e.includes('duplicate values'))) {
  console.log('✅ PASS: Caught duplicate option violation properly');
  passed++;
} else {
  console.error('❌ FAIL: Failed to catch duplicate option violation:', res3);
  failed++;
}

// Test 4: correctAnswer not matching any option
const mismatchedAnswerPayload = {
  questions: [
    {
      question: "Mismatched answer question?",
      options: ["A", "B", "C", "D"],
      correctAnswer: "E",
      explanation: "Expl",
      points: 100
    }
  ]
};

const res4 = validateQuizQuestions(mismatchedAnswerPayload, { expectedCount: 1, difficulty: 'Easy' });
if (!res4.isValid && res4.errors.some(e => e.includes('does not match any of the 4 options'))) {
  console.log('✅ PASS: Caught mismatched correctAnswer violation properly');
  passed++;
} else {
  console.error('❌ FAIL: Failed to catch mismatched correctAnswer:', res4);
  failed++;
}

console.log('\n====================================================');
console.log(`VALIDATOR TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) process.exit(1);
