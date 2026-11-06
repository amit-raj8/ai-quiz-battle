import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'gold', className = '' }) {
  return (
    <div className={`p-5 sm:p-6 rounded-none bg-[#141414] border border-[#242424] flex items-center justify-between text-left ${className}`}>
      <div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#7D7D7D] font-mono block mb-1.5 uppercase">
          {title}
        </span>
        <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-display">
          {value}
        </div>
        {subtitle && (
          <span className="text-[11px] text-[#969696] font-mono block mt-1.5 uppercase">
            {subtitle}
          </span>
        )}
      </div>

      {Icon && (
        <div className="w-11 h-11 bg-[#202020] border border-[#333333] flex items-center justify-center shrink-0 text-[#FFC000]">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
