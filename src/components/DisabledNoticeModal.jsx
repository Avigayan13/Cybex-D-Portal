import React from 'react';
import Modal from './Modal';
import { Lock, Sparkles, BookOpen, HelpCircle, Clock, ShieldCheck } from 'lucide-react';

export default function DisabledNoticeModal({ isOpen, onClose, moduleName = 'Study Materials' }) {
  const isMaterials = moduleName.toLowerCase().includes('material');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${moduleName} • Opening Soon`}
      subtitle="Section D Academic Portal Feature Status"
    >
      <div className="space-y-4 py-2 text-center">
        <div className="w-16 h-16 rounded-3xl bg-white/10 text-white border border-white/20 flex items-center justify-center mx-auto shadow-xl">
          {isMaterials ? <BookOpen className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
        </div>

        <div className="space-y-2">
          <span className="liquid-glass-pill inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full text-zinc-300">
            <Lock className="w-3.5 h-3.5 text-white" /> Feature Temporarily Disabled
          </span>

          <h3 className="text-xl font-extrabold text-white">
            {moduleName} will be available shortly!
          </h3>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            This module has been temporarily reserved by the Class Representative for the current semester phase. Once faculty lecture notes, syllabus sheets, and doubt resolution workflows start, the CR will unlock this section for all classmates.
          </p>
        </div>

        <div className="p-4 rounded-2xl liquid-glass text-left text-xs text-zinc-400 space-y-2">
          <div className="flex items-center gap-2 text-white font-bold">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>What to use currently:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Check the <strong>Interactive Timetable</strong> for live class countdowns & rooms.</li>
            <li>Submit concerns to the CR via <strong>Feedback & Grievances</strong>.</li>
          </ul>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-black text-xs rounded-xl shadow-lg transition"
          >
            Got it, take me back
          </button>
        </div>
      </div>
    </Modal>
  );
}
