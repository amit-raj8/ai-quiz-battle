import React, { useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  Flame, 
  Menu, 
  X, 
  LogOut, 
  Loader2, 
  ChevronRight,
  LogIn,
  UserPlus,
  Lock
} from 'lucide-react';
import Button from './Button';
import Avatar from './Avatar';

export default function Navbar() {
  const { currentScreen, navigateTo, userProfile, streak } = useQuiz();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { id: 'home', label: 'DASHBOARD' },
    { id: 'setup', label: 'ARENAS', requiresAuth: true },
    { id: 'leaderboard', label: 'LEADERBOARD', requiresAuth: true }
  ];

  const handleNavClick = (screen) => {
    navigateTo(screen);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    navigateTo('home');
  };

  const displayName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'PILOT';

  return (
    <nav className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-md border-b border-[#202020] transition-colors">
      <div className="w-full px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: Automotive Brand Emblem */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left focus:outline-none shrink-0"
          >
            <div className="w-9 h-9 bg-black border border-[#FFC000] flex items-center justify-center group-hover:bg-[#FFC000] transition-colors duration-200">
              <Zap className="w-4 h-4 text-[#FFC000] group-hover:text-black transition-colors" />
            </div>
            <div>
              <div className="text-lg font-black tracking-widest text-white uppercase font-display flex items-center gap-1.5">
                <span>AI QUIZ</span>
                <span className="text-[#FFC000]">BATTLE</span>
              </div>
              <div className="text-[9px] text-[#7D7D7D] font-mono tracking-[0.25em] uppercase">
                HIGH-PERFORMANCE ARENA
              </div>
            </div>
          </button>

          {/* CENTER: Minimal Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              const isLocked = item.requiresAuth && !currentUser;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-xs font-bold tracking-[0.18em] transition-all duration-150 py-2 border-b-2 uppercase flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'text-[#FFC000] border-[#FFC000]'
                      : 'text-[#969696] border-transparent hover:text-white hover:border-white/40'
                  }`}
                >
                  <span>{item.label}</span>
                  {isLocked && (
                    <Lock className="w-3 h-3 text-[#FFC000]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT: Telemetry & Pilot Status */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            {streak > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#202020] border border-[#FFC000]/40 text-[#FFC000] text-xs font-mono font-bold">
                <Flame className="w-3.5 h-3.5 fill-[#FFC000] text-[#FFC000]" />
                <span>{streak}X BOOST</span>
              </div>
            )}

            {currentUser ? (
              // LOGGED IN PILOT STATE
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center gap-3 px-3.5 py-2 bg-[#181818] border border-[#333333] hover:border-[#FFC000] transition-all text-xs font-medium text-white group"
                >
                  <Avatar
                    src={userProfile?.photoURL || currentUser?.photoURL}
                    name={displayName}
                    size="sm"
                    borderClassName="border border-[#FFC000]"
                  />
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-[#FFC000] transition-colors max-w-[120px] truncate uppercase font-mono text-[11px]">
                      {displayName}
                    </div>
                    <div className="text-[9px] text-[#FFC000] font-mono uppercase">
                      {userProfile?.pilotId ? `${String(userProfile.pilotId).replace(/^PLT-/i, '')} • ` : ''}LVL {userProfile?.currentLevel || 1}
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  title="Eject / Logout"
                  className="p-2.5 bg-[#181818] border border-[#333333] text-[#7D7D7D] hover:text-[#FF2D55] hover:border-[#FF2D55] transition-all focus:outline-none disabled:opacity-50"
                  aria-label="Logout"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF2D55]" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </button>
              </div>
            ) : (
              // LOGGED OUT STATE
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={LogIn}
                  onClick={() => handleNavClick('login')}
                  className="border-white/40 text-xs py-2 px-4"
                >
                  SIGN IN
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  icon={UserPlus}
                  onClick={() => handleNavClick('register')}
                  className="text-xs py-2 px-5"
                >
                  REGISTER
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 bg-[#181818] border border-[#333333] text-white hover:border-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-black border-b border-[#202020] px-6 pt-4 pb-8 space-y-2">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            const isLocked = item.requiresAuth && !currentUser;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#181818] text-[#FFC000] border-l-2 border-[#FFC000]'
                    : 'text-[#969696] hover:bg-[#121212] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{item.label}</span>
                  {isLocked && <Lock className="w-3 h-3 text-[#FFC000]" />}
                </div>
                <ChevronRight className="w-4 h-4 text-[#7D7D7D]" />
              </button>
            );
          })}
          
          <div className="pt-4 border-t border-[#202020] mt-4">
            {currentUser ? (
              <div className="flex items-center justify-between px-2 pt-2">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={userProfile?.photoURL || currentUser?.photoURL}
                    name={displayName}
                    size="md"
                    borderClassName="border border-[#FFC000]"
                  />
                  <div>
                    <div className="text-xs font-bold text-white uppercase font-mono">{displayName}</div>
                    <div className="text-[10px] text-[#7D7D7D] font-mono truncate max-w-[180px]">
                      {userProfile?.email || currentUser.email} • LVL {userProfile?.currentLevel || 1}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-xs text-[#FF2D55] font-bold px-3 py-2 bg-[#202020] border border-[#FF2D55]/50 hover:bg-[#FF2D55] hover:text-white uppercase font-mono flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isLoggingOut ? '...' : 'LOGOUT'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  size="md"
                  variant="secondary"
                  icon={LogIn}
                  fullWidth
                  onClick={() => handleNavClick('login')}
                >
                  SIGN IN
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  icon={UserPlus}
                  fullWidth
                  onClick={() => handleNavClick('register')}
                >
                  REGISTER
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
