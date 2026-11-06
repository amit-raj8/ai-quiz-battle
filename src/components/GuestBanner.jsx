import React from 'react';
import { Lock, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';

export default function GuestBanner() {
  const { currentUser } = useAuth();
  const { openAuthModal, navigateTo } = useQuiz();

  if (currentUser) return null;

  return (
    <div className="w-full bg-[#121212] border-b border-[#2A2A2A] text-left transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5 text-[#FFC000]">
          <div className="w-5 h-5 bg-[#202020] border border-[#FFC000]/60 flex items-center justify-center shrink-0">
            <Lock className="w-3 h-3 text-[#FFC000]" />
          </div>
          <span className="font-bold tracking-wider uppercase text-[11px] sm:text-xs text-white">
            <span className="text-[#FFC000]">GUEST TELEMETRY ACTIVE:</span> PREVIEW MODE ONLY • ALL LIVE BATTLES & FEATURES LOCKED
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => openAuthModal({
              feature: 'Full Arena Access',
              message: 'Sign in to unlock live battles, AI question generation, XP progression, and global rankings.'
            })}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#FFC000] hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            <span>SIGN IN TO UNLOCK</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
