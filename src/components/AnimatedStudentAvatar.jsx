import React, { useState, useEffect } from 'react';

export default function AnimatedStudentAvatar({ size = "lg", isCR = false }) {
  const [isWinking, setIsWinking] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Natural idle eye blinking every 3.8 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3800);

    return () => clearInterval(blinkInterval);
  }, []);

  const dimensionClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16 sm:w-20 sm:h-20",
    lg: "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28",
    xl: "w-28 h-28 sm:w-32 sm:h-32"
  };

  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer group select-none shrink-0"
      onMouseEnter={() => setIsWinking(true)}
      onMouseLeave={() => setIsWinking(false)}
      title={isCR ? "Class Representative Avatar (Hover to interact)" : "Verified Student Avatar (Hover to interact)"}
    >
      {/* 1. Outer Multi-Tone Ambient Glow Aura */}
      <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-cyan-500/30 via-white/20 to-indigo-500/30 blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse" />

      {/* 2. Rotating Cyber Orbital Ring */}
      <div className="absolute -inset-1.5 rounded-full border border-dashed border-white/25 group-hover:border-white/60 animate-[spin_12s_linear_infinite] pointer-events-none">
        {/* Orbiting Neon Star Satellite */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
      </div>

      {/* 3. Floating Particle Sparkles (Left & Right) */}
      <div className="absolute -top-2 -left-1 text-xs opacity-60 group-hover:opacity-100 transition-opacity animate-bounce duration-1000 pointer-events-none">
        ✨
      </div>
      <div className="absolute -bottom-1 -left-2 text-[10px] opacity-40 group-hover:opacity-90 transition-opacity animate-pulse pointer-events-none">
        ⚡
      </div>
      <div className="absolute -top-1 -right-2 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        🎓
      </div>

      {/* 4. Main Glass Circle Container with Float Motion */}
      <div className={`${dimensionClasses[size] || dimensionClasses.lg} rounded-full bg-gradient-to-b from-zinc-800/90 via-black/90 to-zinc-950 border-2 border-white/30 group-hover:border-white/80 p-1.5 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] relative overflow-hidden transition-all duration-500 group-hover:scale-105 group-active:scale-95 animate-[bounce_5s_ease-in-out_infinite]`}>
        
        {/* Animated Dynamic Glass Sheen Reflection */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

        {/* High-Quality Animated Student Vector Graphic */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transform transition-transform duration-300 group-hover:-translate-y-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hair Base Background */}
          <path
            d="M18 48 C18 18, 82 18, 82 48 C82 62, 76 75, 76 75 L24 75 C24 75, 18 62, 18 48 Z"
            fill="#18181b"
          />

          {/* Student Hoodie / Collar */}
          <path
            d="M12 96 C12 76, 32 70, 50 70 C68 70, 88 76, 88 96 L12 96 Z"
            fill="#27272a"
          />
          {/* Hoodie Drawstrings / Zippers */}
          <path
            d="M44 76 L44 88"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M56 76 L56 88"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Collar Line */}
          <path
            d="M36 71 L50 82 L64 71"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />

          {/* Student Face Tone */}
          <ellipse cx="50" cy="51" rx="27" ry="25" fill="#fcd34d" />

          {/* Ears */}
          <circle cx="22" cy="51" r="5.5" fill="#f59e0b" />
          <circle cx="78" cy="51" r="5.5" fill="#f59e0b" />

          {/* Modern Student Hair Styling (Bangs & Highlights) */}
          <path
            d="M22 44 C26 22, 74 22, 78 44 C66 36, 56 40, 50 34 C44 40, 34 36, 22 44 Z"
            fill="#09090b"
          />
          <path
            d="M32 32 Q42 22 55 26"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Headwear: CR Graduation Cap OR Cyber Headset */}
          {isCR ? (
            <g className="transform -translate-y-1">
              <path d="M50 14 L80 25 L50 36 L20 25 Z" fill="#ffffff" />
              <polygon points="50,15 78,25 50,35 22,25" fill="#18181b" />
              <circle cx="50" cy="25" r="3" fill="#ffffff" />
              {/* Golden Tassel */}
              <path d="M50 25 Q72 30 70 42" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
              <circle cx="70" cy="43" r="2.5" fill="#f59e0b" />
            </g>
          ) : (
            /* Cyber Gamer / Student Headset */
            <g opacity="0.95">
              {/* Headband */}
              <path
                d="M20 50 C20 20, 80 20, 80 50"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Ear Cups */}
              <rect x="15" y="44" width="7" height="15" rx="3.5" fill="#ffffff" />
              <rect x="78" y="44" width="7" height="15" rx="3.5" fill="#ffffff" />
            </g>
          )}

          {/* Expressive Eyebrows */}
          <path
            d="M34 41 Q40 37 46 40"
            stroke="#18181b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M54 40 Q60 37 66 41"
            stroke="#18181b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Smart Glass Frames */}
          <rect
            x="30"
            y="43"
            width="18"
            height="14"
            rx="4.5"
            fill="rgba(255,255,255,0.2)"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <rect
            x="52"
            y="43"
            width="18"
            height="14"
            rx="4.5"
            fill="rgba(255,255,255,0.2)"
            stroke="#ffffff"
            strokeWidth="2"
          />
          {/* Glasses Bridge */}
          <line x1="48" y1="50" x2="52" y2="50" stroke="#ffffff" strokeWidth="2.5" />

          {/* Eyes (With Blinking & Winking animation) */}
          {isBlinking && !isWinking ? (
            /* Closed Blinking Eyes */
            <g>
              <line x1="35" y1="50" x2="43" y2="50" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="57" y1="50" x2="65" y2="50" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ) : isWinking ? (
            /* Left Eye Open, Right Eye Wink */
            <g>
              <circle cx="39" cy="50" r="3.5" fill="#09090b" />
              <circle cx="40" cy="49" r="1.2" fill="#ffffff" />
              {/* Winking right eye curve */}
              <path d="M57 51 Q61 46 65 51" stroke="#09090b" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            /* Open Glowing Eyes */
            <g>
              <circle cx="39" cy="50" r="3.5" fill="#09090b" />
              <circle cx="40" cy="49" r="1.2" fill="#ffffff" />
              <circle cx="61" cy="50" r="3.5" fill="#09090b" />
              <circle cx="62" cy="49" r="1.2" fill="#ffffff" />
            </g>
          )}

          {/* Rosy Cheeks */}
          <circle cx="30" cy="58" r="3.5" fill="#f87171" opacity="0.65" />
          <circle cx="70" cy="58" r="3.5" fill="#f87171" opacity="0.65" />

          {/* Cheerful Smile */}
          <path
            d="M43 61 Q50 68 57 61"
            stroke="#18181b"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Active Online Pulse Indicator Badge */}
      <span className="absolute bottom-0 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-400 border-2 border-black rounded-full shadow-[0_0_12px_rgba(52,211,153,0.9)] flex items-center justify-center z-10">
        <span className="w-2 h-2 bg-white rounded-full animate-ping opacity-75" />
      </span>
    </div>
  );
}
