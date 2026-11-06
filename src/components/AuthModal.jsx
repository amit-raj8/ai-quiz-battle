import React, { useEffect } from 'react';
import { 
  Lock, 
  LogIn, 
  UserPlus, 
  X, 
  Zap, 
  Sparkles,
  Trophy,
  Flame
} from 'lucide-react';
import Button from './Button';

export default function AuthModal({
  isOpen,
  onClose,
  onSignIn,
  onRegister,
  title = "PILOT CLEARANCE REQUIRED",
  featureName = "Battle Arena",
  message = "You must be signed in with an active pilot account to access this feature."
}) {
  // Lock body scroll when modal is open and handle Esc key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Dark Translucent Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Monolithic Modal Window */}
      <div 
        className="relative w-full max-w-lg bg-[#0F0F0F] border border-[#333333] shadow-2xl z-10 text-left overflow-hidden rounded-none my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Accent Bar with Tech Pattern */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC000] via-[#FFCE3E] to-[#FFC000]" />
        
        {/* Header Telemetry Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#161616] border-b border-[#242424] text-[10px] font-mono tracking-[0.25em] text-[#7D7D7D] uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FFC000] animate-pulse inline-block" />
            <span className="text-[#FFC000] font-bold">ACCESS CONTROL SYSTEM</span>
          </div>
          <span>PROTOCOL // 401-RESTRICTED</span>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Lock Emblem & Feature Header */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-[#181818] border border-[#FFC000]/60 flex items-center justify-center text-[#FFC000] shrink-0 relative">
              <Lock className="w-6 h-6 text-[#FFC000]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFC000] text-black flex items-center justify-center text-[8px] font-bold">
                !
              </div>
            </div>

            <div className="space-y-1.5 flex-1 pr-6">
              <div className="inline-block text-[10px] font-mono text-[#FFC000] font-bold tracking-[0.2em] uppercase">
                {featureName}
              </div>
              <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-display">
                {title}
              </h2>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-[#7D7D7D] hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Explanation Text */}
          <p className="text-xs sm:text-sm text-[#969696] leading-relaxed font-sans">
            {message}
          </p>

          {/* Value Props / What Signing In Unlocks */}
          <div className="p-4 bg-[#141414] border border-[#222222] space-y-2.5">
            <div className="text-[10px] font-mono text-[#7D7D7D] uppercase tracking-wider font-bold">
              AUTHENTICATED PILOTS RECEIVE:
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-white">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#FFC000] shrink-0" />
                <span>Unlimited AI Battles</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-[#FFC000] shrink-0" />
                <span>Streak Multipliers</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-[#FFC000] shrink-0" />
                <span>Grand Prix Standings</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FFC000] shrink-0" />
                <span>Telemetry & XP History</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={LogIn}
              onClick={onSignIn}
              className="py-3.5 text-xs font-black tracking-widest"
            >
              SIGN IN WITH PILOT ID
            </Button>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              icon={UserPlus}
              onClick={onRegister}
              className="py-3.5 text-xs font-bold tracking-widest"
            >
              REGISTER NEW PILOT CALLSIGN
            </Button>

            <button
              onClick={onClose}
              className="w-full text-center py-2 text-xs font-mono text-[#7D7D7D] hover:text-white uppercase tracking-widest transition-colors"
            >
              CONTINUE BROWSING AS GUEST
            </button>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="px-6 py-2.5 bg-[#0A0A0A] border-t border-[#1F1F1F] flex items-center justify-between text-[10px] font-mono text-[#555555]">
          <span>GUEST PREVIEW RESTRICTION</span>
          <span>SIGN IN TO ENLIST</span>
        </div>
      </div>
    </div>
  );
}
