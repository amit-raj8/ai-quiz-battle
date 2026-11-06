import React, { useState, useEffect, useRef } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { duelService } from '../services/duelService';
import { battleHistoryService } from '../services/battleHistoryService';
import confetti from 'canvas-confetti';
import { 
  Swords, 
  Clock, 
  Zap, 
  Trophy, 
  Check, 
  X, 
  ArrowRight, 
  Flame, 
  RotateCcw, 
  LogOut,
  Shield,
  Sparkles
} from 'lucide-react';

export default function DuelArena() {
  const { currentDuelRoom, activeDuelRoomId, exitDuel, navigateTo } = useQuiz();
  const { currentUser, userProfile } = useAuth();

  const [roomData, setRoomData] = useState(currentDuelRoom || null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(roomData?.timePerQuestion || 15);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const timerRef = useRef(null);
  const botTimeoutRef = useRef(null);

  const roomId = activeDuelRoomId || roomData?.roomId;
  const isHost = Boolean(roomData && currentUser && roomData.host?.uid === currentUser.uid);
  const myRole = isHost ? 'host' : 'guest';
  const opponentRole = isHost ? 'guest' : 'host';

  const myState = roomData ? roomData[myRole] : null;
  const opponentState = roomData ? roomData[opponentRole] : null;

  // Real-time Firestore Room Subscription
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = duelService.subscribeToRoom(roomId, (updatedRoom) => {
      if (updatedRoom) {
        setRoomData(updatedRoom);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  // Round Timer countdown
  useEffect(() => {
    if (!roomData || isAnswered || roomData.status === 'completed') return;

    const roundDuration = Number(roomData.timePerQuestion) || 15;
    setTimeLeft(roundDuration);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQIndex, isAnswered, roomData?.status]);

  // Simulated AI rival response if opponent is training bot
  useEffect(() => {
    if (!roomData || !opponentState?.isBot || roomData.status === 'completed') return;

    // Simulate bot answering with random speed between 2.5s and 5.0s
    const delay = Math.random() * 2500 + 2000;
    const botQIndex = currentQIndex;

    botTimeoutRef.current = setTimeout(() => {
      if (roomData.status === 'completed') return;

      const currentQ = roomData.questions?.[botQIndex];
      if (!currentQ) return;

      const isBotCorrect = Math.random() < 0.8; // 80% accuracy for bot
      const timeTaken = Number((delay / 1000).toFixed(1));
      const speedBonus = isBotCorrect ? Math.round((roomData.timePerQuestion - timeTaken) * 10) : 0;
      const scoreGained = isBotCorrect ? 100 + speedBonus : 0;

      duelService.submitDuelAnswer(roomId, opponentRole, {
        questionIndex: botQIndex,
        selectedOptionIndex: isBotCorrect ? (currentQ.correctAnswerIndex ?? 0) : 1,
        isCorrect: isBotCorrect,
        timeRemainingSeconds: Math.max(0, roomData.timePerQuestion - timeTaken),
        timeTakenSeconds: timeTaken,
        scoreGained
      });
    }, delay);

    return () => {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    };
  }, [currentQIndex, opponentState?.isBot, roomData?.status]);

  const questions = roomData?.questions || [];
  const currentQuestion = questions[currentQIndex] || null;
  const isMatchOver = roomData?.status === 'completed' || (myState?.completed && opponentState?.completed);

  const hasSavedDuelRef = useRef(false);

  // Trigger celebration confetti on match completion if you won & record stats
  useEffect(() => {
    if (!isMatchOver) return;

    if (roomData?.winnerUid === currentUser?.uid) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // Persist 1v1 duel stats to Firestore users/{uid} & battleHistory
    if (currentUser?.uid && !hasSavedDuelRef.current && roomData?.status === 'completed') {
      hasSavedDuelRef.current = true;
      const myAnswers = myState?.answers || [];
      const myCorrect = myAnswers.filter(a => a.isCorrect).length;
      const isWinner = roomData?.winnerUid === currentUser.uid;

      battleHistoryService.saveBattleResult(currentUser.uid, {
        battleId: `duel_${roomId}_${currentUser.uid}`,
        battleSource: 'duel_1v1',
        categoryId: roomData?.category?.id || 'duel',
        categoryName: roomData?.category?.name || '1v1 Head-to-Head Duel',
        difficulty: 'medium',
        totalQuestions: questions.length,
        attemptedQuestions: myAnswers.length,
        correctAnswers: myCorrect,
        incorrectAnswers: Math.max(0, questions.length - myCorrect),
        score: Number(myState?.score) || 0,
        accuracy: questions.length > 0 ? Math.round((myCorrect / questions.length) * 100) : 0,
        maxStreak: myCorrect,
        xpEarned: Number(myState?.score) || 0,
        isWin: isWinner
      }).catch(err => {
        console.warn('[DuelArena] Error persisting 1v1 duel stats:', err);
      });
    }
  }, [isMatchOver, roomData?.winnerUid, roomData?.status, currentUser?.uid, myState, questions.length, roomId, roomData?.category]);

  // Handle player answer selection
  const handleSelectOption = async (optionIndex) => {
    if (isAnswered || !currentQuestion || isMatchOver) return;

    if (timerRef.current) clearInterval(timerRef.current);

    setIsAnswered(true);
    setSelectedOption(optionIndex);

    const roundDuration = Number(roomData.timePerQuestion) || 15;
    const timeTaken = Number((roundDuration - timeLeft).toFixed(1));
    const isCorrect = optionIndex === currentQuestion.correctAnswerIndex ||
      (currentQuestion.options[optionIndex] === currentQuestion.correctAnswer);

    // Speed-based scoring: Base 100 + Speed Bonus (the faster you submit, the higher the score!)
    const speedBonus = isCorrect ? Math.max(0, Math.round(timeLeft * 10)) : 0;
    const scoreGained = isCorrect ? 100 + speedBonus : 0;

    setLastFeedback({
      isCorrect,
      speedBonus,
      timeTaken,
      scoreGained,
      explanation: currentQuestion.explanation || ''
    });

    await duelService.submitDuelAnswer(roomId, myRole, {
      questionIndex: currentQIndex,
      selectedOptionIndex: optionIndex,
      isCorrect,
      timeRemainingSeconds: timeLeft,
      timeTakenSeconds: timeTaken,
      scoreGained
    });
  };

  // Handle timeout for the player
  const handleTimeExpired = async () => {
    if (isAnswered || !currentQuestion || isMatchOver) return;

    setIsAnswered(true);
    setSelectedOption(null);

    setLastFeedback({
      isCorrect: false,
      speedBonus: 0,
      timeTaken: Number(roomData?.timePerQuestion) || 15,
      scoreGained: 0,
      explanation: currentQuestion?.explanation || ''
    });

    await duelService.submitDuelAnswer(roomId, myRole, {
      questionIndex: currentQIndex,
      selectedOptionIndex: null,
      isCorrect: false,
      timeRemainingSeconds: 0,
      timeTakenSeconds: Number(roomData?.timePerQuestion) || 15,
      scoreGained: 0
    });
  };

  // Advance to next question
  const handleNextQuestion = () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setLastFeedback(null);
    }
  };

  // -------------------------------------------------------------
  // MATCH COMPLETED: 1v1 VICTORY SHOWDOWN SCREEN
  // -------------------------------------------------------------
  if (isMatchOver) {
    const isWinner = roomData?.winnerUid === currentUser?.uid;
    const isTie = roomData?.winnerUid === 'tie';

    const myAnswers = myState?.answers || [];
    const oppAnswers = opponentState?.answers || [];

    const myCorrect = myAnswers.filter(a => a.isCorrect).length;
    const oppCorrect = oppAnswers.filter(a => a.isCorrect).length;

    const myAvgTime = myAnswers.length > 0 
      ? (myAnswers.reduce((sum, a) => sum + (a.timeTakenSeconds || 0), 0) / myAnswers.length).toFixed(1)
      : '0.0';
    const oppAvgTime = oppAnswers.length > 0 
      ? (oppAnswers.reduce((sum, a) => sum + (a.timeTakenSeconds || 0), 0) / oppAnswers.length).toFixed(1)
      : '0.0';

    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center space-y-8 animate-fadeIn">
        {/* Banner */}
        <div className={`p-8 sm:p-12 border-2 ${isWinner ? 'bg-[#18150A] border-[#FFC000]' : isTie ? 'bg-[#151515] border-[#888888]' : 'bg-[#1C1214] border-[#FF2D55]'} space-y-6 shadow-2xl`}>
          <div className="w-16 h-16 mx-auto flex items-center justify-center border-2 border-current">
            {isWinner ? (
              <Trophy className="w-8 h-8 text-[#FFC000]" />
            ) : isTie ? (
              <Swords className="w-8 h-8 text-[#AAAAAA]" />
            ) : (
              <Shield className="w-8 h-8 text-[#FF2D55]" />
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase block text-[#FFC000]">
              1 VS 1 HEAD-TO-HEAD BATTLE CONCLUDED
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase font-display tracking-tight">
              {isWinner ? '👑 VICTORY: YOU CRUSHED THE ARENA!' : isTie ? '⚔️ DRAW: DEAD HEAT DUEL!' : `DEFEAT: ${opponentState?.name || 'OPPONENT'} TOOK THE WIN`}
            </h1>
            <p className="text-sm font-mono text-[#A0A0A0]">
              Discipline: <strong className="text-white">{roomData?.category?.name}</strong> • {questions.length} Rounds
            </p>
          </div>

          {/* Head-to-Head Comparison Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4 text-left">
            {/* YOU */}
            <div className={`p-5 sm:p-6 border ${isWinner ? 'bg-[#221C0A] border-[#FFC000]' : 'bg-[#141414] border-[#2A2A2A]'}`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#888888] uppercase block">PILOT 1 (YOU)</span>
                  <h3 className="text-lg font-bold text-white uppercase font-display">{myState?.name}</h3>
                </div>
                <span className="text-xs font-mono text-[#FFC000]">{myState?.pilotId}</span>
              </div>
              <div className="space-y-3 pt-4 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-[#888888]">FINAL SCORE:</span>
                  <strong className="text-[#FFC000] text-lg font-black">{myState?.score || 0} PTS</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">ACCURACY:</span>
                  <strong className="text-white">{myCorrect} / {questions.length}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">AVG SUBMISSION:</span>
                  <strong className="text-white">{myAvgTime}s</strong>
                </div>
              </div>
            </div>

            {/* OPPONENT */}
            <div className={`p-5 sm:p-6 border ${!isWinner && !isTie ? 'bg-[#251317] border-[#FF2D55]' : 'bg-[#141414] border-[#2A2A2A]'}`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#888888] uppercase block">PILOT 2 (OPPONENT)</span>
                  <h3 className="text-lg font-bold text-white uppercase font-display">{opponentState?.name}</h3>
                </div>
                <span className="text-xs font-mono text-[#FFC000]">{opponentState?.pilotId}</span>
              </div>
              <div className="space-y-3 pt-4 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-[#888888]">FINAL SCORE:</span>
                  <strong className="text-white text-lg font-black">{opponentState?.score || 0} PTS</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">ACCURACY:</span>
                  <strong className="text-white">{oppCorrect} / {questions.length}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">AVG SUBMISSION:</span>
                  <strong className="text-white">{oppAvgTime}s</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
              onClick={() => {
                exitDuel();
                navigateTo('setup');
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#FFC000] hover:bg-[#FFD033] text-black font-mono font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              CHALLENGE AGAIN IN ARENA
            </button>
            <button
              onClick={() => {
                exitDuel();
                navigateTo('home');
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333333] text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE 1v1 LIVE BATTLE COCKPIT
  // -------------------------------------------------------------
  const roundDuration = Number(roomData?.timePerQuestion) || 15;
  const timePercent = (timeLeft / roundDuration) * 100;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-4 text-left">
      
      {/* 1v1 LIVE SPLIT TELEMETRY HUD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-[#111111] border border-[#242424]">
        
        {/* PILOT 1: YOU (Col 5) */}
        <div className="md:col-span-4 p-3 bg-[#181818] border border-[#2A2A2A] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D26A]" />
              <span className="text-[10px] font-mono text-[#888888] uppercase">YOU</span>
            </div>
            <h4 className="text-sm font-bold text-white uppercase font-display truncate max-w-[130px]">
              {myState?.name}
            </h4>
            <span className="text-[10px] font-mono text-[#FFC000]">{myState?.pilotId}</span>
          </div>
          <div className="text-right">
            <span className="text-xl font-black font-mono text-[#FFC000] block">
              {myState?.score || 0}
            </span>
            <span className="text-[9px] font-mono text-[#777777] uppercase">POINTS</span>
          </div>
        </div>

        {/* CENTER: ROUND & TIMER (Col 4) */}
        <div className="md:col-span-4 p-3 bg-[#16140A] border border-[#FFC000]/40 flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#FFC000] font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s REMAINING</span>
          </div>
          <div className="w-full bg-[#202020] h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-[#FF2D55]' : 'bg-[#FFC000]'}`} 
              style={{ width: `${timePercent}%` }} 
            />
          </div>
          <span className="text-[10px] font-mono text-[#888888] uppercase">
            ROUND {currentQIndex + 1} OF {questions.length} • {roomData?.category?.name}
          </span>
        </div>

        {/* PILOT 2: OPPONENT FRIEND (Col 4) */}
        <div className="md:col-span-4 p-3 bg-[#181818] border border-[#2A2A2A] flex items-center justify-between">
          <div className="text-left">
            <span className="text-xl font-black font-mono text-white block">
              {opponentState?.score || 0}
            </span>
            <span className="text-[9px] font-mono text-[#777777] uppercase">POINTS</span>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] font-mono text-[#888888] uppercase">OPPONENT</span>
              <span className="w-2 h-2 rounded-full bg-[#FFC000]" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase font-display truncate max-w-[130px]">
              {opponentState?.name}
            </h4>
            <span className="text-[10px] font-mono text-[#FFC000]">{opponentState?.pilotId}</span>
          </div>
        </div>

      </div>

      {/* QUESTION COCKPIT */}
      {currentQuestion && (
        <div className="p-6 sm:p-8 bg-[#121212] border border-[#242424] space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#888888]">
              <span>QUESTION {currentQIndex + 1}</span>
              <span className="text-[#FFC000] uppercase font-bold">⚡ FASTEST ANSWER WINS SPEED BONUS</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-sans leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === currentQuestion.correctAnswerIndex || opt === currentQuestion.correctAnswer;
              
              let cardStyle = 'bg-[#181818] border-[#2A2A2A] hover:border-white/50 hover:bg-[#1E1E1E] text-white';

              if (isAnswered) {
                if (isCorrectOption) {
                  cardStyle = 'bg-[#121E14] border-[#00D26A] text-[#00D26A] ring-1 ring-[#00D26A]';
                } else if (isSelected) {
                  cardStyle = 'bg-[#201214] border-[#FF2D55] text-[#FF2D55] ring-1 ring-[#FF2D55]';
                } else {
                  cardStyle = 'bg-[#141414] border-[#222222] text-[#666666] opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 sm:p-5 text-left border rounded-none transition-all cursor-pointer font-sans text-sm flex items-start gap-3 select-none ${cardStyle}`}
                >
                  <span className="w-6 h-6 shrink-0 border border-current font-mono font-bold text-xs flex items-center justify-center">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="pt-0.5 leading-normal">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Answer Feedback Banner */}
          {isAnswered && lastFeedback && (
            <div className={`p-4 border ${lastFeedback.isCorrect ? 'bg-[#121E14] border-[#00D26A]' : 'bg-[#201214] border-[#FF2D55]'} space-y-2 animate-fadeIn`}>
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2">
                  {lastFeedback.isCorrect ? (
                    <>
                      <Check className="w-4 h-4 text-[#00D26A]" />
                      <span className="text-[#00D26A]">CORRECT ANSWER! +{lastFeedback.scoreGained} PTS</span>
                      {lastFeedback.speedBonus > 0 && (
                        <span className="text-[#FFC000] ml-2 font-mono">⚡ SPEED BONUS: +{lastFeedback.speedBonus} PTS</span>
                      )}
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-[#FF2D55]" />
                      <span className="text-[#FF2D55]">MISSED TARGET (+0 PTS)</span>
                    </>
                  )}
                </span>
                <span className="text-xs font-mono text-[#888888]">
                  Submitted in {lastFeedback.timeTaken}s
                </span>
              </div>
              {lastFeedback.explanation && (
                <p className="text-xs text-[#CCCCCC] font-sans pt-1">
                  {lastFeedback.explanation}
                </p>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between border-t border-[#222222] pt-4">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="text-xs font-mono text-[#777777] hover:text-[#FF2D55] transition-colors flex items-center gap-1.5 cursor-pointer uppercase"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LEAVE DUEL</span>
            </button>

            {isAnswered && (
              <button
                onClick={handleNextQuestion}
                className="py-2.5 px-6 bg-[#FFC000] hover:bg-[#FFD033] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>{currentQIndex + 1 === questions.length ? 'VIEW FINAL RESULTS' : 'NEXT QUESTION'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 bg-[#141414] border border-[#FF2D55] space-y-4 max-w-sm text-center">
            <h3 className="text-base font-bold text-white uppercase font-display">
              FORFEIT 1V1 DUEL?
            </h3>
            <p className="text-xs text-[#888888] font-sans">
              Leaving the live battle will forfeit the match to your opponent.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="py-2 px-3 bg-[#202020] hover:bg-[#282828] text-white font-mono text-xs uppercase cursor-pointer"
              >
                RESUME
              </button>
              <button
                onClick={() => {
                  exitDuel();
                  navigateTo('setup');
                }}
                className="py-2 px-3 bg-[#FF2D55] hover:bg-[#E0264A] text-white font-mono text-xs font-bold uppercase cursor-pointer"
              >
                FORFEIT
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
