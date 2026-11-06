import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase';
import { randomizeQuestionsList } from '../utils/questionRandomizer.js';

/**
 * Initial curated dataset of questions across all 8 domains and difficulties.
 * Schema:
 * - question: string
 * - options: array of 4 strings
 * - correctAnswer: string (matches one of the options)
 * - categoryId: string
 * - difficulty: "Easy" | "Medium" | "Hard"
 * - explanation: string
 * - points: number
 * - createdAt: serverTimestamp()
 */
export const INITIAL_QUESTIONS = [
  // --- 1. PYTHON ---
  {
    id: 'py-1',
    categoryId: 'python',
    question: 'Which of the following data structures in Python is immutable?',
    options: ['List', 'Dictionary', 'Tuple', 'Set'],
    correctAnswer: 'Tuple',
    difficulty: 'Easy',
    explanation: 'Tuples are immutable sequences in Python, meaning their contents cannot be altered after creation.',
    points: 100
  },
  {
    id: 'py-2',
    categoryId: 'python',
    question: 'What is the primary output of type(lambda x: x) in Python 3?',
    options: ['<class "function">', '<class "lambda">', '<class "object">', '<class "type">'],
    correctAnswer: '<class "function">',
    difficulty: 'Easy',
    explanation: 'In Python, lambda functions are instances of the built-in function class.',
    points: 100
  },
  {
    id: 'py-3',
    categoryId: 'python',
    question: 'Which built-in function returns both the index and value during iteration?',
    options: ['zip()', 'enumerate()', 'map()', 'filter()'],
    correctAnswer: 'enumerate()',
    difficulty: 'Easy',
    explanation: 'enumerate() takes an iterable and yields pairs containing count (index) and value.',
    points: 100
  },
  {
    id: 'py-4',
    categoryId: 'python',
    question: 'What is the time complexity of looking up a key in a standard Python dictionary on average?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
    correctAnswer: 'O(1)',
    difficulty: 'Medium',
    explanation: 'Python dictionaries are implemented using hash tables, giving average O(1) key lookups.',
    points: 150
  },
  {
    id: 'py-5',
    categoryId: 'python',
    question: 'In Python list comprehensions, which syntax correctly filters even numbers from range(10)?',
    options: [
      '[x for x in range(10) if x % 2 == 0]',
      '[if x % 2 == 0 x for x in range(10)]',
      '[x if x % 2 == 0 for x in range(10)]',
      '[x for x in range(10) filter x % 2 == 0]'
    ],
    correctAnswer: '[x for x in range(10) if x % 2 == 0]',
    difficulty: 'Medium',
    explanation: 'The if condition in list comprehension goes after the for ... in ... clause when filtering.',
    points: 150
  },
  {
    id: 'py-6',
    categoryId: 'python',
    question: 'What does the __slots__ attribute in a Python class accomplish?',
    options: [
      'It restricts inheritance from parent classes.',
      'It explicitly defines allowed instance attributes to save memory by preventing __dict__ creation.',
      'It automatically generates getter and setter methods for instance variables.',
      'It forces multi-threaded thread-safety on class instances.'
    ],
    correctAnswer: 'It explicitly defines allowed instance attributes to save memory by preventing __dict__ creation.',
    difficulty: 'Hard',
    explanation: '__slots__ reserves space for a fixed set of attributes, preventing per-instance __dict__ overhead and saving memory.',
    points: 200
  },
  {
    id: 'py-7',
    categoryId: 'python',
    question: 'Which module in Python standard library provides low-level asynchronous I/O primitives?',
    options: ['asyncio', 'threading', 'multiprocessing', 'concurrent.futures'],
    correctAnswer: 'asyncio',
    difficulty: 'Hard',
    explanation: 'asyncio provides the foundation for writing concurrent code using async/await syntax.',
    points: 200
  },

  // --- 2. AI & MACHINE LEARNING ---
  {
    id: 'ai-1',
    categoryId: 'ai_ml',
    question: 'What does the abbreviation "LLM" stand for in modern AI architecture?',
    options: [
      'Low Latency Machine',
      'Large Language Model',
      'Linear Learning Mechanism',
      'Logical Language Module'
    ],
    correctAnswer: 'Large Language Model',
    difficulty: 'Easy',
    explanation: 'LLM refers to deep learning models trained on vast corpora of text data.',
    points: 100
  },
  {
    id: 'ai-2',
    categoryId: 'ai_ml',
    question: 'Which activation function maps real numbers to a probability distribution between 0 and 1 summing to 1?',
    options: ['ReLU', 'Sigmoid', 'Softmax', 'LeakyReLU'],
    correctAnswer: 'Softmax',
    difficulty: 'Easy',
    explanation: 'Softmax normalizes unnormalized logits into categorical probabilities summing to 1.0.',
    points: 100
  },
  {
    id: 'ai-3',
    categoryId: 'ai_ml',
    question: 'What is the vanishing gradient problem primarily caused by in deep neural networks?',
    options: [
      'Using learning rates that are too high',
      'Repeated multiplication of small derivative values through deep layers',
      'Excessive dropout regularization',
      'Overfitting to training noise'
    ],
    correctAnswer: 'Repeated multiplication of small derivative values through deep layers',
    difficulty: 'Medium',
    explanation: 'Saturating activation functions (like Sigmoid) produce gradients < 1, which compound multiplicatively to near-zero in deep networks.',
    points: 150
  },
  {
    id: 'ai-4',
    categoryId: 'ai_ml',
    question: 'Which architectural component is the core innovation of the 2017 "Attention Is All You Need" paper?',
    options: [
      'Convolutional Stride Filter',
      'Self-Attention Mechanism (Transformer)',
      'Recurrent Gate Unit',
      'Residual Bottleneck Layer'
    ],
    correctAnswer: 'Self-Attention Mechanism (Transformer)',
    difficulty: 'Medium',
    explanation: 'The Transformer architecture replaced recurrent mechanisms with multi-head self-attention mechanisms.',
    points: 150
  },
  {
    id: 'ai-5',
    categoryId: 'ai_ml',
    question: 'What does RAG stand for in enterprise LLM deployment pipelines?',
    options: [
      'Recursive Agent Generation',
      'Retrieval-Augmented Generation',
      'Reinforced Automated Grading',
      'Realtime Analytics Graph'
    ],
    correctAnswer: 'Retrieval-Augmented Generation',
    difficulty: 'Hard',
    explanation: 'RAG augments LLM generation by retrieving relevant context from external knowledge stores (e.g., vector databases).',
    points: 200
  },

  // --- 3. JAVASCRIPT ---
  {
    id: 'js-1',
    categoryId: 'javascript',
    question: 'What is the output of typeof null in JavaScript?',
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correctAnswer: '"object"',
    difficulty: 'Easy',
    explanation: 'This is a historical bug in JavaScript from its first implementation where null was tagged with the object type flag (000).',
    points: 100
  },
  {
    id: 'js-2',
    categoryId: 'javascript',
    question: 'Which method creates a new array with the results of calling a function on every element?',
    options: ['forEach()', 'map()', 'filter()', 'reduce()'],
    correctAnswer: 'map()',
    difficulty: 'Easy',
    explanation: 'Array.prototype.map() transforms each element and returns a newly populated array.',
    points: 100
  },
  {
    id: 'js-3',
    categoryId: 'javascript',
    question: 'What is the primary purpose of the JavaScript Event Loop microtask queue?',
    options: [
      'To schedule setTimeout and setInterval callbacks',
      'To execute resolved Promise handlers and queueMicrotask callbacks before macrotasks',
      'To handle user click events with lowest latency',
      'To garbage collect dereferenced heap objects'
    ],
    correctAnswer: 'To execute resolved Promise handlers and queueMicrotask callbacks before macrotasks',
    difficulty: 'Medium',
    explanation: 'Microtasks (Promises, queueMicrotask) are processed immediately after the currently running script and before the next macrotask.',
    points: 150
  },
  {
    id: 'js-4',
    categoryId: 'javascript',
    question: 'Which keyword creates block-scoped variables that cannot be redeclared in the same scope?',
    options: ['var', 'let', 'global', 'dynamic'],
    correctAnswer: 'let',
    difficulty: 'Medium',
    explanation: 'let and const are block-scoped and cannot be redeclared within the same lexical scope.',
    points: 150
  },
  {
    id: 'js-5',
    categoryId: 'javascript',
    question: 'What is the difference between Object.freeze() and Object.seal()?',
    options: [
      'Object.freeze makes properties read-only and non-configurable; Object.seal prevents adding/deleting properties but allows modifying existing writable properties.',
      'Object.seal is recursive while Object.freeze is shallow only.',
      'Object.freeze works on arrays only while Object.seal works on objects.',
      'There is no difference; they are aliases.'
    ],
    correctAnswer: 'Object.freeze makes properties read-only and non-configurable; Object.seal prevents adding/deleting properties but allows modifying existing writable properties.',
    difficulty: 'Hard',
    explanation: 'Object.freeze() makes all existing properties non-writable and non-configurable. Object.seal() prevents extensions and deletions, but allows value mutations if writable.',
    points: 200
  },

  // --- 4. DATA SCIENCE ---
  {
    id: 'ds-1',
    categoryId: 'data_science',
    question: 'In Pandas, which method returns the first 5 rows of a DataFrame by default?',
    options: ['df.first(5)', 'df.head()', 'df.preview()', 'df.top()'],
    correctAnswer: 'df.head()',
    difficulty: 'Easy',
    explanation: 'df.head(n=5) returns the top n rows of the DataFrame.',
    points: 100
  },
  {
    id: 'ds-2',
    categoryId: 'data_science',
    question: 'What metric is represented by the 50th percentile in a dataset?',
    options: ['Mean', 'Mode', 'Median', 'Variance'],
    correctAnswer: 'Median',
    difficulty: 'Easy',
    explanation: 'The 50th percentile (second quartile) splits the distribution into two equal halves, which is the median.',
    points: 100
  },
  {
    id: 'ds-3',
    categoryId: 'data_science',
    question: 'Which dimensionality reduction technique finds orthogonal axes maximizing dataset variance?',
    options: ['PCA (Principal Component Analysis)', 'K-Means', 'Random Forest', 'Linear Regression'],
    correctAnswer: 'PCA (Principal Component Analysis)',
    difficulty: 'Medium',
    explanation: 'PCA computes eigenvectors of the covariance matrix to identify principal components of maximum variance.',
    points: 150
  },
  {
    id: 'ds-4',
    categoryId: 'data_science',
    question: 'What is the primary trade-off addressed by regularization techniques (L1/L2)?',
    options: [
      'Speed vs Memory',
      'Bias vs Variance (Overfitting vs Underfitting)',
      'Precision vs Recall',
      'Supervised vs Unsupervised'
    ],
    correctAnswer: 'Bias vs Variance (Overfitting vs Underfitting)',
    difficulty: 'Hard',
    explanation: 'Regularization adds a penalty term to loss functions to penalize large weights, increasing bias slightly to reduce high variance.',
    points: 200
  },

  // --- 5. TECHNOLOGY ---
  {
    id: 'tech-1',
    categoryId: 'technology',
    question: 'What standard port is used for secure encrypted HTTPS web traffic?',
    options: ['80', '21', '443', '8080'],
    correctAnswer: '443',
    difficulty: 'Easy',
    explanation: 'Port 443 is the standard default port assigned for TLS/SSL HTTPS communication.',
    points: 100
  },
  {
    id: 'tech-2',
    categoryId: 'technology',
    question: 'In Docker architecture, what is a lightweight, standalone, executable package containing application code and dependencies?',
    options: ['Image', 'Volume', 'Daemon', 'Compose file'],
    correctAnswer: 'Image',
    difficulty: 'Easy',
    explanation: 'A Docker Image is an immutable snapshot used to instantiate running Docker containers.',
    points: 100
  },
  {
    id: 'tech-3',
    categoryId: 'technology',
    question: 'What does the CAP Theorem state about distributed data systems?',
    options: [
      'A distributed system can guarantee at most two of Consistency, Availability, and Partition Tolerance simultaneously.',
      'Compute, Access, and Performance must always be proportional.',
      'Caching, Authentication, and Persistence require dedicated physical nodes.',
      'Clusters must maintain 99.999% uptime during network partitions.'
    ],
    correctAnswer: 'A distributed system can guarantee at most two of Consistency, Availability, and Partition Tolerance simultaneously.',
    difficulty: 'Medium',
    explanation: 'Brewer\'s CAP Theorem proves that a distributed data store can simultaneously provide only two out of Consistency, Availability, and Partition Tolerance.',
    points: 150
  },
  {
    id: 'tech-4',
    categoryId: 'technology',
    question: 'Which cryptographic algorithm forms the basis of Bitcoin proof-of-work mining?',
    options: ['SHA-256', 'MD5', 'AES-128', 'RSA-2048'],
    correctAnswer: 'SHA-256',
    difficulty: 'Hard',
    explanation: 'Bitcoin uses double SHA-256 hashing to validate blocks and produce proof-of-work hashes below target difficulty.',
    points: 200
  },

  // --- 6. JAVA ---
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
    correctAnswer: 'To enable caching in the String Pool, thread safety, and secure hashing',
    difficulty: 'Medium',
    explanation: 'String immutability allows String interning in the constant pool, thread safety without synchronization, and stable hashCode caching.',
    points: 150
  },
  {
    id: 'java-2',
    categoryId: 'java',
    question: 'In Java, what occurs when a single bucket in a standard HashMap exceeds 8 elements (and capacity >= 64)?',
    options: [
      'The linked list in the bucket treeifies into a Red-Black tree (TreeNode)',
      'The HashMap throws a ConcurrentModificationException',
      'The bucket creates a secondary hash table with quadratic probing',
      'The oldest entries in the bucket are immediately evicted via LRU'
    ],
    correctAnswer: 'The linked list in the bucket treeifies into a Red-Black tree (TreeNode)',
    difficulty: 'Hard',
    explanation: 'In Java 8+, if a bucket length exceeds TREEIFY_THRESHOLD (8) and the table capacity is at least 64, the bucket is transformed into a balanced Red-Black tree, reducing worst-case search from O(n) to O(log n).',
    points: 200
  },

  // --- 7. C++ ---
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
    correctAnswer: 'To ensure the derived class destructor is called when deleting an object through a base pointer',
    difficulty: 'Medium',
    explanation: 'Deleting a derived class instance through a pointer to a base class without a virtual destructor results in undefined behavior and memory leaks because the derived destructor is never invoked.',
    points: 150
  },
  {
    id: 'cpp-2',
    categoryId: 'cpp',
    question: 'What is the primary difference between std::unique_ptr and std::shared_ptr in modern C++?',
    options: [
      'std::unique_ptr enforces exclusive single ownership with zero overhead, while std::shared_ptr uses reference counting',
      'std::unique_ptr allocates memory on the stack, while std::shared_ptr allocates on the heap',
      'std::unique_ptr can only be used with primitive types, whereas std::shared_ptr works with structs and classes',
      'std::unique_ptr cannot be moved using std::move, whereas std::shared_ptr can be cloned freely'
    ],
    correctAnswer: 'std::unique_ptr enforces exclusive single ownership with zero overhead, while std::shared_ptr uses reference counting',
    difficulty: 'Medium',
    explanation: 'std::unique_ptr has exclusive ownership semantics (move-only) with no reference counting control block overhead. std::shared_ptr maintains an atomic reference-counted control block.',
    points: 150
  },

  // --- 8. DSA & ALGORITHMS ---
  {
    id: 'dsa-1',
    categoryId: 'dsa',
    question: 'What is the worst-case time complexity of QuickSort when using a naive pivot selection on an already sorted array?',
    options: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(log n)'],
    correctAnswer: 'O(n^2)',
    difficulty: 'Easy',
    explanation: 'When the pivot creates unbalanced partitions of size 0 and n-1 at every recursive level, QuickSort degenerates to O(n^2) comparisons.',
    points: 100
  },
  {
    id: 'dsa-2',
    categoryId: 'dsa',
    question: 'Which graph traversal algorithm uses a First-In-First-Out (FIFO) queue and is guaranteed to find the shortest path in an unweighted graph?',
    options: [
      'Breadth-First Search (BFS)',
      'Depth-First Search (DFS)',
      'Topological Sort',
      'Kruskal Algorithm'
    ],
    correctAnswer: 'Breadth-First Search (BFS)',
    difficulty: 'Medium',
    explanation: 'BFS explores vertices in order of their distance from the source level by level, ensuring the first time an unweighted node is visited represents its shortest path.',
    points: 150
  },

  // --- 9. SQL & DATABASES ---
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
    correctAnswer: 'WHERE filters rows before aggregation, while HAVING filters aggregated group results',
    difficulty: 'Easy',
    explanation: 'The WHERE clause filters individual records prior to GROUP BY. The HAVING clause filters the grouped output resulting from aggregate functions like COUNT, SUM, or AVG.',
    points: 100
  },
  {
    id: 'sql-2',
    categoryId: 'sql',
    question: 'Under standard ANSI SQL transaction isolation levels, which isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still allow Phantom Reads?',
    options: [
      'Repeatable Read',
      'Read Committed',
      'Read Uncommitted',
      'Serializable'
    ],
    correctAnswer: 'Repeatable Read',
    difficulty: 'Hard',
    explanation: 'Repeatable Read guarantees that any data read cannot change during the transaction, preventing dirty reads and non-repeatable reads, but new rows inserted by concurrent transactions can still cause phantom reads.',
    points: 200
  },

  // --- 10. REACT & WEB DEV ---
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
    correctAnswer: 'To help the reconciliation diffing algorithm identify which items have changed, added, or removed',
    difficulty: 'Easy',
    explanation: 'React uses keys to match children in the original tree with children in the subsequent tree, preventing unnecessary unmounting and state loss.',
    points: 100
  },
  {
    id: 'react-2',
    categoryId: 'react',
    question: 'What happens if a useEffect hook does not specify a dependency array (i.e., useEffect(() => { ... }))?',
    options: [
      'The effect callback executes after every single component render',
      'The effect callback executes exactly once on initial mount only',
      'The component will throw an unhandled invariant runtime exception',
      'The effect runs asynchronously in a Web Worker thread'
    ],
    correctAnswer: 'The effect callback executes after every single component render',
    difficulty: 'Medium',
    explanation: 'Omitting the dependency array causes the effect to run on initial mount and after every subsequent render update.',
    points: 150
  },

  // --- 11. APTITUDE & REASONING ---
  {
    id: 'apt-1',
    categoryId: 'aptitude',
    question: 'If the price of a commodity increases by 25%, by what percentage must consumption be reduced so that the expenditure remains unchanged?',
    options: ['20%', '25%', '16.67%', '30%'],
    correctAnswer: '20%',
    difficulty: 'Easy',
    explanation: 'Using the formula [r / (100 + r)] * 100: [25 / 125] * 100 = 20% reduction in consumption.',
    points: 100
  },
  {
    id: 'apt-2',
    categoryId: 'aptitude',
    question: 'Find the next number in the prime square sequence: 4, 9, 25, 49, 121, ?',
    options: ['144', '169', '196', '225'],
    correctAnswer: '169',
    difficulty: 'Easy',
    explanation: 'The sequence consists of squares of consecutive prime numbers: 2^2, 3^2, 5^2, 7^2, 11^2. The next prime is 13, whose square is 169.',
    points: 100
  },
  {
    id: 'apt-3',
    categoryId: 'aptitude',
    question: 'A sum of money doubles itself in 8 years under simple interest. What is the annual rate of interest?',
    options: ['10%', '12.5%', '15%', '8%'],
    correctAnswer: '12.5%',
    difficulty: 'Easy',
    explanation: 'Simple interest SI = P. Since SI = (P * R * T) / 100, we have P = (P * R * 8) / 100 => R = 100 / 8 = 12.5% per annum.',
    points: 100
  },
  {
    id: 'apt-4',
    categoryId: 'aptitude',
    question: 'Pipe A can fill a tank in 12 hours and Pipe B can fill it in 18 hours. If both pipes operate together, how long will it take to fill the tank completely?',
    options: ['6.4 hours', '7.2 hours', '8.0 hours', '7.5 hours'],
    correctAnswer: '7.2 hours',
    difficulty: 'Medium',
    explanation: 'Combined rate = 1/12 + 1/18 = (3 + 2)/36 = 5/36 per hour. Total time = 36 / 5 = 7.2 hours.',
    points: 150
  },
  {
    id: 'apt-5',
    categoryId: 'aptitude',
    question: 'A 240-meter long train running at a uniform speed of 72 km/h crosses a platform in 25 seconds. What is the length of the platform?',
    options: ['260 meters', '280 meters', '300 meters', '320 meters'],
    correctAnswer: '260 meters',
    difficulty: 'Medium',
    explanation: 'Speed in m/s = 72 * (5/18) = 20 m/s. Total distance traveled = 20 * 25 = 500 meters. Platform length = 500 - 240 = 260 meters.',
    points: 150
  },
  {
    id: 'apt-6',
    categoryId: 'aptitude',
    question: 'Two fair six-sided dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on both dice is equal to 8?',
    options: ['5/36', '1/6', '7/36', '1/9'],
    correctAnswer: '5/36',
    difficulty: 'Medium',
    explanation: 'Favorable pairs summing to 8 are (2,6), (3,5), (4,4), (5,3), (6,2) — total 5 outcomes out of 36 possible outcomes. Probability = 5/36.',
    points: 150
  },
  {
    id: 'apt-7',
    categoryId: 'aptitude',
    question: 'A vessel contains 80 liters of pure milk. 8 liters is withdrawn and replaced with water. This replacement is repeated once more. How many liters of milk remain in the vessel?',
    options: ['64.8 liters', '62.5 liters', '66.4 liters', '60.0 liters'],
    correctAnswer: '64.8 liters',
    difficulty: 'Hard',
    explanation: 'Using the repeated dilution formula: Remaining Milk = 80 * (1 - 8/80)^2 = 80 * (9/10)^2 = 80 * 0.81 = 64.8 liters.',
    points: 200
  },
  {
    id: 'apt-8',
    categoryId: 'aptitude',
    question: 'A motorboat travels 24 km upstream and 36 km downstream in a total of 6 hours. If the speed of the river current is 2 km/h, what is the boat speed in still water?',
    options: ['10 km/h', '12 km/h', '8 km/h', '14 km/h'],
    correctAnswer: '10 km/h',
    difficulty: 'Hard',
    explanation: 'Let still water speed be v. Upstream speed = v - 2, downstream speed = v + 2. Equation: 24/(v - 2) + 36/(v + 2) = 6. Substituting v = 10: 24/8 + 36/12 = 3 + 3 = 6 hours.',
    points: 200
  }
];

/**
 * Service managing Firestore "questions" collection operations.
 */
export const questionService = {
  /**
   * Fetches questions for a battle based on categoryId and difficulty.
   * Shuffles questions randomly.
   *
   * @param {Object} params
   * @param {string} params.categoryId - e.g. 'python', 'ai_ml'
   * @param {string} params.difficulty - 'easy', 'medium', 'hard' (case-insensitive)
   * @param {number} [params.limit=10] - Number of questions to return
   * @returns {Promise<Array>} List of full questions
   */
  async getQuestionsForBattle({ categoryId = 'python', difficulty = 'medium', limit = 10 }) {
    try {
      const questionsRef = collection(db, 'questions');
      
      // Query by categoryId
      const qQuery = query(questionsRef, where('categoryId', '==', categoryId));
      let snapshot = await getDocs(qQuery);

      let allCategoryQuestions = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      // If Firestore collection is empty or unpopulated, use bundled INITIAL_QUESTIONS
      if (allCategoryQuestions.length === 0) {
        allCategoryQuestions = INITIAL_QUESTIONS.filter(q => q.categoryId === categoryId);
      }

      // If still empty, use all initial questions
      if (allCategoryQuestions.length === 0) {
        allCategoryQuestions = [...INITIAL_QUESTIONS];
      }

      // Normalize target difficulty
      const targetDiff = (difficulty || 'medium').toLowerCase();

      // Prioritize matching difficulty
      let matchedQuestions = allCategoryQuestions.filter(
        q => (q.difficulty || '').toLowerCase() === targetDiff
      );

      // If not enough questions of exact difficulty, complement with other difficulties from same category
      if (matchedQuestions.length < limit) {
        const remainingNeeded = limit - matchedQuestions.length;
        const otherDiffQuestions = allCategoryQuestions.filter(
          q => (q.difficulty || '').toLowerCase() !== targetDiff
        );
        matchedQuestions = [...matchedQuestions, ...otherDiffQuestions.slice(0, remainingNeeded)];
      }

      // If still not enough, complement with any available questions
      if (matchedQuestions.length < limit) {
        const remainingNeeded = limit - matchedQuestions.length;
        const remainingQuestions = INITIAL_QUESTIONS.filter(
          q => !matchedQuestions.some(m => m.id === q.id)
        );
        matchedQuestions = [...matchedQuestions, ...remainingQuestions.slice(0, remainingNeeded)];
      }

      // Randomize / Shuffle question order (Fisher-Yates Shuffle)
      const shuffled = [...matchedQuestions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return randomizeQuestionsList(shuffled.slice(0, limit));
    } catch (error) {
      console.warn('[QuestionService] Firestore questions query failed, using bundled fallback:', error);
      
      // Fallback to local dataset
      const targetDiff = (difficulty || 'medium').toLowerCase();
      let matched = INITIAL_QUESTIONS.filter(
        q => q.categoryId === categoryId && (q.difficulty || '').toLowerCase() === targetDiff
      );

      if (matched.length < limit) {
        const other = INITIAL_QUESTIONS.filter(
          q => q.categoryId === categoryId && (q.difficulty || '').toLowerCase() !== targetDiff
        );
        matched = [...matched, ...other];
      }

      if (matched.length < limit) {
        const allOther = INITIAL_QUESTIONS.filter(q => !matched.some(m => m.id === q.id));
        matched = [...matched, ...allOther];
      }

      const shuffled = [...matched];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return randomizeQuestionsList(shuffled.slice(0, limit));
    }
  }
};
