/**
 * Domain Calibration Configuration for AI QUIZ BATTLE.
 *
 * Defines domain-specific guidance, technical tokens, difficulty calibration,
 * and relevance criteria across all supported quiz categories.
 */

export const DOMAIN_CALIBRATIONS = {
  python: {
    id: 'python',
    name: 'Python',
    aliases: ['python', 'py'],
    tokens: [
      'python', 'def', 'lambda', 'list', 'dict', 'tuple', 'set', 'str', 'int', 'float', 'bool',
      'import', 'from', 'class', 'self', '__init__', 'yield', 'generator', 'decorator', 'async',
      'await', 'except', 'try', 'finally', 'raise', 'with', 'return', 'pass', 'break', 'continue',
      'range', 'len', 'enumerate', 'zip', 'map', 'filter', 'print', 'type', 'isinstance', 'issubclass',
      'dunder', 'slice', 'comprehension', 'iterable', 'iterator', 'method', 'attribute', 'package',
      'module', 'pip', 'virtualenv', 'gil', 'metaclass', 'cpython', 'pypy', 'mro', '__slots__',
      '__repr__', '__str__', '__call__', '__getitem__', '__iter__', '__next__', '__enter__', '__exit__',
      '__prepare__', '__await__', 'args', 'kwargs', 'none', 'true', 'false', 'global', 'nonlocal',
      'assert', 'in', 'is', 'not', 'and', 'or', 'elif', 'else', 'while', 'for', 'co_cellvars',
      'co_freevars', 'syntax', 'function', 'variable', 'object', 'inheritance', 'polymorphism',
      'recursion', 'namespace', 'scope', 'closure', 'garbage collection', 'memory', 'bytecode',
      'mutable', 'immutable', 'builtin', 'key', 'value', 'parameter', 'argument'
    ],
    difficultyGuidance: {
      Easy: 'Basic Python syntax, standard built-in data types (list, dict, tuple, set, str, int), common built-in functions (len, type, print, range), straightforward arithmetic/boolean operations, and simple control flow (if/else, for/while).',
      Medium: 'List and dictionary comprehensions, slicing, string formatting, function arguments (*args, **kwargs), exception handling (try/except/finally), basic object-oriented programming (classes, self, __init__, inheritance), and standard library modules (math, os, sys, json).',
      Hard: 'Advanced OOP mechanics, Method Resolution Order (MRO), custom metaclasses, descriptors (__get__, __set__), generators and yield from, custom decorators with arguments, memory optimization (__slots__, GIL, garbage collection), context managers (__enter__/__exit__), and async/await event loop coroutines.'
    },
    promptGuidance: 'Focus strictly on idiomatic Python 3, standard library mechanics, and language internals. Avoid mixing syntax from other languages or asking generic questions.',
    forbiddenPatterns: 'Avoid HTML, CSS, JavaScript-only APIs (like DOM/window), and generic unrelated trivia.'
  },

  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    aliases: ['javascript', 'js', 'ecmascript'],
    tokens: [
      'javascript', 'js', 'const', 'let', 'var', 'function', 'arrow function', 'array', 'object',
      'map', 'filter', 'reduce', 'promise', 'async', 'await', 'closure', 'prototype', 'prototype chain',
      'scope', 'hoisting', 'event loop', 'callback', 'dom', 'fetch', 'json', 'typescript', 'es6',
      'destructuring', 'spread', 'rest', 'module', 'import', 'export', 'this', 'bind', 'call',
      'apply', 'null', 'undefined', 'nan', 'typeof', 'instanceof', 'event', 'addeventlistener',
      'localstorage', 'sessionstorage', 'strict mode', 'generator', 'symbol', 'settimeout',
      'setinterval', 'currying', 'garbage collection', 'v8', 'node', 'truthy', 'falsy', 'coercion',
      'isnan', 'parseint', 'stringify', 'key', 'value', 'entries', 'freeze', 'seal', 'class',
      'extends', 'super', 'constructor', 'getter', 'setter', 'event bubbling', 'event delegation'
    ],
    difficultyGuidance: {
      Easy: 'Variable declarations (const, let, var), primitive data types (string, number, boolean, null, undefined), basic array/object creation, simple conditionals, typeof operator, and straightforward functions.',
      Medium: 'ES6+ features (destructuring, arrow functions, template literals, spread/rest), array transformation methods (map, filter, reduce, find), asynchronous JavaScript (Promises, async/await, fetch), basic closures, scope rules (block vs function scope), and DOM manipulation.',
      Hard: 'Event loop execution phases (microtasks vs macrotasks / Promise jobs vs setTimeout), prototype inheritance and prototype pollution concepts, explicit `this` binding (call, apply, bind), lexical environments and complex closures, Proxy and Reflect APIs, WeakMap/WeakSet memory semantics, and JS engine optimization nuances.'
    },
    promptGuidance: 'Focus on modern ECMAScript standards (ES6+), runtime execution mechanics (V8/Browser/Node), asynchronous patterns, and DOM/API standards. Ensure code snippets are syntactically valid JavaScript.',
    forbiddenPatterns: 'Avoid Java syntax, C++ pointers, or generic computer history unless directly tied to JavaScript evolution.'
  },

  ai_ml: {
    id: 'ai_ml',
    name: 'AI & Machine Learning',
    aliases: ['ai_ml', 'ai & machine learning', 'ai', 'machine learning', 'machine_learning', 'artificial intelligence', 'ml', 'deep learning'],
    tokens: [
      'machine learning', 'artificial intelligence', 'ai', 'ml', 'deep learning', 'neural network',
      'supervised', 'unsupervised', 'reinforcement learning', 'classification', 'regression',
      'clustering', 'cnn', 'rnn', 'transformer', 'llm', 'overfitting', 'underfitting', 'gradient descent',
      'backpropagation', 'loss function', 'activation function', 'relu', 'sigmoid', 'softmax',
      'cross-entropy', 'learning rate', 'epoch', 'batch size', 'precision', 'recall', 'f1-score',
      'roc', 'auc', 'cross-validation', 'regularization', 'dropout', 'l1', 'l2', 'knn', 'svm',
      'decision tree', 'random forest', 'xgboost', 'hyperparameter', 'embedding', 'tokenization',
      'attention mechanism', 'fine-tuning', 'rlhf', 'latent space', 'autoencoder', 'gan',
      'bias-variance', 'confusion matrix', 'nlp', 'computer vision', 'self-attention', 'weights',
      'biases', 'tensor', 'pytorch', 'tensorflow', 'model', 'dataset', 'training', 'inference',
      'prompt engineering', 'zero-shot', 'few-shot', 'quantization', 'lora', 'hallucination'
    ],
    difficultyGuidance: {
      Easy: 'Core paradigm definitions (supervised, unsupervised, reinforcement learning), fundamental problem types (classification vs regression vs clustering), basic performance concepts (accuracy, overfitting vs underfitting), and definition of neural networks.',
      Medium: 'Evaluation metrics (precision, recall, F1-score, ROC-AUC curve, confusion matrix), standard algorithms (Decision Trees, Random Forest, SVM, K-Means), regularization techniques (L1/L2 ridge/lasso, dropout), loss functions (MSE, cross-entropy), and activation functions (ReLU, Sigmoid, Softmax).',
      Hard: 'Transformer architecture details (multi-head self-attention, positional encodings, feedforward layers), optimization algorithms (Adam, RMSProp, learning rate schedulers, momentum), backpropagation calculus and gradient explosion/vanishing solutions (batch normalization, residual connections), and modern LLM alignment (RLHF, DPO, LoRA parameter-efficient fine-tuning).'
    },
    promptGuidance: 'Focus on rigorous artificial intelligence and machine learning principles, neural network mechanics, statistical learning theory, NLP/Vision architectures, and modern foundation model techniques. Avoid vague science fiction tropes.',
    forbiddenPatterns: 'Avoid sci-fi movie trivia or non-technical speculative claims. Questions must be grounded in real ML engineering and data science principles.'
  },

  data_science: {
    id: 'data_science',
    name: 'Data Science',
    aliases: ['data_science', 'data science', 'datascience', 'data analysis', 'analytics'],
    tokens: [
      'data science', 'pandas', 'numpy', 'dataframe', 'series', 'dataset', 'data cleaning',
      'preprocessing', 'statistics', 'hypothesis testing', 'p-value', 'null hypothesis',
      'correlation', 'covariance', 'mean', 'median', 'mode', 'standard deviation', 'variance',
      'outlier', 'imputation', 'normalization', 'standardization', 'eda', 'exploratory data analysis',
      'visualization', 'matplotlib', 'seaborn', 'histogram', 'boxplot', 'scatter plot',
      'feature engineering', 'one-hot encoding', 'scaling', 'aggregation', 'groupby', 'pivot table',
      'join', 'merge', 'sql', 'query', 'sampling', 'central limit theorem', 'distribution',
      'normal distribution', 'z-score', 'skewness', 'kurtosis', 'pca', 'dimension reduction',
      'time series', 'missing values', 'drop_duplicates', 'fillna', 'loc', 'iloc', 'vectorization',
      't-test', 'chi-square', 'anova', 'confidence interval', 'linear regression'
    ],
    difficultyGuidance: {
      Easy: 'Basic statistical measures (mean, median, mode, range), core data science libraries (Pandas DataFrames, NumPy ndarrays), basic data visualization chart types (bar, line, scatter, pie), and identifying missing or duplicate records.',
      Medium: 'Data preprocessing and feature transformation (one-hot encoding, min-max normalization, z-score standardization), Pandas data manipulation (groupby aggregations, merge/join operations, loc/iloc indexing), correlation vs covariance, and outlier detection (IQR, boxplots).',
      Hard: 'Inferential statistics and hypothesis testing (t-test, ANOVA, chi-square tests, p-value interpretation, Type I / Type II errors), probability distributions (Central Limit Theorem, Poisson, Binomial, Gaussian properties), dimensionality reduction (PCA eigenvectors/eigenvalues), and advanced multi-table vectorization pipelines.'
    },
    promptGuidance: 'Focus on data manipulation libraries (Pandas, NumPy), statistical inference, exploratory data analysis (EDA), feature engineering pipelines, and data visualization best practices.',
    forbiddenPatterns: 'Avoid general non-data programming trivia or purely web development questions.'
  },

  technology: {
    id: 'technology',
    name: 'Technology',
    aliases: ['technology', 'tech', 'computing', 'computer science', 'it', 'software engineering'],
    tokens: [
      'technology', 'computer', 'cpu', 'gpu', 'ram', 'ssd', 'operating system', 'linux', 'kernel',
      'process', 'thread', 'database', 'sql', 'nosql', 'relational', 'acid', 'networking', 'ip',
      'tcp', 'udp', 'http', 'https', 'dns', 'osi model', 'cloud computing', 'aws', 'azure',
      'docker', 'container', 'kubernetes', 'microservices', 'api', 'rest', 'graphql', 'cybersecurity',
      'encryption', 'cryptography', 'firewall', 'authentication', 'jwt', 'oauth', 'distributed systems',
      'cache', 'redis', 'load balancer', 'ci/cd', 'git', 'version control', 'hardware', 'virtualization',
      'serverless', 'lambda', 'ssh', 'ssl', 'tls', 'socket', 'storage', 'deadlock', 'concurrency',
      'throughput', 'latency', 'bandwidth', 'protocol', 'port', 'router', 'switch', 'vpn', 'vulnerability'
    ],
    difficultyGuidance: {
      Easy: 'Fundamental computer hardware components (CPU, RAM, ROM, storage), core internet protocols (HTTP, HTTPS, DNS, IP addresses), basic operating system concepts, and common developer tools (Git, basic commands).',
      Medium: 'Networking layers and transport protocols (TCP vs UDP, OSI model 7 layers), database concepts (ACID properties, relational vs NoSQL, indexes), cloud architecture fundamentals (virtual machines, containers, Docker, object storage), and basic cybersecurity (symmetric vs asymmetric encryption, hashing vs encryption).',
      Hard: 'Distributed systems concepts (CAP theorem, consensus algorithms like Raft, eventual consistency), operating system internals (virtual memory paging, process scheduling algorithms, race conditions/deadlocks), advanced network packet flow (TLS handshake, TCP windowing, subnetting), and container orchestration/service mesh architectures.'
    },
    promptGuidance: 'Focus on computer science fundamentals, systems architecture, computer networking, operating systems, cloud/DevOps infrastructure, and cybersecurity engineering.',
    forbiddenPatterns: 'Avoid consumer gadget rumors or lifestyle tech news; focus on technical computing fundamentals.'
  },

  java: {
    id: 'java',
    name: 'Java',
    aliases: ['java', 'core java', 'jvm', 'spring', 'spring boot', 'j2ee'],
    tokens: [
      'java', 'jvm', 'jdk', 'jre', 'bytecode', 'class', 'interface', 'abstract class', 'inheritance',
      'polymorphism', 'encapsulation', 'overloading', 'overriding', 'static', 'final', 'finally',
      'finalize', 'try', 'catch', 'throw', 'throws', 'exception', 'garbage collection', 'gc', 'g1',
      'zgc', 'heap', 'stack', 'metaspace', 'string pool', 'immutable', 'stringbuilder', 'stringbuffer',
      'equals', 'hashcode', 'hashmap', 'concurrent', 'treemap', 'arraylist', 'linkedlist', 'synchronize',
      'synchronized', 'volatile', 'atomic', 'thread', 'runnable', 'callable', 'future', 'executorservice',
      'generics', 'reflection', 'stream', 'lambda', 'optional', 'spring', 'bean', 'autowired'
    ],
    difficultyGuidance: {
      Easy: 'Core syntax, basic OOP (classes, objects, inheritance, polymorphism, encapsulation), primitive vs reference types, String immutability, == vs .equals(), and ArrayList basics.',
      Medium: 'Exception handling hierarchy (checked vs unchecked), Collections Framework (HashMap collision handling, TreeMap vs HashMap, Set), method overloading vs overriding rules, final/finally/finalize, and interfaces vs abstract classes.',
      Hard: 'JVM memory architecture (Heap, Stack, Metaspace, Young/Old generation, G1GC/ZGC), multithreading & concurrency (volatile, synchronized, ReentrantLock, AtomicInteger, ThreadLocal), Stream API internals, Java Memory Model (JMM happens-before relationship), and custom classloaders.'
    },
    promptGuidance: 'Focus on modern Java (Java 17/21 LTS), JVM architecture, enterprise patterns, OOP principles, and concurrency fundamentals crucial for coding exams and technical interviews.',
    forbiddenPatterns: 'Avoid JavaScript or C# syntax, or generic non-technical Java trivia.'
  },

  cpp: {
    id: 'cpp',
    name: 'C++',
    aliases: ['cpp', 'c++', 'cplusplus', 'c/c++'],
    tokens: [
      'c++', 'cpp', 'pointer', 'reference', 'malloc', 'free', 'new', 'delete', 'raii', 'destructor',
      'constructor', 'copy constructor', 'move constructor', 'move semantics', 'rvalue', 'lvalue',
      'std::move', 'std::unique_ptr', 'std::shared_ptr', 'std::weak_ptr', 'smart pointer', 'vtable',
      'vptr', 'virtual', 'pure virtual', 'polymorphism', 'template', 'specialization', 'stl', 'vector',
      'map', 'unordered_map', 'set', 'priority_queue', 'iterator', 'const', 'constexpr', 'consteval',
      'inline', 'static_cast', 'dynamic_cast', 'reinterpret_cast', 'const_cast', 'namespace',
      'operator overloading', 'lambda', 'rule of five', 'rule of zero', 'memory leak', 'segmentation fault',
      'stack', 'heap', 'concurrency', 'thread', 'mutex'
    ],
    difficultyGuidance: {
      Easy: 'Basic syntax, pointers vs references, dynamic memory (new/delete), basic classes and structs, function overloading, and standard I/O streams.',
      Medium: 'Constructors, destructors, copy vs move semantics (std::move), virtual functions and abstract base classes, STL containers (std::vector, std::map, std::unordered_map), and casting operators (static_cast, dynamic_cast).',
      Hard: 'Memory management (smart pointers: unique_ptr, shared_ptr, weak_ptr), vtable/vptr dispatch internals, RAII idiom, Rule of Three/Five/Zero, template metaprogramming, rvalue references, and thread synchronization (std::mutex, std::lock_guard).'
    },
    promptGuidance: 'Focus on modern C++ (C++17/20), standard template library (STL), memory safety, object lifecycles, and low-level mechanics tested in technical interviews and competitive exams.',
    forbiddenPatterns: 'Avoid pure C trivia or mixing with C# or Java syntax.'
  },

  dsa: {
    id: 'dsa',
    name: 'DSA & Algorithms',
    aliases: ['dsa', 'algorithms', 'data structures', 'data structures and algorithms', 'algo', 'leetcode'],
    tokens: [
      'array', 'linked list', 'doubly linked list', 'stack', 'queue', 'deque', 'hash table', 'hash map',
      'binary tree', 'binary search tree', 'bst', 'avl tree', 'red-black tree', 'trie', 'heap',
      'min heap', 'max heap', 'priority queue', 'graph', 'directed graph', 'dag', 'adjacency matrix',
      'adjacency list', 'dfs', 'bfs', 'dijkstra', 'bellman-ford', 'floyd-warshall', 'topological sort',
      'kruskal', 'prim', 'dynamic programming', 'memoization', 'tabulation', 'greedy', 'divide and conquer',
      'binary search', 'two pointers', 'sliding window', 'backtracking', 'recursion', 'quicksort',
      'mergesort', 'heapsort', 'big o', 'time complexity', 'space complexity', 'asymptotic', 'amortized'
    ],
    difficultyGuidance: {
      Easy: 'Basic arrays and strings, singly linked list traversal, stack LIFO and queue FIFO operations, binary search in a sorted array, and basic Big-O time complexity (O(1), O(n), O(n^2)).',
      Medium: 'Two-pointer and sliding window techniques, Binary Search Trees (insertion, search, traversal), Heap operations and priority queues, basic Graph traversals (BFS, DFS), and sorting algorithm complexities (QuickSort vs MergeSort).',
      Hard: 'Dynamic Programming (0/1 Knapsack, Longest Common Subsequence, state transitions), Advanced Graph algorithms (Dijkstra, Topological Sort, Disjoint Set Union / Union-Find), Self-balancing trees (AVL rotations, Red-Black trees), Trie prefix operations, and amortized complexity analysis.'
    },
    promptGuidance: 'Focus on classic computer science algorithms, data structures, asymptotic time/space complexities, and algorithmic problem-solving patterns frequently tested in FAANG coding interviews and university exams.',
    forbiddenPatterns: 'Avoid trivia about who invented an algorithm; focus on operational mechanics, Big-O trade-offs, and edge cases.'
  },

  sql: {
    id: 'sql',
    name: 'SQL & Databases',
    aliases: ['sql', 'database', 'databases', 'rdbms', 'postgresql', 'mysql', 'dbms'],
    tokens: [
      'sql', 'select', 'insert', 'update', 'delete', 'from', 'where', 'group by', 'having', 'order by',
      'join', 'inner join', 'left join', 'right join', 'full outer join', 'cross join', 'primary key',
      'foreign key', 'unique', 'index', 'b-tree', 'clustered index', 'non-clustered index', 'acid',
      'atomicity', 'consistency', 'isolation', 'durability', 'transaction', 'commit', 'rollback',
      'savepoint', 'isolation level', 'read uncommitted', 'read committed', 'repeatable read',
      'serializable', 'dirty read', 'phantom read', 'normalization', '1nf', '2nf', '3nf', 'bcnf',
      'denormalization', 'view', 'trigger', 'stored procedure', 'subquery', 'cte', 'window function',
      'row_number', 'rank', 'dense_rank', 'partition by', 'query optimization', 'explain plan', 'deadlock'
    ],
    difficultyGuidance: {
      Easy: 'Fundamental SQL DDL and DML statements (SELECT, INSERT, UPDATE, DELETE), basic WHERE filtering, ORDER BY sorting, and primary vs foreign keys.',
      Medium: 'JOIN types (INNER, LEFT, RIGHT, FULL), GROUP BY and HAVING clauses, aggregate functions (COUNT, SUM, AVG), subqueries, and table normalization concepts (1NF, 2NF, 3NF).',
      Hard: 'ACID transaction properties and isolation levels (Dirty Read, Non-repeatable Read, Phantom Read), database indexing internals (B-Tree vs Hash index, clustered vs non-clustered), Window Functions (ROW_NUMBER, RANK, DENSE_RANK with PARTITION BY), and query execution plan optimization.'
    },
    promptGuidance: 'Focus on relational database theory, ANSI SQL standards, indexing performance, transactions, and real-world database design patterns tested in database exams and backend interviews.',
    forbiddenPatterns: 'Avoid vendor-specific niche edge syntax; focus on standard ANSI SQL and core database engine internals.'
  },

  react: {
    id: 'react',
    name: 'React & Web Dev',
    aliases: ['react', 'reactjs', 'react.js', 'web development', 'frontend', 'web dev'],
    tokens: [
      'react', 'jsx', 'component', 'props', 'state', 'usestate', 'useeffect', 'usecontext', 'usememo',
      'usecallback', 'useref', 'usereducer', 'custom hook', 'hooks', 'virtual dom', 'reconciliation',
      'diffing algorithm', 'fiber', 'key prop', 'fragment', 'react.memo', 'lifecycle', 'mounting',
      'unmounting', 'render', 're-render', 'synthetic event', 'controlled component', 'context api',
      'redux', 'next.js', 'ssr', 'ssg', 'csr', 'hydrate', 'suspense', 'lazy', 'error boundary',
      'web performance', 'core web vitals'
    ],
    difficultyGuidance: {
      Easy: 'JSX syntax, functional components, passing props, basic useState hook, conditional rendering, and rendering lists with key props.',
      Medium: 'useEffect lifecycle and dependency arrays, controlled vs uncontrolled inputs, Context API for state sharing, useRef for DOM access and mutable values, and lifting state up.',
      Hard: 'Virtual DOM diffing and React Fiber architecture, performance optimization with useMemo, useCallback, and React.memo, custom hook design patterns, Concurrent React features (Suspense, useTransition), and Server-Side Rendering (SSR) hydration nuances.'
    },
    promptGuidance: 'Focus on modern React (React 18+), component architecture, Hooks mental models, rendering performance, and frontend engineering principles tested in frontend job interviews.',
    forbiddenPatterns: 'Avoid outdated React class lifecycle methods unless explicitly contrasting with modern hooks.'
  },

  aptitude: {
    id: 'aptitude',
    name: 'Aptitude & Reasoning',
    aliases: ['aptitude', 'quantitative aptitude', 'reasoning', 'logical reasoning', 'quant', 'mental ability', 'placement aptitude', 'aptitude & reasoning'],
    tokens: [
      'speed', 'distance', 'time', 'work', 'train', 'pipes', 'cistern', 'ratio', 'proportion',
      'percentage', 'profit', 'loss', 'discount', 'simple interest', 'compound interest', 'principal',
      'rate', 'probability', 'permutation', 'combination', 'alligation', 'mixture', 'average',
      'age', 'clock', 'calendar', 'series', 'sequence', 'progression', 'lcm', 'hcf',
      'remainder', 'divisibility', 'number', 'syllogism', 'blood relation', 'direction',
      'seating arrangement', 'data sufficiency', 'pie chart', 'bar graph', 'venn diagram',
      'coding decoding', 'analogy', 'puzzle', 'efficiency', 'relative speed', 'upstream', 'downstream',
      'math', 'arithmetic', 'geometric', 'quadrilateral', 'triangle', 'perimeter', 'area', 'volume',
      'fraction', 'decimal', 'equation', 'cost price', 'selling price', 'marked price', 'factor'
    ],
    difficultyGuidance: {
      Easy: 'Direct arithmetic calculations, basic percentages, straightforward ratios and proportions, simple interest formulas, basic series completion, and elementary blood relations/directions.',
      Medium: 'Time, Speed and Distance (relative speed, trains crossing platforms/trains), Time and Work (alternate days, efficiency ratios, pipes and cisterns), Compound Interest vs Simple Interest differences, classic Permutation & Combination counting, basic Probability (dice, cards, coins), and standard Syllogisms.',
      Hard: 'Multi-variable work-rate problems, Upstream/Downstream boat problems with currents, complex Probability (conditional probability, Bayes theorem intuition), Circular and Linear seating arrangements with dual attributes, Mixtures & Alligations replacement formulas, Data Sufficiency statements, and advanced Number Systems (Euler totient, unit digit cycles, Chinese remainder concepts).'
    },
    promptGuidance: 'Focus strictly on quantitative aptitude, logical reasoning, and placement exam speed-math problem solving typical in campus recruitment drives (TCS, Infosys, Wipro, Cognizant, FAANG/MNC screening rounds, GATE general aptitude, and CAT basics). Ensure questions have precise numerical figures, unambiguous reasoning, and fully verified correct answers.',
    forbiddenPatterns: 'Avoid software programming syntax or non-mathematical trivia. Every question must test quantitative calculation, logic, or placement reasoning.'
  }
};

/**
 * Resolves any category name, slug, or alias to its corresponding calibration configuration.
 * Falls back to 'python' if the category is unrecognized.
 *
 * @param {string} categoryNameOrId - Raw category identifier or title
 * @returns {Object} Domain calibration configuration object
 */
export function getDomainCalibration(categoryNameOrId) {
  if (!categoryNameOrId || typeof categoryNameOrId !== 'string') {
    return DOMAIN_CALIBRATIONS.python;
  }

  const normalized = categoryNameOrId.trim().toLowerCase().replace(/[^a-z0-9_ &]/g, '');

  // 1. Direct key lookup
  if (DOMAIN_CALIBRATIONS[normalized]) {
    return DOMAIN_CALIBRATIONS[normalized];
  }

  // 2. Lookup by aliases or matching canonical names
  for (const domainKey of Object.keys(DOMAIN_CALIBRATIONS)) {
    const config = DOMAIN_CALIBRATIONS[domainKey];
    if (config.id === normalized || config.name.toLowerCase() === normalized) {
      return config;
    }
    if (config.aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))) {
      return config;
    }
  }

  // 3. Fallback for custom or general categories
  return {
    id: normalized.replace(/\s+/g, '_'),
    name: categoryNameOrId.trim(),
    aliases: [normalized],
    tokens: [normalized, 'concept', 'definition', 'application', 'analysis', 'method', 'theory'],
    difficultyGuidance: {
      Easy: 'Foundational concepts, core definitions, and basic principles of ' + categoryNameOrId,
      Medium: 'Intermediate reasoning, practical application, and standard patterns in ' + categoryNameOrId,
      Hard: 'Advanced mastery, specialized nuances, edge cases, and deep analytical problem solving in ' + categoryNameOrId
    },
    promptGuidance: `Focus on precise, technically accurate concepts pertaining strictly to "${categoryNameOrId}".`,
    forbiddenPatterns: 'Avoid generic, unrelated trivia.'
  };
}

const TECHNICAL_COMMON_SIGNALS = [
  'algorithm', 'code', 'data', 'function', 'system', 'process', 'memory', 'protocol', 'database',
  'network', 'server', 'client', 'method', 'class', 'object', 'variable', 'structure', 'query',
  'index', 'cache', 'request', 'response', 'type', 'value', 'parameter', 'argument', 'module',
  'library', 'framework', 'execution', 'runtime', 'interface', 'architecture', 'component',
  'operation', 'performance', 'throughput', 'latency', 'concurrency', 'hardware', 'software',
  'application', 'analysis', 'logic', 'layer', 'storage', 'file', 'security', 'error', 'exception',
  'optimization', 'pipeline', 'metric', 'equation', 'energy', 'force', 'theory', 'experiment',
  'compute', 'device', 'packet', 'cluster', 'node', 'thread', 'syntax', 'statement', 'expression'
];

/**
 * Checks whether text satisfies domain relevance criteria using domain tokens and semantic heuristics.
 *
 * @param {string} text - Combined normalized text (question + options + explanation)
 * @param {Object} domainConfig - Calibration configuration from getDomainCalibration
 * @returns {boolean}
 */
export function isTextDomainRelevant(text, domainConfig) {
  if (!domainConfig) {
    return true; // Non-restrictive fallback
  }

  const normalizedText = (text || '').toLowerCase();

  // 1. Direct name / ID match
  if (domainConfig.name && normalizedText.includes(domainConfig.name.toLowerCase())) {
    return true;
  }
  if (domainConfig.id && normalizedText.includes(domainConfig.id.toLowerCase())) {
    return true;
  }

  // 2. Alias match
  if (Array.isArray(domainConfig.aliases) && domainConfig.aliases.some(alias => normalizedText.includes(alias.toLowerCase()))) {
    return true;
  }

  // 3. Domain tokens match
  if (Array.isArray(domainConfig.tokens) && domainConfig.tokens.some(token => normalizedText.includes(token.toLowerCase()))) {
    return true;
  }

  // 4. Fallback: Technical/Scientific common semantic signals for coding & STEM domains
  const isTechDomain = [
    'python', 'javascript', 'java', 'cpp', 'dsa', 'sql', 'react', 'ai_ml', 'data_science', 'technology', 'aptitude'
  ].includes(domainConfig.id);
  if (isTechDomain) {
    const hasStemSignal = TECHNICAL_COMMON_SIGNALS.some(signal => normalizedText.includes(signal));
    if (hasStemSignal) {
      return true;
    }
  }

  // 5. Default pass for fallback custom categories
  if (domainConfig.id && !['python', 'javascript', 'java', 'cpp', 'dsa', 'sql', 'react', 'ai_ml', 'aptitude'].includes(domainConfig.id)) {
    return true;
  }

  return false;
}

