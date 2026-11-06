import React, { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import Timer from '../components/Timer';
import ScoreDisplay from '../components/ScoreDisplay';
import StreakDisplay from '../components/StreakDisplay';
import QuizOption from '../components/QuizOption';
import Button from '../components/Button';
import { 
  ArrowRight, 
  Check, 
  X, 
  Clock, 
  AlertCircle,
  AlertTriangle,
  RefreshCw, 
  Database, 
  Zap,
  LogOut
} from 'lucide-react';

const AI_LOADING_STAGES = [
  { stage: 'SYNTHESIZING FRESH AI QUESTIONS', detail: 'Randomizing subtopics and querying Gemini AI' },
  { stage: 'CALIBRATING DIFFICULTY', detail: 'Calibrating precision complexity curves' },
  { stage: 'BUILDING NOVEL QUESTION MATRIX', detail: 'Enforcing zero overlap with prior battles' },
  { stage: 'VALIDATING QUESTION INTEGRITY', detail: 'Verifying answer symmetry & technical depth' },
  { stage: 'ARMING ARENA COCKPIT', detail: 'Arming 15-second countdown timers' }
];

export default function QuizGame() {
  const {
    currentQuestion,
    currentIndex,
    questions,
    score,
    streak,
    selectedOption,
    isAnswered,
    revealedAnswer,
    lastScoreGained,
    quizConfig,
    isLoading,
    gameError,
    submitAnswer,
    handleTimeout,
    nextQuestion,
    startQuiz,
    abortBattle,
    navigateTo
  } = useQuiz();

  const [aiStageIndex, setAiStageIndex] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Dynamic cockpit stage progression during AI battle generation
  useEffect(() => {
    if (!isLoading || quizConfig.battleSource !== 'ai') {
      setAiStageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setAiStageIndex(prev => (prev + 1) % AI_LOADING_STAGES.length);
    }, 1400);

    return () => clearInterval(interval);
  }, [isLoading, quizConfig.battleSource]);

  // Loading State
  if (isLoading) {
    const isAIGenerating = quizConfig.battleSource === 'ai';
    const activeStage = isAIGenerating ? AI_LOADING_STAGES[aiStageIndex] : null;

    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="p-8 sm:p-12 bg-[#121212] border border-[#242424] space-y-6">
          <div className="w-14 h-14 bg-[#1A1810] border border-[#FFC000] flex items-center justify-center mx-auto text-[#FFC000]">
            {isAIGenerating ? (
              <Zap className="w-7 h-7 animate-pulse stroke-[2.5]" />
            ) : (
              <div className="w-7 h-7 border-2 border-[#202020] border-t-[#FFC000] animate-spin" />
            )}
          </div>

          <div className="space-y-3">
            <span className="inline-block px-3 py-1 bg-[#202020] border border-[#FFC000]/40 text-[#FFC000] font-mono text-[10px] font-bold uppercase tracking-[0.25em]">
              {isAIGenerating ? 'NEURAL ENGINE ACTIVE' : 'FIRESTORE ARENA'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight transition-all duration-300">
              {isAIGenerating ? activeStage.stage : 'CALIBRATING ARENA TELEMETRY...'}
            </h2>
            <div className="space-y-1.5 pt-2">
              <p className="text-xs text-[#FFC000] font-mono uppercase tracking-wider">
                {isAIGenerating
                  ? `${activeStage.detail} • ${quizConfig.difficulty.toUpperCase()} [${quizConfig.categoryName.toUpperCase()}]`
                  : `LOADING ${quizConfig.categoryName.toUpperCase()} ARCHIVED DATASET`}
              </p>
              <p className="text-[11px] text-[#7D7D7D] font-mono">
                {isAIGenerating
                  ? `Synthesizing ${quizConfig.questionCount} dynamic stages via Google Gemini AI`
                  : `Arming 15-second countdown timer for ${quizConfig.questionCount} stages`}
              </p>
            </div>
          </div>

          {/* Progress bar placeholder animation */}
          <div className="w-full bg-[#1A1A1A] h-1.5 overflow-hidden">
            <div className="bg-[#FFC000] h-full w-2/3 animate-[pulse_1.5s_infinite]" />
          </div>

          <div className="pt-4">
            <button
              onClick={abortBattle}
              className="text-xs text-[#7D7D7D] hover:text-[#FF2D55] font-mono uppercase tracking-widest transition-colors flex items-center gap-1.5 mx-auto cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>CANCEL & RETURN TO COCKPIT</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (gameError || !currentQuestion || questions.length === 0) {
    const isAIError = quizConfig.battleSource === 'ai';
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="p-8 sm:p-10 bg-[#141414] border border-[#2A2A2A] space-y-6">
          <div className="w-14 h-14 bg-[#202020] border border-[#FF2D55] flex items-center justify-center mx-auto text-[#FF2D55]">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-white uppercase font-display">
              {isAIError ? 'AI BATTLE GENERATION FAILED' : 'ARENA TELEMETRY ERROR'}
            </h3>
            <p className="text-xs text-[#7D7D7D] font-mono">
              {gameError || 'Unable to generate or retrieve battle questions at this time.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isAIError ? (
              <>
                <Button 
                  variant="primary" 
                  size="md" 
                  icon={RefreshCw}
                  onClick={() => startQuiz(quizConfig)}
                >
                  RETRY AI GENERATION
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="md" 
                  icon={Database}
                  onClick={() => startQuiz({ ...quizConfig, battleSource: 'firestore' })}
                >
                  SWITCH TO FIRESTORE BATTLE
                </Button>
              </>
            ) : (
              <Button 
                variant="primary" 
                size="md" 
                icon={RefreshCw}
                onClick={() => startQuiz(quizConfig)}
              >
                RETRY ARENA
              </Button>
            )}

            <Button 
              variant="outline" 
              size="md" 
              onClick={() => navigateTo('setup')}
            >
              CONFIGURATION
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentIndex + 1 === questions.length;
  const isTimeout = isAnswered && selectedOption === null;
  const isCorrect = isAnswered && !isTimeout && Boolean(revealedAnswer?.isCorrect);

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-[1400px] mx-auto space-y-5 py-2 sm:py-4 text-left">
      
      {/* MINIMAL BATTLE HUD */}
      <div className="bg-[#101010] border border-[#222222] rounded-none overflow-hidden">
        
        {/* Top telemetry bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between flex-wrap gap-3">
          
          {/* Left: Domain, Level & Question Counter */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono flex-wrap">
            <span className="font-bold text-[#FFC000] uppercase tracking-wider">{quizConfig.categoryName}</span>
            <span className="text-[#333]">/</span>
            <span className="text-[#888] uppercase text-xs">{quizConfig.difficulty}</span>
            <span className="text-[#333] hidden sm:inline">•</span>
            <span className="text-white font-medium text-xs hidden sm:inline">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Right: Score, Streak, Timer & Exit */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-white font-medium text-xs sm:hidden mr-1">
              {currentIndex + 1}/{questions.length}
            </span>
            <ScoreDisplay score={score} />
            <StreakDisplay streak={streak} />
            <Timer
              duration={15}
              questionId={currentQuestion.id}
              isPaused={isAnswered || showExitConfirm}
              onTimeout={handleTimeout}
            />

            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="px-2.5 py-1.5 text-xs font-mono text-[#888] hover:text-[#FF2D55] hover:bg-[#1A1214] border border-[#262626] hover:border-[#FF2D55]/50 transition-colors cursor-pointer flex items-center gap-1.5 uppercase"
              title="Abort battle"
            >
              <LogOut className="w-3 h-3" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Minimal 2px Progress Line */}
        <div className="w-full h-1 bg-[#1A1A1A] overflow-hidden">
          <div 
            className="h-full bg-[#FFC000] transition-all duration-300 ease-out"
            style={{ width: `${Math.round(((currentIndex + 1) / questions.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="p-6 sm:p-8 lg:p-10 bg-[#121212] border border-[#222222] space-y-6 rounded-none relative">
        
        {/* Question Heading (Sentence case, clean, readable) */}
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        {/* OPTIONS 2x2 GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {currentQuestion.options.map((optionText, idx) => (
            <QuizOption
              key={idx}
              index={idx}
              text={optionText}
              isSelected={selectedOption === idx}
              isCorrect={isCorrect}
              isAnswered={isAnswered}
              correctAnswerIndex={revealedAnswer?.correctAnswerIndex}
              correctAnswerText={revealedAnswer?.correctAnswer}
              onSelect={(index) => submitAnswer(index, 10)}
            />
          ))}
        </div>

        {/* FEEDBACK & EXPLANATION */}
        {isAnswered && (
          <div className="pt-5 border-t border-[#202020] space-y-3.5 animate-fadeIn">
            
            {/* Status & Next Button Bar */}
            <div
              className={`p-4 rounded-none border flex items-center justify-between flex-wrap gap-4 ${
                isCorrect
                  ? 'bg-[#121A14] border-[#00D26A]/50 text-[#00D26A]'
                  : isTimeout
                  ? 'bg-[#1A1810] border-[#FFC000]/50 text-[#FFC000]'
                  : 'bg-[#1A1214] border-[#FF2D55]/50 text-[#FF2D55]'
              }`}
            >
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <div className="w-7 h-7 bg-[#00D26A] text-black flex items-center justify-center font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : isTimeout ? (
                  <div className="w-7 h-7 bg-[#FFC000] text-black flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-7 h-7 bg-[#FF2D55] text-white flex items-center justify-center font-bold">
                    <X className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-sm text-white">
                    {isCorrect
                      ? 'Correct'
                      : isTimeout
                      ? 'Time Expired'
                      : 'Incorrect'}
                  </h4>
                  <div className="text-xs font-mono mt-0.5">
                    {isCorrect && lastScoreGained ? (
                      <span className="text-[#00D26A]">+{lastScoreGained.totalPoints} pts</span>
                    ) : (
                      <span className="text-[#999]">Correct: <strong className="text-white">{revealedAnswer?.correctAnswer}</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <Button
                variant="primary"
                size="md"
                onClick={nextQuestion}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full sm:w-auto font-bold px-6 py-2"
              >
                {isLastQuestion ? 'Complete Battle' : 'Next Question'}
              </Button>
            </div>

            {/* Clean Explanation Box */}
            {revealedAnswer?.explanation && (
              <div className="p-4 bg-[#0D0D0D] border border-[#202020] text-xs sm:text-sm text-[#A0A0A0] leading-relaxed">
                <span className="font-mono font-bold text-white mr-1.5">Explanation:</span>
                {revealedAnswer.explanation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* EXIT BATTLE CONFIRMATION MODAL */}
      {showExitConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#121212] border border-[#FF2D55] p-6 sm:p-8 space-y-6 text-left shadow-2xl rounded-none">
            <div className="flex items-center gap-3 border-b border-[#242424] pb-4">
              <div className="w-10 h-10 bg-[#221214] border border-[#FF2D55] flex items-center justify-center text-[#FF2D55] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase font-display">ABORT ARENA BATTLE?</h3>
                <p className="text-[10px] font-mono text-[#FF2D55] uppercase tracking-wider">PROGRESS WILL NOT BE RECORDED</p>
              </div>
            </div>

            <p className="text-xs text-[#969696] font-sans leading-relaxed">
              Are you sure you want to exit the battle? Your current streak, points, and answers will be immediately discarded. This session will <span className="text-white font-bold">NOT</span> count as a completed battle, and no score will be added to the leaderboard.
            </p>

            <div className="space-y-2.5 pt-2">
              <Button
                variant="danger"
                size="md"
                fullWidth
                onClick={abortBattle}
                icon={LogOut}
                className="py-3 text-xs font-black tracking-widest cursor-pointer"
              >
                CONFIRM EXIT (DISCARD BATTLE)
              </Button>

              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setShowExitConfirm(false)}
                className="py-3 text-xs font-bold tracking-widest border-white/40 cursor-pointer"
              >
                RESUME BATTLE
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
