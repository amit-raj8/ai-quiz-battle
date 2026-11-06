import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import CategoryCard from '../components/CategoryCard';
import Avatar from '../components/Avatar';
import SplineRobot from '../components/SplineRobot';
import PilotBadge from '../components/PilotBadge';
import { 
  Play, 
  Trophy, 
  Flame, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Radio,
  Lock
} from 'lucide-react';

export default function Home() {
  const { 
    categories, 
    isCategoriesLoading, 
    leaderboard, 
    userRank, 
    isLeaderboardLoading, 
    navigateTo, 
    selectCategoryAndGoToSetup, 
    userProfile,
    openAuthModal
  } = useQuiz();
  const { currentUser } = useAuth();

  const topPlayers = leaderboard.slice(0, 4);

  const handleFeatureGatedAction = (featureName, message, targetScreen, targetCategory = null) => {
    if (!currentUser) {
      openAuthModal({
        featureName,
        message,
        pendingScreen: targetScreen,
        pendingCategory: targetCategory
      });
    } else {
      if (targetCategory) {
        selectCategoryAndGoToSetup(targetCategory);
      } else if (targetScreen) {
        navigateTo(targetScreen);
      }
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 max-w-[1500px] mx-auto pt-1 sm:pt-2 pb-12 space-y-12 lg:space-y-16 bg-black text-white">
      
      {/* ========================================================================= */}
      {/* 1. MINIMAL HERO SECTION (DEVELOPER CODING ARENA) */}
      {/* ========================================================================= */}
      <section className="relative pt-2 sm:pt-4 pb-8 sm:pb-10 border-b border-[#1E1E1E]">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* LEFT COLUMN: Clean Typography & Quick Actions (Span 7) */}
          <div className="lg:col-span-7 space-y-6 text-left z-10 lg:pl-10 xl:pl-16">
            
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414] border border-[#242424] text-[11px] font-mono text-[#999999]">
              <span className="w-2 h-2 rounded-full bg-[#00D26A] animate-pulse" />
              <span className="text-white font-medium">DEVELOPER ARENA</span>
              <span className="text-[#444444]">•</span>
              <span className="text-[#FFC000]">ONLINE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] uppercase font-display">
              Challenge Your Intellect.{' '}
              <span className="text-[#FFC000] block mt-1 sm:mt-2">
                Dominate The Arena.
              </span>
            </h1>

            {/* Subtitle / Description */}
            <p className="text-sm sm:text-base text-[#888888] max-w-xl leading-relaxed font-sans">
              Rapid-fire technical quiz battles powered by AI. Master DSA, systems, and full-stack interview concepts with real-time scoring and competitive streaks.
            </p>

            {/* CTA Buttons Row */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  variant="primary"
                  icon={currentUser ? Play : Lock}
                  iconPosition="left"
                  onClick={() => handleFeatureGatedAction(
                    'Battle Arena Configuration',
                    'Pilot clearance required. Sign in with your pilot account to configure battle parameters, challenge Gemini AI, and earn XP.',
                    'setup'
                  )}
                  className="font-bold text-xs sm:text-sm px-6 py-3 cursor-pointer"
                >
                  START BATTLE
                </Button>
                
                <Button
                  size="lg"
                  variant="secondary"
                  icon={currentUser ? Trophy : Lock}
                  iconPosition="left"
                  onClick={() => handleFeatureGatedAction(
                    'Leaderboard',
                    'Pilot clearance required. Sign in to view real-time global pilot rankings, accuracy telemetry, and championship podiums.',
                    'leaderboard'
                  )}
                  className="font-semibold text-xs sm:text-sm px-6 py-3 cursor-pointer"
                >
                  LEADERBOARD
                </Button>
              </div>

              {!currentUser && (
                <p className="text-[11px] font-mono text-[#666666] flex items-center gap-1.5 tracking-wide">
                  <Lock className="w-3 h-3 text-[#FFC000]" />
                  <span>Guest preview active • Sign in to save telemetry and rank</span>
                </p>
              )}
            </div>

            {/* Micro Telemetry Specs */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-mono text-[#777777] border-t border-[#1C1C1C]">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#FFC000]" />
                <span>15s Rapid Rounds</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-[#FFC000]" />
                <span>2.0x Multiplier</span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#00D26A]" />
                <span>AI Evaluation</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Spline 3D AI Assistant Robot (Span 5) */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center py-2 lg:py-0 z-10">
            <SplineRobot />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FEATURED CHALLENGE ARENAS (DIRECT TO BATTLE) */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1E1E1E] pb-4 text-left">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#999999]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFC000]" />
              <span className="text-white font-medium uppercase tracking-wider">Domains</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Featured Arenas
            </h2>
            <p className="text-xs sm:text-sm text-[#888888] max-w-xl font-sans">
              Choose a discipline below to launch live AI questions, test your reflexes, and prep for placements.
            </p>
          </div>

          <Button
            variant="outline"
            size="md"
            icon={currentUser ? ArrowRight : Lock}
            iconPosition="right"
            onClick={() => handleFeatureGatedAction(
              'All Challenge Arenas',
              'Pilot clearance required. Sign in with your pilot account to browse and configure all available arena domains.',
              'setup'
            )}
            className="shrink-0 text-xs py-2 px-4"
          >
            ALL DOMAINS
          </Button>
        </div>

        {isCategoriesLoading ? (
          <div className="p-16 bg-[#121212] border border-[#242424] flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-8 h-8 border-2 border-[#202020] border-t-[#FFC000] animate-spin" />
            <p className="text-xs font-mono text-[#FFC000] tracking-widest uppercase">
              RETRIEVING ARENA DOMAINS FROM FIRESTORE...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                isLocked={!currentUser}
                onSelect={() => selectCategoryAndGoToSetup(cat)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. GLOBAL LEADERBOARD & PILOT TELEMETRY */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Arena Champions Table (Span 8) */}
        <div className="lg:col-span-8 p-6 sm:p-7 bg-[#111111] border border-[#202020] space-y-5 flex flex-col justify-between text-left">
          <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#FFC000]">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase font-display">Arena Champions</h3>
                <p className="text-[10px] text-[#777777] font-mono uppercase">Global Grand Prix Standings</p>
              </div>
            </div>

            <button
              onClick={() => handleFeatureGatedAction(
                'Grand Prix Standings',
                'Pilot clearance required. Sign in with your pilot account to view complete global rankings and telemetry.',
                'leaderboard'
              )}
              className="text-xs text-[#FFC000] font-bold font-mono tracking-wider uppercase hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>STANDINGS</span>
              {!currentUser ? <Lock className="w-3 h-3" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="space-y-2">
            {isLeaderboardLoading ? (
              <div className="p-8 flex items-center justify-center space-x-3 text-xs font-mono text-[#7D7D7D] uppercase">
                <div className="w-5 h-5 border-2 border-[#202020] border-t-[#FFC000] animate-spin" />
                <span>CALIBRATING LEADERBOARD...</span>
              </div>
            ) : topPlayers.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-[#7D7D7D] uppercase">
                NO STANDINGS RECORDED YET. ENTER THE ARENA TO STAKE #1.
              </div>
            ) : (
              topPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 border transition-colors ${
                    player.isCurrentPlayer
                      ? 'bg-[#1C1705] border-[#FFC000]'
                      : player.rank === 1
                      ? 'bg-[#16140A] border-[#FFC000]/40 hover:border-[#FFC000]'
                      : 'bg-[#161616] border-[#222222] hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 flex items-center justify-center font-bold text-xs font-mono ${
                      player.rank === 1 
                        ? 'bg-[#FFC000] text-black font-black' 
                        : player.rank === 2
                        ? 'bg-[#CCCCCC] text-black font-bold'
                        : player.rank === 3
                        ? 'bg-[#8C7355] text-white font-bold'
                        : 'bg-[#222222] text-[#888888]'
                    }`}>
                      #{player.rank}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase font-display flex items-center gap-2">
                        <span>{player.name}</span>
                        {player.isCurrentPlayer && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-[#FFC000] text-black font-black">YOU</span>
                        )}
                        {player.rank === 1 && !player.isCurrentPlayer && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-[#FFC000]/20 text-[#FFC000] font-mono font-bold">POLE</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#777777] font-mono uppercase flex items-center gap-1.5 mt-0.5">
                        <PilotBadge wins={player.wins} size="sm" />
                        <span>•</span>
                        <span>{player.wins || 0}W</span>
                        <span>•</span>
                        <span>{player.accuracyFormatted || `${String(player.accuracy).replace('%', '')}%`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs sm:text-sm font-black text-white">
                      {player.totalScore?.toLocaleString() || player.totalScore} PTS
                    </div>
                    <div className="text-[10px] text-[#FFC000]">{player.maxBoost}X BOOST</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-1">
            <Button
              variant="secondary"
              fullWidth
              size="md"
              icon={currentUser ? Trophy : Lock}
              onClick={() => handleFeatureGatedAction(
                'Grand Prix Standings',
                'Pilot clearance required. Sign in with your pilot account to view full Grand Prix standings and competitor statistics.',
                'leaderboard'
              )}
              className="text-xs py-2.5 font-bold cursor-pointer"
            >
              {currentUser ? 'VIEW FULL STANDINGS' : 'VIEW FULL STANDINGS (SIGN IN)'}
            </Button>
          </div>
        </div>

        {/* Active Pilot Profile Summary (Span 4) */}
        <div className="lg:col-span-4 p-6 sm:p-7 bg-[#111111] border border-[#202020] space-y-5 flex flex-col justify-between text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-3.5">
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#777777] uppercase">
                {currentUser ? 'PILOT TELEMETRY' : 'GUEST TELEMETRY'}
              </span>
              <span className="text-[10px] font-mono text-[#FFC000] bg-[#181818] px-2 py-0.5 border border-[#282828] uppercase">
                {currentUser ? `RANK #${userRank || 1}` : 'GUEST'}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              {currentUser ? (
                <Avatar
                  src={userProfile?.photoURL || currentUser.photoURL}
                  name={userProfile?.displayName || currentUser.displayName || currentUser.email}
                  size="md"
                  borderClassName="border border-[#FFC000]"
                />
              ) : (
                <div className="w-11 h-11 bg-[#1A1A1A] border border-[#282828] flex items-center justify-center text-[#FFC000] font-mono font-bold text-sm rounded-none shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-white uppercase font-display truncate max-w-[170px]">
                  {userProfile?.displayName || currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'GUEST PILOT')}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <PilotBadge wins={userProfile?.totalWins ?? userProfile?.wins ?? 0} size="sm" />
                  <span className="text-[10px] text-[#FFC000] font-mono uppercase font-semibold">
                    {currentUser ? ((userProfile?.currentLevel || 1) >= 10 ? 'VETERAN' : (userProfile?.currentLevel || 1) >= 5 ? 'ELITE' : 'PILOT') : 'TRIAL GUEST'}
                  </span>
                </div>
                <div className="text-[10px] text-[#777777] font-mono mt-0.5 uppercase">
                  LEVEL {userProfile?.currentLevel || 1} • {userProfile?.xp || 0} XP
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2.5 bg-[#161616] border border-[#202020]">
                <div className="text-[#777777] text-[9px] uppercase tracking-wider mb-0.5">VICTORIES</div>
                <div className="text-sm font-black text-white">{userProfile?.totalWins ?? userProfile?.wins ?? 0} WINS</div>
              </div>
              <div className="p-2.5 bg-[#161616] border border-[#202020]">
                <div className="text-[#777777] text-[9px] uppercase tracking-wider mb-0.5">MAX BOOST</div>
                <div className="text-sm font-black text-[#FFC000]">{userProfile?.maxBoost || 0}X</div>
              </div>
              <div className="p-2.5 bg-[#161616] border border-[#202020]">
                <div className="text-[#777777] text-[9px] uppercase tracking-wider mb-0.5">BATTLES</div>
                <div className="text-sm font-black text-white">{userProfile?.totalBattles || 0}</div>
              </div>
              <div className="p-2.5 bg-[#161616] border border-[#202020]">
                <div className="text-[#777777] text-[9px] uppercase tracking-wider mb-0.5">ACCURACY</div>
                <div className="text-sm font-black text-white">{userProfile?.accuracy || 0}%</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => handleFeatureGatedAction(
                'Live Battle Arena',
                'Pilot clearance required. Sign in with your pilot account to start an arena battle and persist telemetry.',
                'setup'
              )}
              icon={currentUser ? Play : Lock}
              className="text-xs py-2.5 font-bold cursor-pointer"
            >
              {currentUser ? 'LAUNCH BATTLE' : 'SIGN IN TO LAUNCH BATTLE'}
            </Button>
            {!currentUser && (
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => navigateTo('login')}
                className="text-[11px] py-1.5 text-[#777777] hover:text-white cursor-pointer"
              >
                SIGN IN TO PERSIST RECORDS
              </Button>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
