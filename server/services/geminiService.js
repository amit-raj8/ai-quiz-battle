import { GoogleGenAI } from '@google/genai';
import { validateQuizQuestions } from '../utils/quizValidator.js';
import { getDomainCalibration } from '../config/domainCalibration.js';

// In-flight Promise deduplication (guards concurrent duplicate HTTP requests within milliseconds)
const inFlightGenerations = new Map();

// History of recently generated question concepts to strictly prevent repetition
const recentCategoryQuestions = new Map();

// Diverse sub-topic pools per category to ensure wide variation across rounds
const DOMAIN_SUBTOPICS = {
  python: [
    'Generators, yield from, and memory-efficient streaming iterators',
    'Custom decorators with arguments and functools.wraps semantics',
    'Asyncio, event loops, tasks, coroutines, and async context managers',
    'Object-oriented mechanics: MRO, super(), metaclasses, and abstract base classes',
    'Dunder data model: __getitem__, __setitem__, __slots__, __call__, __repr__',
    'Memory optimization: reference counting, weakref, gc module, and GIL',
    'Dictionary & set hash table internals, collision resolution, and key hashing',
    'Collections module: deque, Counter, defaultdict, ChainMap, and OrderedDict',
    'Type hinting: typing.Protocol, Union, Optional, TypeVar, and Annotated',
    'Context managers, contextlib.contextmanager, and resource cleanup',
    'List/dict/set comprehensions, generator expressions, and advanced slicing',
    'Exception hierarchies, custom exceptions, and except* syntax',
    'Standard library mastery: itertools, functools, pathlib, dataclasses, math',
    'Lambda functions, closures, scoping rules (LEGB), and nonlocal keyword'
  ],
  javascript: [
    'Event loop phases: microtasks vs macrotasks, Promise jobs, and queueMicrotask',
    'Prototypes, prototype chain, Object.create, and inheritance',
    'V8 engine internals, inline caches, hidden classes, and JIT compilation',
    'Proxy and Reflect APIs for metaprogramming, traps, and validation',
    'Memory management: WeakMap, WeakSet, FinalizationRegistry, and memory leaks',
    'Modern ES features: optional chaining, nullish coalescing, private class fields',
    'Asynchronous coordination: Promise.allSettled, Promise.race, and AbortController',
    'Closures, lexical scope, hoisting, and Temporal Dead Zone (TDZ)',
    'TypedArrays, ArrayBuffers, DataView, and binary memory layout',
    'Modules: ES Module static analysis vs CommonJS dynamic loading',
    'DOM event lifecycle: capturing, target, bubbling, and delegation',
    'Function binding: call, apply, bind, and lexical this in arrow functions'
  ],
  ai_ml: [
    'Transformer self-attention mechanism, query-key-value projections, and multi-head attention',
    'Loss functions: cross-entropy, focal loss, contrastive loss, and triplet loss',
    'Optimization: AdamW, RMSprop, learning rate schedules, and gradient clipping',
    'Diffusion models: forward diffusion, reverse denoising U-Net, and score matching',
    'Reinforcement Learning from Human Feedback (RLHF), DPO, and PPO',
    'Model quantization: INT8, INT4, AWQ, and LoRA/QLoRA parameter-efficient fine-tuning',
    'Evaluation metrics: BLEU, ROUGE, perplexity, AUC-ROC, PR curves, and F1 calibration',
    'Convolutional & vision architectures: ResNet residual connections, ViT patch embeddings',
    'Regularization: dropout, batch normalization, layer normalization, and weight decay',
    'Vector embeddings, cosine similarity, approximate nearest neighbor search, and RAG'
  ],
  data_science: [
    'Pandas indexing, multi-indexing, vectorization, and memory downcasting',
    'NumPy array broadcasting rules, strides, ufuncs, and memory layouts',
    'Hypothesis testing: p-values, t-tests, ANOVA, Mann-Whitney U, and Chi-square',
    'Dimensionality reduction: PCA eigenvalues, t-SNE perplexity, and UMAP',
    'Feature engineering: target encoding, polynomial features, and quantile transformations',
    'Time series analysis: ARIMA, stationarity, Dickey-Fuller test, and autocorrelation',
    'Missing data mechanisms: MCAR, MAR, MNAR, and iterative imputation methods',
    'Data visualization principles: distribution skewness, boxplots, and heatmaps'
  ],
  technology: [
    'Distributed systems: CAP theorem, PACELC, Raft consensus, and vector clocks',
    'Kubernetes architecture: control plane, kubelet, etcd, and pod lifecycle',
    'Cloud networking: VPC peering, BGP, CIDR blocks, NAT gateways, and load balancing',
    'Database engines: B+ trees vs LSM trees, Write-Ahead Logging (WAL), and MVCC',
    'Operating system internals: virtual memory paging, context switches, epoll vs select',
    'Cybersecurity: OAuth 2.0 PKCE, JWT security, mTLS, CSRF vs XSS defenses',
    'Microservices: circuit breakers, saga pattern, event sourcing, and CQRS',
    'API design: RESTful idempotency, GraphQL resolvers, and gRPC Protobuf serialization'
  ],
  java: [
    'JVM memory architecture: Heap (Eden, Survivor, Tenured) vs Stack, Metaspace, and GC roots',
    'Garbage collection collectors: G1GC, ZGC, Shenandoah, and Stop-The-World (STW) pauses',
    'Java Concurrency: volatile keyword, Java Memory Model (JMM) happens-before guarantee',
    'Multithreading primitives: synchronized, ReentrantLock, CountDownLatch, and Semaphore',
    'Collections framework: HashMap internal bucket indexing, treeification (Red-Black tree threshold 8), and ConcurrentHashMap',
    'String internals: String constant pool, immutability, StringBuilder vs StringBuffer, and compact strings',
    'Object equality: == vs equals(), hashCode() contract, and HashSet lookups',
    'Exception hierarchy: Throwable, checked exceptions vs unchecked (RuntimeException), try-with-resources',
    'Modern Java features: Records, sealed classes, pattern matching, switch expressions, and virtual threads (Project Loom)',
    'Spring Framework core: Inversion of Control (IoC), Dependency Injection, Bean lifecycles, and @Transactional isolation'
  ],
  cpp: [
    'Pointers and references: pointer arithmetic, dangling pointers, nullptr vs NULL, and reference aliasing',
    'Smart pointers: std::unique_ptr move semantics, std::shared_ptr control block & reference count, and std::weak_ptr cycle prevention',
    'Object lifecycle & RAII: Rule of Three, Rule of Five, and Rule of Zero for resource management',
    'Move semantics: lvalue vs rvalue references (&&), std::move, and std::forward perfect forwarding',
    'Polymorphism & dispatch: virtual functions, vtable and vptr memory layout, and pure virtual abstract classes',
    'STL containers: std::vector dynamic resizing amortization, std::deque chunking, and std::unordered_map hashing',
    'Templates: function/class templates, template specialization, SFINAE, and C++20 concepts',
    'Memory management: new/delete vs malloc/free, placement new, and memory alignment',
    'Concurrency in modern C++: std::thread, std::mutex, std::lock_guard, std::unique_lock, and std::atomic',
    'Modern C++ features: constexpr, consteval, structured bindings, auto type deduction, and lambda capture modes'
  ],
  dsa: [
    'Tree data structures: Binary Search Tree (BST), AVL self-balancing rotations, and Red-Black tree properties',
    'Graph algorithms: Breadth-First Search (BFS), Depth-First Search (DFS), and cycle detection in directed/undirected graphs',
    'Shortest path algorithms: Dijkstra algorithm with min-heap priority queue, Bellman-Ford, and Floyd-Warshall',
    'Dynamic Programming: 0/1 Knapsack, Longest Common Subsequence (LCS), Longest Increasing Subsequence (LIS), and memoization vs tabulation',
    'Heaps and Priority Queues: binary heap array representation, heapify-up/down O(log n), and building a heap O(n)',
    'Sorting and Searching: QuickSort partition schemes (Lomuto vs Hoare), MergeSort stability, and Binary Search edge cases',
    'Trie data structure: prefix insertion, search, prefix matching, and word suggestion optimization',
    'Two Pointers and Sliding Window: trapping rain water, longest substring without repeating characters, and subarrays',
    'Disjoint Set Union (DSU / Union-Find): path compression and union by rank/size',
    'Asymptotic complexity analysis: Master Theorem, amortized complexity, and worst-case vs average-case Big-O bounds'
  ],
  sql: [
    'Relational joins: INNER JOIN, LEFT OUTER JOIN, FULL OUTER JOIN, CROSS JOIN, and self-joins',
    'Aggregation and grouping: GROUP BY mechanics, HAVING filtering vs WHERE clause evaluation order',
    'Database indexing: B-Tree vs Hash indexes, clustered vs non-clustered index lookup costs, and composite index leftmost prefix rule',
    'ACID transactions: Atomicity, Consistency, Isolation, Durability, and Write-Ahead Logging (WAL)',
    'Transaction isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable, and dirty/phantom reads',
    'Database normalization: 1NF, 2NF, 3NF, Boyce-Codd Normal Form (BCNF), and denormalization trade-offs',
    'Window functions: ROW_NUMBER(), RANK(), DENSE_RANK(), and LEAD()/LAG() with PARTITION BY and ORDER BY',
    'Subqueries and CTEs: Correlated subqueries vs Common Table Expressions (WITH clause) and recursive CTEs',
    'Query execution plans: EXPLAIN/ANALYZE, table scan vs index scan vs index seek, and nested loop vs hash joins',
    'Database constraints & integrity: PRIMARY KEY, FOREIGN KEY ON DELETE CASCADE, UNIQUE, and CHECK constraints'
  ],
  react: [
    'React rendering lifecycle: render phase vs commit phase, component re-rendering triggers, and reconciliation',
    'Virtual DOM and diffing algorithm: element type comparison, key prop importance, and heuristic diffing O(n)',
    'React Hooks mental model: useState closures, useEffect dependency array rules, and stale state bugs',
    'Performance optimization: React.memo shallow comparison, useMemo for expensive calculations, and useCallback for stable handlers',
    'DOM and mutable refs: useRef for imperatively accessing DOM nodes and persisting mutable values across renders',
    'Context API and State Architecture: React Context propagation, context splitting, and Redux/Zustand comparison',
    'React Fiber architecture: incremental rendering, fiber tree structure (child, sibling, return), and priority scheduling',
    'Concurrent React: Suspense boundaries, useTransition non-blocking updates, and useDeferredValue',
    'Custom hooks design: abstracting business logic, composability, and clean separation of UI and effects',
    'Server-Side Rendering (SSR) & Next.js: hydration process, client vs server components, and Core Web Vitals (LCP, FID, CLS)'
  ],
  aptitude: [
    'Time, Speed & Distance: relative speed, train crossing stationary/moving objects, and average speed',
    'Boats & Streams: upstream and downstream speed vectors, still water speed, and round trips',
    'Time & Work: individual and combined work rates, efficiency ratios, and alternate day work cycles',
    'Pipes & Cisterns: inlet/outlet flow rates, filling/emptying times, and leak calculations',
    'Permutations & Combinations: arrangement of distinct items, circular arrangements, and selection subsets',
    'Probability: dice rolls, card draws, independent events, and mutually exclusive outcomes',
    'Profit, Loss & Discount: marked price, successive discounts, cost price calculation, and profit margins',
    'Simple & Compound Interest: annual/semi-annual compounding, SI vs CI difference formula for 2 and 3 years',
    'Ratios, Proportions & Mixtures: alligation rule, repeated dilution of liquid mixtures, and partnership capital shares',
    'Number Systems & Divisibility: prime factorization, LCM & HCF word problems, unit digit cycles, and remainders',
    'Logical Deduction & Syllogisms: Venn diagram relationships, premise validity, and logical conclusions',
    'Blood Relations & Direction Sense: family tree decoding, coded relations, and cardinal/diagonal navigation vectors',
    'Seating Arrangements & Data Sufficiency: circular/row arrangements with facing constraints, and sufficiency checks'
  ]
};

/**
 * Extracts and parses JSON from raw model output, handling markdown blocks, LaTeX escapes, and control characters.
 *
 * @param {string} text
 * @returns {Object|null}
 */
function extractJson(text) {
  if (!text || typeof text !== 'string') return null;
  let cleaned = text.trim();

  // 1. Extract content within markdown code block if present
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  // 2. Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    // 3. Try parsing bounded substring from first '{' to last '}'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const bounded = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(bounded);
      } catch (e2) {
        // 4. Handle unescaped backslashes (e.g. from LaTeX notation like \Delta, \frac, \sqrt)
        try {
          const escaped = bounded.replace(/\\(?![/"\\bfnrtu]|u[0-9a-fA-F]{4})/g, '\\\\');
          return JSON.parse(escaped);
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}

/**
 * Executes Gemini generateContent with automatic retry and model rotation on transient conditions
 * (such as 503 High Demand or 429 Rate Limits).
 *
 * @param {Object} ai - GoogleGenAI client instance
 * @param {Object} params - Generation options
 * @param {number} [maxRetries=3] - Maximum backoff retries
 * @returns {Promise<Object>}
 */
async function callGeminiWithRetry(ai, params, maxRetries = 3) {
  const fallbackModels = [
    params.model,
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-latest'
  ].filter(Boolean);
  const models = [...new Set(fallbackModels)];

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const currentModel = models[attempt % models.length] || params.model;
    try {
      return await ai.models.generateContent({
        ...params,
        model: currentModel
      });
    } catch (err) {
      lastError = err;
      const msg = String(err.message || '');
      const lower = msg.toLowerCase();
      const isTransient = 
        msg.includes('429') || 
        msg.includes('503') || 
        lower.includes('quota') || 
        lower.includes('rate limit') || 
        lower.includes('resource_exhausted') || 
        lower.includes('high demand') || 
        lower.includes('unavailable') || 
        lower.includes('overloaded') ||
        lower.includes('fetch failed') ||
        lower.includes('etimedout');

      if (isTransient && attempt < maxRetries) {
        const waitMs = (attempt + 1) * 2000;
        console.warn(`[GeminiService] Transient condition on ${currentModel} (${msg.substring(0, 60)}...). Retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Service managing Gemini AI quiz generation with strict novelty, quality verification, and dynamic variance.
 */
export const geminiService = {
  /**
   * Generates validated structured quiz questions using Google Gemini API.
   *
   * @param {Object} params
   * @param {string} params.categoryName - Category display title (e.g., 'Python', 'AI & Machine Learning')
   * @param {string} [params.categoryId] - Category domain ID (e.g., 'python')
   * @param {string} params.difficulty - 'Easy' | 'Medium' | 'Hard'
   * @param {number} params.questionCount - Number of questions to generate (5 - 15)
   * @param {string} [params.generationId] - Unique identifier for intentional new battle requests
   * @returns {Promise<{ generationId: string|null, questions: Array }>}
   */
  async generateQuizQuestions({ 
    categoryName = 'Python', 
    categoryId = '',
    difficulty = 'Medium', 
    questionCount = 10,
    generationId = ''
  }) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      const err = new Error('Gemini API key is not configured on the server.');
      err.statusCode = 503;
      throw err;
    }

    const normalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
    const count = Math.max(5, Math.min(15, Number(questionCount) || 10));
    const expectedPoints = normalizedDifficulty === 'Hard' ? 200 : normalizedDifficulty === 'Medium' ? 150 : 100;
    const cleanGenId = (generationId || '').trim();

    // Concurrent request deduplication key (only for exact in-flight requests)
    const inFlightKey = cleanGenId ? `flight::${cleanGenId}` : null;
    if (inFlightKey && inFlightGenerations.has(inFlightKey)) {
      return await inFlightGenerations.get(inFlightKey);
    }

    const generationPromise = (async () => {
      try {
        return await this._executeGeminiGeneration({
          categoryName,
          categoryId,
          normalizedDifficulty,
          count,
          expectedPoints,
          cleanGenId,
          apiKey
        });
      } finally {
        if (inFlightKey) {
          inFlightGenerations.delete(inFlightKey);
        }
      }
    })();

    if (inFlightKey) {
      inFlightGenerations.set(inFlightKey, generationPromise);
    }

    return await generationPromise;
  },

  async _executeGeminiGeneration({
    categoryName,
    categoryId,
    normalizedDifficulty,
    count,
    expectedPoints,
    cleanGenId,
    apiKey
  }) {
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    const ai = new GoogleGenAI({ apiKey });

    const domainCalibration = getDomainCalibration(categoryId || categoryName);
    const domainName = domainCalibration.name || categoryName;
    const domainGuidance = domainCalibration.promptGuidance || `Focus strictly on core concepts of "${domainName}".`;
    const forbiddenGuidance = domainCalibration.forbiddenPatterns ? ` ${domainCalibration.forbiddenPatterns}` : '';
    const difficultyDetail = domainCalibration.difficultyGuidance?.[normalizedDifficulty] 
      ? domainCalibration.difficultyGuidance[normalizedDifficulty]
      : (normalizedDifficulty === 'Hard' ? 'Advanced/niche mastery' : normalizedDifficulty === 'Easy' ? 'Fundamental concepts' : 'Intermediate applied knowledge');

    const categoryKey = (categoryId || categoryName || 'general').toLowerCase();
    const recentQuestions = recentCategoryQuestions.get(categoryKey) || [];

    // Dynamically pick 3-5 random subtopics from the domain pool to steer this battle's questions
    const subtopicPool = DOMAIN_SUBTOPICS[categoryKey] || DOMAIN_SUBTOPICS.python || [];
    const shuffledSubtopics = [...subtopicPool].sort(() => 0.5 - Math.random());
    const selectedSubtopics = shuffledSubtopics.slice(0, Math.min(5, Math.max(3, Math.ceil(count / 2))));

    // Build list of recently used question concepts to explicitly avoid
    const recentAvoidText = recentQuestions.length > 0
      ? `\nPREVIOUSLY USED CONCEPTS (STRICTLY AVOID REPEATING ANY OF THESE):\n- ${recentQuestions.slice(0, 30).join('\n- ')}`
      : '';

    const randomSeed = Math.random().toString(36).substring(2, 9).toUpperCase();
    const timestampNonce = Date.now();

    const systemPrompt = `You are a high-performance trivia arena question engine for an esports quiz platform called AI QUIZ BATTLE.
Your goal is to generate engaging, precise, technically accurate, novel, and calibrated multiple-choice questions.

CRITICAL GENERATION RULES:
1. Category: "${domainName}"
2. Domain Guidance: ${domainGuidance}${forbiddenGuidance}
3. Difficulty: "${normalizedDifficulty}" (Calibration criteria: ${difficultyDetail})
4. Question Count: Exactly ${count} questions.
5. Each question MUST have EXACTLY 4 distinct, non-empty, unique options.
6. All 4 options MUST be unique. Absolutely NO duplicate options within any question.
7. Each question MUST have EXACTLY ONE correct answer, and "correctAnswer" MUST verbatim match one of the 4 items in "options".
8. RANDOMIZED ANSWER PLACEMENT: Strictly vary and randomize the position of the correct answer among the 4 options. Distribute the correct answer evenly across options A, B, C, and D across the set of questions. Never favor option B or any single position.
9. Do NOT use "All of the above" or "None of the above".
10. Provide a concise, educational technical explanation (1-2 sentences) for why the correct answer is right.
11. Set "points": ${expectedPoints}.
12. All ${count} questions must be completely UNIQUE. No duplicate questions in the response.
13. FRESHNESS GUARANTEE: Never generate cliché, starter, or repeated questions. Every single round must feel fresh, technical, and stimulating.
14. Return ONLY valid JSON in the exact schema requested.`;

    const userPrompt = `Generate exactly ${count} completely fresh, unique ${normalizedDifficulty}-difficulty multiple-choice questions for the domain "${domainName}".

BATTLE DIVERSIFICATION SPECIFICATIONS:
- Unique Battle Session Nonce: #${randomSeed} // ${timestampNonce}
- Focus on these dynamic sub-areas for this round:
  * ${selectedSubtopics.join('\n  * ')}
${recentAvoidText}

Return your response strictly as a JSON object adhering to this structure:
{
  "questions": [
    {
      "question": "Clear, technically precise question text?",
      "options": [
        "Plausible Option 1",
        "Plausible Option 2",
        "Plausible Option 3",
        "Plausible Option 4"
      ],
      "correctAnswer": "Plausible Option 1",
      "explanation": "Concise technical explanation.",
      "points": ${expectedPoints}
    }
  ]
}`;

    // Pass 1: Initial AI Generation with temperature: 1.0 for high diversity
    try {
      const response = await callGeminiWithRetry(ai, {
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.85
        }
      });
      const responseText = response?.text;

      if (!responseText) {
        throw new Error('Empty response received from Gemini API.');
      }

      let parsedData = extractJson(responseText);
      let pass1Validation = null;

      if (parsedData) {
        pass1Validation = validateQuizQuestions(parsedData, {
          expectedCount: count,
          difficulty: normalizedDifficulty,
          categoryName: domainName,
          categoryId
        });

        if (pass1Validation.isValid) {
          // Record recently generated question texts for anti-overlap
          const newNormalized = pass1Validation.sanitizedQuestions.map(q => q.question);
          const updatedRecent = [...newNormalized, ...recentQuestions].slice(0, 50);
          recentCategoryQuestions.set(categoryKey, updatedRecent);

          return {
            generationId: cleanGenId || null,
            questions: pass1Validation.sanitizedQuestions
          };
        }

        console.warn('[GeminiService] Pass 1 validation failed:', pass1Validation.errors);
      } else {
        console.warn('[GeminiService] Pass 1 JSON parsing failed.');
      }

      // Pass 2: Retry with explicit error correction instructions
      const errorsList = pass1Validation?.errors?.length 
        ? pass1Validation.errors.join('; ')
        : 'Malformed JSON structure or invalid response schema.';

      console.log('[GeminiService] Initiating single retry with correction feedback:', errorsList);

      const retryPrompt = `Your previous output had validation errors:
${errorsList}

Please regenerate exactly ${count} completely unique, fresh multiple-choice questions for category "${domainName}" (${normalizedDifficulty} difficulty).

STRICT CORRECTION REQUIREMENTS:
- Domain Focus: Must strictly adhere to ${domainName} (${domainGuidance}).
- Difficulty Calibration: ${difficultyDetail}.
- Exactly ${count} completely unique questions (NO duplicates).
- Exactly 4 unique, distinct options per question.
- "correctAnswer" must match one of the 4 options verbatim.
- "explanation" must be non-empty and technically descriptive.
- "points": ${expectedPoints}.
- Return strictly valid JSON adhering to the schema.`;

      const retryResponse = await callGeminiWithRetry(ai, {
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${retryPrompt}` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.85
        }
      });

      const retryText = retryResponse?.text;
      if (!retryText) {
        throw new Error('Empty response received on retry from Gemini API.');
      }

      const retryParsed = extractJson(retryText);
      if (!retryParsed) {
        const parseErr = new Error('AI quiz generation failed: Invalid JSON on retry.');
        parseErr.statusCode = 502;
        throw parseErr;
      }

      const retryValidation = validateQuizQuestions(retryParsed, {
        expectedCount: count,
        difficulty: normalizedDifficulty,
        categoryName,
        categoryId
      });

      if (!retryValidation.isValid) {
        console.error('[GeminiService] Retry validation failed:', retryValidation.errors);
        const valErr = new Error('AI quiz generation failed quality validation standards.');
        valErr.statusCode = 502;
        throw valErr;
      }

      // Record recently generated question texts for anti-overlap
      const newNormalized = retryValidation.sanitizedQuestions.map(q => q.question);
      const updatedRecent = [...newNormalized, ...recentQuestions].slice(0, 50);
      recentCategoryQuestions.set(categoryKey, updatedRecent);

      return {
        generationId: cleanGenId || null,
        questions: retryValidation.sanitizedQuestions
      };

    } catch (error) {
      if (error.statusCode) {
        throw error;
      }

      console.error('[GeminiService] Gemini API execution error:', error.message || error);
      
      const errorMessage = String(error.message || '');
      const lower = errorMessage.toLowerCase();

      // Rate limit / Quota exceeded
      if (errorMessage.includes('429') || lower.includes('quota') || lower.includes('rate limit') || lower.includes('resource_exhausted')) {
        const rateLimitErr = new Error('AI generation rate limit exceeded. Please try again in a moment.');
        rateLimitErr.statusCode = 429;
        throw rateLimitErr;
      }

      // Invalid / Missing API Key
      if (errorMessage.includes('API_KEY_INVALID') || lower.includes('invalid api key') || lower.includes('permission_denied')) {
        const authErr = new Error('AI generation service is temporarily unavailable.');
        authErr.statusCode = 503;
        throw authErr;
      }

      // Service Unavailable or Timeout
      if (lower.includes('unavailable') || lower.includes('econnrefused') || lower.includes('etimedout') || lower.includes('fetch failed')) {
        const serviceErr = new Error('AI generation service is temporarily unavailable.');
        serviceErr.statusCode = 503;
        throw serviceErr;
      }

      // Default safe user-facing message
      const serverErr = new Error('AI quiz generation failed. Please retry.');
      serverErr.statusCode = 500;
      throw serverErr;
    }
  }
};
