import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Bell, Pin, ChevronRight, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';

export default function NoticeBanner() {
  const { announcements } = useData();
  const [selectedNotice, setSelectedNotice] = useState(null);

  if (!announcements || announcements.length === 0) return null;

  // Most urgent or pinned notice
  const primaryNotice = announcements[0];

  const priorityStyles = {
    Urgent: 'bg-rose-50 border-rose-200 text-rose-800',
    High: 'bg-amber-50 border-amber-200 text-amber-800',
    Normal: 'bg-srm-50 border-srm-200 text-srm-800'
  };

  const priorityBadge = {
    Urgent: 'bg-white text-black font-black shadow-[0_0_15px_rgba(255,255,255,0.4)]',
    High: 'liquid-glass-pill text-white border-white/40',
    Normal: 'liquid-glass-pill text-zinc-300'
  };

  return (
    <>
      <div className="liquid-glass rounded-3xl p-5 sm:p-6 transition-all shadow-xl relative overflow-hidden">
        {/* Specular sheen */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-white text-black shadow-lg shrink-0 mt-0.5 sm:mt-0">
              {primaryNotice.priority === 'Urgent' ? (
                <AlertTriangle className="w-5 h-5 text-black" />
              ) : (
                <Bell className="w-5 h-5 text-black" />
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full ${priorityBadge[primaryNotice.priority] || priorityBadge.Normal}`}>
                  {primaryNotice.priority} Notice
                </span>
                {primaryNotice.isPinned && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-300 liquid-glass-pill px-2.5 py-0.5 rounded-full">
                    <Pin className="w-3 h-3 text-white" /> Pinned
                  </span>
                )}
                <span className="text-xs text-zinc-500">
                  {new Date(primaryNotice.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                {primaryNotice.title}
              </h3>
              
              <p className="text-xs sm:text-sm text-zinc-400 line-clamp-1 sm:line-clamp-2">
                {primaryNotice.content}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setSelectedNotice(primaryNotice)}
              className="text-xs font-black text-black bg-white hover:bg-zinc-200 px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 hover:scale-105"
            >
              <span>Read Notice</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notice Detail Modal */}
      <Modal
        isOpen={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        title={selectedNotice?.title || "Notice"}
        subtitle={`Posted by ${selectedNotice?.authorName || 'Class Representative'} on ${selectedNotice ? new Date(selectedNotice.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''}`}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs uppercase font-black px-3 py-1 rounded-full ${priorityBadge[selectedNotice?.priority] || priorityBadge.Normal}`}>
              {selectedNotice?.priority} Priority
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full liquid-glass-pill text-zinc-300">
              Category: {selectedNotice?.category}
            </span>
          </div>

          <div className="p-5 rounded-2xl liquid-glass text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
            {selectedNotice?.content}
          </div>

          <div className="text-right pt-2">
            <button
              onClick={() => setSelectedNotice(null)}
              className="px-5 py-2.5 text-xs font-black bg-white text-black hover:bg-zinc-200 rounded-xl transition shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
