import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Standardizes raw category documents into consistent schema.
 *
 * @param {Object} docSnapOrObj
 * @returns {Object}
 */
export function normalizeCategoryDoc(docSnapOrObj) {
  if (!docSnapOrObj) return null;
  const data = typeof docSnapOrObj.data === 'function' ? docSnapOrObj.data() : docSnapOrObj;
  const docId = docSnapOrObj.id || data.id || data.categoryId || '';
  const rawId = (data.id || data.categoryId || docId || '').trim();
  const id = rawId.toLowerCase() || docId;
  const name = data.name || data.title || (id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Category');

  return {
    ...data,
    id,
    categoryId: id,
    name,
    description: data.description || 'Arena challenge domain.',
    icon: data.icon || data.iconName || 'Code',
    iconName: data.iconName || data.icon || 'Code',
    totalQuestions: Number(data.totalQuestions) || Number(data.questionCount) || 15,
    questionCount: Number(data.questionCount) || Number(data.totalQuestions) || 15,
    availableDifficulties: Array.isArray(data.availableDifficulties) && data.availableDifficulties.length > 0
      ? data.availableDifficulties
      : ['Easy', 'Medium', 'Hard'],
    badge: data.badge || null,
    order: Number(data.order) || 99
  };
}

/**
 * Initial 8 domain categories for AI Quiz Battle.
 * Each document contains: name, description, icon, totalQuestions, availableDifficulties, createdAt.
 */
export const INITIAL_CATEGORIES = [
  {
    id: 'python',
    categoryId: 'python',
    name: 'Python',
    description: 'Master Python syntax, data structures, OOP concepts, generators, and standard library.',
    icon: 'Code',
    iconName: 'Code',
    totalQuestions: 15,
    questionCount: 15,
    availableDifficulties: ['Easy', 'Medium', 'Hard'],
    badge: 'Popular',
    order: 1
  },
  {
    id: 'javascript',
    categoryId: 'javascript',
    name: 'JavaScript',
    description: 'Master ES6+, async/await, closures, prototypes, event loop, and JS engine mechanics.',
    icon: 'FileCode',
    iconName: 'FileCode',
    totalQuestions: 15,
    questionCount: 15,
    availableDifficulties: ['Easy', 'Medium', 'Hard'],
    badge: 'Hot',
    order: 2
  },
  {
    id: 'java',
    categoryId: 'java',
    name: 'Java',
    description: 'Core Java, JVM internals, multithreading, concurrency, OOP, Collections, and Spring.',
    icon: 'Coffee',
    iconName: 'Coffee',
    totalQuestions: 15,
    questionCount: 15,
    availableDifficulties: ['Easy', 'Medium', 'Hard'],
    badge: 'Enterprise',
    order: 3
  },
  {
    id: 'cpp',
    categoryId: 'cpp',
    name: 'C++',
    description: 'Pointers, memory management, STL containers, modern C++ (C++17/20), and system coding.',
    icon: 'Terminal',
    iconName: 'Terminal',
    totalQuestions: 15,
    questionCount: 15,
    availableDifficulties: ['Easy', 'Medium', 'Hard'],
    badge: 'Placement',
    order: 4
  },
  {
    id: 'dsa',
    categoryId: 'dsa',
    name: 'DSA & Algorithms',
    description: 'Trees, graphs, dynamic programming, sorting, recursion, and Big-O time/space complexity.',
    icon: 'Binary',
    iconName: 'Binary',
    totalQuestions: 15,
    questionCount: 15,
    availableDifficulties: ['Easy', 'Medium', 'Hard'],
    badge: 'Interview Top',
    order: 5
  },
  {
    id: 'sql',
    categoryId: 'sql',
    name: 'SQL & Databases',
    description: 'Complex queries, indexing, joins, ACID transactions, normalization, and optimization.',
    icon: 'Database',
    iconName: 'Database',
    totalQuestions: 15,
    questionCount: 15,
    availableDifficulties: ['Easy', 'Medium', 'Hard'],
    badge: 'Essential',
    order: 6
  },
  {
    id: 'react',
    categoryId: 'react',
    name: 'React & Web Dev',
    description: 'React Hooks, Virtual DOM, state management, reconciliation, and web performance.',
    icon: 'Layout',
    iconName: 'Layout',
    totalQuestions: 15,
    questionCount: 15,
    availableDifficulties: ['Easy', 'Medium', 'Hard'],
    badge: 'Frontend',
    order: 7
  },
  {
    id: 'ai_ml',
    categoryId: 'ai_ml',
    name: 'AI & Machine Learning',
    description: 'Neural networks, LLMs, computer vision, NLP, loss functions, and deep learning.',
    icon: 'Brain',
    iconName: 'Brain',
    totalQuestions: 15,
    questionCount: 15,
    availableDifficulties: ['Easy', 'Medium', 'Hard'],
    badge: 'Trending',
    order: 8
  },
  {
    id: 'aptitude',
    categoryId: 'aptitude',
    name: 'Aptitude & Reasoning',
    description: 'Quantitative math, logical reasoning, data interpretation, probability, and placement exam speed puzzles.',
    icon: 'Calculator',
    iconName: 'Calculator',
    totalQuestions: 15,
    questionCount: 15,
    availableDifficulties: ['Easy', 'Medium', 'Hard'],
    badge: 'Placement Core',
    order: 9
  }
];

export const categoryService = {
  /**
   * Fetches categories from Firestore "categories" collection.
   * If collection is empty, returns initial categories fallback.
   *
   * @returns {Promise<Array>} List of category objects
   */
  async getCategories() {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);

      if (snapshot.empty) {
        return [...INITIAL_CATEGORIES].sort((a, b) => (a.order || 99) - (b.order || 99));
      }

      const categories = snapshot.docs.map(docSnap => normalizeCategoryDoc(docSnap));

      // Sort by order for consistent UI presentation
      categories.sort((a, b) => (a.order || 99) - (b.order || 99));
      return categories;
    } catch (error) {
      console.warn('[CategoryService] Failed to fetch categories from Firestore, using bundled fallback:', error);
      return [...INITIAL_CATEGORIES].sort((a, b) => (a.order || 99) - (b.order || 99));
    }
  },

  /**
   * Fetches a single category by its document ID.
   *
   * @param {string} categoryId - The category document ID / slug
   * @returns {Promise<Object|null>}
   */
  async getCategoryById(categoryId) {
    if (!categoryId) return null;
    try {
      const normalizedId = String(categoryId).trim().toLowerCase();
      const docRef = doc(db, 'categories', normalizedId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return normalizeCategoryDoc(snapshot);
      }
      const fallback = INITIAL_CATEGORIES.find(c => c.id === normalizedId || c.categoryId === normalizedId);
      return fallback || null;
    } catch (error) {
      console.warn(`[CategoryService] Failed to get category ${categoryId}, checking fallback:`, error);
      const normalizedId = String(categoryId).trim().toLowerCase();
      const fallback = INITIAL_CATEGORIES.find(c => c.id === normalizedId || c.categoryId === normalizedId);
      return fallback || null;
    }
  },

  /**
   * Subscribes to real-time updates of the "categories" collection.
   *
   * @param {Function} onUpdate - Callback with sorted categories array
   * @param {Function} [onError] - Callback for error handling
   * @returns {Function} Unsubscribe listener
   */
  subscribeToCategories(onUpdate, onError) {
    const categoriesRef = collection(db, 'categories');
    return onSnapshot(
      categoriesRef,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate([...INITIAL_CATEGORIES].sort((a, b) => (a.order || 99) - (b.order || 99)));
          return;
        }

        const categories = snapshot.docs.map(docSnap => normalizeCategoryDoc(docSnap));
        categories.sort((a, b) => (a.order || 99) - (b.order || 99));
        onUpdate(categories);
      },
      (error) => {
        console.warn('[CategoryService] Categories snapshot listener error, falling back:', error);
        onUpdate([...INITIAL_CATEGORIES].sort((a, b) => (a.order || 99) - (b.order || 99)));
        if (onError) onError(error);
      }
    );
  }
};

