import React from 'react';

interface BrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md'
}) => {
  const isLight = variant === 'light';
  
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  };

  const titleSizes = {
    sm: 'text-sm font-bold tracking-tight',
    md: 'text-base font-extrabold tracking-tight',
    lg: 'text-xl font-extrabold tracking-tight'
  };

  const subtitleSizes = {
    sm: 'text-[9px] tracking-widest font-semibold',
    md: 'text-[10px] tracking-widest font-semibold',
    lg: 'text-xs tracking-widest font-semibold'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Dental & Smile Medical Icon */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-sky-800 text-white shadow-sm ${iconSizes[size]} shrink-0 p-1.5`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Stylized Tooth Contour */}
          <path d="M12 2C7.5 2 4.5 5 4.5 9c0 3 1.5 6 3 9 1 2 2.5 4 4.5 4s3.5-2 4.5-4c1.5-3 3-6 3-9 0-4-3-7-7.5-7z" fill="rgba(255,255,255,0.15)" />
          {/* Subtle Gentle Smile Arc */}
          <path d="M8.5 10.5C9.8 12.2 11.2 12.8 12 12.8c0.8 0 2.2-0.6 3.5-2.3" stroke="white" strokeWidth="2" />
          {/* Medical cross/sparkle spark */}
          <circle cx="12" cy="6" r="1.2" fill="white" stroke="none" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span className={`${titleSizes[size]} font-heading ${isLight ? 'text-white' : 'text-slate-900'} uppercase tracking-tight`}>
          SANJEEVINI
        </span>
        <span className={`${subtitleSizes[size]} ${isLight ? 'text-cyan-300' : 'text-cyan-700'} uppercase mt-0.5`}>
          DENTAL CLINIC
        </span>
      </div>
    </div>
  );
};
