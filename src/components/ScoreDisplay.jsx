import React from 'react';
import { Trophy } from 'lucide-react';

export default function ScoreDisplay({ score }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] border border-[#262626] text-xs font-mono">
      <Trophy className="w-3.5 h-3.5 text-[#FFC000]" />
      <span className="font-bold text-white">{score}</span>
      <span className="text-[#666] text-[10px] uppercase">pts</span>
    </div>
  );
}
