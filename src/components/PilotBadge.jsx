import React from 'react';
import { 
  Shield, 
  Award, 
  Crown, 
  Sparkles, 
  Swords, 
  Lock
} from 'lucide-react';
import { getBadge } from '../utils/badgeSystem';

export default function PilotBadge({ 
  wins = 0, 
  badge = null, 
  size = 'md', 
  showNextGoal = false,
  showWins = false,
  className = '' 
}) {
  const currentBadge = badge || getBadge(wins);

  const getTierIcon = (id, iconClass = 'w-3.5 h-3.5') => {
    switch (id) {
      case 'grandmaster':
        return <Crown className={`${iconClass} fill-[#FF2D55] stroke-[#FF2D55] animate-pulse`} />;
      case 'master':
        return <Swords className={`${iconClass} stroke-[#C084FC]`} />;
      case 'diamond':
        return <Sparkles className={`${iconClass} stroke-[#00F0FF] fill-[#00F0FF]/20`} />;
      case 'gold':
        return <Crown className={`${iconClass} stroke-[#FFC000] fill-[#FFC000]/20`} />;
      case 'silver':
        return <Award className={`${iconClass} stroke-[#E0E0E0]`} />;
      case 'bronze':
        return <Shield className={`${iconClass} stroke-[#CD7F32] fill-[#CD7F32]/20`} />;
      default:
        return <Lock className={`${iconClass} stroke-[#666666]`} />;
    }
  };

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 border font-mono font-bold text-[10px] uppercase tracking-wider ${currentBadge.bg} ${currentBadge.border} ${currentBadge.accent} ${className}`}>
        {getTierIcon(currentBadge.id, 'w-3 h-3')}
        <span>{currentBadge.name}</span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 border ${currentBadge.bg} ${currentBadge.border} ${currentBadge.glow} space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 border flex items-center justify-center bg-black/40 ${currentBadge.border}`}>
              {getTierIcon(currentBadge.id, 'w-5 h-5')}
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#888888] uppercase tracking-widest">
                COMBAT TIER BADGE
              </div>
              <div className={`text-base font-black font-display uppercase tracking-wider ${currentBadge.accent}`}>
                {currentBadge.name}
              </div>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-sm font-black text-white">{currentBadge.wins}</div>
            <div className="text-[9px] text-[#777777] uppercase">ARENA WINS</div>
          </div>
        </div>

        {showNextGoal && currentBadge.nextBadge && (
          <div className="pt-2 border-t border-white/10 space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-[#A0A0A0] uppercase">
              <span>{currentBadge.nextBadge.nextGoalText}</span>
              <span>{currentBadge.nextBadge.progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/60 border border-white/10 overflow-hidden">
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${currentBadge.nextBadge.progressPercent}%`,
                  backgroundColor: currentBadge.color
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default 'md' size
  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 border font-mono font-bold text-xs uppercase tracking-wider ${currentBadge.bg} ${currentBadge.border} ${currentBadge.glow} ${currentBadge.accent}`}>
        {getTierIcon(currentBadge.id, 'w-3.5 h-3.5')}
        <span>{currentBadge.name}</span>
        {showWins && (
          <span className="text-[10px] text-[#888888] font-normal border-l border-white/20 pl-1.5">
            {currentBadge.wins}W
          </span>
        )}
      </div>

      {showNextGoal && currentBadge.nextBadge && (
        <span className="text-[10px] font-mono text-[#888888] uppercase">
          {currentBadge.nextBadge.nextGoalText}
        </span>
      )}
    </div>
  );
}
