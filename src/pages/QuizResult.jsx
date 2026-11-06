import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import { 
  Trophy, 
  RotateCcw, 
  Grid, 
  Home, 
  Check, 
  X, 
  Clock, 
  Flame, 
  Percent, 
  Zap,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export default function QuizResult() {
  const { 
    lastSummary, 
    quizConfig, 
    isSavingBattle,
    battleSaveError,
    restartQuiz, 
    navigateTo 
  } = useQuiz();
  const { currentUser } = useAuth();

  if (!lastSummary) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-white font-display uppercase">No active battle telemetry found.</h2>
        <Button onClick={() => navigateTo('setup')}>CHOOSE A CATEGORY</Button>
      </div>
    );
  }

  const {
    totalQuestions,
    correctCount,
    correctAnswers = correctCount,
    incorrectCount,
    incorrectAnswers = incorrectCount,
    unansweredCount = 0,
    accuracy,
    totalScore,
    score = totalScore,
    maxStreak,
    xpEarned = score,
    performanceMessage,
    performanceBadge,
    battleId,
    isSaved
  } = lastSummary;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 text-left">
      {/* GRAND PRIX RESULT HERO CARD */}
      <div className="p-8 sm:p-12 bg-[#121212] border border-[#242424] text-center space-y-8 rounded-none">
        
        {/* Gold Trophy Emblem */}
        <div className="w-16 h-16 bg-[#202020] border border-[#FFC000] flex items-center justify-center mx-auto text-[#FFC000]">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-3">
          <span className="inline-block px-3 py-1 bg-[#202020] border border-[#FFC000]/50 text-[#FFC000] font-mono text-[10px] font-bold uppercase tracking-[0.25em]">
            {performanceBadge}
          </span>
          <div className="flex items-center justify-center flex-wrap gap-2 text-xs text-[#7D7D7D] font-mono uppercase tracking-widest pt-1">
            <span>{quizConfig.categoryName}</span>
            <span>•</span>
            <span>{quizConfig.difficulty.toUpperCase()} CALIBRATION</span>
            <span>•</span>
            <span className={`px-2 py-0.5 border text-[10px] font-bold ${
              (lastSummary?.battleSource || quizConfig.battleSource) === 'ai'
                ? 'bg-[#1A1810] border-[#FFC000]/40 text-[#FFC000]'
                : 'bg-[#181818] border-[#333333] text-white'
            }`}>
              {(lastSummary?.battleSource || quizConfig.battleSource) === 'ai' ? '⚡ AI GENERATED BATTLE' : '🏛️ FIRESTORE BATTLE'}
            </span>
          </div>
        </div>

        {/* Big Final Score & XP Earned Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <div className="p-6 bg-[#0A0A0A] border border-[#222222] text-center space-y-1">
            <span className="text-[10px] font-mono text-[#7D7D7D] uppercase tracking-[0.25em]">FINAL SCORE</span>
            <div className="text-4xl sm:text-5xl font-black text-white font-display">
              {score} <span className="text-base text-[#FFC000] font-mono">PTS</span>
            </div>
          </div>

          <div className="p-6 bg-[#0A0A0A] border border-[#222222] text-center space-y-1">
            <span className="text-[10px] font-mono text-[#7D7D7D] uppercase tracking-[0.25em]">CAREER XP EARNED</span>
            <div className="text-4xl sm:text-5xl font-black text-[#FFC000] font-display">
              +{xpEarned} <span className="text-base text-white font-mono">XP</span>
            </div>
          </div>
        </div>

        {/* Telemetry Persistence Status Pill */}
        <div className="flex items-center justify-center">
          {currentUser ? (
            isSavingBattle ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1C1A12] border border-[#FFC000]/40 text-[#FFC000] text-xs font-mono font-bold uppercase tracking-wider">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>COMMITTING TELEMETRY TO FIRESTORE...</span>
              </div>
            ) : battleSaveError ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1C1214] border border-[#FF2D55] text-[#FF2D55] text-xs font-mono font-bold uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{battleSaveError}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#141C16] border border-[#00D26A]/50 text-[#00D26A] text-xs font-mono font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>BATTLE RECORDED IN PILOT LOGBOOK</span>
              </div>
            )
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#181818] border border-[#333333] text-[#969696] text-xs font-mono uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFC000]" />
              <span>GUEST TELEMETRY — LOG IN TO SAVE FUTURE BATTLES</span>
            </div>
          )}
        </div>

        {/* STATS MATRIX */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <StatCard
            title="ACCURACY"
            value={`${accuracy}%`}
            icon={Percent}
          />
          <StatCard
            title="CORRECT"
            value={`${correctAnswers} / ${totalQuestions}`}
            icon={Check}
          />
          <StatCard
            title="INCORRECT"
            value={incorrectAnswers}
            icon={X}
          />
          <StatCard
            title="MAX BOOST"
            value={`${maxStreak}X`}
            icon={Flame}
          />
        </div>

        {/* Unanswered Banner if any */}
        {unansweredCount > 0 && (
          <div className="p-3.5 bg-[#181818] border border-[#2A2A2A] text-xs text-[#7D7D7D] font-mono flex items-center justify-center gap-2 uppercase">
            <Clock className="w-4 h-4 text-[#FFC000]" />
            <span>UNANSWERED STAGES: <strong className="text-white">{unansweredCount}</strong></span>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-[#222222]">
          <Button
            size="lg"
            variant="primary"
            icon={RotateCcw}
            onClick={restartQuiz}
            className="w-full sm:w-auto font-black"
          >
            PLAY AGAIN
          </Button>

          <Button
            size="lg"
            variant="secondary"
            icon={Grid}
            onClick={() => navigateTo('setup')}
            className="w-full sm:w-auto font-bold"
          >
            CHOOSE ANOTHER DOMAIN
          </Button>

          <Button
            size="lg"
            variant="outline"
            icon={Home}
            onClick={() => navigateTo('home')}
            className="w-full sm:w-auto font-bold"
          >
            RETURN HOME
          </Button>
        </div>
      </div>
    </div>
  );
}
