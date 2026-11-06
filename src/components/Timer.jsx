import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export default function Timer({ duration = 15, onTimeout, isPaused = false, questionId }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(duration);
  }, [questionId, duration]);

  // Interval timer tick
  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeout) onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isPaused, onTimeout]);

  let textClass = 'text-white border-[#262626] bg-[#141414]';
  let iconClass = 'text-[#7D7D7D]';

  if (timeLeft <= 4) {
    textClass = 'text-[#FF2D55] border-[#FF2D55]/60 bg-[#1E1214] animate-pulse';
    iconClass = 'text-[#FF2D55]';
  } else if (timeLeft <= 8) {
    textClass = 'text-[#FFC000] border-[#FFC000]/50 bg-[#1C1810]';
    iconClass = 'text-[#FFC000]';
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none border text-xs font-mono font-bold transition-colors ${textClass}`}>
      <Clock className={`w-3.5 h-3.5 ${iconClass}`} />
      <span>{timeLeft}s</span>
    </div>
  );
}
