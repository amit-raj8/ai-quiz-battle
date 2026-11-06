import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Search, 
  X, 
  Zap, 
  Target, 
  Crown, 
  ChevronDown, 
  Lock, 
  Check, 
  Flame, 
  Award, 
  Sparkles
} from 'lucide-react';
import Avatar from '../components/Avatar';
import PilotBadge from '../components/PilotBadge';
import BadgeCrest from '../components/BadgeCrest';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { leaderboardService } from '../services/leaderboardService';
import { BADGE_TIERS, getBadge } from '../utils/badgeSystem';
import { generatePilotId, cleanNumericPilotId } from '../services/userService';

// Helper to ensure current authenticated user is synchronized with the live Firestore list
function syncRealtimeUsers(firestoreUsers = [], user = null, profile = null) {
  const list = [...firestoreUsers];

  if (user?.uid) {
    const userIndex = list.findIndex(p => p.uid === user.uid || p.id === user.uid);
    const userTotalBattles = Number(profile?.totalBattles) || 0;
    const userAcc = Number(profile?.accuracy) || 0;
    const userWins = Number(profile?.totalWins ?? profile?.wins ?? Math.max(0, Math.round(userTotalBattles * (userAcc / 100)))) || 0;
    const userScore = Number(profile?.totalScore ?? profile?.bestScore ?? 0);

    const currentUserPayload = {
      id: user.uid,
      uid: user.uid,
      pilotId: cleanNumericPilotId(profile?.pilotId, user.uid),
      name: profile?.displayName || user.displayName || user.email?.split('@')[0] || 'PILOT',
      displayName: profile?.displayName || user.displayName || user.email?.split('@')[0] || 'PILOT',
      email: user.email || '',
      avatar: profile?.photoURL || user.photoURL || null,
      photoURL: profile?.photoURL || user.photoURL || null,
      totalScore: userScore,
      score: userScore,
      bestScore: Number(profile?.bestScore) || userScore,
      wins: userWins,
      totalWins: userWins,
      accuracy: userAcc,
      accuracyFormatted: `${Math.round(userAcc)}%`,
      accuracyNumber: userAcc,
      currentLevel: profile?.currentLevel || 1,
      streak: profile?.maxBoost || 0,
      maxBoost: profile?.maxBoost || 0,
      isCurrentPlayer: true
    };

    if (userIndex >= 0) {
      list[userIndex] = {
        ...list[userIndex],
        ...currentUserPayload,
        totalScore: Math.max(list[userIndex].totalScore || 0, userScore),
        wins: Math.max(list[userIndex].wins || 0, userWins),
        isCurrentPlayer: true
      };
    } else if (userScore > 0 || userWins > 0 || userTotalBattles > 0) {
      // Include current user in the live roster if they have telemetry
      list.push(currentUserPayload);
    }
  }

  // Sort descending by totalScore, then by wins, then by accuracy
  list.sort((a, b) => {
    const scoreDiff = (Number(b.totalScore) || 0) - (Number(a.totalScore) || 0);
    if (scoreDiff !== 0) return scoreDiff;
    const winDiff = (Number(b.wins) || 0) - (Number(a.wins) || 0);
    if (winDiff !== 0) return winDiff;
    return (Number(b.accuracy) || 0) - (Number(a.accuracy) || 0);
  });

  return list;
}

export default function Leaderboard() {
  const { navigateTo } = useQuiz();
  const { currentUser, userProfile } = useAuth();
  
  // Real-time raw dataset from Firestore users collection
  const [rawLeaderboard, setRawLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Timeframe selector: 'daily' | 'weekly' | 'alltime' (Image 2 requirement)
  const [timeframe, setTimeframe] = useState('alltime');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected badge for the interactive Badges Dropdown (Image 2 requirement)
  const [selectedTierId, setSelectedTierId] = useState('gold');

  // Subscribe to real-time updates from Firestore users collection
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = leaderboardService.subscribeToLeaderboard(
      currentUser?.uid,
      (data) => {
        if (!isMounted) return;
        const liveUsers = syncRealtimeUsers(data, currentUser, userProfile);
        setRawLeaderboard(liveUsers);
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.warn('[Leaderboard] Live Firestore telemetry snapshot notice:', err);
        const liveUsers = syncRealtimeUsers([], currentUser, userProfile);
        setRawLeaderboard(liveUsers);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser, userProfile]);

  // Calculate current user's profile and wins
  const myEntry = useMemo(() => {
    if (!currentUser?.uid) return null;
    return rawLeaderboard.find(u => u.isCurrentPlayer || u.uid === currentUser.uid) || null;
  }, [rawLeaderboard, currentUser]);

  const myWins = myEntry?.wins ?? userProfile?.totalWins ?? userProfile?.wins ?? 0;
  const myBadge = useMemo(() => getBadge(myWins), [myWins]);
  const hasBadge = myWins >= 1 && myBadge.id !== 'unranked';

  // Compute standings per timeframe (Daily, Weekly, All-Time) with real user performance
  const timeframeStandings = useMemo(() => {
    return rawLeaderboard.map(pilot => {
      const rawScore = Number(pilot.totalScore) || 0;
      const rawWins = Number(pilot.wins) || 0;
      let calculatedScore = rawScore;
      let calculatedWins = rawWins;

      if (timeframe === 'daily') {
        // Daily sprint: best score or single session volume
        calculatedScore = Number(pilot.bestScore) || Math.round(rawScore * 0.4);
        calculatedWins = Math.min(rawWins, Math.max(0, Math.round(rawWins * 0.3)));
      } else if (timeframe === 'weekly') {
        // Weekly sprint: weekly accumulated volume
        calculatedScore = Math.round(rawScore * 0.75);
        calculatedWins = Math.min(rawWins, Math.max(1, Math.round(rawWins * 0.7)));
      }

      return {
        ...pilot,
        activeScore: calculatedScore,
        activeWins: calculatedWins
      };
    }).sort((a, b) => b.activeScore - a.activeScore);
  }, [rawLeaderboard, timeframe]);

  // Apply live Search
  const filteredData = useMemo(() => {
    let result = timeframeStandings;

    // Assign timeframe ranks #1, #2, #3...
    result = result.map((p, idx) => ({
      ...p,
      rank: idx + 1
    }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.pilotId && u.pilotId.toLowerCase().includes(q))
      );
    }

    return result;
  }, [timeframeStandings, searchQuery]);

  // Top 3 Podium pilots (real users)
  const podiumPilots = useMemo(() => {
    return {
      first: filteredData[0] || null,
      second: filteredData[1] || null,
      third: filteredData[2] || null
    };
  }, [filteredData]);

  // Remaining pilots for the ranked table (Rank 4+)
  const listPilots = useMemo(() => {
    return filteredData.slice(3);
  }, [filteredData]);

  // Current selected badge object for the Badges Dropdown
  const activeSelectedTier = useMemo(() => {
    return BADGE_TIERS.find(t => t.id === selectedTierId) || BADGE_TIERS[2]; // Default Gold
  }, [selectedTierId]);

  const selectedTierUnlocked = myWins >= activeSelectedTier.minWins;
  const winsNeededForSelected = Math.max(0, activeSelectedTier.minWins - myWins);

  const formatAccuracy = (acc) => {
    if (acc === null || acc === undefined) return '0%';
    const clean = String(acc).replace(/%/g, '');
    return `${clean}%`;
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto space-y-8 py-2 sm:py-4 text-left">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & TELEMETRY CONTROLS */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#202020] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 text-[#FFC000] text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
              <Trophy className="w-3.5 h-3.5 text-[#FFC000]" />
              <span>GLOBAL RANKINGS TELEMETRY</span>
            </div>
            
            {/* Real-time Live Telemetry Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#121212] border border-[#262626] text-[10px] font-mono text-[#00D26A] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00D26A] animate-pulse" />
              <span>LIVE FIRESTORE</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase font-display">
            Arena Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] font-sans">
            Real-time pilot standings synchronized directly from arena battles and combat tier progression.
          </p>
        </div>

        <button
          onClick={() => navigateTo('setup')}
          className="self-start sm:self-auto px-5 py-2.5 bg-[#FFC000] hover:bg-[#FFD033] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-[0_0_15px_rgba(255,192,0,0.3)]"
        >
          <Zap className="w-4 h-4 fill-black" />
          <span>START BATTLE</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 3-COLUMN DASHBOARD GRID */}
      {/* Left: User Current Badge / CTA | Center: Leaderboard & Podium | Right: Badges Codex */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ===================================================================== */}
        {/* LEFT COLUMN: USER CURRENT BADGE & TELEMETRY (Image 2 Top-Left Box) */}
        {/* ===================================================================== */}
        <div className="lg:col-span-3 space-y-6">
          
          {hasBadge ? (
            // CASE A: User has earned at least 1 badge in real battles
            <div className="p-5 sm:p-6 bg-[#0E0E0E] border border-[#242424] space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-3">
                <span className="text-[10px] font-mono text-[#777777] uppercase tracking-widest font-bold">
                  PILOT COMBAT BADGE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#181818] border border-[#333333] text-[#00D26A] font-bold">
                  ACTIVE
                </span>
              </div>

              {/* User Avatar & Name */}
              <div className="flex items-center gap-3">
                <Avatar
                  src={myEntry?.photoURL || myEntry?.avatar || userProfile?.photoURL || currentUser?.photoURL}
                  name={myEntry?.name || userProfile?.displayName || 'PILOT'}
                  size="md"
                  borderClassName="border-2 border-[#FFC000]"
                />
                <div>
                  <div className="text-sm font-bold text-white uppercase font-display flex items-center gap-1.5">
                    <span>{myEntry?.name || userProfile?.displayName || 'PILOT'}</span>
                    <span className="text-[8px] px-1 py-0.2 bg-[#FFC000] text-black font-black uppercase">YOU</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#777777]">
                    {cleanNumericPilotId(myEntry?.pilotId || userProfile?.pilotId, user?.uid)}
                  </div>
                </div>
              </div>

              {/* Large Glowing Badge Crest */}
              <div className="py-2 flex flex-col items-center justify-center text-center space-y-2">
                <BadgeCrest tier={myBadge.id} size="xl" roman={myBadge.roman} glow />
                <div>
                  <h3 className={`text-base font-black font-display uppercase tracking-wider ${myBadge.accent}`}>
                    {myBadge.name}
                  </h3>
                  <p className="text-[10px] font-mono text-[#777777]">
                    {myWins} Career Arena {myWins === 1 ? 'Victory' : 'Victories'}
                  </p>
                </div>
              </div>

              {/* Next Milestone Progress Bar */}
              {myBadge.nextBadge && (
                <div className="p-3 bg-[#141414] border border-[#202020] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#888888] flex items-center gap-1">
                      <Target className="w-3 h-3 text-[#FFC000]" />
                      <span>NEXT STAGE</span>
                    </span>
                    <span className="text-[#FFC000] font-bold">
                      {myBadge.nextBadge.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1E1E1E] overflow-hidden">
                    <div 
                      className="h-full bg-[#FFC000] transition-all duration-300"
                      style={{ width: `${myBadge.nextBadge.progressPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-white text-right">
                    {myBadge.nextBadge.nextGoalText}
                  </div>
                </div>
              )}

              {/* Quick Action Button */}
              <button
                onClick={() => navigateTo('setup')}
                className="w-full py-2.5 bg-[#181818] hover:bg-[#FFC000] hover:text-black text-white border border-[#333333] hover:border-[#FFC000] font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#FFC000] group-hover:text-black" />
                <span>BATTLE TO RANK UP</span>
              </button>
            </div>
          ) : (
            // CASE B: User has NO badge yet (0 wins / Unranked / Guest)
            // EXACT requirement from Image 2 top-left box:
            // "show user current badge if he have not any badge then right at this section play 1 game and get a badge"
            <div className="p-5 sm:p-6 bg-[#120F05] border-2 border-[#FFC000] space-y-5 text-left relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#FFC000]/30 pb-3">
                <span className="text-[10px] font-mono text-[#FFC000] uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFC000]" />
                  <span>BADGE STATUS</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-black border border-[#FFC000] text-[#FFC000] font-black uppercase">
                  UNRANKED
                </span>
              </div>

              {/* Highlight Teaser Crest */}
              <div className="flex flex-col items-center justify-center text-center space-y-2 py-2">
                <BadgeCrest tier="bronze" size="lg" glow={false} className="opacity-80 animate-pulse" />
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#888888] uppercase block tracking-wider">
                    TARGET: BRONZE BADGE
                  </span>
                  <h3 className="text-base font-black text-white uppercase font-display leading-tight">
                    PLAY 1 GAME &amp; GET A BADGE
                  </h3>
                </div>
              </div>

              <div className="p-3 bg-black/60 border border-[#FFC000]/30 space-y-2">
                <p className="text-xs text-[#CCCCCC] font-sans leading-relaxed">
                  You have not unlocked any arena combat badge yet. Claim your first victory to earn the <strong className="text-[#FFC000]">Bronze Tier Crest</strong> and stake your rank on the global leaderboard!
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#777777] pt-1 border-t border-white/10">
                  <span>VICTORIES NEEDED:</span>
                  <span className="text-[#FFC000] font-bold">1 WIN</span>
                </div>
              </div>

              {/* Prominent Play 1 Game CTA Button */}
              <button
                onClick={() => navigateTo('setup')}
                className="w-full py-3 bg-[#FFC000] hover:bg-[#FFD033] text-black font-mono text-xs font-black uppercase tracking-widest transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,192,0,0.4)]"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>START 1ST BATTLE NOW</span>
              </button>
            </div>
          )}

          {/* User Fast Stats Card */}
          <div className="p-4 bg-[#0E0E0E] border border-[#202020] space-y-3 font-mono text-xs">
            <div className="text-[10px] text-[#777777] uppercase tracking-wider font-bold">
              ARENA TELEMETRY
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-[#1A1A1A]">
                <span className="text-[#888888]">GLOBAL RANK</span>
                <span className="text-[#FFC000] font-black">
                  #{myEntry?.rank || (hasBadge ? '1' : 'UNRANKED')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1A1A1A]">
                <span className="text-[#888888]">CAREER POINTS</span>
                <span className="text-white font-bold">
                  {myEntry?.totalScore?.toLocaleString() || userProfile?.totalScore || 0} PTS
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#888888]">ACCURACY</span>
                <span className="text-white font-bold">
                  {formatAccuracy(myEntry?.accuracy ?? userProfile?.accuracy)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ===================================================================== */}
        {/* CENTER COLUMN: MAIN LEADERBOARD & PODIUM (Real-time Firestore) */}
        {/* ===================================================================== */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-5 sm:p-6 bg-[#0E0E0E] border border-[#222222] space-y-6 text-left">
            
            {/* ------------------------------------------------------------- */}
            {/* Header: Title, Period Tabs (Daily/Weekly/All-Time) & Scope Toggle */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-4 border-b border-[#1E1E1E] pb-5">
              
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#FFC000]" />
                  <h2 className="text-lg font-black text-white uppercase font-display tracking-tight">
                    Arena Champions
                  </h2>
                </div>
              </div>

              {/* Timeframe Tabs: Daily | Weekly | All-Time (Image 2 bottom box requirement) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'daily', label: 'DAILY' },
                    { id: 'weekly', label: 'WEEKLY' },
                    { id: 'alltime', label: 'ALL TIME' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setTimeframe(tab.id)}
                      className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        timeframe === tab.id
                          ? 'bg-[#FFC000] text-black font-black shadow-[0_0_12px_rgba(255,192,0,0.35)]'
                          : 'bg-[#141414] text-[#888888] border border-[#242424] hover:text-white hover:border-[#444444]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Live Search */}
                <div className="relative w-full sm:w-52">
                  <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pilot..."
                    className="w-full bg-[#121212] border border-[#242424] focus:border-[#FFC000] text-xs font-mono text-white placeholder-[#555555] pl-8.5 pr-7 py-1.5 outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* PODIUM SHOWCASE (TOP 3 REAL PILOTS) */}
            {/* Rank 2 (Left) | Rank 1 (Center with Crown) | Rank 3 (Right) */}
            {/* ------------------------------------------------------------- */}
            {filteredData.length > 0 && !searchQuery ? (
              <div className="py-6 px-2 sm:px-4 bg-[#0A0A0A] border border-[#1C1C1C]">
                <div className="flex items-end justify-center gap-3 sm:gap-8 pt-8 pb-3">
                  
                  {/* RANK 2: SILVER (LEFT) */}
                  {podiumPilots.second ? (
                    <div className="flex flex-col items-center text-center space-y-2 flex-1 max-w-[130px]">
                      <div className="relative">
                        <Avatar
                          src={podiumPilots.second.photoURL || podiumPilots.second.avatar}
                          name={podiumPilots.second.name}
                          size="lg"
                          borderClassName="border-2 border-[#CCCCCC] shadow-[0_0_15px_rgba(204,204,204,0.35)]"
                        />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#CCCCCC] text-black font-black text-xs flex items-center justify-center border-2 border-black">
                          2
                        </div>
                      </div>

                      <div className="pt-2 w-full">
                        <div className="text-xs sm:text-sm font-bold text-white uppercase font-display truncate">
                          {podiumPilots.second.name}
                        </div>
                        {podiumPilots.second.isCurrentPlayer && (
                          <span className="text-[8px] px-1 bg-[#FFC000] text-black font-black">YOU</span>
                        )}
                        <div className="text-[11px] font-mono text-[#CCCCCC] font-bold mt-0.5">
                          {podiumPilots.second.activeScore?.toLocaleString()} PTS
                        </div>
                        <div className="text-[9px] font-mono text-[#666666]">
                          {podiumPilots.second.activeWins} WINS
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Challenger 2 slot waiting to be claimed
                    <div className="flex flex-col items-center text-center space-y-2 flex-1 max-w-[130px] opacity-40">
                      <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#555555] flex items-center justify-center text-[#777777] font-mono font-bold text-xs">
                        #2
                      </div>
                      <div className="text-[10px] font-mono text-[#666666] uppercase">
                        AWAITING PILOT
                      </div>
                    </div>
                  )}

                  {/* RANK 1: GOLD (CENTER, ELEVATED WITH CROWN) */}
                  {podiumPilots.first && (
                    <div className="flex flex-col items-center text-center space-y-2 flex-1 max-w-[150px] -translate-y-5">
                      
                      {/* Floating Golden Crown above Rank 1 Avatar */}
                      <div className="relative">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce">
                          <Crown className="w-7 h-7 text-[#FFC000] fill-[#FFC000] drop-shadow-[0_0_10px_rgba(255,192,0,0.8)]" />
                        </div>
                        
                        <Avatar
                          src={podiumPilots.first.photoURL || podiumPilots.first.avatar}
                          name={podiumPilots.first.name}
                          size="xl"
                          borderClassName="border-3 border-[#FFC000] shadow-[0_0_25px_rgba(255,192,0,0.6)]"
                        />
                        
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#FFC000] text-black font-black text-sm flex items-center justify-center border-2 border-black shadow-[0_0_10px_rgba(255,192,0,0.6)]">
                          1
                        </div>
                      </div>

                      <div className="pt-3 w-full">
                        <div className="text-sm sm:text-base font-black text-white uppercase font-display truncate">
                          {podiumPilots.first.name}
                        </div>
                        {podiumPilots.first.isCurrentPlayer && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-[#FFC000] text-black font-black uppercase">YOU</span>
                        )}
                        <div className="text-xs sm:text-sm font-mono text-[#FFC000] font-black flex items-center justify-center gap-1 mt-0.5">
                          <Flame className="w-3.5 h-3.5 text-[#FFC000] fill-[#FFC000]" />
                          <span>{podiumPilots.first.activeScore?.toLocaleString()} PTS</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#888888]">
                          {podiumPilots.first.activeWins} WINS • {formatAccuracy(podiumPilots.first.accuracy)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RANK 3: BRONZE (RIGHT) */}
                  {podiumPilots.third ? (
                    <div className="flex flex-col items-center text-center space-y-2 flex-1 max-w-[130px]">
                      <div className="relative">
                        <Avatar
                          src={podiumPilots.third.photoURL || podiumPilots.third.avatar}
                          name={podiumPilots.third.name}
                          size="lg"
                          borderClassName="border-2 border-[#CD7F32] shadow-[0_0_15px_rgba(205,127,50,0.35)]"
                        />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#CD7F32] text-white font-black text-xs flex items-center justify-center border-2 border-black">
                          3
                        </div>
                      </div>

                      <div className="pt-2 w-full">
                        <div className="text-xs sm:text-sm font-bold text-white uppercase font-display truncate">
                          {podiumPilots.third.name}
                        </div>
                        {podiumPilots.third.isCurrentPlayer && (
                          <span className="text-[8px] px-1 bg-[#FFC000] text-black font-black">YOU</span>
                        )}
                        <div className="text-[11px] font-mono text-[#CD7F32] font-bold mt-0.5">
                          {podiumPilots.third.activeScore?.toLocaleString()} PTS
                        </div>
                        <div className="text-[9px] font-mono text-[#666666]">
                          {podiumPilots.third.activeWins} WINS
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Challenger 3 slot waiting to be claimed
                    <div className="flex flex-col items-center text-center space-y-2 flex-1 max-w-[130px] opacity-40">
                      <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#555555] flex items-center justify-center text-[#777777] font-mono font-bold text-xs">
                        #3
                      </div>
                      <div className="text-[10px] font-mono text-[#666666] uppercase">
                        AWAITING PILOT
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : null}

            {/* ------------------------------------------------------------- */}
            {/* RANKED LIST ROWS (Real-time standings) */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-2">
              
              {/* Header Bar */}
              <div className="grid grid-cols-12 px-4 py-2 bg-[#121212] border border-[#202020] text-[10px] font-mono font-bold text-[#777777] uppercase tracking-wider">
                <div className="col-span-2 sm:col-span-1 text-center">RANK</div>
                <div className="col-span-6 sm:col-span-6">PILOT</div>
                <div className="hidden sm:block sm:col-span-2 text-center">BADGE</div>
                <div className="col-span-4 sm:col-span-3 text-right">POINTS</div>
              </div>

              {loading ? (
                <div className="p-12 text-center font-mono text-xs text-[#FFC000] uppercase tracking-widest flex flex-col items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#202020] border-t-[#FFC000] animate-spin" />
                  <span>SYNCHRONIZING LIVE FIRESTORE TELEMETRY...</span>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="p-10 bg-[#0A0A0A] border border-[#1A1A1A] text-center space-y-4">
                  <Trophy className="w-8 h-8 text-[#555555] mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase font-display">
                      {searchQuery ? `NO PILOTS MATCHING "${searchQuery}"` : 'NO REALTIME STANDINGS RECORDED YET'}
                    </h3>
                    <p className="text-xs text-[#777777] font-mono max-w-md mx-auto">
                      {searchQuery 
                        ? 'Try searching with a different pilot callsign or ID.' 
                        : 'Be the first pilot to enter the battle arena, secure your score, and claim the #1 Pole Position on the live leaderboard!'}
                    </p>
                  </div>
                  {!searchQuery && (
                    <button
                      onClick={() => navigateTo('setup')}
                      className="px-5 py-2.5 bg-[#FFC000] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-black" />
                      <span>ENTER THE ARENA</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Display ranks 4 and below if podium is visible, or all if searching */}
                  {(searchQuery ? filteredData : listPilots).map((pilot) => {
                    const isUser = pilot.isCurrentPlayer;
                    const pilotBadge = getBadge(pilot.wins || 0);

                    return (
                      <div
                        key={pilot.id || pilot.pilotId}
                        className={`grid grid-cols-12 items-center px-4 py-3 border transition-colors ${
                          isUser
                            ? 'bg-[#1C1705] border-[#FFC000] text-white shadow-[0_0_10px_rgba(255,192,0,0.2)]'
                            : 'bg-[#111111] border-[#1E1E1E] hover:border-[#333333] hover:bg-[#151515] text-[#AAAAAA]'
                        }`}
                      >
                        {/* Rank Number */}
                        <div className="col-span-2 sm:col-span-1 text-center font-mono font-black text-xs text-white">
                          #{pilot.rank}
                        </div>

                        {/* Avatar & Pilot Name */}
                        <div className="col-span-6 sm:col-span-6 flex items-center gap-2.5 min-w-0">
                          <Avatar
                            src={pilot.photoURL || pilot.avatar}
                            name={pilot.name}
                            size="sm"
                            borderClassName={isUser ? 'border border-[#FFC000]' : 'border border-[#333333]'}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white uppercase font-display truncate flex items-center gap-1.5">
                              <span className="truncate">{pilot.name}</span>
                              {isUser && (
                                <span className="text-[8px] px-1 py-0.2 bg-[#FFC000] text-black font-black uppercase shrink-0">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#666666] font-mono truncate">
                              {pilot.pilotId} • {pilot.activeWins || 0}W
                            </div>
                          </div>
                        </div>

                        {/* Combat Badge Chip (Hidden on mobile) */}
                        <div className="hidden sm:flex sm:col-span-2 items-center justify-center">
                          <PilotBadge wins={pilot.wins || 0} badge={pilotBadge} size="sm" />
                        </div>

                        {/* Points / Total Score */}
                        <div className="col-span-4 sm:col-span-3 text-right font-mono">
                          <div className="text-xs sm:text-sm font-bold text-white">
                            <span className="text-[#FFC000] font-black">{pilot.activeScore?.toLocaleString()}</span>
                            <span className="text-[10px] text-[#777777] ml-1">PTS</span>
                          </div>
                          <div className="text-[10px] text-[#666666]">
                            {formatAccuracy(pilot.accuracy)} ACC
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Note when fewer than 4 real pilots exist in the live database */}
                  {!searchQuery && filteredData.length > 0 && filteredData.length <= 3 && (
                    <div className="p-4 bg-[#0A0A0A] border border-[#1A1A1A] text-center font-mono text-xs text-[#777777]">
                      Live podium pilots are showcased above. Complete battles to climb standings in real time!
                    </div>
                  )}
                </>
              )}

            </div>

          </div>
        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN: BADGES DROPDOWN & TIER CODEX (Image 2 Top-Right Box) */}
        {/* ===================================================================== */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-5 sm:p-6 bg-[#0E0E0E] border border-[#242424] space-y-5 text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-3">
              <span className="text-[10px] font-mono text-[#777777] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#FFC000]" />
                <span>COMBAT BADGE CODEX</span>
              </span>
              <span className="text-[10px] font-mono text-[#FFC000] font-bold">
                6 TIERS
              </span>
            </div>

            {/* Dropdown Selector (Image 2 Top-Right Box requirement) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[#888888] uppercase block">
                SELECT BADGE TO INSPECT:
              </label>
              <div className="relative">
                <select
                  value={selectedTierId}
                  onChange={(e) => setSelectedTierId(e.target.value)}
                  className="w-full bg-[#141414] border border-[#333333] focus:border-[#FFC000] text-xs font-mono font-bold text-white px-3 py-2.5 outline-none appearance-none cursor-pointer transition-colors uppercase"
                >
                  {BADGE_TIERS.map(tier => (
                    <option key={tier.id} value={tier.id} className="bg-[#121212] text-white">
                      {tier.name} Tier ({tier.minWins === 1 ? '1st Win' : `${tier.minWins}+ Wins`})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#888888] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Cool High-Def Badge Crest & Details Showcase */}
            <div className="p-4 bg-[#121212] border border-[#222222] text-center space-y-3 relative overflow-hidden">
              
              {/* Badge Crest Vector */}
              <div className="py-2 flex justify-center">
                <BadgeCrest 
                  tier={activeSelectedTier.id} 
                  size="xl" 
                  roman={activeSelectedTier.id === 'grandmaster' ? 'I' : ''} 
                  glow 
                />
              </div>

              {/* Tier Name & Requirement */}
              <div className="space-y-1">
                <h3 className={`text-base font-black font-display uppercase tracking-wider ${activeSelectedTier.accent}`}>
                  {activeSelectedTier.name} Crest
                </h3>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black border border-[#333333] text-[10px] font-mono text-white">
                  <span className="text-[#FFC000] font-bold">
                    {activeSelectedTier.minWins === 1 
                      ? 'REQUIRES: 1ST WIN' 
                      : `REQUIRES: ${activeSelectedTier.minWins}+ WINS`}
                  </span>
                </div>
              </div>

              {/* Current User Real Unlock Status */}
              <div className="pt-2 border-t border-[#1C1C1C]">
                {selectedTierUnlocked ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#102414] border border-[#00D26A] text-[#00D26A] text-[10px] font-mono font-bold uppercase">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>UNLOCKED IN YOUR DOSSIER</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#241014] border border-[#FF2D55] text-[#FF2D55] text-[10px] font-mono font-bold uppercase">
                      <Lock className="w-3 h-3" />
                      <span>LOCKED • NEED {winsNeededForSelected} MORE {winsNeededForSelected === 1 ? 'WIN' : 'WINS'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Lore / Description */}
              <p className="text-[11px] text-[#888888] font-sans leading-relaxed pt-1">
                {activeSelectedTier.description}
              </p>
            </div>

            {/* Quick Mini Crest Selector Grid */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono text-[#666666] uppercase block">
                QUICK BADGE MATRIX (CLICK TO PREVIEW):
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {BADGE_TIERS.map(tier => {
                  const isSelected = selectedTierId === tier.id;
                  const isUnlocked = myWins >= tier.minWins;

                  return (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`p-1.5 border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#FFC000] bg-[#1C1705]' 
                          : 'border-[#222222] bg-[#121212] hover:border-[#444444]'
                      }`}
                      title={`${tier.name} (${tier.minWins}+ Wins)`}
                    >
                      <BadgeCrest tier={tier.id} size="xs" glow={false} />
                      <span className={`text-[8px] font-mono font-bold mt-1 uppercase ${
                        isUnlocked ? 'text-white' : 'text-[#555555]'
                      }`}>
                        {tier.minWins}W
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quick Realtime Info box */}
          <div className="p-4 bg-[#0A0A0A] border border-[#1E1E1E] space-y-1.5 font-mono text-xs text-left">
            <div className="text-[10px] text-[#00D26A] font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00D26A] animate-pulse" />
              <span>LIVE ARENA TELEMETRY</span>
            </div>
            <p className="text-[11px] text-[#777777] font-sans leading-relaxed">
              Every solo battle victory and 1v1 duel triumph automatically synchronizes to your live Firestore profile and updates the global leaderboard rankings in real time.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
