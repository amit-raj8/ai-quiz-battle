import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { quizService } from '../services/quizService';
import { aiQuizService } from '../services/aiQuizService';
import { categoryService } from '../services/categoryService';
import { leaderboardService } from '../services/leaderboardService';
import { battleHistoryService } from '../services/battleHistoryService';
import { duelService } from '../services/duelService';
import { calculateQuestionScore, calculateQuizSummary } from '../utils/scoring';
import { randomizeQuestionOptions } from '../utils/questionRandomizer';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

const QuizContext = createContext(null);

export const QuizProvider = ({ children }) => {
  const { currentUser, userProfile } = useAuth();

  // Navigation State: 'home' | 'setup' | 'game' | 'result' | 'leaderboard' | 'profile' | 'duel'
  const [currentScreen, setCurrentScreen] = useState('home');

  // 1v1 Multiplayer Duel State
  const [activeDuelRoomId, setActiveDuelRoomId] = useState(null);
  const [currentDuelRoom, setCurrentDuelRoom] = useState(null);
  const [incomingDuelInvites, setIncomingDuelInvites] = useState([]);

  // Categories & Data
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  // Leaderboard & Global Rank State
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);

  // Setup Config State (Defaults to dynamic AI Battle mode)
  const [quizConfig, setQuizConfig] = useState({
    battleSource: 'ai', // 'ai' | 'firestore'
    categoryId: '',
    categoryName: '',
    difficulty: 'Medium',
    questionCount: 10
  });

  // Unique Battle Session State & Concurrency Guard
  const [battleSessionId, setBattleSessionId] = useState(null);
  const savedBattleIdsRef = useRef(new Set());
  const isStartingRef = useRef(false);
  const [isSavingBattle, setIsSavingBattle] = useState(false);
  const [battleSaveError, setBattleSaveError] = useState(null);

  // Game Engine State
  const [questions, setQuestions] = useState([]);
  const [sessionQuestionsMap, setSessionQuestionsMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  
  // Current Question Interactive State
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [revealedAnswer, setRevealedAnswer] = useState(null);
  const [lastScoreGained, setLastScoreGained] = useState(null);
  
  // Status Flags
  const [isLoading, setIsLoading] = useState(false);
  const [gameError, setGameError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [lastSummary, setLastSummary] = useState(null);

  // Subscribe to real-time categories from Firestore
  useEffect(() => {
    setIsCategoriesLoading(true);
    const unsubscribe = categoryService.subscribeToCategories(
      (fetchedCategories) => {
        const normalized = (fetchedCategories || []).map(c => ({
          ...c,
          id: (c.id || c.categoryId || '').toLowerCase(),
          categoryId: (c.categoryId || c.id || '').toLowerCase(),
          name: c.name || c.title || ''
        }));

        setCategories(normalized);
        setIsCategoriesLoading(false);
        setCategoriesError(null);

        // Keep quizConfig synchronized with loaded categories without blowing away active selection
        setQuizConfig(prev => {
          if (!prev.categoryId) return prev;
          const currentId = (prev.categoryId || '').toLowerCase();
          const matched = normalized.find(c => c.id === currentId || c.categoryId === currentId);
          if (matched) {
            return {
              ...prev,
              categoryId: matched.id,
              categoryName: matched.name
            };
          }
          return prev;
        });
      },
      (error) => {
        console.error('[QuizContext] Error loading categories from Firestore:', error);
        setCategoriesError('Failed to load arena categories. Please verify network connection.');
        setIsCategoriesLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time leaderboard and calculate current user rank
  useEffect(() => {
    setIsLeaderboardLoading(true);
    const unsubscribe = leaderboardService.subscribeToLeaderboard(
      currentUser?.uid,
      (rankedList) => {
        setLeaderboard(rankedList);
        setIsLeaderboardLoading(false);
        if (currentUser?.uid) {
          const found = rankedList.find(p => p.uid === currentUser.uid);
          setUserRank(found ? found.rank : 1);
        }
      },
      (error) => {
        console.error('[QuizContext] Error loading leaderboard from Firestore:', error);
        setIsLeaderboardLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Subscribe to real-time incoming 1v1 duel invites
  useEffect(() => {
    if (!currentUser?.uid) {
      setIncomingDuelInvites([]);
      return;
    }

    const unsubscribe = duelService.subscribeToIncomingDuelInvites(
      currentUser.uid,
      (invites) => {
        setIncomingDuelInvites(invites || []);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const startDuelMatch = (roomData) => {
    setActiveDuelRoomId(roomData.roomId);
    setCurrentDuelRoom(roomData);
    setCurrentScreen('duel');
  };

  const acceptDuelInvite = async (invite) => {
    await duelService.acceptDuelInvite(invite.roomId || invite.id);
    setActiveDuelRoomId(invite.roomId || invite.id);
    setCurrentDuelRoom(invite);
    setIncomingDuelInvites(prev => prev.filter(inv => inv.roomId !== (invite.roomId || invite.id)));
    setCurrentScreen('duel');
  };

  const declineDuelInvite = async (roomId) => {
    await duelService.declineDuelInvite(roomId);
    setIncomingDuelInvites(prev => prev.filter(inv => inv.roomId !== roomId));
  };

  const exitDuel = () => {
    setActiveDuelRoomId(null);
    setCurrentDuelRoom(null);
  };

  // Protected screens that require authentication to access features
  const PROTECTED_SCREENS = ['setup', 'game', 'result', 'leaderboard', 'profile', 'duel'];

  // Auth Modal State for feature access control
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    title: 'PILOT CLEARANCE REQUIRED',
    featureName: 'Arena Feature',
    message: 'You must be signed in with an active pilot account to access this feature.'
  });

  // Saved pending navigation target if user signs in
  const [pendingTarget, setPendingTarget] = useState({
    screen: null,
    category: null
  });

  const openAuthModal = ({
    title = 'PILOT CLEARANCE REQUIRED',
    featureName = 'Arena Feature',
    message = 'You must be signed in with an active pilot account to access this feature.',
    pendingScreen = null,
    pendingCategory = null
  } = {}) => {
    if (pendingScreen || pendingCategory) {
      setPendingTarget({
        screen: pendingScreen,
        category: pendingCategory
      });
    }
    setAuthModal({
      isOpen: true,
      title,
      featureName,
      message
    });
  };

  const closeAuthModal = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  };

  const clearPendingTarget = () => {
    setPendingTarget({ screen: null, category: null });
  };

  // Screen Navigation helper with feature access control
  const navigateTo = (screen, options = {}) => {
    // If user is trying to access a protected feature screen while logged out
    if (PROTECTED_SCREENS.includes(screen) && !currentUser && !options.skipAuthCheck) {
      const featureLabels = {
        setup: 'Battle Arena Configuration',
        game: 'Live Quiz Arena',
        result: 'Battle Telemetry Results',
        leaderboard: 'Grand Prix Standings',
        profile: 'Pilot Telemetry Profile'
      };

      openAuthModal({
        title: 'PILOT CLEARANCE REQUIRED',
        featureName: featureLabels[screen] || 'Restricted Arena Feature',
        message: `Sign in to access ${featureLabels[screen] || 'this arena feature'}, generate AI trivia, and compete on the global podium.`,
        pendingScreen: screen
      });
      return false;
    }

    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  };

  // Launch setup with pre-selected category (Guarded for authenticated pilots)
  const selectCategoryAndGoToSetup = (category) => {
    if (!category) return;
    const catId = (category.id || category.categoryId || '').toLowerCase();
    const catName = category.name || category.title || (catId ? catId.charAt(0).toUpperCase() + catId.slice(1) : '');

    if (!currentUser) {
      openAuthModal({
        title: 'PILOT CLEARANCE REQUIRED',
        featureName: `${catName || 'Domain'} Arena`,
        message: `Sign in with your pilot account to configure battle telemetry and challenge AI in the ${catName || 'selected'} arena.`,
        pendingScreen: 'setup',
        pendingCategory: category
      });
      return;
    }

    setQuizConfig(prev => ({
      ...prev,
      categoryId: catId,
      categoryName: catName
    }));
    navigateTo('setup');
  };

  // Start Quiz Session with concurrency deduplication guard (Guarded)
  const startQuiz = async (configOverride) => {
    if (!currentUser) {
      openAuthModal({
        title: 'PILOT CLEARANCE REQUIRED',
        featureName: 'Live Battle Arena',
        message: 'You must be signed in with a pilot account to launch AI battles and record XP telemetry.',
        pendingScreen: 'setup'
      });
      return;
    }

    if (isStartingRef.current) {
      console.warn('[QuizContext] Battle launch already running. Suppressing duplicate launch trigger.');
      return;
    }

    isStartingRef.current = true;

    if (configOverride) {
      setQuizConfig(prev => ({ ...prev, ...configOverride }));
    }

    const activeConfig = {
      ...quizConfig,
      ...(configOverride || {})
    };

    const newSessionId = `battle_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newGenerationId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    setBattleSessionId(newSessionId);
    setIsSavingBattle(false);
    setBattleSaveError(null);
    setIsLoading(true);
    setGameError(null);
    navigateTo('game');
    
    try {
      let fetchedQuestions = [];

      if (activeConfig.battleSource === 'ai') {
        fetchedQuestions = await aiQuizService.generateAIQuiz({
          categoryId: activeConfig.categoryId,
          categoryName: activeConfig.categoryName,
          difficulty: activeConfig.difficulty,
          questionCount: activeConfig.questionCount,
          generationId: newGenerationId
        });
      } else {
        fetchedQuestions = await quizService.getQuestions({
          categoryId: activeConfig.categoryId,
          difficulty: activeConfig.difficulty,
          limit: activeConfig.questionCount
        });
      }

      if (!fetchedQuestions || fetchedQuestions.length === 0) {
        setQuestions([]);
        setSessionQuestionsMap({});
        setGameError('No questions could be loaded for this arena battle.');
        return;
      }

      const diffNormalized = (activeConfig.difficulty || 'medium').toLowerCase();
      const expectedPoints = diffNormalized === 'hard' ? 200 : diffNormalized === 'easy' ? 100 : 150;

      // Map questions and randomize options to guarantee uniform answer distribution (no Option B bias)
      const questionsMap = {};
      const sanitizedQuestions = [];

      fetchedQuestions.forEach((rawQ) => {
        // Completely randomize options so correct answers distribute uniformly across A, B, C, D
        const q = randomizeQuestionOptions(rawQ);

        let correctIdx = q.correctAnswerIndex;
        if (correctIdx === undefined || correctIdx === null || correctIdx < 0) {
          if (typeof q.correctAnswer === 'number') {
            correctIdx = q.correctAnswer;
          } else if (typeof q.correctAnswer === 'string') {
            const matchIdx = q.options.findIndex(
              opt => opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
            );
            correctIdx = matchIdx >= 0 ? matchIdx : 0;
          }
        }

        const correctAnswerString = typeof q.correctAnswer === 'string'
          ? q.correctAnswer
          : (q.options[correctIdx] || '');

        const safePoints = q.points || expectedPoints;

        questionsMap[q.id] = {
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: correctAnswerString,
          correctAnswerIndex: correctIdx,
          explanation: q.explanation || '',
          points: safePoints,
          difficulty: q.difficulty || activeConfig.difficulty,
          categoryId: q.categoryId || activeConfig.categoryId
        };

        // Sanitized question for UI (correctAnswer and explanation omitted before submission)
        sanitizedQuestions.push({
          id: q.id,
          question: q.question,
          options: q.options,
          categoryId: q.categoryId || activeConfig.categoryId,
          difficulty: q.difficulty || activeConfig.difficulty,
          points: safePoints
        });
      });

      setSessionQuestionsMap(questionsMap);
      setQuestions(sanitizedQuestions);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setUserAnswers([]);
      setSelectedOption(null);
      setIsAnswered(false);
      setRevealedAnswer(null);
      setLastScoreGained(null);
      setQuizCompleted(false);
      setLastSummary(null);
    } catch (err) {
      console.error('[QuizContext] Error starting quiz:', err);
      aiQuizService.resetLock();
      const userMessage = activeConfig.battleSource === 'ai'
        ? (err.message || 'AI Battle Generation Failed. Unable to generate battle right now. Please retry.')
        : 'Failed to load arena battle questions. Please check connection.';
      setGameError(userMessage);
    } finally {
      isStartingRef.current = false;
      setIsLoading(false);
    }
  };

  // Submit Answer for current question
  const submitAnswer = (optionIndex, timeRemainingSeconds = 0) => {
    if (isAnswered || !questions[currentIndex]) return;

    const currentQ = questions[currentIndex];
    const fullQ = sessionQuestionsMap[currentQ.id];
    
    if (!fullQ) return;

    const selectedOptionText = currentQ.options[optionIndex] || '';
    const isCorrect = 
      optionIndex === fullQ.correctAnswerIndex || 
      selectedOptionText.trim().toLowerCase() === fullQ.correctAnswer.trim().toLowerCase();

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const scoreResult = calculateQuestionScore({
      isCorrect,
      streak,
      difficulty: quizConfig.difficulty,
      timeRemainingSeconds
    });

    const newScore = score + scoreResult.totalPoints;
    const newStreak = scoreResult.newStreak;
    const newMaxStreak = Math.max(maxStreak, newStreak);

    setScore(newScore);
    setStreak(newStreak);
    setMaxStreak(newMaxStreak);
    setLastScoreGained(scoreResult);

    // Reveal answer and explanation
    setRevealedAnswer({
      correctAnswer: fullQ.correctAnswer,
      correctAnswerIndex: fullQ.correctAnswerIndex,
      explanation: fullQ.explanation,
      isCorrect
    });

    const answerRecord = {
      questionId: currentQ.id,
      selectedIndex: optionIndex,
      correctIndex: fullQ.correctAnswerIndex,
      correctAnswer: fullQ.correctAnswer,
      isCorrect,
      isTimeout: false,
      scoreGained: scoreResult.totalPoints,
      explanation: fullQ.explanation
    };

    setUserAnswers(prev => [...prev, answerRecord]);
  };

  // Handle Timeout (15s expired)
  const handleTimeout = () => {
    if (isAnswered || !questions[currentIndex]) return;

    const currentQ = questions[currentIndex];
    const fullQ = sessionQuestionsMap[currentQ.id];

    setSelectedOption(null);
    setIsAnswered(true);
    setStreak(0);

    setLastScoreGained({
      basePoints: 0,
      streakBonus: 0,
      timeBonus: 0,
      difficultyMultiplier: 1,
      totalPoints: 0,
      newStreak: 0
    });

    if (fullQ) {
      setRevealedAnswer({
        correctAnswer: fullQ.correctAnswer,
        correctAnswerIndex: fullQ.correctAnswerIndex,
        explanation: fullQ.explanation,
        isCorrect: false
      });
    }

    const answerRecord = {
      questionId: currentQ.id,
      selectedIndex: null,
      correctIndex: fullQ?.correctAnswerIndex ?? -1,
      correctAnswer: fullQ?.correctAnswer ?? '',
      isCorrect: false,
      isTimeout: true,
      scoreGained: 0,
      explanation: fullQ?.explanation || ''
    };

    setUserAnswers(prev => [...prev, answerRecord]);
  };

  // Advance to Next Question or Finish
  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setRevealedAnswer(null);
      setLastScoreGained(null);
    } else {
      finishQuiz();
    }
  };

  // Finish Quiz & Calculate Final Summary
  const finishQuiz = async () => {
    const summary = calculateQuizSummary(questions, userAnswers, score, maxStreak);
    const activeBattleId = battleSessionId || `battle_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const currentBattleSource = quizConfig.battleSource || 'ai';
    
    const enrichedSummary = {
      ...summary,
      battleId: activeBattleId,
      battleSource: currentBattleSource,
      categoryId: quizConfig.categoryId,
      categoryName: quizConfig.categoryName,
      difficulty: quizConfig.difficulty,
      isSaved: false
    };

    setLastSummary(enrichedSummary);
    setQuizCompleted(true);
    navigateTo('result');

    // Trigger celebration confetti if high score/good accuracy
    if (summary.accuracy >= 60) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Save ONE battle document to users/{uid}/battleHistory/{battleId} if authenticated and not already saved
    if (currentUser?.uid) {
      if (!savedBattleIdsRef.current.has(activeBattleId)) {
        savedBattleIdsRef.current.add(activeBattleId);
        setIsSavingBattle(true);
        setBattleSaveError(null);

        const battlePayload = {
          battleId: activeBattleId,
          userId: currentUser.uid,
          battleSource: currentBattleSource,
          categoryId: quizConfig.categoryId,
          categoryName: quizConfig.categoryName,
          difficulty: quizConfig.difficulty,
          totalQuestions: summary.totalQuestions,
          attemptedQuestions: summary.attemptedQuestions,
          correctAnswers: summary.correctAnswers,
          incorrectAnswers: summary.incorrectAnswers,
          score: summary.score,
          accuracy: summary.accuracy,
          maxStreak: summary.maxStreak,
          xpEarned: summary.xpEarned
        };

        try {
          const saveResult = await battleHistoryService.saveBattleResult(currentUser.uid, battlePayload);
          setIsSavingBattle(false);
          if (saveResult && saveResult.success) {
            setLastSummary(prev => (prev ? { ...prev, isSaved: true } : prev));
          }
        } catch (err) {
          console.error('[QuizContext] Error saving battle telemetry to Firestore:', err);
          setIsSavingBattle(false);
          setBattleSaveError('Failed to record battle telemetry in database.');
        }
      }
    }

    // Submit results to service layer
    try {
      await quizService.submitResults({
        category: quizConfig.categoryName,
        difficulty: quizConfig.difficulty,
        summary: enrichedSummary
      });
    } catch (err) {
      console.error('Failed to submit results:', err);
    }
  };

  // Restart Quiz with same config
  const restartQuiz = () => {
    startQuiz(quizConfig);
  };

  // Abort / Exit Battle mid-game without recording stats or saving to leaderboard
  const abortBattle = () => {
    if (battleSessionId) {
      savedBattleIdsRef.current.add(battleSessionId);
    }
    isStartingRef.current = false;
    aiQuizService.resetLock();

    // Reset battle engine state
    setBattleSessionId(null);
    setQuestions([]);
    setSessionQuestionsMap({});
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setUserAnswers([]);
    setSelectedOption(null);
    setIsAnswered(false);
    setRevealedAnswer(null);
    setLastScoreGained(null);
    setIsLoading(false);
    setGameError(null);
    setQuizCompleted(false);
    setLastSummary(null);
    setIsSavingBattle(false);
    setBattleSaveError(null);

    navigateTo('setup');
  };

  return (
    <QuizContext.Provider
      value={{
        currentScreen,
        navigateTo,
        authModal,
        openAuthModal,
        closeAuthModal,
        pendingTarget,
        clearPendingTarget,
        categories,
        isCategoriesLoading,
        categoriesError,
        leaderboard,
        userRank,
        isLeaderboardLoading,
        userProfile,
        quizConfig,
        setQuizConfig,
        selectCategoryAndGoToSetup,
        questions,
        currentIndex,
        currentQuestion: questions[currentIndex] || null,
        score,
        streak,
        maxStreak,
        userAnswers,
        selectedOption,
        isAnswered,
        revealedAnswer,
        lastScoreGained,
        isLoading,
        gameError,
        quizCompleted,
        lastSummary,
        battleSessionId,
        isSavingBattle,
        battleSaveError,
        startQuiz,
        submitAnswer,
        handleTimeout,
        nextQuestion,
        restartQuiz,
        abortBattle,
        activeDuelRoomId,
        currentDuelRoom,
        incomingDuelInvites,
        startDuelMatch,
        acceptDuelInvite,
        declineDuelInvite,
        exitDuel
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
