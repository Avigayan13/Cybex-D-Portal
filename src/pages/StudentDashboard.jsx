import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import LiveClassCard from '../components/LiveClassCard';
import NoticeBanner from '../components/NoticeBanner';
import DisabledNoticeModal from '../components/DisabledNoticeModal';
import AnimatedStudentAvatar from '../components/AnimatedStudentAvatar';
import { 
  MessageSquarePlus, 
  ArrowRight, 
  ShieldCheck, 
  Calendar,
  BookOpen, 
  HelpCircle, 
  Lock,
  Sparkles,
  FileCheck2,
  Bell
} from 'lucide-react';

export default function StudentDashboard({ onNavigate }) {
  const { user, portalConfig, isAdmin } = useAuth();
  const { feedbackList, exams } = useData();
  const [disabledModalInfo, setDisabledModalInfo] = useState(null);

  const myFeedbacks = feedbackList.slice(0, 3);
  const upcomingExamsCount = exams ? exams.length : 0;

  const statusStyles = {
    'New': 'liquid-glass-pill text-zinc-300',
    'In Progress': 'bg-white/20 text-white border-white/30 font-bold',
    'Resolved': 'bg-white text-black font-black shadow-[0_0_15px_rgba(255,255,255,0.4)]'
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome & Section Greeting Header */}
      <div className="liquid-glass rounded-3xl p-5 sm:p-7 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden text-left">
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>

        {/* Leftmost Corner: Text + Animated Avatar */}
        <div className="flex items-center gap-4 sm:gap-6 justify-start text-left mr-auto">
          <div className="shrink-0">
            <AnimatedStudentAvatar isCR={isAdmin} size="lg" />
          </div>

          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="liquid-glass-pill text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-300 px-3 py-0.5 rounded-full">
                CYBEX D • SRM AP
              </span>
              {isAdmin && (
                <span className="bg-white text-black font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                  Class Rep (CR)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Hello, {user?.name || 'Student'}</span>
              <span className="inline-block hover:rotate-12 transition-transform cursor-pointer origin-[70%_70%]">👋</span>
            </h1>

            <p className="text-xs text-zinc-400 font-medium hidden sm:block">
              {user?.rollNumber ? `Verified Student (${user.rollNumber}) • Cyber Security - Section D` : 'Cyber Security Section D Portal'}
            </p>
          </div>
        </div>

        {/* Right Corner: Controls / Section D Info */}
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          {isAdmin ? (
            <button
              onClick={() => onNavigate('admin')}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open CR Control Panel</span>
            </button>
          ) : (
            <div className="text-right hidden md:block liquid-glass-pill px-4 py-2 rounded-2xl border border-white/10">
              <p className="text-xs font-bold text-white">CSE Section D</p>
              <p className="text-[11px] text-zinc-400">Representative: {portalConfig.adminName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Notice Banner */}
      <NoticeBanner />

      {/* Live 3D Class Tracker Component with Hours & Minutes */}
      <LiveClassCard onViewTimetable={() => onNavigate('timetable')} />

      {/* Core Actions & Quick Hubs Grid */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3.5 px-1 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Academic Hub & Services</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active 1: Timetable */}
          <button
            onClick={() => onNavigate('timetable')}
            className="liquid-glass-interactive flex flex-col items-start p-6 rounded-3xl text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center mb-4 font-black group-hover:scale-110 transition-transform shadow-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-base font-bold text-white group-hover:text-zinc-200 transition block">
              Timetable
            </span>
            <span className="text-xs text-zinc-400 mt-1 block leading-relaxed">
              Class schedule with hours/mins live countdowns
            </span>
            <span className="mt-4 text-xs font-bold text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Open Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          {/* Active 2: Exams & Syllabus Hub */}
          <button
            onClick={() => onNavigate('exams')}
            className="liquid-glass-interactive flex flex-col items-start p-6 rounded-3xl text-left group border border-amber-500/20"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-4 border border-amber-500/30 group-hover:scale-110 transition-transform shadow-lg">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white group-hover:text-amber-200 transition block">
                Exams & Syllabus
              </span>
              {upcomingExamsCount > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Bell className="w-2.5 h-2.5" /> {upcomingExamsCount} Active
                </span>
              )}
            </div>
            <span className="text-xs text-zinc-400 mt-1 block leading-relaxed">
              Official exam notices, syllabus, rooms & drive blueprints
            </span>
            <span className="mt-4 text-xs font-bold text-amber-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Check Syllabus & Dates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          {/* Active 3: Study Materials & Google Classroom Vault */}
          <button
            onClick={() => onNavigate('materials')}
            className="liquid-glass-interactive flex flex-col items-start p-6 rounded-3xl text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/30 group-hover:scale-110 transition-transform shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white group-hover:text-indigo-200 transition block">
                Class Vault & PDFs
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Live Sync
              </span>
            </div>
            <span className="text-xs text-zinc-400 mt-1 block leading-relaxed">
              Google Classroom notes, lecture PDFs & PYQs
            </span>
            <span className="mt-4 text-xs font-bold text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Open Class Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          {/* Active 4: Feedback & Grievances */}
          <button
            onClick={() => onNavigate('feedback')}
            className="liquid-glass-interactive flex flex-col items-start p-6 rounded-3xl text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-4 border border-white/20 group-hover:scale-110 transition-transform shadow-lg">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <span className="text-base font-bold text-white group-hover:text-zinc-200 transition block">
              Feedback Desk
            </span>
            <span className="text-xs text-zinc-400 mt-1 block leading-relaxed">
              Confidential submissions to Class Rep
            </span>
            <span className="mt-4 text-xs font-bold text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Submit Grievance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>

      {/* My Feedback Status Tracker */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-white" />
            <h3 className="text-base font-bold text-white">My Submitted Grievances & Updates</h3>
          </div>
          <button
            onClick={() => onNavigate('feedback')}
            className="text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myFeedbacks.length === 0 ? (
          <div className="py-10 text-center liquid-glass rounded-2xl">
            <p className="text-xs text-zinc-400">You haven't submitted any feedback yet.</p>
            <button
              onClick={() => onNavigate('feedback')}
              className="mt-3 text-xs font-black text-black bg-white hover:bg-zinc-200 px-5 py-2.5 rounded-xl transition shadow-lg hover:scale-105"
            >
              + Submit Feedback to Class Representative
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myFeedbacks.map(fb => (
              <div 
                key={fb.id}
                onClick={() => onNavigate('feedback')}
                className="p-4 rounded-2xl liquid-glass-interactive cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-zinc-400">{fb.category}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusStyles[fb.status] || 'liquid-glass-pill text-zinc-300'}`}>
                    {fb.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{fb.title}</h4>
                {fb.crResponse ? (
                  <p className="text-xs text-white liquid-glass p-2.5 rounded-xl mt-2 border border-white/20 line-clamp-2">
                    <strong>CR Update:</strong> {fb.crResponse}
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500 mt-1">Pending review by Class Representative</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 flex items-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>Submissions remain confidential and are handled directly by your Class Representative.</span>
        </div>
      </div>

      {/* Disabled Modal */}
      <DisabledNoticeModal
        isOpen={!!disabledModalInfo}
        onClose={() => setDisabledModalInfo(null)}
        moduleName={disabledModalInfo || 'Academic Section'}
      />
    </div>
  );
}
