import React, { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { battleHistoryService } from '../services/battleHistoryService';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import PilotBadge from '../components/PilotBadge';
import { getBadge, BADGE_TIERS } from '../utils/badgeSystem';
import { 
  Trophy, 
  Flame, 
  Percent, 
  Award, 
  History, 
  Zap, 
  ShieldCheck, 
  Mail, 
  LogOut, 
  Loader2,
  AlertCircle,
  RotateCcw,
  Check
} from 'lucide-react';

export default function Profile() {
  const { userProfile, userRank, navigateTo } = useQuiz();
  const { currentUser, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Battle History State
  const [battleHistory, setBattleHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) {
      setBattleHistory([]);
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);
    setHistoryError(null);

    const unsubscribe = battleHistoryService.subscribeToBattleHistory(
      currentUser.uid,
      (battles) => {
        setBattleHistory(battles);
        setIsLoadingHistory(false);
        setHistoryError(null);
      },
      (err) => {
        console.error('[Profile] Error loading battle history:', err);
        setHistoryError('Failed to load battle history archives. Please check connection.');
        setIsLoadingHistory(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  if (!currentUser) return null;

  const displayName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'PILOT';
  const email = userProfile?.email || currentUser?.email || 'pilot@quizbattle.ai';
  const userLevel = userProfile?.currentLevel || 1;
  const userXp = userProfile?.xp || 0;
  const nextLevelXp = userLevel * 500;
  const xpPercentage = Math.min(100, Math.round((userXp / nextLevelXp) * 100));
  const totalBattles = userProfile?.totalBattles || 0;
  const bestScore = userProfile?.bestScore || 0;
  const maxBoost = userProfile?.maxBoost || 0;
  const accuracy = userProfile?.accuracy || 0;
  const totalWins = Number(userProfile?.totalWins ?? userProfile?.wins ?? Math.max(0, Math.round(totalBattles * (accuracy / 100)))) || 0;
  const currentBadge = getBadge(totalWins);
  const pilotTitle = userLevel >= 10 ? 'VETERAN GLADIATOR' : userLevel >= 5 ? 'ELITE PILOT' : 'ARENA PILOT';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    navigateTo('home');
  };

  const handleRetryHistory = async () => {
    if (!currentUser?.uid) return;
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const history = await battleHistoryService.getBattleHistory(currentUser.uid);
      setBattleHistory(history);
    } catch (err) {
      setHistoryError('Failed to load battle history archives.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-4 sm:py-6 text-left">
      
      {/* PILOT SPECIFICATION HEADER CARD */}
      <div className="p-6 sm:p-8 bg-[#121212] border border-[#242424] rounded-none">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          {/* Avatar (Sharp Rectangle) */}
          <div className="relative shrink-0">
            <Avatar
              src={userProfile?.photoURL || currentUser?.photoURL}
              name={displayName}
              size="xl"
              borderClassName="border-2 border-[#FFC000]"
            />
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-black text-[#FFC000] border border-[#FFC000] text-[10px] font-black font-mono uppercase">
              LVL {userLevel}
            </div>
          </div>

          {/* Pilot Details */}
          <div className="space-y-4 flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-display">
                  {displayName}
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-1.5 font-mono text-xs">
                  <PilotBadge wins={totalWins} badge={currentBadge} size="sm" />
                  <span className="text-[#333333]">•</span>
                  <span className="text-[#FFC000] font-bold flex items-center gap-1.5 uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    {pilotTitle}
                  </span>
                  <span className="text-[#333333]">•</span>
                  <span className="text-[#7D7D7D] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {email}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="px-3.5 py-1.5 bg-[#202020] border border-[#333333] text-white text-xs font-mono font-bold uppercase tracking-wider">
                  GLOBAL RANK #{userRank || 1}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  icon={isLoggingOut ? Loader2 : LogOut}
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  className="border-[#FF2D55]/50 text-[#FF2D55] hover:bg-[#FF2D55] hover:text-white hover:border-[#FF2D55]"
                >
                  {isLoggingOut ? 'EJECTING...' : 'LOGOUT'}
                </Button>
              </div>
            </div>

            {/* Level XP Progress Horizon Bar */}
            <div className="space-y-1.5 max-w-md mx-auto sm:mx-0">
              <div className="flex justify-between text-[10px] font-mono text-[#7D7D7D] uppercase tracking-wider">
                <span>PILOT XP PROGRESSION</span>
                <span>{userXp} / {nextLevelXp} XP ({xpPercentage}%)</span>
              </div>
              <div className="w-full h-1.5 bg-[#202020] rounded-none overflow-hidden">
                <div
                  className="h-full bg-[#FFC000] rounded-none transition-all duration-300"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS MATRIX */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase font-display flex items-center gap-2">
          <Award className="w-4 h-4 text-[#FFC000]" />
          <span>Lifetime Career Statistics</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            title="TOTAL BATTLES"
            value={totalBattles}
            subtitle="COMPLETED STAGES"
            icon={Zap}
          />
          <StatCard
            title="ARENA VICTORIES"
            value={`${totalWins} WINS`}
            subtitle={currentBadge.name.toUpperCase()}
            icon={Trophy}
          />
          <StatCard
            title="BEST TELEMETRY"
            value={`${bestScore} PTS`}
            subtitle="SINGLE MATCH HIGH"
            icon={Award}
          />
          <StatCard
            title="MAX BOOST"
            value={`${maxBoost}X`}
            subtitle="PEAK MULTIPLIER"
            icon={Flame}
          />
          <StatCard
            title="CAREER ACCURACY"
            value={`${accuracy}%`}
            subtitle="CORRECT HIT RATIO"
            icon={Percent}
          />
        </div>
      </div>

      {/* COMBAT BADGE SHOWCASE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202020] pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase font-display flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#FFC000]" />
              <span>Combat Tier Badges</span>
            </h2>
            <p className="text-xs text-[#7D7D7D] font-mono mt-0.5">
              Secure arena victories to unlock prestigious tiers. Grandmaster advances in Roman numerals with every victory.
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-[#FFC000]">
            CURRENT RECORD: {totalWins} WINS
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* Active Badge Hero Card (Span 5) */}
          <div className="lg:col-span-5">
            <PilotBadge 
              wins={totalWins} 
              badge={currentBadge} 
              size="lg" 
              showNextGoal={true}
              className="h-full"
            />
          </div>

          {/* All 6 Badge Tiers Progression Grid (Span 7) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {BADGE_TIERS.map((tier) => {
              const isUnlocked = totalWins >= tier.minWins;
              const isCurrent = currentBadge.id === tier.id;
              const winsNeeded = Math.max(0, tier.minWins - totalWins);

              return (
                <div
                  key={tier.id}
                  className={`p-3.5 border transition-all text-left flex flex-col justify-between space-y-2 ${
                    isCurrent
                      ? `${tier.bg} ${tier.border} ${tier.glow} ring-1 ring-white/20`
                      : isUnlocked
                      ? 'bg-[#141414] border-[#2E2E2E]'
                      : 'bg-[#0E0E0E] border-[#1C1C1C] opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span 
                      className="text-xs font-black font-display uppercase tracking-wider"
                      style={{ color: isUnlocked ? tier.color : '#666666' }}
                    >
                      {tier.id === 'grandmaster' && isUnlocked ? currentBadge.name : tier.name}
                    </span>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 ${
                      isCurrent 
                        ? 'bg-[#FFC000] text-black font-black' 
                        : isUnlocked 
                        ? 'bg-[#1E1E1E] text-[#00D26A]' 
                        : 'bg-[#161616] text-[#666666]'
                    }`}>
                      {isCurrent ? 'ACTIVE' : isUnlocked ? 'UNLOCKED ✓' : 'LOCKED'}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono">
                    <div className="text-[10px] text-[#A0A0A0]">
                      REQ: <span className="text-white font-bold">{tier.minWins}+ WINS</span>
                    </div>
                    <div className="text-[9px] text-[#777777]">
                      {isUnlocked 
                        ? (tier.id === 'grandmaster' ? `Stage ${currentBadge.roman || 'I'}` : 'Unlocked') 
                        : `${winsNeeded} win${winsNeeded === 1 ? '' : 's'} to unlock`
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* RECENT BATTLE LOGS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#202020] pb-3">
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase font-display flex items-center gap-2">
            <History className="w-4 h-4 text-[#FFC000]" />
            <span>Recent Battle History</span>
          </h2>
          <Button size="sm" variant="outline" onClick={() => navigateTo('setup')}>
            NEW BATTLE
          </Button>
        </div>

        {isLoadingHistory ? (
          <div className="p-12 bg-[#121212] border border-[#222222] text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#FFC000] mx-auto" />
            <div className="text-xs font-mono font-bold text-white uppercase tracking-widest">
              SYNCING ARENA TELEMETRY ARCHIVES...
            </div>
            <p className="text-[11px] text-[#7D7D7D] font-mono">Loading battle history logs from Firestore subcollection.</p>
          </div>
        ) : historyError ? (
          <div className="p-8 bg-[#181214] border border-[#FF2D55]/50 text-center space-y-3">
            <AlertCircle className="w-6 h-6 text-[#FF2D55] mx-auto" />
            <div className="text-xs font-mono font-bold text-[#FF2D55] uppercase tracking-wider">
              {historyError}
            </div>
            <Button size="sm" variant="outline" icon={RotateCcw} onClick={handleRetryHistory}>
              RETRY SYNC
            </Button>
          </div>
        ) : battleHistory.length > 0 ? (
          <div className="space-y-2.5">
            {battleHistory.map((item) => (
              <div
                key={item.battleId || item.id}
                className="p-4 bg-[#141414] border border-[#222222] hover:border-white/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono"
              >
                {/* Left: Domain & Difficulty */}
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-[#202020] border border-[#333333] flex items-center justify-center shrink-0 text-[#FFC000]">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase font-display text-sm">
                      {item.categoryName || item.category}
                    </h4>
                    <div className="text-[10px] text-[#7D7D7D] uppercase mt-0.5 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-[#1E1E1E] text-[#FFC000] border border-[#333333] font-bold">
                        {item.difficulty}
                      </span>
                      <span>•</span>
                      <span>{item.date || 'RECENT'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Telemetry Metrics Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 md:gap-6 border-t md:border-t-0 border-[#222222] pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <div className="text-[9px] text-[#777777] uppercase">SCORE</div>
                    <div className="text-xs font-black text-white">{item.score} PTS</div>
                  </div>

                  <div className="text-left md:text-right">
                    <div className="text-[9px] text-[#777777] uppercase">ACCURACY</div>
                    <div className="text-xs font-black text-white">{item.accuracy}%</div>
                  </div>

                  <div className="text-left md:text-right">
                    <div className="text-[9px] text-[#777777] uppercase">CORRECT</div>
                    <div className="text-xs font-black text-[#00D26A] flex items-center md:justify-end gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{item.correctAnswers} / {item.totalQuestions}</span>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <div className="text-[9px] text-[#777777] uppercase">MAX BOOST</div>
                    <div className="text-xs font-black text-[#FFC000]">{item.maxStreak}X</div>
                  </div>

                  <div className="text-left md:text-right col-span-2 sm:col-span-1">
                    <div className="text-[9px] text-[#777777] uppercase">XP EARNED</div>
                    <div className="text-xs font-black text-[#FFC000]">+{item.xpEarned} XP</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 bg-[#141414] border border-[#222222] text-center space-y-3">
            <div className="text-xs font-bold text-[#FFC000] font-mono uppercase tracking-widest">
              NO ARENA TELEMETRY LOGGED YET
            </div>
            <p className="text-xs text-[#777777] font-mono max-w-md mx-auto">
              Complete your first quiz battle in the arena to record stage telemetry and begin leveling up your pilot profile.
            </p>
            <div className="pt-2">
              <Button size="sm" variant="primary" onClick={() => navigateTo('setup')}>
                START FIRST BATTLE
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

