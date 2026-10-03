import React from 'react';

interface EduFlowLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  lightText?: boolean;
}

export const EduFlowLogo: React.FC<EduFlowLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  lightText = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Modern Geometric Vector SVG Emblem */}
      <div className={`relative shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          <defs>
            <linearGradient id="ef_grad_bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
            <linearGradient id="ef_grad_ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="ef_grad_accent" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d1fae5" />
            </linearGradient>
          </defs>

          {/* Rounded base container with subtle curvature */}
          <rect width="48" height="48" rx="14" fill="url(#ef_grad_bg)" />

          {/* Fluid Ribbon / Open Book / Dynamic Wave */}
          <path
            d="M12 18C12 16.8954 12.8954 16 14 16H21C22.6569 16 24 17.3431 24 19V32C24 30.8954 23.1046 30 22 30H14C12.8954 30 12 29.1046 12 28V18Z"
            fill="url(#ef_grad_ribbon)"
            fillOpacity="0.95"
          />
          <path
            d="M36 18C36 16.8954 35.1046 16 34 16H27C25.3431 16 24 17.3431 24 19V32C24 30.8954 24.8954 30 26 30H34C35.1046 30 36 29.1046 36 28V18Z"
            fill="url(#ef_grad_accent)"
          />

          {/* Floating dynamic spark / learning compass point */}
          <circle cx="24" cy="13.5" r="2.5" fill="#ffffff" />
          <path
            d="M24 19L27 24H21L24 19Z"
            fill="#065f46"
            fillOpacity="0.3"
          />
          <path
            d="M16 22H20M16 25H19"
            stroke="#047857"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M28 22H32M29 25H32"
            stroke="#047857"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Modern Wordmark */}
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className={`font-extrabold tracking-tight ${textSizes[size]}`}>
            <span className={lightText ? 'text-white' : 'text-slate-900'}>Edu</span>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Flow
            </span>
          </div>
          <span
            className={`font-semibold tracking-wider uppercase mt-0.5 ${subtitleSizes[size]} ${
              lightText ? 'text-emerald-200/80' : 'text-slate-400'
            }`}
          >
            Workspace Guru
          </span>
        </div>
      )}
    </div>
  );
};
