import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DisabledNoticeModal from './DisabledNoticeModal';
import { 
  Home, 
  MessageSquarePlus, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  Calendar,
  BookOpen,
  HelpCircle,
  Lock,
  FileCheck2,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  X
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, isAdmin } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [disabledModalInfo, setDisabledModalInfo] = useState(null);

  const rollNumber = user?.rollNumber || user?.regNo || user?.rollNo || (isAdmin ? 'AP26110090265' : 'AP26110090269');

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'timetable', label: 'Timetable', icon: Calendar, isHighlight: true },
    { id: 'exams', label: 'Exams & Tests', icon: FileCheck2, isSpecialNotice: true },
    { id: 'materials', label: 'Class Vault & Sync', icon: BookOpen },
    { id: 'feedback', label: 'Grievance Desk', icon: MessageSquarePlus },
    { id: 'doubts_disabled', label: 'Doubt Board', icon: HelpCircle, isDisabled: true },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'CR Control Panel', icon: ShieldCheck, isSpecial: true });
  }

  const handleNavClick = (item) => {
    if (item.isDisabled) {
      setDisabledModalInfo(item.label);
      return;
    }
    setActiveTab(item.id);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="w-full max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* SRM AP Full Logo & CYBEX D Branding */}
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-3 sm:gap-4 cursor-pointer select-none group shrink-0"
            >
              <div className="h-10 sm:h-12 px-2.5 py-1 rounded-2xl bg-black border border-white/20 flex items-center justify-center shadow-2xl group-hover:border-white/40 transition-all">
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
                  <span className="font-black text-xl sm:text-2xl tracking-tight text-white flex items-center gap-1">
                    CYBEX <span className="text-zinc-400">D</span>
                  </span>
                  <span className="liquid-glass text-zinc-300 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full border border-white/15">
                    CSE Sec-D
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
                  SRM University AP • Class Representative Hub
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                if (item.isDisabled) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className="liquid-glass-pill flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-zinc-500 hover:text-zinc-300 transition group opacity-70 hover:opacity-100"
                      title="Temporarily locked by CR"
                    >
                      <Icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
                      <span>{item.label}</span>
                      <span className="text-[9px] font-black uppercase bg-white/5 text-zinc-400 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-white/10">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`flex items-center gap-2 px-3.5 xl:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                      item.isSpecial
                        ? isActive
                          ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105'
                          : 'liquid-glass-pill text-zinc-300 hover:text-white border-white/20 hover:border-white/40'
                        : item.isSpecialNotice
                        ? isActive
                          ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.35)] scale-105'
                          : 'liquid-glass-interactive text-amber-300 hover:text-white'
                        : item.isHighlight
                        ? isActive
                          ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.35)] scale-105'
                          : 'liquid-glass-interactive text-zinc-300 hover:text-white'
                        : isActive
                        ? 'liquid-glass-pill bg-white/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border-white/30'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-2xl px-3.5 py-2'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Profile Button */}
            <div className="flex items-center gap-2.5 shrink-0">
              {user ? (
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="liquid-glass-interactive flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-left border border-white/15 hover:border-white/30 transition shadow-lg cursor-pointer"
                  title="My Info & Account Details"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center text-xs font-black shadow-md">
                    {isAdmin ? 'CR' : user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                      {user.name || user.email.split('@')[0]}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                      {isAdmin ? (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Class Rep (Admin)
                        </span>
                      ) : (
                        <span className="text-zinc-400">{rollNumber}</span>
                      )}
                    </p>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>
              ) : null}
            </div>

          </div>
        </div>
      </header>

      {/* Rock-Solid Full Viewport Profile Modal Popup */}
      {showProfileMenu && user && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs" 
            onClick={() => setShowProfileMenu(false)} 
          />

          {/* Profile Card Fixed Directly Below Header (Never Cut Off) */}
          <div className="fixed top-18 sm:top-22 right-3 sm:right-6 lg:right-10 w-[calc(100vw-24px)] sm:w-90 max-w-sm liquid-glass bg-black/95 backdrop-blur-3xl rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.98)] border border-white/20 p-4 sm:p-5 z-50 animate-in fade-in zoom-in-95 duration-150 text-zinc-100 max-h-[85vh] overflow-y-auto">
            
            {/* Header: Avatar, Name, Email, Close button */}
            <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-white to-zinc-300 text-black flex items-center justify-center text-base font-black shadow-xl shrink-0">
                  {isAdmin ? 'CR' : user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-white truncate">{user.name || 'SRM AP Student'}</h3>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" title="Verified SRM AP Student" />
                  </div>
                  <p className="text-xs text-zinc-400 font-mono tracking-wide truncate">{user.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/15">
                    <GraduationCap className="w-3 h-3" />
                    {isAdmin ? 'Class Representative (CR)' : 'Enrolled Student'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowProfileMenu(false)}
                className="p-1.5 rounded-xl liquid-glass-pill text-zinc-400 hover:text-white hover:bg-white/10 transition shrink-0 cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Verified Academic Details */}
            <div className="py-3.5 space-y-2 border-b border-white/10 text-xs">
              <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/[0.04] border border-white/5">
                <span className="text-zinc-400 font-medium">Roll / Reg No:</span>
                <span className="font-mono font-bold text-white tracking-wider">{rollNumber}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/[0.04] border border-white/5">
                <span className="text-zinc-400 font-medium">Class & Section:</span>
                <span className="font-bold text-white">CSE • Section D</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/[0.04] border border-white/5">
                <span className="text-zinc-400 font-medium">Batch / Program:</span>
                <span className="font-bold text-zinc-300">B.Tech 2024–2028</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/[0.04] border border-white/5">
                <span className="text-zinc-400 font-medium">Campus:</span>
                <span className="font-bold text-zinc-300">SRM University-AP</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3.5 space-y-2">
              {isAdmin ? (
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-black text-black bg-white hover:bg-zinc-200 rounded-xl transition shadow-lg cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span>Open CR Control Panel</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab('exams');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white liquid-glass-pill hover:bg-white/15 rounded-xl transition cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4 text-amber-400" />
                  <span>View Exams & Syllabus</span>
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-rose-500/20 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Portal</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Disabled Modal Explaining Temporarily Locked Features */}
      <DisabledNoticeModal
        isOpen={!!disabledModalInfo}
        onClose={() => setDisabledModalInfo(null)}
        moduleName={disabledModalInfo || 'Study Materials'}
      />
    </>
  );
}
