import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DisabledNoticeModal from './DisabledNoticeModal';
import { 
  Home, 
  MessageSquarePlus, 
  Calendar, 
  ShieldCheck,
  BookOpen,
  Lock
} from 'lucide-react';

export default function MobileNav({ activeTab, setActiveTab }) {
  const { isAdmin } = useAuth();
  const [disabledModalInfo, setDisabledModalInfo] = useState(null);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'feedback', label: 'Feedback', icon: MessageSquarePlus },
    { id: 'materials_disabled', label: 'Materials', icon: BookOpen, isDisabled: true },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'CR Panel', icon: ShieldCheck, isSpecial: true });
  }

  const handleNavClick = (item) => {
    if (item.isDisabled) {
      setDisabledModalInfo('Study Materials & Doubts');
      return;
    }
    setActiveTab(item.id);
  };

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/85 backdrop-blur-2xl border-t border-white/10 px-3 py-2 shadow-2xl">
        <div className="flex items-center justify-around">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isDisabled) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-zinc-600 opacity-60"
                >
                  <div className="p-1 rounded-lg relative">
                    <Icon className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-white/40 rounded-full"></span>
                  </div>
                  <span className="text-[10px] mt-0.5 flex items-center gap-0.5">
                    {item.label} <Lock className="w-2 h-2" />
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition ${
                  item.isSpecial
                    ? isActive
                      ? 'bg-white text-black font-black shadow-md'
                      : 'text-zinc-400 hover:text-white font-medium'
                    : isActive
                    ? 'liquid-glass-pill text-white font-bold'
                    : 'text-zinc-400 hover:text-white font-medium'
                }`}
              >
                <div className="p-1 rounded-lg">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <DisabledNoticeModal
        isOpen={!!disabledModalInfo}
        onClose={() => setDisabledModalInfo(null)}
        moduleName={disabledModalInfo || 'Academic Hub'}
      />
    </>
  );
}
