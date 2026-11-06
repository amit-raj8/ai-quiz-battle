import React, { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import CategoryCard from '../components/CategoryCard';
import DifficultySelector from '../components/DifficultySelector';
import Button from '../components/Button';
import { friendService, TRAINING_BOT_FRIEND } from '../services/friendService';
import { duelService } from '../services/duelService';
import { questionService } from '../services/questionService';
import { generatePilotId } from '../services/userService';
import { randomizeQuestionsList } from '../utils/questionRandomizer';
import { 
  Play, 
  Sparkles, 
  SlidersHorizontal, 
  Layers, 
  AlertCircle, 
  Zap, 
  Swords, 
  User, 
  Users, 
  Copy, 
  Check, 
  Search, 
  UserPlus, 
  Clock, 
  Send, 
  ShieldAlert, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export default function QuizSetup() {
  const { 
    categories, 
    isCategoriesLoading, 
    categoriesError, 
    quizConfig, 
    setQuizConfig, 
    isLoading,
    startQuiz,
    startDuelMatch 
  } = useQuiz();

  const { currentUser, userProfile } = useAuth();

  // Mode Selection: 'solo' (Solo Arena) | '1v1' (1 VS 1 Friend Duel)
  const [battleMode, setBattleMode] = useState('solo');

  // Unique Pilot ID & Copy state
  const myPilotId = userProfile?.pilotId || (currentUser ? generatePilotId(currentUser.uid) : 'PLT-GUEST');
  const [copiedId, setCopiedId] = useState(false);

  // Friend System states
  const [friendsList, setFriendsList] = useState([TRAINING_BOT_FRIEND]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState(null);
  const [friendActionMsg, setFriendActionMsg] = useState(null);

  // 1v1 Duel Configuration
  const [selectedFriend, setSelectedFriend] = useState(TRAINING_BOT_FRIEND);
  const [duelTimePerQ, setDuelTimePerQ] = useState(15);
  const [duelQuestionCount, setDuelQuestionCount] = useState(5);
  const [isDispatchingDuel, setIsDispatchingDuel] = useState(false);
  const [pendingDuelRoomId, setPendingDuelRoomId] = useState(null);

  // Subscribe to user's friends list and pending friend requests in real-time
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubFriends = friendService.subscribeToFriends(currentUser.uid, (friends) => {
      setFriendsList(friends);
      // If selected friend no longer exists, default to training bot
      setSelectedFriend(prev => {
        if (!prev) return TRAINING_BOT_FRIEND;
        const exists = friends.find(f => f.uid === prev.uid);
        return exists || TRAINING_BOT_FRIEND;
      });
    });

    const unsubRequests = friendService.subscribeToFriendRequests(currentUser.uid, (reqs) => {
      setPendingRequests(reqs);
    });

    return () => {
      unsubFriends();
      unsubRequests();
    };
  }, [currentUser?.uid]);

  // Listen for opponent accepting the 1v1 duel
  useEffect(() => {
    if (!pendingDuelRoomId) return;

    const unsubscribe = duelService.subscribeToRoom(pendingDuelRoomId, (roomData) => {
      if (roomData && roomData.status === 'in_progress') {
        setPendingDuelRoomId(null);
        setIsDispatchingDuel(false);
        startDuelMatch(roomData);
      } else if (roomData && (roomData.status === 'declined' || roomData.status === 'cancelled')) {
        setPendingDuelRoomId(null);
        setIsDispatchingDuel(false);
        setFriendActionMsg({
          type: 'error',
          text: 'The pilot declined or cancelled the 1v1 duel challenge.'
        });
      }
    });

    return () => unsubscribe();
  }, [pendingDuelRoomId, startDuelMatch]);

  const handleCopyPilotId = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(myPilotId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleSearchPilots = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !currentUser) return;

    setIsSearching(true);
    setSearchFeedback(null);
    try {
      const results = await friendService.searchPilots(searchQuery, currentUser.uid);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchFeedback('No pilots found matching that Pilot ID or display name.');
      }
    } catch (err) {
      setSearchFeedback('Error searching pilots. Please verify connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (targetPilot) => {
    if (!currentUser) return;
    const res = await friendService.sendFriendRequest(
      {
        uid: currentUser.uid,
        displayName: userProfile?.displayName || currentUser.displayName || 'PILOT',
        pilotId: myPilotId,
        photoURL: currentUser.photoURL || null
      },
      targetPilot
    );

    setFriendActionMsg({
      type: res.success ? 'success' : 'error',
      text: res.message
    });

    setTimeout(() => setFriendActionMsg(null), 4000);
  };

  const handleSelectOpponentDirectly = (pilot) => {
    if (!pilot) return;
    setFriendsList(prev => {
      const exists = prev.some(f => f.uid === pilot.uid);
      return exists ? prev : [pilot, ...prev];
    });
    setSelectedFriend(pilot);
    setFriendActionMsg({
      type: 'success',
      text: `Pilot ${pilot.displayName} (${pilot.pilotId}) selected as opponent! Configure rounds below and dispatch duel.`
    });
    setTimeout(() => setFriendActionMsg(null), 4000);
  };

  const handleRespondRequest = async (requestId, decision, reqData) => {
    await friendService.respondToFriendRequest(requestId, decision, reqData);
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleCategorySelect = (category) => {
    if (!category) return;
    const catId = (category.id || category.categoryId || '').toLowerCase();
    const catName = category.name || category.title || (catId ? catId.charAt(0).toUpperCase() + catId.slice(1) : '');
    setQuizConfig(prev => ({
      ...prev,
      categoryId: catId,
      categoryName: catName
    }));
  };

  const handleDifficultyChange = (difficulty) => {
    setQuizConfig(prev => ({ ...prev, difficulty }));
  };

  const handleQuestionCountChange = (count) => {
    setQuizConfig(prev => ({ ...prev, questionCount: count }));
  };

  const selectedCategoryObj = categories.find(
    c => (c.id || c.categoryId || '').toLowerCase() === (quizConfig.categoryId || '').toLowerCase()
  ) || null;

  const isCategorySelected = Boolean(quizConfig.categoryId);

  // Dispatch 1v1 Battle Invite
  const handleLaunchDuel = async () => {
    if (!currentUser || !selectedFriend || !quizConfig.categoryId) return;

    setIsDispatchingDuel(true);
    setFriendActionMsg(null);

    try {
      // Retrieve questions for the battle and randomize options
      const rawQuestions = await questionService.getQuestionsForBattle({
        categoryId: quizConfig.categoryId,
        difficulty: quizConfig.difficulty || 'medium',
        limit: duelQuestionCount
      });

      const normalizedQuestions = randomizeQuestionsList(rawQuestions).map(q => {
        let cIdx = q.correctAnswerIndex;
        if (cIdx === undefined || cIdx === null || cIdx === -1) {
          cIdx = q.options.findIndex(opt => opt === q.correctAnswer);
        }
        if (cIdx === -1) cIdx = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;
        return {
          ...q,
          correctAnswerIndex: cIdx
        };
      });

      const hostUser = {
        uid: currentUser.uid,
        displayName: userProfile?.displayName || currentUser.displayName || 'PILOT',
        pilotId: myPilotId,
        photoURL: currentUser.photoURL || null
      };

      const { roomId, payload } = await duelService.createDuelRoom({
        hostUser,
        guestUser: selectedFriend,
        category: {
          id: quizConfig.categoryId,
          name: quizConfig.categoryName || selectedCategoryObj?.name || 'Arena'
        },
        timePerQuestion: duelTimePerQ,
        questionCount: duelQuestionCount,
        difficulty: quizConfig.difficulty || 'Medium',
        questions: normalizedQuestions
      });

      if (selectedFriend.isBot) {
        // AI training rival accepts immediately
        setIsDispatchingDuel(false);
        startDuelMatch({ roomId, ...payload });
      } else {
        // Real human friend: wait for acceptance
        setPendingDuelRoomId(roomId);
      }
    } catch (err) {
      console.error('[QuizSetup] Error dispatching duel:', err);
      setIsDispatchingDuel(false);
      setFriendActionMsg({
        type: 'error',
        text: 'Failed to dispatch duel challenge. Please retry.'
      });
    }
  };

  const handleCancelPendingDuel = async () => {
    if (pendingDuelRoomId) {
      await duelService.cancelDuelInvite(pendingDuelRoomId);
      setPendingDuelRoomId(null);
    }
    setIsDispatchingDuel(false);
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto space-y-10 py-4 sm:py-6 text-left">
      {/* Page Header */}
      <div className="space-y-3 border-b border-[#202020] pb-6">
        <div className="inline-flex items-center gap-2 text-[#FFC000] text-[10px] font-mono font-bold tracking-[0.25em] uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ARENA TELEMETRY SPECIFICATION</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
          Configure Your Challenge
        </h1>
        <p className="text-sm sm:text-base text-[#888888] max-w-2xl font-sans">
          Select your engineering discipline, choose Solo Arena or 1v1 Friend Duel, calibrate round speed, and arm the battle arena.
        </p>
      </div>

      {/* SECTION 1: CHALLENGE DOMAIN SELECTION */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-[#202020] pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base tracking-wider uppercase font-display">
            <Layers className="w-4 h-4 text-[#FFC000]" />
            <span>01. SELECT CHALLENGE DOMAIN</span>
          </div>
          <span className="text-xs font-mono text-[#7D7D7D] uppercase tracking-wider">
            {categories.length} DOMAINS READY
          </span>
        </div>

        {isCategoriesLoading ? (
          <div className="p-16 bg-[#121212] border border-[#242424] flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-8 h-8 border-2 border-[#202020] border-t-[#FFC000] animate-spin" />
            <p className="text-xs font-mono text-[#FFC000] tracking-widest uppercase">
              RETRIEVING ARENA DOMAINS FROM FIRESTORE...
            </p>
          </div>
        ) : categoriesError ? (
          <div className="p-8 bg-[#1C1214] border border-[#FF2D55] text-left flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-[#FF2D55] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white font-mono uppercase">TELEMETRY ERROR</h4>
              <p className="text-xs text-[#FF2D55] font-mono">{categoriesError}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const catId = (cat.id || cat.categoryId || '').toLowerCase();
              const isSelected = isCategorySelected && catId === quizConfig.categoryId.toLowerCase();
              return (
                <CategoryCard
                  key={catId || cat.name}
                  category={cat}
                  isSelected={isSelected}
                  onSelect={handleCategorySelect}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: BATTLE CONFIGURATION */}
      {!isCategorySelected ? (
        <div className="p-8 sm:p-12 bg-[#121212] border border-[#242424] text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-[#FFC000] text-xs font-mono font-bold tracking-widest uppercase">
            <Layers className="w-4 h-4" />
            <span>AWAITING DOMAIN SELECTION</span>
          </div>
          <h3 className="text-lg font-black text-white uppercase font-display">
            Select A Challenge Domain Above
          </h3>
          <p className="text-xs text-[#7D7D7D] max-w-md mx-auto font-sans">
            Click on any arena domain card above (such as Aptitude & Reasoning or Python) to reveal the battle configuration and 1v1 mode.
          </p>
        </div>
      ) : (
        <div className="space-y-10 animate-fadeIn">
          
          {/* SECTION 2A: SELECT BATTLE MODE (SOLO ARENA vs 1 VS 1 FRIEND DUEL) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#202020] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wider uppercase font-display">
                <Swords className="w-4 h-4 text-[#FFC000]" />
                <span>02. SELECT BATTLE MODE</span>
              </div>
              <span className="text-[10px] font-mono text-[#FFC000] uppercase font-bold">
                {battleMode === 'solo' ? '🏎️ SOLO ARENA SPEED DRILL' : '⚔️ 1 VS 1 FRIEND DUEL'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option 1: SOLO ARENA */}
              <button
                type="button"
                onClick={() => setBattleMode('solo')}
                className={`
                  p-5 sm:p-6 text-left border rounded-none transition-all cursor-pointer relative select-none
                  ${battleMode === 'solo'
                    ? 'bg-[#18150A] border-[#FFC000] ring-1 ring-[#FFC000]'
                    : 'bg-[#121212] border-[#242424] hover:border-[#383838] hover:bg-[#151515]'
                  }
                `}
              >
                {battleMode === 'solo' && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#FFC000] text-black font-mono font-black text-[9px] uppercase tracking-wider">
                    ACTIVE MODE
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-none border ${battleMode === 'solo' ? 'bg-[#FFC000] text-black border-[#FFC000]' : 'bg-[#1C1C1C] text-[#7D7D7D] border-[#2A2A2A]'}`}>
                    <Zap className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-black text-base uppercase font-display ${battleMode === 'solo' ? 'text-white' : 'text-[#B0B0B0]'}`}>
                        ⚡ SOLO ARENA
                      </h3>
                      <span className="text-[10px] font-mono text-[#FFC000] uppercase">SPEED DRILL</span>
                    </div>
                    <p className="text-xs text-[#7D7D7D] font-sans">
                      Autonomous speed battle against the clock with live AI telemetry evaluation.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: 1 VS 1 FRIEND DUEL */}
              <button
                type="button"
                onClick={() => setBattleMode('1v1')}
                className={`
                  p-5 sm:p-6 text-left border rounded-none transition-all cursor-pointer relative select-none
                  ${battleMode === '1v1'
                    ? 'bg-[#18150A] border-[#FFC000] ring-1 ring-[#FFC000]'
                    : 'bg-[#121212] border-[#242424] hover:border-[#383838] hover:bg-[#151515]'
                  }
                `}
              >
                {battleMode === '1v1' && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#FFC000] text-black font-mono font-black text-[9px] uppercase tracking-wider">
                    ACTIVE MODE
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-none border ${battleMode === '1v1' ? 'bg-[#FFC000] text-black border-[#FFC000]' : 'bg-[#1C1C1C] text-[#7D7D7D] border-[#2A2A2A]'}`}>
                    <Swords className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-black text-base uppercase font-display ${battleMode === '1v1' ? 'text-white' : 'text-[#B0B0B0]'}`}>
                        ⚔️ 1 VS 1 FRIEND DUEL
                      </h3>
                      <span className="text-[10px] font-mono text-[#FFC000] uppercase">HEAD-TO-HEAD</span>
                    </div>
                    <p className="text-xs text-[#7D7D7D] font-sans">
                      Challenge a friend in real time. Who submits the correct answer first wins!
                    </p>
                  </div>
                </div>
              </button>

            </div>
          </div>

          {/* Feedback banner for friend actions */}
          {friendActionMsg && (
            <div className={`p-4 border font-mono text-xs flex items-center justify-between ${
              friendActionMsg.type === 'success' ? 'bg-[#121E14] border-[#00D26A] text-[#00D26A]' : 'bg-[#201214] border-[#FF2D55] text-[#FF2D55]'
            }`}>
              <span>{friendActionMsg.text}</span>
              <button onClick={() => setFriendActionMsg(null)} className="underline cursor-pointer">DISMISS</button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BRANCH A: 1 VS 1 FRIEND DUEL COMMAND CENTER */}
          {/* ========================================================================= */}
          {battleMode === '1v1' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* 1. YOUR UNIQUE PILOT ID BANNER */}
              <div className="p-6 bg-[#121212] border border-[#242424] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#888888] uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-[#FFC000]" />
                    <span>YOUR UNIQUE PILOT IDENTITY</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black font-mono text-white tracking-wider">
                      {myPilotId}
                    </span>
                    <span className="px-2 py-0.5 bg-[#1F1F1F] border border-[#333333] text-[10px] font-mono text-[#00D26A] uppercase font-bold">
                      ACTIVE PILOT
                    </span>
                  </div>
                  <p className="text-xs text-[#777777] font-sans">
                    Share your unique Pilot ID with friends so they can search and challenge you to a 1v1 battle.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPilotId}
                  className="py-2.5 px-5 bg-[#1E1E1E] hover:bg-[#282828] border border-[#383838] hover:border-[#FFC000] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-4 h-4 text-[#00D26A]" />
                      <span className="text-[#00D26A]">COPIED TO CLIPBOARD!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#FFC000]" />
                      <span>COPY PILOT ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* 2. FIND & ADD FRIENDS + PENDING REQUESTS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Search Pilot Form (Span 7) */}
                <div className="lg:col-span-7 p-6 bg-[#121212] border border-[#242424] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#202020] pb-3">
                    <div className="flex items-center gap-2 text-white font-bold text-xs tracking-wider uppercase font-display">
                      <UserPlus className="w-4 h-4 text-[#FFC000]" />
                      <span>SEARCH PILOT BY ID OR NAME</span>
                    </div>
                  </div>

                  <form onSubmit={handleSearchPilots} className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter Pilot ID (e.g. PLT-...) or pilot name..."
                      className="flex-1 bg-[#181818] border border-[#333333] focus:border-[#FFC000] px-4 py-2.5 text-xs text-white placeholder-[#666666] font-mono outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="px-5 py-2.5 bg-[#FFC000] hover:bg-[#FFD033] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{isSearching ? 'SEARCHING...' : 'FIND'}</span>
                    </button>
                  </form>

                  {searchFeedback && (
                    <p className="text-xs font-mono text-[#888888]">{searchFeedback}</p>
                  )}

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-mono text-[#888888] uppercase">MATCHING PILOTS</span>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {searchResults.map((p) => (
                          <div key={p.uid} className="p-3 bg-[#181818] border border-[#2A2A2A] flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-white uppercase">{p.displayName}</h4>
                              <p className="text-[10px] font-mono text-[#FFC000]">{p.pilotId} • Level {p.currentLevel}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSelectOpponentDirectly(p)}
                                className="px-3 py-1.5 bg-[#FFC000] hover:bg-[#FFD033] text-black border border-[#FFC000] text-[10px] font-mono uppercase font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Swords className="w-3 h-3" />
                                <span>CHALLENGE</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendFriendRequest(p)}
                                className="px-3 py-1.5 bg-[#252525] hover:bg-[#383838] hover:text-white border border-[#3D3D3D] text-[10px] font-mono uppercase font-bold transition-colors cursor-pointer"
                              >
                                + ADD FRIEND
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Incoming Pending Requests (Span 5) */}
                <div className="lg:col-span-5 p-6 bg-[#121212] border border-[#242424] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#202020] pb-3">
                    <div className="flex items-center gap-2 text-white font-bold text-xs tracking-wider uppercase font-display">
                      <Users className="w-4 h-4 text-[#FFC000]" />
                      <span>PENDING FRIEND REQUESTS</span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#202020] text-[10px] font-mono text-[#FFC000]">
                      {pendingRequests.length} PENDING
                    </span>
                  </div>

                  {pendingRequests.length === 0 ? (
                    <p className="text-xs text-[#777777] font-sans py-4 text-center">
                      No incoming friend requests right now.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto">
                      {pendingRequests.map((req) => (
                        <div key={req.id} className="p-3 bg-[#181818] border border-[#2A2A2A] space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-xs font-bold text-white uppercase">{req.fromName}</h4>
                              <p className="text-[10px] font-mono text-[#FFC000]">{req.fromPilotId}</p>
                            </div>
                            <span className="text-[9px] font-mono text-[#888888] uppercase">REQUEST</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => handleRespondRequest(req.id, 'accepted', req)}
                              className="py-1 bg-[#00D26A] text-black font-mono font-bold text-[10px] uppercase hover:bg-[#00E575] cursor-pointer"
                            >
                              ACCEPT
                            </button>
                            <button
                              onClick={() => handleRespondRequest(req.id, 'declined', req)}
                              className="py-1 bg-[#222222] text-[#888888] font-mono text-[10px] uppercase hover:text-white cursor-pointer"
                            >
                              DECLINE
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* 3. SELECT OPPONENT FRIEND */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#202020] pb-3">
                  <div className="flex items-center gap-2 text-white font-bold text-xs tracking-wider uppercase font-display">
                    <Users className="w-4 h-4 text-[#FFC000]" />
                    <span>03. SELECT OPPONENT PILOT</span>
                  </div>
                  <span className="text-xs font-mono text-[#888888]">
                    {friendsList.length} PILOTS AVAILABLE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friendsList.map((friend) => {
                    const isSelected = selectedFriend?.uid === friend.uid;
                    return (
                      <button
                        key={friend.uid}
                        type="button"
                        onClick={() => setSelectedFriend(friend)}
                        className={`
                          p-4 text-left border rounded-none transition-all cursor-pointer relative select-none
                          ${isSelected
                            ? 'bg-[#18150A] border-[#FFC000] ring-1 ring-[#FFC000]'
                            : 'bg-[#121212] border-[#242424] hover:border-[#383838] hover:bg-[#151515]'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${friend.isBot ? 'bg-[#FFC000]' : 'bg-[#00D26A]'}`} />
                              <h4 className="text-sm font-bold text-white uppercase font-display truncate max-w-[170px]">
                                {friend.displayName}
                              </h4>
                            </div>
                            <p className="text-[11px] font-mono text-[#FFC000]">
                              {friend.pilotId || 'PLT-PILOT'}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-[#1F1F1F] border border-[#2E2E2E] text-[9px] font-mono text-[#888888] uppercase">
                            {friend.isBot ? 'AI RIVAL' : 'FRIEND'}
                          </span>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-[#202020] flex items-center justify-between text-[10px] font-mono text-[#777777]">
                          <span>LEVEL {friend.currentLevel || 1}</span>
                          <span className={isSelected ? 'text-[#FFC000] font-bold' : ''}>
                            {isSelected ? 'SELECTED OPPONENT ✓' : 'CLICK TO SELECT'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. DUEL MATCH CONFIGURATION (Time per Question & Rounds) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 bg-[#121212] border border-[#242424]">
                
                {/* Round Speed Timer */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-xs tracking-wider uppercase font-display">
                    <Clock className="w-4 h-4 text-[#FFC000]" />
                    <span>ROUND RESPONSE TIMER</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { seconds: 10, label: '10s BLITZ' },
                      { seconds: 15, label: '15s STANDARD' },
                      { seconds: 30, label: '30s TACTICAL' }
                    ].map((item) => (
                      <button
                        key={item.seconds}
                        type="button"
                        onClick={() => setDuelTimePerQ(item.seconds)}
                        className={`py-3 px-2 border font-mono font-bold text-xs uppercase transition-colors cursor-pointer text-center ${
                          duelTimePerQ === item.seconds
                            ? 'bg-[#FFC000] border-[#FFC000] text-black'
                            : 'bg-[#181818] border-[#2A2A2A] text-[#888888] hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stage Count / Winner Count */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-xs tracking-wider uppercase font-display">
                    <Sparkles className="w-4 h-4 text-[#FFC000]" />
                    <span>DUEL STAGE COUNT</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 15].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setDuelQuestionCount(cnt)}
                        className={`py-3 px-2 border font-mono font-bold text-xs uppercase transition-colors cursor-pointer text-center ${
                          duelQuestionCount === cnt
                            ? 'bg-[#FFC000] border-[#FFC000] text-black'
                            : 'bg-[#181818] border-[#2A2A2A] text-[#888888] hover:text-white'
                        }`}
                      >
                        {cnt} STAGES
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Head-to-Head Speed Rule Notice */}
              <div className="p-4 bg-[#181408] border border-[#FFC000]/40 flex items-start gap-3">
                <Zap className="w-5 h-5 text-[#FFC000] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-mono font-bold text-[#FFC000] uppercase">
                    1V1 SPEED & ACCURACY BATTLE TELEMETRY
                  </h4>
                  <p className="text-xs text-[#E0E0E0] font-sans">
                    Both pilots answer the exact same questions under the same countdown. The pilot who submits the correct answer first gains the speed advantage and wins the match!
                  </p>
                </div>
              </div>

              {/* 1v1 Launch CTA */}
              <div className="pt-2 flex flex-col items-center space-y-3">
                {pendingDuelRoomId ? (
                  <div className="w-full max-w-xl p-6 bg-[#16140A] border-2 border-[#FFC000] text-center space-y-4 animate-pulse">
                    <div className="w-8 h-8 border-2 border-[#FFC000] border-t-transparent animate-spin mx-auto" />
                    <h3 className="text-sm font-black font-mono text-[#FFC000] uppercase tracking-wider">
                      WAITING FOR {selectedFriend?.displayName} TO ACCEPT DUEL...
                    </h3>
                    <p className="text-xs text-[#888888] font-sans">
                      Challenge dispatched to {selectedFriend?.displayName} ({selectedFriend?.pilotId}). When accepted, you will enter the cockpit immediately.
                    </p>
                    <button
                      type="button"
                      onClick={handleCancelPendingDuel}
                      className="px-4 py-2 bg-[#202020] hover:bg-[#FF2D55] text-white font-mono text-xs uppercase font-bold transition-colors cursor-pointer"
                    >
                      CANCEL CHALLENGE
                    </button>
                  </div>
                ) : (
                  <Button
                    size="xl"
                    variant="primary"
                    fullWidth
                    icon={Swords}
                    iconPosition="left"
                    disabled={isDispatchingDuel || !selectedFriend}
                    onClick={handleLaunchDuel}
                    className="w-full max-w-xl py-5 font-black text-sm sm:text-base tracking-widest uppercase cursor-pointer"
                  >
                    {isDispatchingDuel 
                      ? 'SYNCHRONIZING DUEL ROOM...' 
                      : `DISPATCH 1V1 DUEL TO ${selectedFriend?.displayName || 'PILOT'} (${duelQuestionCount} STAGES)`
                    }
                  </Button>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* BRANCH B: SOLO ARENA SPEED DRILL (Classic Performance Mode) */}
          {/* ========================================================================= */}
          {battleMode === 'solo' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Difficulty Selector */}
                <div className="md:col-span-2 space-y-4 p-6 sm:p-8 bg-[#121212] border border-[#242424] rounded-none">
                  <div className="flex items-center gap-2 text-white font-bold text-xs tracking-wider uppercase font-display">
                    <SlidersHorizontal className="w-4 h-4 text-[#FFC000]" />
                    <span>03. PERFORMANCE MODE</span>
                  </div>

                  <DifficultySelector
                    selectedDifficulty={quizConfig.difficulty}
                    onChange={handleDifficultyChange}
                  />
                </div>

                {/* Stage / Question Count */}
                <div className="space-y-4 p-6 sm:p-8 bg-[#121212] border border-[#242424] rounded-none flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-white font-bold text-xs tracking-wider uppercase font-display mb-4">
                      <Sparkles className="w-4 h-4 text-[#FFC000]" />
                      <span>04. STAGE COUNT</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[5, 10, 15].map((count) => {
                        const isSelected = quizConfig.questionCount === count;
                        return (
                          <button
                            key={count}
                            type="button"
                            onClick={() => handleQuestionCountChange(count)}
                            className={`
                              py-3.5 rounded-none border text-center font-black font-mono transition-colors text-xs select-none cursor-pointer uppercase
                              ${
                                isSelected
                                  ? 'bg-[#FFC000] border-[#FFC000] text-black ring-1 ring-[#FFC000]'
                                  : 'bg-[#181818] border-[#2A2A2A] text-[#7D7D7D] hover:border-white hover:text-white'
                              }
                            `}
                          >
                            {count} STAGES
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Telemetry Configuration Summary */}
                  <div className="p-3.5 bg-[#0A0A0A] border border-[#202020] text-[11px] font-mono text-[#7D7D7D] space-y-1.5 uppercase">
                    <div className="flex justify-between">
                      <span>ENGINE:</span>
                      <span className="text-[#FFC000] font-bold">SOLO SPEED DRILL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DOMAIN:</span>
                      <span className="text-white font-bold">{quizConfig.categoryName || selectedCategoryObj?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CALIBRATION:</span>
                      <span className="text-[#FFC000] font-bold">{quizConfig.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* START / LAUNCH BATTLE CTA */}
              <div className="pt-4 flex justify-center">
                <div className="w-full max-w-xl">
                  <Button
                    size="xl"
                    variant="primary"
                    fullWidth
                    icon={Play}
                    iconPosition="left"
                    disabled={isLoading}
                    onClick={() => startQuiz()}
                    className="py-5 font-black text-sm sm:text-base tracking-widest uppercase cursor-pointer"
                  >
                    {isLoading 
                      ? 'INITIALIZING SOLO ARENA...' 
                      : `LAUNCH SOLO ARENA BATTLE (${quizConfig.questionCount} STAGES)`
                    }
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
