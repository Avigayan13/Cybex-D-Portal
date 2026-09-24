import React, { useState, useEffect } from 'react';

export default function InteractiveDoodleBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating study & CS doodles with fixed positions and gentle animations
  const doodles = [
    { text: '∫ e^(-x²) dx = √π / 2', top: '12%', left: '8%', rotate: '-6deg', size: 'text-xs sm:text-sm', color: 'text-zinc-500/60' },
    { text: 'printf("Hello Sec-D!\\n");', top: '18%', right: '10%', rotate: '8deg', size: 'text-xs sm:text-sm', color: 'text-emerald-400/50', mono: true },
    { text: 'while(alive) { coffee(); code(); }', top: '28%', left: '4%', rotate: '-12deg', size: 'text-xs sm:text-sm', color: 'text-amber-400/50', mono: true },
    { text: 'lim(sleep → 0) [Bugs = ∞]', top: '35%', right: '6%', rotate: '-4deg', size: 'text-xs sm:text-sm', color: 'text-rose-400/50', mono: true },
    { text: '∇ × E = -∂B/∂t', top: '48%', left: '7%', rotate: '6deg', size: 'text-xs sm:text-sm', color: 'text-cyan-400/50' },
    { text: 'e^(iπ) + 1 = 0', top: '56%', right: '9%', rotate: '12deg', size: 'text-xs sm:text-sm', color: 'text-indigo-400/50' },
    { text: 'sudo rm -rf /stress', top: '65%', left: '5%', rotate: '-8deg', size: 'text-xs sm:text-sm', color: 'text-zinc-400/50', mono: true },
    { text: '∑(58 Students) = 100% Chaos', top: '74%', right: '7%', rotate: '-6deg', size: 'text-xs sm:text-sm', color: 'text-white/40' },
    { text: '/* It worked on localhost */', top: '82%', left: '10%', rotate: '5deg', size: 'text-xs sm:text-sm', color: 'text-amber-300/40', mono: true },
    { text: 'λ = h / p  •  Δx·Δp ≥ ℏ/2', top: '88%', right: '12%', rotate: '-3deg', size: 'text-xs sm:text-sm', color: 'text-sky-300/40' },
  ];

  // Mathematical & Computing Symbols scattered around
  const floatingSymbols = [
    { symbol: '∫', top: '8%', left: '25%', size: 'text-4xl', delay: '0s' },
    { symbol: '</>', top: '15%', left: '45%', size: 'text-2xl', delay: '1s', mono: true },
    { symbol: 'π', top: '22%', right: '28%', size: 'text-3xl', delay: '2s' },
    { symbol: '∑', top: '40%', left: '18%', size: 'text-3xl', delay: '1.5s' },
    { symbol: '01000101', top: '45%', right: '22%', size: 'text-xs', delay: '0.5s', mono: true },
    { symbol: '√-1 = i', top: '60%', left: '22%', size: 'text-xl', delay: '2.5s' },
    { symbol: '{ ... }', top: '68%', right: '25%', size: 'text-2xl', delay: '3s', mono: true },
    { symbol: '∂y/∂x', top: '78%', left: '30%', size: 'text-lg', delay: '1.2s' },
    { symbol: '⚡', top: '85%', right: '35%', size: 'text-xl', delay: '2s' },
    { symbol: '☕', top: '92%', left: '50%', size: 'text-2xl', delay: '0.8s' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Background Cyber Grid Matrix Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" 
      />

      {/* Ambient Gradient Blobs with Parallax Effect */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }}
      />
      <div 
        className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      />

      {/* Floating Code & Math Doodle Snippets */}
      {doodles.map((d, idx) => (
        <div
          key={idx}
          className={`absolute ${d.mono ? 'font-mono' : 'font-serif'} ${d.size} ${d.color} opacity-40 hover:opacity-100 transition-all duration-300 pointer-events-auto cursor-default backdrop-blur-[1px] px-2 py-1 rounded-lg border border-transparent hover:border-white/20 hover:bg-white/[0.04] hidden md:block`}
          style={{
            top: d.top,
            left: d.left,
            right: d.right,
            transform: `rotate(${d.rotate}) translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
            transition: 'transform 0.5s ease-out, opacity 0.3s ease'
          }}
        >
          {d.text}
        </div>
      ))}

      {/* Scattered Floating Mathematical Symbols */}
      {floatingSymbols.map((s, idx) => (
        <div
          key={idx}
          className={`absolute text-white/20 ${s.size} ${s.mono ? 'font-mono' : 'font-serif font-bold'} animate-pulse hidden lg:block`}
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            animationDelay: s.delay,
            transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)`,
            transition: 'transform 0.6s ease-out'
          }}
        >
          {s.symbol}
        </div>
      ))}
    </div>
  );
}
