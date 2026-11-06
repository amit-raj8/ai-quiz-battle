import React from 'react';
import { Flame } from 'lucide-react';

export default function StreakDisplay({ streak }) {
  if (!streak || streak <= 1) return null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1C1810] border border-[#FFC000]/40 text-[#FFC000] text-xs font-mono font-bold animate-fadeIn">
      <Flame className="w-3.5 h-3.5 fill-[#FFC000]" />
      <span>{streak}x</span>
    </div>
  );
}
