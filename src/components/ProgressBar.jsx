import React from 'react';

export default function ProgressBar({ current, total }) {
  const percentage = Math.min(100, Math.max(0, Math.round((current / total) * 100)));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.2em] text-[#7D7D7D] mb-2 font-mono uppercase">
        <span>STAGE {current} / {total}</span>
        <span className="text-[#FFC000]">{percentage}% TELEMETRY COMPLETED</span>
      </div>
      <div className="w-full h-1 bg-[#202020] rounded-none overflow-hidden">
        <div
          className="h-full bg-[#FFC000] rounded-none transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
