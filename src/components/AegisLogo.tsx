import React from 'react';

interface AegisLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  theme?: 'dark' | 'light';
}

export const AegisLogo: React.FC<AegisLogoProps> = ({
  className = '',
  size = 28,
  showText = true,
  theme = 'dark',
}) => {
  const fgColor = theme === 'dark' ? '#0A0A0B' : '#FFFFFF';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric AEGIS Shield-Chevron Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200"
      >
        {/* Outer Chevron / Apex Frame */}
        <path
          d="M50 4L14 82L38 68L41 42L50 28L59 42L62 68L86 82L50 4Z"
          fill={fgColor}
        />
        {/* Central Embedded Shield */}
        <path
          d="M50 38L42 46V64L50 86L58 64V46L50 38Z"
          fill={fgColor}
        />
      </svg>

      {showText && (
        <span
          className="font-sans font-semibold uppercase tracking-[0.32em] text-[13px] sm:text-[14px]"
          style={{ color: fgColor, letterSpacing: '0.32em' }}
        >
          ΛEGIS
        </span>
      )}
    </div>
  );
};
