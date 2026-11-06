import React from 'react';
import { 
  Code, 
  FileCode, 
  Brain, 
  BarChart3, 
  Cpu, 
  Coffee,
  Terminal,
  Binary,
  Database,
  Layout,
  Calculator,
  Zap,
  Check,
  ChevronRight,
  Lock
} from 'lucide-react';

const iconMap = {
  Code,
  FileCode,
  Coffee,
  Terminal,
  Binary,
  Database,
  Layout,
  Brain,
  BarChart3,
  Cpu,
  Calculator
};

export default function CategoryCard({ category, isSelected = false, isLocked = false, onSelect }) {
  const IconComponent = iconMap[category?.icon || category?.iconName] || Code;
  const questionCount = category?.totalQuestions || category?.questionCount || 15;
  const catId = (category?.id || category?.categoryId || '').toLowerCase();

  const handleClick = (e) => {
    e.preventDefault();
    if (onSelect) {
      onSelect(category);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSelected}
      data-category-id={catId}
      className={`
        w-full relative cursor-pointer p-6 sm:p-7 transition-all duration-200 select-none rounded-none
        border text-left group outline-none focus-visible:ring-2 focus-visible:ring-[#FFC000]
        ${
          isSelected
            ? 'bg-[#202020] border-[#FFC000] ring-1 ring-[#FFC000]'
            : 'bg-[#141414] border-[#222222] hover:border-white/50 hover:bg-[#1A1A1A]'
        }
      `}
    >
      {/* Top Bar: Icon + Telemetry Badge */}
      <div className="flex items-start justify-between mb-5">
        <div className={`
          w-11 h-11 flex items-center justify-center rounded-none transition-colors duration-150
          ${
            isSelected
              ? 'bg-[#FFC000] text-black'
              : 'bg-[#202020] text-white group-hover:bg-white group-hover:text-black'
          }
        `}>
          <IconComponent className="w-5 h-5 stroke-[2]" />
        </div>

        {isSelected ? (
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 bg-[#FFC000] text-black uppercase">
            <Check className="w-3 h-3 stroke-[3]" />
            <span>ARMED</span>
          </div>
        ) : isLocked ? (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold tracking-[0.2em] px-2 py-1 bg-[#1A1414] text-[#FFC000] border border-[#FFC000]/40 uppercase">
            <Lock className="w-2.5 h-2.5" />
            <span>LOCKED</span>
          </span>
        ) : category?.badge ? (
          <span className="text-[9px] font-mono font-bold tracking-[0.2em] px-2.5 py-1 bg-[#202020] text-[#969696] border border-[#333333] uppercase">
            {category.badge}
          </span>
        ) : null}
      </div>

      {/* Domain Title */}
      <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mb-2.5 font-display group-hover:text-[#FFC000] transition-colors">
        {category?.name}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-[#888888] line-clamp-2 mb-6 leading-relaxed font-sans">
        {category?.description}
      </p>

      {/* Card Footer: Metrics + Action */}
      <div className="flex items-center justify-between pt-4 border-t border-[#222222] text-[11px] font-mono">
        <span className="text-[#969696] uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-[#FFC000]" />
          <span>{questionCount} STAGES</span>
        </span>

        <span className={`flex items-center gap-1 font-bold uppercase tracking-widest transition-colors ${
          isSelected 
            ? 'text-[#FFC000]' 
            : isLocked 
              ? 'text-[#FFC000] group-hover:text-white' 
              : 'text-white/70 group-hover:text-white'
        }`}>
          {isLocked ? (
            <>
              <Lock className="w-3 h-3 text-[#FFC000]" />
              <span>SIGN IN TO PLAY</span>
            </>
          ) : (
            <>
              <span>{isSelected ? 'SELECTED' : 'CONFIGURE'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </span>
      </div>
    </button>
  );
}
