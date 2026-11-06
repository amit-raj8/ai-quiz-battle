import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';

export default function Footer() {
  const { navigateTo } = useQuiz();

  return (
    <footer className="bg-black border-t border-[#1C1C1C] py-8 text-[#777777] text-xs font-mono">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-black border border-[#FFC000] flex items-center justify-center">
            <Zap className="w-3 h-3 text-[#FFC000]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase tracking-wider font-display text-xs">
              AI QUIZ <span className="text-[#FFC000]">BATTLE</span>
            </span>
            <span className="text-[#444444]">•</span>
            <span className="text-[11px] text-[#777777] hidden sm:inline">
              Developer Interview & Coding Arena
            </span>
          </div>
        </div>

        {/* Minimal Navigation */}
        <div className="flex items-center gap-6 text-[11px] uppercase tracking-wider">
          <button 
            onClick={() => navigateTo('home')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigateTo('setup')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Arenas
          </button>
          <button 
            onClick={() => navigateTo('leaderboard')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Leaderboard
          </button>
        </div>

        {/* Status & Copyright */}
        <div className="flex items-center gap-4 text-[11px] text-[#555555]">
          <div className="flex items-center gap-1.5 text-[#00D26A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D26A] animate-pulse" />
            <span className="font-medium uppercase tracking-wider">Systems Online</span>
          </div>
          <span className="text-[#333333]">•</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

      </div>
    </footer>
  );
}
