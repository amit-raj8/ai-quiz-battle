export const MOCK_QUESTIONS = [
  // --- PYTHON ---
  {
    id: 'py-1',
    categoryId: 'python',
    question: 'Which of the following data structures in Python is immutable?',
    options: ['List', 'Dictionary', 'Tuple', 'Set'],
    correctAnswer: 2,
    difficulty: 'easy',
    explanation: 'Tuples are immutable sequences in Python, meaning their contents cannot be altered after creation.'
  },
  {
    id: 'py-2',
    categoryId: 'python',
    question: 'What is the primary output of `type(lambda x: x)` in Python 3?',
    options: ['<class "function">', '<class "lambda">', '<class "object">', '<class "type">'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'In Python, lambda functions are instances of the built-in function class.'
  },
  {
    id: 'py-3',
    categoryId: 'python',
    question: 'Which built-in function returns both the index and value during iteration?',
    options: ['zip()', 'enumerate()', 'map()', 'filter()'],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: 'enumerate() takes an iterable and yields pairs containing count (index) and values.'
  },
  {
    id: 'py-4',
    categoryId: 'python',
    question: 'What is the time complexity of looking up a key in a standard Python dictionary on average?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'Python dictionaries are implemented using hash tables, giving average O(1) key lookups.'
  },
  {
    id: 'py-5',
    categoryId: 'python',
    question: 'In Python list comprehensions, which syntax correctly filters even numbers from `range(10)`?',
    options: [
      '[x for x in range(10) if x % 2 == 0]',
      '[if x % 2 == 0 x for x in range(10)]',
      '[x if x % 2 == 0 for x in range(10)]',
      '[x for x in range(10) filter x % 2 == 0]'
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'The `if` condition in list comprehension goes after the `for ... in ...` clause when filtering.'
  },
  {
    id: 'py-6',
    categoryId: 'python',
    question: 'What does the `__slots__` attribute in a Python class accomplish?',
    options: [
      'It restricts inheritance from parent classes.',
      'It explicitly defines allowed instance attributes to save memory by preventing `__dict__` creation.',
      'It automatically generates getter and setter methods for instance variables.',
      'It marks class methods as thread-safe synchronized functions.'
    ],
    correctAnswer: 1,
    difficulty: 'hard',
    explanation: 'Using `__slots__` prevents the automatic creation of instance `__dict__` and `__weakref__`, saving significant memory.'
  },
  {
    id: 'py-7',
    categoryId: 'python',
    question: 'What is the output of `bool([])` vs `bool([0])` in Python?',
    options: [
      'False, False',
      'True, True',
      'False, True',
      'True, False'
    ],
    correctAnswer: 2,
    difficulty: 'easy',
    explanation: 'An empty list evaluates to False, whereas a non-empty list (even containing 0) evaluates to True.'
  },
  {
    id: 'py-8',
    categoryId: 'python',
    question: 'Which decorator in Python functools is used to cache function execution results based on arguments?',
    options: ['@lru_cache', '@memoize', '@cacheize', '@result_store'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: '@functools.lru_cache (Least Recently Used) wraps a function with a memoizing callable that saves recent calls.'
  },

  // --- JAVASCRIPT ---
  {
    id: 'js-1',
    categoryId: 'javascript',
    question: 'Which data structure follows the FIFO (First In, First Out) principle?',
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: 'A Queue works on the FIFO principle where the item enqueued first is dequeued first.'
  },
  {
    id: 'js-2',
    categoryId: 'javascript',
    question: 'What is the result of `typeof NaN` in JavaScript?',
    options: ['"number"', '"nan"', '"undefined"', '"object"'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'In JavaScript, NaN (Not-a-Number) is a special numeric value defined under IEEE 754 floating point spec.'
  },
  {
    id: 'js-3',
    categoryId: 'javascript',
    question: 'Which operator checks both value and type equality in JavaScript?',
    options: ['==', '===', '=', 'equals()'],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: 'The strict equality operator (===) checks equality without performing type coercion.'
  },
  {
    id: 'js-4',
    categoryId: 'javascript',
    question: 'What will `console.log(0.1 + 0.2 === 0.3)` output?',
    options: ['true', 'false', 'undefined', 'TypeError'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'Due to binary floating-point representation (IEEE 754), 0.1 + 0.2 evaluates to 0.30000000000000004, which is not strictly equal to 0.3.'
  },
  {
    id: 'js-5',
    categoryId: 'javascript',
    question: 'Which method returns a new array with all sub-array elements concatenated up to a specified depth?',
    options: ['Array.prototype.flat()', 'Array.prototype.concat()', 'Array.prototype.join()', 'Array.prototype.reduce()'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'flat() creates a new array with all sub-array elements flattened recursively up to the specified depth.'
  },
  {
    id: 'js-6',
    categoryId: 'javascript',
    question: 'What is the Event Loop mechanism responsible for in JavaScript runtime?',
    options: ['Compiling V8 code into machine instructions', 'Handling asynchronous callback execution from the microtask/macrotask queues', 'Garbage collecting unreachable DOM nodes', 'Synchronizing multi-threaded Web Workers'],
    correctAnswer: 1,
    difficulty: 'hard',
    explanation: 'The Event Loop continuously monitors the Call Stack and task queues, pushing callbacks onto the stack when it is clear.'
  },

  // --- AI & MACHINE LEARNING ---
  {
    id: 'ai-1',
    categoryId: 'ai_ml',
    question: 'What does LLM stand for in modern AI technology?',
    options: ['Large Language Model', 'Linear Logic Machine', 'Layered Learning Method', 'Linked Language Matrix'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'LLM stands for Large Language Model, an AI model trained on massive text corpora to process and generate human language.'
  },
  {
    id: 'ai-2',
    categoryId: 'ai_ml',
    question: 'Which key architectural component was introduced in the breakthrough paper "Attention Is All You Need" (2017)?',
    options: ['Convolutional Neural Network (CNN)', 'Recurrent Neural Network (RNN)', 'Transformer', 'Generative Adversarial Network (GAN)'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'Vaswani et al. introduced the Transformer architecture relying on self-attention mechanisms without recurrent layers.'
  },
  {
    id: 'ai-3',
    categoryId: 'ai_ml',
    question: 'What problem occurs when a model performs exceptionally on training data but fails to generalize to test data?',
    options: ['Underfitting', 'Overfitting', 'Vanishing Gradient', 'Mode Collapse'],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: 'Overfitting occurs when a model memorizes noise and patterns specific to the training set rather than learning generalized features.'
  },
  {
    id: 'ai-4',
    categoryId: 'ai_ml',
    question: 'Which activation function outputs values in the range (-1 to 1) and is zero-centered?',
    options: ['ReLU', 'Sigmoid', 'Tanh (Hyperbolic Tangent)', 'Leaky ReLU'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'The Tanh function maps input real numbers into the range (-1, 1) and has a zero-centered output distribution.'
  },
  {
    id: 'ai-5',
    categoryId: 'ai_ml',
    question: 'In Reinforcement Learning, what equation expresses the value of a state as the immediate reward plus discounted future rewards?',
    options: ['Schrödinger Equation', 'Bellman Equation', 'Bayes Theorem', 'Markov Decision Chain'],
    correctAnswer: 1,
    difficulty: 'hard',
    explanation: 'The Bellman Equation decomposes the optimal value function into the immediate reward plus the discounted value of successor states.'
  },

  // --- DATA SCIENCE ---
  {
    id: 'ds-1',
    categoryId: 'data_science',
    question: 'Which Python library is primarily used for high-performance array computing and vector math?',
    options: ['Pandas', 'NumPy', 'Matplotlib', 'Scikit-Learn'],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: 'NumPy provides N-dimensional array objects and optimized C-based math routines for data manipulation.'
  },
  {
    id: 'ds-2',
    categoryId: 'data_science',
    question: 'What statistical measure represents the middle value in an ordered dataset?',
    options: ['Mean', 'Median', 'Mode', 'Variance'],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: 'The median divides a sorted dataset into two equal halves.'
  },
  {
    id: 'ds-3',
    categoryId: 'data_science',
    question: 'What does R-squared (R²) measure in linear regression analysis?',
    options: ['The sum of squared residuals', 'The proportion of variance in the dependent variable predictable from independent variables', 'The standard error of the estimate', 'The statistical significance p-value'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'R² (coefficient of determination) indicates how much variance in the response variable is explained by the model.'
  },

  // --- TECHNOLOGY ---
  {
    id: 'tech-1',
    categoryId: 'technology',
    question: 'What default port does HTTPS protocol communicate over?',
    options: ['80', '8080', '443', '22'],
    correctAnswer: 2,
    difficulty: 'easy',
    explanation: 'HTTPS traffic uses port 443 by default, whereas HTTP uses port 80.'
  },
  {
    id: 'tech-2',
    categoryId: 'technology',
    question: 'What containerization technology packages applications with their environment dependencies into portable images?',
    options: ['Kubernetes', 'Docker', 'Vagrant', 'Terraform'],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: 'Docker isolates software applications inside lightweight containers that run reliably across host OS environments.'
  },
  {
    id: 'tech-3',
    categoryId: 'technology',
    question: 'Which HTTP status code represents "404"?',
    options: ['Unauthorized', 'Forbidden', 'Not Found', 'Internal Server Error'],
    correctAnswer: 2,
    difficulty: 'easy',
    explanation: '404 indicates the requested server resource could not be found at the URL specified.'
  },

  // --- JAVA ---
  {
    id: 'java-1',
    categoryId: 'java',
    question: 'Why are String objects immutable in Java?',
    options: [
      'To enable caching in the String Pool, thread safety, and secure hashing',
      'Because JVM bytecode does not support dynamic heap allocation for characters',
      'To prevent Java garbage collector from running out of stack memory',
      'Because primitive char arrays cannot be resized at runtime'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'String immutability allows String interning in the constant pool, thread safety without synchronization, and stable hashCode caching.'
  },

  // --- C++ ---
  {
    id: 'cpp-1',
    categoryId: 'cpp',
    question: 'Why must a base class destructor almost always be declared virtual in C++ if it has derived classes?',
    options: [
      'To ensure the derived class destructor is called when deleting an object through a base pointer',
      'To allow the base class to allocate memory directly in the stack segment',
      'Because the C++ compiler forbids instantiation of any class with a non-virtual destructor',
      'To automatically reset all derived class member variables to nullptr upon destruction'
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'Deleting a derived class instance through a pointer to a base class without a virtual destructor results in undefined behavior and memory leaks.'
  },

  // --- DSA ---
  {
    id: 'dsa-1',
    categoryId: 'dsa',
    question: 'What is the worst-case time complexity of QuickSort when using a naive pivot selection on an already sorted array?',
    options: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(log n)'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'When partitions are maximally unbalanced (0 and n-1 elements), QuickSort degenerates to O(n^2) comparisons.'
  },

  // --- SQL ---
  {
    id: 'sql-1',
    categoryId: 'sql',
    question: 'What is the core syntactic difference between WHERE and HAVING clauses in an SQL query?',
    options: [
      'WHERE filters rows before aggregation, while HAVING filters aggregated group results',
      'WHERE can only be used with numeric columns, while HAVING operates on text columns',
      'HAVING executes before JOIN operations, while WHERE executes at the very end',
      'WHERE requires subqueries, while HAVING requires a UNIQUE constraint'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'The WHERE clause filters individual records prior to GROUP BY. The HAVING clause filters the grouped output resulting from aggregate functions.'
  },

  // --- REACT ---
  {
    id: 'react-1',
    categoryId: 'react',
    question: 'In React, what is the primary purpose of supplying a unique and stable "key" prop when rendering a dynamic list of elements?',
    options: [
      'To help the reconciliation diffing algorithm identify which items have changed, added, or removed',
      'To register the DOM nodes in the browser global window object for faster lookups',
      'To automatically trigger CSS keyframe transition animations on re-renders',
      'To encrypt component state in browser localStorage'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'React uses keys to match children in the original tree with children in the subsequent tree, preventing unnecessary unmounting and state loss.'
  },

  // --- APTITUDE & REASONING ---
  {
    id: 'apt-1',
    categoryId: 'aptitude',
    question: 'If the price of a commodity increases by 25%, by what percentage must consumption be reduced so that the expenditure remains unchanged?',
    options: ['20%', '25%', '16.67%', '30%'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'Using the formula [r / (100 + r)] * 100: [25 / 125] * 100 = 20% reduction in consumption.'
  },
  {
    id: 'apt-2',
    categoryId: 'aptitude',
    question: 'Find the next number in the prime square sequence: 4, 9, 25, 49, 121, ?',
    options: ['144', '169', '196', '225'],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: 'The sequence consists of squares of consecutive prime numbers: 2^2, 3^2, 5^2, 7^2, 11^2. The next prime is 13, whose square is 169.'
  },
  {
    id: 'apt-3',
    categoryId: 'aptitude',
    question: 'Pipe A can fill a tank in 12 hours and Pipe B can fill it in 18 hours. If both pipes operate together, how long will it take to fill the tank completely?',
    options: ['6.4 hours', '7.2 hours', '8.0 hours', '7.5 hours'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'Combined rate = 1/12 + 1/18 = (3 + 2)/36 = 5/36 per hour. Total time = 36 / 5 = 7.2 hours.'
  },
  {
    id: 'apt-4',
    categoryId: 'aptitude',
    question: 'A 240-meter long train running at a uniform speed of 72 km/h crosses a platform in 25 seconds. What is the length of the platform?',
    options: ['260 meters', '280 meters', '300 meters', '320 meters'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'Speed in m/s = 72 * (5/18) = 20 m/s. Total distance traveled = 20 * 25 = 500 meters. Platform length = 500 - 240 = 260 meters.'
  },
  {
    id: 'apt-5',
    categoryId: 'aptitude',
    question: 'Two fair six-sided dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on both dice is equal to 8?',
    options: ['5/36', '1/6', '7/36', '1/9'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'Favorable pairs summing to 8 are (2,6), (3,5), (4,4), (5,3), (6,2) — total 5 outcomes out of 36 possible outcomes. Probability = 5/36.'
  },
  {
    id: 'apt-6',
    categoryId: 'aptitude',
    question: 'A vessel contains 80 liters of pure milk. 8 liters is withdrawn and replaced with water. This replacement is repeated once more. How many liters of milk remain in the vessel?',
    options: ['64.8 liters', '62.5 liters', '66.4 liters', '60.0 liters'],
    correctAnswer: 0,
    difficulty: 'hard',
    explanation: 'Using the repeated dilution formula: Remaining Milk = 80 * (1 - 8/80)^2 = 80 * (9/10)^2 = 80 * 0.81 = 64.8 liters.'
  },
  {
    id: 'apt-7',
    categoryId: 'aptitude',
    question: 'A motorboat travels 24 km upstream and 36 km downstream in a total of 6 hours. If the speed of the river current is 2 km/h, what is the boat speed in still water?',
    options: ['10 km/h', '12 km/h', '8 km/h', '14 km/h'],
    correctAnswer: 0,
    difficulty: 'hard',
    explanation: 'Let still water speed be v. Upstream speed = v - 2, downstream speed = v + 2. Equation: 24/(v - 2) + 36/(v + 2) = 6. Substituting v = 10: 24/8 + 36/12 = 3 + 3 = 6 hours.'
  }
];
