import React, { useState, useEffect } from 'react';

/**
 * High-performance, fault-tolerant Avatar component.
 * Uses the authenticated Firebase user's profile photo (photoURL) when available,
 * and seamlessly displays a sleek Lamborghini-styled default avatar when photoURL is null,
 * unavailable, or fails to load. Prevents broken-image icons and alt text flash.
 */
export default function Avatar({
  src,
  name = 'PILOT',
  size = 'md',
  className = '',
  borderClassName = 'border border-[#FFC000]',
  fallbackBg = 'bg-[#FFC000]',
  fallbackTextColor = 'text-black'
}) {
  const [imageError, setImageError] = useState(false);

  // Reset error state when src prop updates
  useEffect(() => {
    setImageError(false);
  }, [src]);

  // Dimension presets matching Lamborghini sharp geometry
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-24 h-24 text-3xl'
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const initial = (name || 'P').trim().charAt(0).toUpperCase() || 'P';
  const hasValidSrc = Boolean(src && typeof src === 'string' && src.trim().length > 0);

  if (hasValidSrc && !imageError) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setImageError(true)}
        className={`${selectedSize} ${borderClassName} object-cover rounded-none shrink-0 select-none ${className}`}
      />
    );
  }

  return (
    <div
      className={`${selectedSize} ${fallbackBg} ${fallbackTextColor} ${borderClassName} flex items-center justify-center font-black font-display rounded-none shrink-0 select-none ${className}`}
      aria-label={name}
    >
      {initial}
    </div>
  );
}
