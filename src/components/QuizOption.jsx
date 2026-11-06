import React from 'react';
import { Check, X } from 'lucide-react';

export default function QuizOption({
  index,
  text,
  isSelected,
  isCorrect,
  isAnswered,
  correctAnswerIndex,
  correctAnswerText,
  onSelect
}) {
  const letters = ['A', 'B', 'C', 'D'];
  const optionLetter = letters[index] || 'A';

  const isThisCorrect = isAnswered && (
    index === correctAnswerIndex || 
    (correctAnswerText && text?.trim().toLowerCase() === correctAnswerText.trim().toLowerCase())
  );
  const isThisIncorrect = isAnswered && isSelected && !isCorrect;

  let stateClasses = 'bg-[#121212] border-[#222222] text-[#E0E0E0] hover:border-[#444444] hover:bg-[#181818] cursor-pointer';

  if (isAnswered) {
    if (isThisCorrect) {
      stateClasses = 'bg-[#121A14] border-[#00D26A] text-white ring-1 ring-[#00D26A] cursor-default';
    } else if (isThisIncorrect) {
      stateClasses = 'bg-[#1A1214] border-[#FF2D55] text-white ring-1 ring-[#FF2D55] cursor-default';
    } else {
      stateClasses = 'bg-[#0A0A0A] border-[#181818] text-[#444444] opacity-40 cursor-default';
    }
  } else if (isSelected) {
    stateClasses = 'bg-[#1C1810] border-[#FFC000] text-white ring-1 ring-[#FFC000] cursor-pointer';
  }

  return (
    <div
      onClick={() => !isAnswered && onSelect && onSelect(index)}
      className={`
        group relative flex items-center justify-between p-4 sm:p-5 rounded-none border transition-all duration-150 select-none min-h-[68px] sm:min-h-[74px]
        ${stateClasses}
      `}
    >
      <div className="flex items-center gap-3.5 sm:gap-4 pr-3 flex-1 min-w-0">
        {/* Letter Badge */}
        <div
          className={`
            w-8 h-8 rounded-none font-bold text-xs flex items-center justify-center shrink-0 font-mono transition-colors
            ${
              isThisCorrect
                ? 'bg-[#00D26A] text-black font-black'
                : isThisIncorrect
                ? 'bg-[#FF2D55] text-white font-black'
                : isSelected
                ? 'bg-[#FFC000] text-black font-black'
                : 'bg-[#1C1C1C] border border-[#2A2A2A] text-[#888888] group-hover:text-white group-hover:border-[#555]'
            }
          `}
        >
          {optionLetter}
        </div>

        {/* Text */}
        <span className="text-sm sm:text-base font-normal leading-relaxed break-words">
          {text}
        </span>
      </div>

      {/* Right Indicator Icon */}
      <div className="shrink-0 ml-2">
        {isThisCorrect && (
          <div className="w-6 h-6 bg-[#00D26A] text-black flex items-center justify-center font-bold">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        )}
        {isThisIncorrect && (
          <div className="w-6 h-6 bg-[#FF2D55] text-white flex items-center justify-center font-bold">
            <X className="w-4 h-4 stroke-[3]" />
          </div>
        )}
      </div>
    </div>
  );
}
