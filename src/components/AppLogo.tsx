import React, { useState } from 'react';
import officialLogo from '../assets/images/cave_logo_luxury_1787757973907.jpg';

interface AppLogoProps {
  className?: string;
  imgClassName?: string;
  alt?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = "w-10 h-10 rounded-xl overflow-hidden shadow-inner border border-amber-500/40 shrink-0 bg-slate-950 flex items-center justify-center",
  imgClassName = "w-full h-full object-cover",
  alt = "Cave Companions Logo"
}) => {
  const [imgSrc, setImgSrc] = useState<string>(officialLogo || '/app_icon.jpg');
  const [hasFailedAll, setHasFailedAll] = useState(false);

  const handleError = () => {
    if (imgSrc !== '/app_icon.jpg') {
      // Try fallback to public URL
      setImgSrc('/app_icon.jpg');
    } else {
      setHasFailedAll(true);
    }
  };

  if (hasFailedAll) {
    // Official Cave Companions Logo vector representation (minimalist cave entrance with warm glowing fire)
    return (
      <div className={`${className} bg-slate-950 flex items-center justify-center relative overflow-hidden`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="fireGlow" cx="50%" cy="65%" r="45%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="caveStone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          {/* Cave Outline / Arch */}
          <path
            d="M 15 90 L 15 50 C 15 25 30 12 50 12 C 70 12 85 25 85 50 L 85 90 Z"
            fill="url(#caveStone)"
            stroke="#f59e0b"
            strokeWidth="3"
          />
          {/* Cave Entrance Inner */}
          <path
            d="M 28 90 L 28 55 C 28 38 38 28 50 28 C 62 28 72 38 72 55 L 72 90 Z"
            fill="#020617"
          />
          {/* Fire Glow inside Cave */}
          <circle cx="50" cy="70" r="24" fill="url(#fireGlow)" />
          {/* Flame Icon */}
          <path
            d="M 50 54 C 53 60 58 64 58 72 C 58 77 54 81 50 81 C 46 81 42 77 42 72 C 42 66 47 62 50 54 Z"
            fill="#fef08a"
          />
          <path
            d="M 50 63 C 51.5 66 54 68 54 73 C 54 75.5 52 77.5 50 77.5 C 48 77.5 46 75.5 46 73 C 46 70 48.5 68 50 63 Z"
            fill="#f97316"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={imgSrc}
        alt={alt}
        className={imgClassName}
        referrerPolicy="no-referrer"
        onError={handleError}
      />
    </div>
  );
};
