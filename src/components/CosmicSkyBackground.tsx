import React, { useMemo } from 'react';

interface CosmicSkyBackgroundProps {
  isLight: boolean;
}

interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  opacity: number;
  delay: string;
  duration: string;
  isSpecial?: boolean;
}

export const CosmicSkyBackground: React.FC<CosmicSkyBackgroundProps> = ({ isLight }) => {
  // Deterministic star field so it doesn't flicker or re-render unexpectedly
  const stars: Star[] = useMemo(() => {
    // Generate 65 delicate celestial stars distributed across the viewport
    const starList: Star[] = [];
    const seedValues = [
      { t: 4, l: 8, s: 1.5, d: '0.2s', dur: '3.1s' },
      { t: 7, l: 88, s: 2, d: '1.2s', dur: '4.2s', sp: true },
      { t: 12, l: 24, s: 1, d: '0.7s', dur: '2.8s' },
      { t: 15, l: 76, s: 1.5, d: '2.1s', dur: '3.6s' },
      { t: 18, l: 45, s: 1, d: '1.5s', dur: '3.9s' },
      { t: 22, l: 94, s: 2.2, d: '0.5s', dur: '4.5s', sp: true },
      { t: 25, l: 6, s: 2, d: '1.8s', dur: '3.3s', sp: true },
      { t: 28, l: 32, s: 1, d: '2.4s', dur: '4.0s' },
      { t: 33, l: 82, s: 1.5, d: '0.9s', dur: '3.2s' },
      { t: 37, l: 15, s: 1.5, d: '1.7s', dur: '4.1s' },
      { t: 41, l: 68, s: 1, d: '2.9s', dur: '3.5s' },
      { t: 45, l: 91, s: 2, d: '0.3s', dur: '4.8s', sp: true },
      { t: 48, l: 5, s: 1.5, d: '1.1s', dur: '3.4s' },
      { t: 52, l: 28, s: 1, d: '2.0s', dur: '2.9s' },
      { t: 56, l: 85, s: 2.5, d: '0.8s', dur: '4.3s', sp: true },
      { t: 61, l: 12, s: 1.5, d: '1.4s', dur: '3.7s' },
      { t: 65, l: 72, s: 1, d: '2.3s', dur: '3.0s' },
      { t: 69, l: 96, s: 1.5, d: '0.6s', dur: '4.4s' },
      { t: 73, l: 19, s: 2, d: '1.9s', dur: '3.8s', sp: true },
      { t: 77, l: 62, s: 1, d: '0.4s', dur: '3.1s' },
      { t: 81, l: 89, s: 1.5, d: '2.5s', dur: '4.6s' },
      { t: 85, l: 8, s: 2, d: '1.3s', dur: '3.5s', sp: true },
      { t: 89, l: 40, s: 1, d: '0.9s', dur: '2.7s' },
      { t: 93, l: 80, s: 1.5, d: '2.1s', dur: '4.0s' },
      { t: 96, l: 22, s: 1.2, d: '1.6s', dur: '3.3s' },
      { t: 9, l: 55, s: 1, d: '2.8s', dur: '4.2s' },
      { t: 16, l: 12, s: 1.5, d: '0.1s', dur: '3.0s' },
      { t: 31, l: 96, s: 1, d: '1.9s', dur: '3.7s' },
      { t: 44, l: 38, s: 1.5, d: '0.8s', dur: '4.1s' },
      { t: 59, l: 48, s: 1, d: '2.2s', dur: '3.2s' },
      { t: 71, l: 4, s: 1.5, d: '1.0s', dur: '3.6s' },
      { t: 84, l: 95, s: 1, d: '2.7s', dur: '4.3s' },
      { t: 91, l: 60, s: 1.5, d: '0.5s', dur: '3.8s' },
    ];

    seedValues.forEach((seed, index) => {
      starList.push({
        id: index,
        top: `${seed.t}%`,
        left: `${seed.l}%`,
        size: seed.s,
        opacity: seed.sp ? 0.85 : 0.6,
        delay: seed.d,
        duration: seed.dur,
        isSpecial: seed.sp,
      });
    });

    return starList;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Base Cosmic Gradient Atmosphere */}
      {isLight ? (
        // Day Sky Cosmic Atmosphere: Soft celestial azure, daylight solar aura & dawn lilac wisps
        <div className="absolute inset-0 bg-gradient-to-b from-[#edf4ff] via-[#f7f3ff] to-[#fff4f7] transition-colors duration-500">
          {/* Daylight Sunburst Glow (top-right) */}
          <div
            className="absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full blur-3xl opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(253, 224, 71, 0.15) 45%, transparent 70%)',
            }}
          />
          {/* Celestial Daylight Sky Mist (mid-left) */}
          <div
            className="absolute top-1/4 -left-28 w-[520px] h-[520px] rounded-full blur-3xl opacity-35"
            style={{
              background: 'radial-gradient(circle, rgba(186, 230, 253, 0.4) 0%, rgba(199, 210, 254, 0.2) 50%, transparent 70%)',
            }}
          />
          {/* Dawn Pink / Nebula Glow (lower-right) */}
          <div
            className="absolute -bottom-16 -right-16 w-[450px] h-[450px] rounded-full blur-3xl opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(244, 114, 182, 0.3) 0%, rgba(251, 207, 232, 0.15) 50%, transparent 70%)',
            }}
          />
          {/* Subtle Celestial Lavender Aura (center) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(216, 180, 254, 0.25) 0%, transparent 65%)',
            }}
          />
        </div>
      ) : (
        // Cosmic Night Sky Atmosphere: Deep obsidian midnight space with glowing nebula clouds
        <div className="absolute inset-0 bg-[#06060f] transition-colors duration-500">
          {/* Deep Violet Nebula (top-center) */}
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[500px] rounded-full blur-3xl opacity-35"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.35) 0%, rgba(79, 70, 229, 0.18) 45%, transparent 75%)',
            }}
          />
          {/* Cosmic Magenta Nebula (mid-left) */}
          <div
            className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(168, 85, 247, 0.15) 50%, transparent 75%)',
            }}
          />
          {/* Deep Stellar Indigo & Cyan Nebula (bottom-right) */}
          <div
            className="absolute -bottom-24 -right-24 w-[550px] h-[550px] rounded-full blur-3xl opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(30, 58, 138, 0.25) 50%, transparent 75%)',
            }}
          />
          {/* Subtle Central Stardust Void Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-15"
            style={{
              background: 'radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, transparent 65%)',
            }}
          />
        </div>
      )}

      {/* 2. Micro Starfield & Celestial Twinkle Points */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: isLight
                ? star.isSpecial
                  ? 'rgba(129, 140, 248, 0.75)'
                  : 'rgba(99, 102, 241, 0.45)'
                : star.isSpecial
                ? '#ffffff'
                : 'rgba(224, 231, 255, 0.75)',
              boxShadow: isLight
                ? star.isSpecial
                  ? '0 0 6px rgba(129, 140, 248, 0.6)'
                  : 'none'
                : star.isSpecial
                ? '0 0 7px rgba(244, 114, 182, 0.8), 0 0 3px #ffffff'
                : '0 0 3px rgba(255, 255, 255, 0.5)',
              animation: `cosmicTwinkle ${star.duration} ease-in-out infinite`,
              animationDelay: star.delay,
              opacity: star.opacity,
            }}
          />
        ))}

        {/* 3. Distinctive 4-Point Cosmic Astro Stars in empty corners/margins */}
        {/* Top-Right Astro Star */}
        <div
          className={`absolute top-6 right-5 ${
            isLight ? 'text-indigo-400/50' : 'text-pink-300/60'
          } select-none animate-cosmic-shimmer`}
          style={{ animationDuration: '4.5s' }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        {/* Mid-Left Astro Star */}
        <div
          className={`absolute top-[42%] left-4 ${
            isLight ? 'text-pink-400/40' : 'text-cyan-300/50'
          } select-none animate-cosmic-shimmer`}
          style={{ animationDuration: '5.2s', animationDelay: '1.2s' }}
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        {/* Bottom-Right Astro Star */}
        <div
          className={`absolute bottom-24 right-6 ${
            isLight ? 'text-amber-400/45' : 'text-purple-300/55'
          } select-none animate-cosmic-shimmer`}
          style={{ animationDuration: '3.8s', animationDelay: '2.1s' }}
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        {/* Top-Left Astro Micro Star */}
        <div
          className={`absolute top-14 left-6 ${
            isLight ? 'text-sky-400/40' : 'text-indigo-200/50'
          } select-none animate-cosmic-shimmer`}
          style={{ animationDuration: '4.8s', animationDelay: '0.7s' }}
        >
          <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
