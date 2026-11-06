import React from 'react';
import { Swords, Clock, Zap, Check, X, ShieldAlert } from 'lucide-react';

export default function DuelInviteModal({ invite, onAccept, onDecline }) {
  if (!invite) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#111111] border-2 border-[#FFC000] p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Pulsing Header */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1810] border border-[#FFC000] flex items-center justify-center text-[#FFC000]">
              <Swords className="w-5 h-5 animate-pulse stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#FFC000] uppercase font-bold tracking-widest block">
                INCOMING LIVE CHALLENGE
              </span>
              <h2 className="text-xl font-black text-white uppercase font-display tracking-tight">
                1 VS 1 FRIEND DUEL
              </h2>
            </div>
          </div>
          <button
            onClick={() => onDecline(invite.roomId || invite.id)}
            className="p-1.5 text-[#777777] hover:text-white transition-colors cursor-pointer"
            aria-label="Decline"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenger Card */}
        <div className="p-4 bg-[#181818] border border-[#282828] space-y-2 text-left">
          <p className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">
            CHALLENGER SQUADRON
          </p>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white uppercase font-display">
                {invite.host?.name || 'PILOT CHALLENGER'}
              </h3>
              <p className="text-xs font-mono text-[#FFC000]">
                {invite.host?.pilotId || 'PLT-WARRIOR'}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-[#222222] border border-[#333333] text-[10px] font-mono text-white uppercase">
              READY
            </span>
          </div>
        </div>

        {/* Match Specs */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 bg-[#151515] border border-[#222222] space-y-1">
            <span className="text-[10px] font-mono text-[#777777] uppercase block">ARENA DISCIPLINE</span>
            <p className="text-sm font-bold text-white uppercase font-display">
              {invite.category?.name || 'Aptitude'}
            </p>
          </div>
          <div className="p-3 bg-[#151515] border border-[#222222] space-y-1">
            <span className="text-[10px] font-mono text-[#777777] uppercase block">TIME & STAGES</span>
            <p className="text-sm font-bold text-white uppercase font-display flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FFC000]" />
              <span>{invite.timePerQuestion || 15}s • {invite.questionCount || 5} Qs</span>
            </p>
          </div>
        </div>

        {/* Win Condition Rule */}
        <div className="p-3 bg-[#161208] border border-[#FFC000]/40 flex items-start gap-3 text-left">
          <Zap className="w-4 h-4 text-[#FFC000] shrink-0 mt-0.5" />
          <p className="text-xs text-[#E0E0E0] font-sans">
            <strong className="text-[#FFC000] uppercase font-mono">Head-to-Head Speed Rule:</strong> Both pilots answer the exact same questions. The fastest correct submission takes the speed bonus and wins the match!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            onClick={() => onDecline(invite.roomId || invite.id)}
            className="w-full py-3 px-4 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333333] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            DECLINE
          </button>
          <button
            type="button"
            onClick={() => onAccept(invite)}
            className="w-full py-3 px-4 bg-[#FFC000] hover:bg-[#FFD033] text-black font-mono text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,192,0,0.4)]"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>ACCEPT & BATTLE</span>
          </button>
        </div>

      </div>
    </div>
  );
}
