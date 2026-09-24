import React from 'react';
import { 
  ArrowRight, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Calendar,
  Box, 
  MessageSquarePlus, 
  ShieldCheck,
  Coffee,
  Code2,
  Binary,
  BrainCircuit,
  Zap
} from 'lucide-react';
import InteractiveDoodleBackground from '../components/InteractiveDoodleBackground';

export default function LandingPage({ onGetStarted, onAdminLogin }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black relative overflow-hidden">
      {/* Interactive Floating Math & CS Doodles Background */}
      <InteractiveDoodleBackground />

      {/* Top Navbar */}
      <nav className="bg-black/80 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 sm:h-12 px-2.5 py-1 rounded-2xl bg-black border border-white/20 flex items-center justify-center shadow-2xl">
              <img 
                src="/srm_full_logo.png" 
                alt="SRM University AP" 
                className="h-full w-auto object-contain brightness-110 contrast-125"
                onError={(e) => {
                  e.target.src = '/srm_logo.png';
                }}
              />
            </div>

            <div className="h-7 w-[1px] bg-white/20 hidden sm:block"></div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl text-white tracking-tight">
                  CYBEX <span className="text-zinc-400">D</span>
                </span>
                <span className="liquid-glass text-zinc-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-white/15">
                  CSE Sec-D
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">SRM University AP</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onAdminLogin}
              className="liquid-glass-pill text-xs font-bold text-zinc-300 hover:text-white px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              CR Admin
            </button>
            <button
              onClick={onGetStarted}
              className="text-xs sm:text-sm font-black bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Student Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="w-full max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24 flex-1 flex flex-col justify-center relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="liquid-glass-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-zinc-300 text-xs font-black tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-white animate-spin" style={{ animationDuration: '8s' }} />
            <span>Official Section D • Cyber Security Hub</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-[1.05]">
            Welcome to <br />
            <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
              CYBEX D
            </span>
          </h1>

          {/* Funny, Creative, Relatable Section-D Subtitle */}
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal max-w-2xl mx-auto">
            Where <span className="text-white font-bold underline decoration-indigo-400/50 underline-offset-4">58 sleep-deprived cyber students</span> compile C pointers, solve calculus matrices at 2 AM, and calculate the exact second <span className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/10">S 312</span> lectures dismiss. ☕💻
          </p>

          {/* Interactive Humor/Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="liquid-glass px-3 py-1 rounded-full text-zinc-400 flex items-center gap-1.5 hover:text-white hover:border-white/30 transition cursor-default">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>0% Sleep</span>
            </span>
            <span className="liquid-glass px-3 py-1 rounded-full text-zinc-400 flex items-center gap-1.5 hover:text-white hover:border-white/30 transition cursor-default">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% StackOverflow</span>
            </span>
            <span className="liquid-glass px-3 py-1 rounded-full text-zinc-400 flex items-center gap-1.5 hover:text-white hover:border-white/30 transition cursor-default">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Timetable</span>
            </span>
            <span className="liquid-glass px-3 py-1 rounded-full text-zinc-400 flex items-center gap-1.5 hover:text-white hover:border-white/30 transition cursor-default">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>CR Grievance Box</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-sm shadow-[0_0_25px_rgba(255,255,255,0.35)] hover:scale-105 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Access Student Portal</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onAdminLogin}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl liquid-glass-pill hover:bg-white/10 text-zinc-300 hover:text-white font-bold text-sm transition cursor-pointer"
            >
              CR Admin Login
            </button>
          </div>

          {/* Institutional Domain Notice */}
          <div className="inline-flex items-center gap-2 text-xs text-zinc-400 liquid-glass px-4 py-2 rounded-full border border-white/10">
            <Lock className="w-3.5 h-3.5 text-white" />
            <span>Protected with OTP verification for <code className="font-bold text-white">@srmap.edu.in</code> accounts</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/60 backdrop-blur-md py-4 text-center text-xs text-zinc-500 relative z-10">
        <p className="font-bold text-zinc-400">CYBEX D • SRM University AP</p>
        <p className="text-[11px] text-zinc-600 mt-0.5">Computer Science & Engineering • Section D</p>
      </footer>
    </div>
  );
}
