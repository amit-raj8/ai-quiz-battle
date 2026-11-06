import React from 'react';

/**
 * High-definition vector emblem/crest for every Arena Combat Badge tier.
 * Matches website cyberpunk developer aesthetic with custom metallic gradients and neon glows.
 */
export default function BadgeCrest({ 
  tier = 'bronze', 
  size = 'md', 
  roman = '', 
  glow = true,
  className = '' 
}) {
  const normalizedTier = (tier || 'unranked').toLowerCase();

  // Dimensions
  const sizeMap = {
    xs: { px: 28, view: '0 0 64 64' },
    sm: { px: 40, view: '0 0 64 64' },
    md: { px: 64, view: '0 0 64 64' },
    lg: { px: 96, view: '0 0 64 64' },
    xl: { px: 130, view: '0 0 64 64' }
  };

  const { px, view } = sizeMap[size] || sizeMap.md;

  const renderCrestContent = () => {
    switch (normalizedTier) {
      case 'bronze':
        return (
          <g>
            <defs>
              <linearGradient id="bronzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8C4A1E" />
                <stop offset="50%" stopColor="#CD7F32" />
                <stop offset="100%" stopColor="#E29D62" />
              </linearGradient>
              <linearGradient id="bronzeInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2E180A" />
                <stop offset="100%" stopColor="#190C05" />
              </linearGradient>
            </defs>
            {/* Outer Hex Shield */}
            <polygon 
              points="32,4 58,16 58,42 32,60 6,42 6,16" 
              fill="url(#bronzeInner)" 
              stroke="url(#bronzeGradient)" 
              strokeWidth="2.5" 
            />
            {/* Inner Border */}
            <polygon 
              points="32,9 53,19 53,39 32,54 11,39 11,19" 
              fill="none" 
              stroke="#CD7F32" 
              strokeWidth="1" 
              strokeOpacity="0.4"
            />
            {/* Crossed Blades & Shield Emblem */}
            <path d="M20,22 L44,42 M44,22 L20,42" stroke="url(#bronzeGradient)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32,16 L40,24 L32,48 L24,24 Z" fill="url(#bronzeGradient)" opacity="0.9" />
            {/* Rivets */}
            <circle cx="32" cy="7" r="1.5" fill="#E29D62" />
            <circle cx="55" cy="18" r="1.5" fill="#E29D62" />
            <circle cx="55" cy="40" r="1.5" fill="#E29D62" />
            <circle cx="32" cy="57" r="1.5" fill="#E29D62" />
            <circle cx="9" cy="40" r="1.5" fill="#E29D62" />
            <circle cx="9" cy="18" r="1.5" fill="#E29D62" />
          </g>
        );

      case 'silver':
        return (
          <g>
            <defs>
              <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9CA3AF" />
                <stop offset="40%" stopColor="#E5E7EB" />
                <stop offset="70%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#9CA3AF" />
              </linearGradient>
              <linearGradient id="silverInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E2024" />
                <stop offset="100%" stopColor="#111215" />
              </linearGradient>
            </defs>
            {/* Sharp Octagon Aegis */}
            <polygon 
              points="20,4 44,4 60,20 60,44 44,60 20,60 4,44 4,20" 
              fill="url(#silverInner)" 
              stroke="url(#silverGradient)" 
              strokeWidth="2.5" 
            />
            <polygon 
              points="22,8 42,8 56,22 56,42 42,56 22,56 8,42 8,22" 
              fill="none" 
              stroke="#D1D5DB" 
              strokeWidth="1" 
              strokeOpacity="0.4"
            />
            {/* Winged Laurels Chevron */}
            <path d="M14,32 L24,20 L32,28 L40,20 L50,32 L40,44 L32,36 L24,44 Z" fill="url(#silverGradient)" />
            <circle cx="32" cy="32" r="3.5" fill="#111215" stroke="url(#silverGradient)" strokeWidth="1.5" />
          </g>
        );

      case 'gold':
        return (
          <g>
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B45309" />
                <stop offset="35%" stopColor="#FFC000" />
                <stop offset="70%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#FFC000" />
              </linearGradient>
              <linearGradient id="goldInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#241A04" />
                <stop offset="100%" stopColor="#130D02" />
              </linearGradient>
            </defs>
            {/* Imperial Crown Crest */}
            <polygon 
              points="32,2 59,18 51,58 13,58 5,18" 
              fill="url(#goldInner)" 
              stroke="url(#goldGradient)" 
              strokeWidth="2.5" 
            />
            <polygon 
              points="32,7 54,20 48,53 16,53 10,20" 
              fill="none" 
              stroke="#FFC000" 
              strokeWidth="1" 
              strokeOpacity="0.4" 
            />
            {/* Triple Crown Peaks */}
            <path d="M16,46 L16,26 L24,34 L32,20 L40,34 L48,26 L48,46 Z" fill="url(#goldGradient)" />
            <circle cx="16" cy="24" r="2.5" fill="#FEF08A" />
            <circle cx="32" cy="18" r="3" fill="#FEF08A" />
            <circle cx="48" cy="24" r="2.5" fill="#FEF08A" />
            <polygon points="32,32 36,39 32,44 28,39" fill="#130D02" />
          </g>
        );

      case 'diamond':
        return (
          <g>
            <defs>
              <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284C7" />
                <stop offset="40%" stopColor="#00F0FF" />
                <stop offset="75%" stopColor="#E0F2FE" />
                <stop offset="100%" stopColor="#00F0FF" />
              </linearGradient>
              <linearGradient id="diamondInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#041E24" />
                <stop offset="100%" stopColor="#021014" />
              </linearGradient>
            </defs>
            {/* Hexagonal Laser Diamond */}
            <polygon 
              points="32,2 58,16 58,48 32,62 6,48 6,16" 
              fill="url(#diamondInner)" 
              stroke="url(#diamondGradient)" 
              strokeWidth="2.5" 
            />
            {/* Facet lines */}
            <line x1="32" y1="2" x2="32" y2="62" stroke="url(#diamondGradient)" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="6" y1="16" x2="58" y2="48" stroke="url(#diamondGradient)" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="6" y1="48" x2="58" y2="16" stroke="url(#diamondGradient)" strokeWidth="1" strokeOpacity="0.4" />
            {/* Center Prism Gem */}
            <polygon points="32,18 46,32 32,46 18,32" fill="url(#diamondGradient)" />
            <polygon points="32,24 40,32 32,40 24,32" fill="#021014" />
            <circle cx="32" cy="32" r="2" fill="#FFFFFF" />
          </g>
        );

      case 'master':
        return (
          <g>
            <defs>
              <linearGradient id="masterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7E22CE" />
                <stop offset="50%" stopColor="#C084FC" />
                <stop offset="100%" stopColor="#F3E8FF" />
              </linearGradient>
              <linearGradient id="masterInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1C0A2E" />
                <stop offset="100%" stopColor="#0D0417" />
              </linearGradient>
            </defs>
            {/* Aggressive Master Aegis */}
            <polygon 
              points="32,2 62,14 52,54 32,62 12,54 2,14" 
              fill="url(#masterInner)" 
              stroke="url(#masterGradient)" 
              strokeWidth="2.5" 
            />
            <polygon 
              points="32,8 56,18 48,50 32,56 16,50 8,18" 
              fill="none" 
              stroke="#A855F7" 
              strokeWidth="1" 
              strokeOpacity="0.4" 
            />
            {/* Crossed Cyber Blades & Plasma Orb */}
            <path d="M18,18 L46,46 M46,18 L18,46" stroke="url(#masterGradient)" strokeWidth="3" strokeLinecap="square" />
            <circle cx="32" cy="32" r="8" fill="url(#masterInner)" stroke="url(#masterGradient)" strokeWidth="2" />
            <polygon points="32,27 36,32 32,37 28,32" fill="#F3E8FF" />
          </g>
        );

      case 'grandmaster':
        return (
          <g>
            <defs>
              <linearGradient id="gmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BE123C" />
                <stop offset="45%" stopColor="#FF2D55" />
                <stop offset="80%" stopColor="#FFA4B6" />
                <stop offset="100%" stopColor="#FF2D55" />
              </linearGradient>
              <linearGradient id="gmInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#290810" />
                <stop offset="100%" stopColor="#140206" />
              </linearGradient>
            </defs>
            {/* Apex Grandmaster Crown Wings */}
            <polygon 
              points="32,2 62,12 56,46 32,62 8,46 2,12" 
              fill="url(#gmInner)" 
              stroke="url(#gmGradient)" 
              strokeWidth="3" 
            />
            {/* Dragon Crest Flames */}
            <path d="M12,20 L22,30 L32,10 L42,30 L52,20 L46,44 L32,54 L18,44 Z" fill="url(#gmGradient)" />
            <circle cx="32" cy="36" r="6" fill="#140206" stroke="#FFA4B6" strokeWidth="1.5" />
            <circle cx="32" cy="36" r="2.5" fill="#FF2D55" />
            {/* Crown Top Flares */}
            <polygon points="32,2 35,9 29,9" fill="#FFA4B6" />
            <polygon points="12,20 15,15 17,21" fill="#FFA4B6" />
            <polygon points="52,20 47,21 49,15" fill="#FFA4B6" />
          </g>
        );

      default: // Unranked / Locked
        return (
          <g>
            <polygon 
              points="32,4 58,16 58,44 32,60 6,44 6,16" 
              fill="#141414" 
              stroke="#333333" 
              strokeWidth="2" 
              strokeDasharray="4 2"
            />
            <rect x="23" y="28" width="18" height="15" fill="#202020" stroke="#555555" strokeWidth="1.5" />
            <path d="M26,28 L26,22 C26,18.7 28.7,16 32,16 C35.3,16 38,18.7 38,22 L38,28" fill="none" stroke="#666666" strokeWidth="2" />
            <circle cx="32" cy="35" r="2" fill="#777777" />
          </g>
        );
    }
  };

  const getGlowFilter = () => {
    if (!glow) return '';
    switch (normalizedTier) {
      case 'bronze': return 'drop-shadow(0 0 10px rgba(205,127,50,0.45))';
      case 'silver': return 'drop-shadow(0 0 10px rgba(229,231,235,0.45))';
      case 'gold': return 'drop-shadow(0 0 14px rgba(255,192,0,0.55))';
      case 'diamond': return 'drop-shadow(0 0 14px rgba(0,240,255,0.6))';
      case 'master': return 'drop-shadow(0 0 16px rgba(192,132,252,0.65))';
      case 'grandmaster': return 'drop-shadow(0 0 20px rgba(255,45,85,0.75))';
      default: return '';
    }
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: px, height: px }}
    >
      <svg 
        viewBox={view} 
        width={px} 
        height={px} 
        className="w-full h-full transition-transform duration-300 hover:scale-105"
        style={{ filter: getGlowFilter() }}
      >
        {renderCrestContent()}
      </svg>
      {roman && (
        <span className="absolute -bottom-1 px-1.5 py-0.2 bg-black border border-current text-[9px] font-black font-mono">
          {roman}
        </span>
      )}
    </div>
  );
}
