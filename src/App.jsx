import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuizProvider, useQuiz } from './context/QuizContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import GuestBanner from './components/GuestBanner';

// Pages
import Home from './pages/Home';
import QuizSetup from './pages/QuizSetup';
import QuizGame from './pages/QuizGame';
import QuizResult from './pages/QuizResult';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import DuelArena from './pages/DuelArena';
import DuelInviteModal from './components/DuelInviteModal';

import { Check, AlertCircle, X } from 'lucide-react';

function NotificationBanner() {
  const { authNotification, clearNotification } = useAuth();

  if (!authNotification) return null;

  const isSuccess = authNotification.type === 'success';

  return (
    <div className="fixed top-24 right-4 sm:right-8 z-50 animate-fadeIn">
      <div
        className={`px-5 py-3.5 rounded-none border shadow-2xl flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider ${
          isSuccess
            ? 'bg-[#121A14] border-[#00D26A] text-[#00D26A]'
            : 'bg-[#1A1214] border-[#FF2D55] text-[#FF2D55]'
        }`}
      >
        {isSuccess ? (
          <div className="w-5 h-5 bg-[#00D26A] text-black flex items-center justify-center font-bold">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        ) : (
          <AlertCircle className="w-5 h-5 text-[#FF2D55] shrink-0" />
        )}
        <span>{authNotification.message}</span>
        <button
          onClick={clearNotification}
          className="p-1 hover:bg-white/10 text-[#7D7D7D] hover:text-white transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function MainContent() {
  const { currentScreen } = useQuiz();
  const { loading } = useAuth();

  // Initial Auth Loading Screen
  if (loading) {
    return (
      <main className="flex-1 w-full flex flex-col items-center justify-center py-28 space-y-4">
        <div className="w-10 h-10 border-2 border-[#202020] border-t-[#FFC000] animate-spin" />
        <p className="text-xs font-mono text-[#FFC000] tracking-[0.25em] uppercase">
          INITIALIZING ARENA TELEMETRY...
        </p>
      </main>
    );
  }

  if (currentScreen === 'home') {
    return (
      <main className="flex-1 w-full overflow-x-hidden">
        <Home />
      </main>
    );
  }

  const isBattlePlaying = currentScreen === 'game' || currentScreen === 'duel';

  return (
    <main className={`flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 ${isBattlePlaying ? 'py-4 sm:py-6' : 'py-8'}`}>
      {currentScreen === 'setup' && (
        <ProtectedRoute featureName="Battle Configuration">
          <QuizSetup />
        </ProtectedRoute>
      )}
      {currentScreen === 'game' && (
        <ProtectedRoute featureName="Live Battle Arena">
          <QuizGame />
        </ProtectedRoute>
      )}
      {currentScreen === 'duel' && (
        <ProtectedRoute featureName="1v1 Head-to-Head Duel">
          <DuelArena />
        </ProtectedRoute>
      )}
      {currentScreen === 'result' && (
        <ProtectedRoute featureName="Battle Results">
          <QuizResult />
        </ProtectedRoute>
      )}
      {currentScreen === 'leaderboard' && (
        <ProtectedRoute featureName="Grand Prix Leaderboard">
          <Leaderboard />
        </ProtectedRoute>
      )}
      {currentScreen === 'profile' && (
        <ProtectedRoute featureName="Pilot Telemetry Profile">
          <Profile />
        </ProtectedRoute>
      )}
      {currentScreen === 'login' && <Login />}
      {currentScreen === 'register' && <Register />}
    </main>
  );
}

function AppShell() {
  const { 
    authModal, 
    closeAuthModal, 
    navigateTo, 
    currentScreen,
    incomingDuelInvites,
    acceptDuelInvite,
    declineDuelInvite
  } = useQuiz();

  const handleModalSignIn = () => {
    closeAuthModal();
    navigateTo('login', { skipAuthCheck: true });
  };

  const handleModalRegister = () => {
    closeAuthModal();
    navigateTo('register', { skipAuthCheck: true });
  };

  const isBattlePlaying = currentScreen === 'game' || currentScreen === 'duel';

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-[#FFC000] selection:text-black">
      {!isBattlePlaying && <Navbar />}
      {!isBattlePlaying && <GuestBanner />}
      <NotificationBanner />
      <MainContent />
      {!isBattlePlaying && <Footer />}
      
      {/* Global Incoming 1v1 Challenge Modal */}
      {incomingDuelInvites && incomingDuelInvites.length > 0 && !isBattlePlaying && (
        <DuelInviteModal
          invite={incomingDuelInvites[0]}
          onAccept={acceptDuelInvite}
          onDecline={declineDuelInvite}
        />
      )}

      {/* Global Feature Access Lock Modal */}
      <AuthModal
        isOpen={authModal?.isOpen}
        onClose={closeAuthModal}
        onSignIn={handleModalSignIn}
        onRegister={handleModalRegister}
        title={authModal?.title}
        featureName={authModal?.featureName}
        message={authModal?.message}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <AppShell />
      </QuizProvider>
    </AuthProvider>
  );
}
