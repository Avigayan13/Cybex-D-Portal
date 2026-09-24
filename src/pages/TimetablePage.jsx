import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import LiveClassCard from '../components/LiveClassCard';
import ThreeTimetable from '../components/ThreeTimetable';
import Interactive3DTimetable from '../components/Interactive3DTimetable';
import Modal from '../components/Modal';
import { 
  Box, 
  Sparkles, 
  Image as ImageIcon, 
  Layers, 
  Calendar, 
  BookOpen, 
  Compass
} from 'lucide-react';

export default function TimetablePage() {
  const { user, isAdmin } = useAuth();
  const { timetable, currentTime, liveStatus } = useData();

  const [modelMode, setModelMode] = useState('3d-spatial');
  const [showOriginalModal, setShowOriginalModal] = useState(false);

  const subjectsDirectory = [
    { code: 'AEC 101', name: 'ART OF LISTENING, SPEAKING AND READING SKILLS', ltpc: '1-1-0-2', faculty: 'Dr. Antarleena Basu (26093)', room: 'S 312' },
    { code: 'CSE 101', name: 'FUNDAMENTALS OF COMPUTING AND PROGRAMMING IN C', ltpc: '3-0-1-5', faculty: 'Dr. Mudavath Ravi (25358) / Dr. Sahadeb Shit (25199)', room: 'S 312 / V 403 / V 602' },
    { code: 'FIC 102', name: 'ENGINEERING PHYSICS', ltpc: '2-0-1-3', faculty: 'Dr. Krishna Prasad Maity (24123)', room: 'S 312 / V 306' },
    { code: 'FIC 103', name: 'CALCULUS FOR ENGINEERS', ltpc: '3-0-0-3', faculty: 'Dr. Koyel Chakravarty (22108)', room: 'S 312' },
    { code: 'SEC 101', name: 'ANALYTICAL REASONING AND APTITUDE SKILLS - I', ltpc: '1-0-1-2', faculty: 'Mr. Skilling Course (Tmp124)', room: 'S 312' },
    { code: 'VAC 101', name: 'ENVIRONMENTAL SCIENCE', ltpc: '2-0-0-2', faculty: 'Dr. Kousik Das (22118)', room: 'S 312' }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Live Active Class Monitor with Hours & Minutes Countdown */}
      <LiveClassCard />

      {/* Main Timetable Header */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="liquid-glass-pill text-xs font-black uppercase tracking-widest text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-white" /> CYBEX D Timetable
            </span>
            <span className="liquid-glass text-xs font-bold text-zinc-400 px-2.5 py-1 rounded-full border border-white/10">
              Section D Schedule
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Interactive Class Schedule
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Live interactive schedule with room locators (S 312, V 602, V 403, V 306), faculty details, and period countdowns in hours and minutes.
          </p>
        </div>

        {/* Timetable View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => setShowOriginalModal(true)}
            className="liquid-glass-pill px-4 py-2.5 rounded-2xl text-zinc-200 font-bold text-xs transition flex items-center gap-2 group hover:border-white/30"
          >
            <ImageIcon className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span>Official Portal Image</span>
          </button>

          <div className="flex items-center gap-1 liquid-glass p-1.5 rounded-2xl">
            <button
              onClick={() => setModelMode('3d-spatial')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                modelMode === '3d-spatial'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Deck View</span>
            </button>

            <button
              onClick={() => setModelMode('webgl-orbit')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                modelMode === 'webgl-orbit'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>
        </div>
      </div>

      {/* RENDER SELECTED 3D ENGINE */}
      {modelMode === '3d-spatial' ? (
        <Interactive3DTimetable
          timetable={timetable}
          liveStatus={liveStatus}
          currentTime={currentTime}
          onShowOriginal={() => setShowOriginalModal(true)}
        />
      ) : (
        <ThreeTimetable
          timetable={timetable}
          liveStatus={liveStatus}
          currentTime={currentTime}
        />
      )}

      {/* Course & Faculty Directory Table */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-white" />
            <h3 className="text-base font-bold text-white">Official Course & Faculty Directory</h3>
          </div>
          <span className="text-xs font-semibold text-zinc-400">Section D Curriculum</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 font-bold">Code</th>
                <th className="py-3 px-3 font-bold">Subject Description</th>
                <th className="py-3 px-3 font-bold">L-T-P-C</th>
                <th className="py-3 px-3 font-bold">Faculty In-Charge</th>
                <th className="py-3 px-3 font-bold">Allocated Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {subjectsDirectory.map(sub => (
                <tr key={sub.code} className="hover:bg-white/[0.04] transition">
                  <td className="py-3.5 px-3 font-mono font-black text-white">{sub.code}</td>
                  <td className="py-3.5 px-3 font-bold text-zinc-200">{sub.name}</td>
                  <td className="py-3.5 px-3 font-mono text-zinc-400">{sub.ltpc}</td>
                  <td className="py-3.5 px-3 text-zinc-300">{sub.faculty}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-white"><span className="liquid-glass-pill px-2.5 py-1 rounded-lg">{sub.room}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Original Portal Timetable Image Preview */}
      <Modal
        isOpen={showOriginalModal}
        onClose={() => setShowOriginalModal(false)}
        title="Official SRM AP Portal Timetable"
        subtitle="Computer Science & Engineering • Section D Schedule"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center p-2">
            <img
              src="/timetable_original.jpg"
              alt="Official SRM AP Timetable"
              className="w-full max-h-[70vh] object-contain rounded-xl"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
            <span>Source: SRM AP Student Portal (Official Section D Timetable)</span>
            <button
              onClick={() => setShowOriginalModal(false)}
              className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-black text-xs rounded-xl shadow-lg transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
