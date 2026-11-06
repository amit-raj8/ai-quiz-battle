import React from 'react';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  type = 'button'
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none rounded-none text-center cursor-pointer';

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs gap-2',
    md: 'px-6 py-3 text-xs sm:text-sm gap-2.5',
    lg: 'px-8 py-3.5 sm:py-4 text-sm sm:text-base gap-3',
    xl: 'px-10 py-4 sm:py-5 text-base sm:text-lg gap-3.5'
  };

  const variantStyles = {
    // Primary Lamborghini Gold CTA
    primary: 'bg-[#FFC000] text-black hover:bg-[#917300] hover:text-black border-0 active:bg-[#785F00]',
    accent: 'bg-[#FFC000] text-black hover:bg-[#917300] hover:text-black border-0 active:bg-[#785F00]',
    
    // Ghost Button (1px White Border 50% opacity)
    secondary: 'bg-transparent text-white border border-white/50 hover:bg-white hover:text-black hover:border-white active:bg-neutral-200',
    ghost: 'bg-transparent text-white border border-white/40 hover:bg-white/10 hover:border-white active:bg-white/20',
    
    // Outline variant with gold hover
    outline: 'bg-transparent text-white/90 border border-[#333333] hover:border-[#FFC000] hover:text-[#FFC000] active:bg-[#FFC000]/10',
    
    // Dark Charcoal surface button
    dark: 'bg-[#202020] text-white border border-[#333333] hover:border-white hover:bg-[#2A2A2A]',
    
    // Success / Speed Telemetry
    success: 'bg-[#00D26A] text-black hover:bg-[#00A855] border-0',
    
    // Danger / Eject
    danger: 'bg-[#FF2D55] text-white hover:bg-[#D61A3F] border-0'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
