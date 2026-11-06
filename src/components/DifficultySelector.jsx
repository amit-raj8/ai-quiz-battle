import React from 'react';
import { Gauge, Zap, Flame } from 'lucide-react';

export default function DifficultySelector({ selectedDifficulty = 'Medium', onChange }) {
  const options = [
    {
      id: 'Easy',
      label: 'STRADA / EASY',
      multiplier: '1.0X SCORE MULTIPLIER',
      icon: Gauge,
      badge: 'STANDARD'
    },
    {
      id: 'Medium',
      label: 'SPORT / MEDIUM',
      multiplier: '1.5X SCORE MULTIPLIER',
      icon: Zap,
      badge: 'PERFORMANCE'
    },
    {
      id: 'Hard',
      label: 'CORSA / HARD',
      multiplier: '2.0X SCORE MULTIPLIER',
      icon: Flame,
      badge: 'MAXIMUM'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = (selectedDifficulty || '').toLowerCase() === opt.id.toLowerCase();

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`
              relative flex items-center justify-between p-5 rounded-none border transition-all duration-150 text-left select-none cursor-pointer
              ${
                isSelected
                  ? 'bg-[#202020] border-[#FFC000] ring-1 ring-[#FFC000]'
                  : 'bg-[#141414] border-[#222222] text-[#7D7D7D] hover:border-white/40 hover:bg-[#1A1A1A] hover:text-white'
              }
            `}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-8 h-8 flex items-center justify-center rounded-none font-mono ${
                isSelected ? 'bg-[#FFC000] text-black' : 'bg-[#222222] text-[#969696]'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className={`font-black text-xs tracking-wider uppercase font-display ${
                  isSelected ? 'text-white' : 'text-[#969696]'
                }`}>
                  {opt.label}
                </div>
                <div className="text-[10px] text-[#7D7D7D] font-mono tracking-wider mt-0.5">
                  {opt.multiplier}
                </div>
              </div>
            </div>

            <div className={`w-3.5 h-3.5 rounded-none border flex items-center justify-center ${
              isSelected ? 'border-[#FFC000] bg-[#FFC000]' : 'border-[#333333]'
            }`}>
              {isSelected && <div className="w-1.5 h-1.5 bg-black" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
