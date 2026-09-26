import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DisabledNoticeModal from './DisabledNoticeModal';
import { 
  Home, 
  MessageSquarePlus, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  SlidersHorizontal,
  Calendar,
  Box,
  BookOpen,
  HelpCircle,
  Lock,
  Maximize2,
  Minimize2
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, switchRole, portalConfig, isAdmin } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [disabledModalInfo, setDisabledModalInfo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((e) => console.log(e));
      }
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'timetable', label: 'Timetable', icon: Calendar, isHighlight: true },
    { id: 'feedback', label: 'Feedback & Grievances', icon: MessageSquarePlus },
    { id: 'materials', label: 'Study Materials & Vault', icon: BookOpen },
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
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="w-full max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* SRM AP Full Logo & CYBEX D Branding */}
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-3 sm:gap-4 cursor-pointer select-none group"
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

            {/* Desktop Navigation Links with Liquid Glass Design */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                if (item.isDisabled) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className="liquid-glass-pill flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-zinc-500 hover:text-zinc-300 transition group opacity-70 hover:opacity-100"
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
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                      item.isSpecial
                        ? isActive
                          ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105'
                          : 'liquid-glass-pill text-zinc-300 hover:text-white border-white/20 hover:border-white/40'
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

            {/* Actions: Fullscreen Button & User Profile */}
            <div className="flex items-center gap-2.5">
              {/* Fullscreen Toggle Button */}
              <button
                onClick={toggleFullscreen}
                className="liquid-glass-pill p-2.5 rounded-2xl text-zinc-400 hover:text-white hover:border-white/30 transition flex items-center gap-1.5"
                title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span className="text-[11px] font-bold hidden md:inline">{isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    className="liquid-glass-interactive flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center text-xs font-black shadow-md">
                      {isAdmin ? 'CR' : user.name ? user.name.charAt(0) : 'S'}
                    </div>
                    
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                        {user.name || user.email.split('@')[0]}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                        {isAdmin ? (
                          <span className="text-white">Class Rep (Admin)</span>
                        ) : (
                          <span className="text-zinc-400">Student</span>
                        )}
                      </p>
                    </div>

                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {/* Role Switcher & Account Dropdown with Liquid Glass */}
                  {showRoleMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowRoleMenu(false)} 
                      />
                      <div className="absolute right-0 mt-2 w-64 liquid-glass bg-black/90 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] border border-white/15 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-zinc-100">
                        <div className="px-3 py-2 border-b border-white/10 mb-2">
                          <p className="text-xs font-bold text-white">{user.name}</p>
                          <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                          <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-lg liquid-glass text-white uppercase border border-white/15">
                            Role: {user.role}
                          </span>
                        </div>

                        {/* Quick Role Switcher */}
                        <div className="px-3 py-1.5">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <SlidersHorizontal className="w-3 h-3" /> Quick Switch Role
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => {
                                switchRole('student');
                                setShowRoleMenu(false);
                              }}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition text-center ${
                                !isAdmin ? 'bg-white text-black shadow-md' : 'liquid-glass-pill hover:bg-white/10 text-zinc-300'
                              }`}
                            >
                              Student
                            </button>
                            <button
                              onClick={() => {
                                switchRole('admin');
                                setShowRoleMenu(false);
                              }}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition text-center ${
                                isAdmin ? 'bg-white text-black shadow-md' : 'liquid-glass-pill hover:bg-white/10 text-zinc-300'
                              }`}
                            >
                              CR Admin
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-white/10 mt-2 pt-2 space-y-1">
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setActiveTab('admin');
                                setShowRoleMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10 rounded-xl transition"
                            >
                              <ShieldCheck className="w-4 h-4 text-white" />
                              <span>Open CR Control Panel</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              logout();
                              setShowRoleMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>

          </div>
        </div>
      </header>

      {/* Disabled Modal Explaining Temporarily Locked Features */}
      <DisabledNoticeModal
        isOpen={!!disabledModalInfo}
        onClose={() => setDisabledModalInfo(null)}
        moduleName={disabledModalInfo || 'Study Materials'}
      />
    </>
  );
}
