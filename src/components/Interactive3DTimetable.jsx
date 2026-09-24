import React, { useState, useRef } from 'react';
import { 
  Box, 
  Clock, 
  MapPin, 
  User, 
  Sparkles, 
  Layers, 
  Calendar, 
  RotateCcw,
  Building,
  Image as ImageIcon
} from 'lucide-react';
import Modal from './Modal';

export default function Interactive3DTimetable({ timetable, liveStatus, currentTime, onShowOriginal }) {
  const containerRef = useRef(null);

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentTime.getDay()];

  const [selectedDay, setSelectedDay] = useState(
    daysList.includes(todayDayName) ? todayDayName : 'Monday'
  );

  // 3D View Preset: '3d-deck' | '3d-matrix' | '3d-navigator'
  const [viewStyle, setViewStyle] = useState('3d-deck');
  
  // Interactive 3D Spatial Angles
  const [rotX, setRotX] = useState(10);
  const [rotY, setRotY] = useState(-6);
  const [zoomDepth, setZoomDepth] = useState(15);
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });
  const [selectedClassModal, setSelectedClassModal] = useState(null);

  // Mouse Parallax effect on the 3D stage
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -18;
    setMouseParallax({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseParallax({ x: 0, y: 0 });
  };

  const reset3DView = () => {
    setRotX(10);
    setRotY(-6);
    setZoomDepth(15);
    setMouseParallax({ x: 0, y: 0 });
  };

  // Campus Room Information
  const roomDetails = {
    'S 312': { building: 'S-Block (Main Academic Block)', floor: '3rd Floor', desc: 'Main Lecture Classroom with Smart Projector' },
    'V 602': { building: 'V-Block (Vishwakarma Block)', floor: '6th Floor', desc: 'Advanced Computer Programming & Computing Lab' },
    'V 403': { building: 'V-Block (Vishwakarma Block)', floor: '4th Floor', desc: 'CS Lab 3 & C Programming Practice Laboratory' },
    'V 306': { building: 'V-Block (Vishwakarma Block)', floor: '3rd Floor', desc: 'Engineering Physics & Optics Laboratory' }
  };

  const daySlots = timetable
    .filter(t => t.day.toLowerCase() === selectedDay.toLowerCase())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="liquid-glass rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black shadow-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>Class Schedule Engine</span>
              <span className="liquid-glass text-[10px] font-black px-2 py-0.5 rounded-full text-zinc-300 border border-white/20">
                Interactive
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">Interactive period cards • Click any class card for details</p>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 liquid-glass p-1 rounded-2xl">
            <button
              onClick={() => setViewStyle('3d-deck')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                viewStyle === '3d-deck'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Deck View</span>
            </button>

            <button
              onClick={() => setViewStyle('3d-matrix')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                viewStyle === '3d-matrix'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Full Week</span>
            </button>

            <button
              onClick={() => setViewStyle('3d-navigator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                viewStyle === '3d-navigator'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Campus Rooms</span>
            </button>
          </div>

          <button
            onClick={reset3DView}
            className="liquid-glass-pill p-2 rounded-xl text-zinc-300 hover:text-white transition"
            title="Reset View Angle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Day Selector Pills for 3D Deck */}
      {viewStyle !== '3d-matrix' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {daysList.map(d => {
            const isToday = d.toLowerCase() === todayDayName.toLowerCase();
            const isSelected = selectedDay === d;
            const count = timetable.filter(t => t.day.toLowerCase() === d.toLowerCase()).length;

            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`flex-1 min-w-[120px] p-4 rounded-2xl text-center transition-all duration-300 relative group ${
                  isSelected
                    ? 'liquid-glass bg-white/15 text-white border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)] -translate-y-1'
                    : 'liquid-glass-pill text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider">{d}</span>
                  {isToday && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-white text-black shadow-sm">
                      TODAY
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-zinc-400 mt-0.5">
                  {count} {count === 1 ? 'Period' : 'Periods'}
                </p>
                {isSelected && (
                  <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* MODE 1: 3D INTERACTIVE HOLOGRAPHIC CARD DECK */}
      {viewStyle === '3d-deck' && (
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-3xl p-6 sm:p-8 liquid-glass overflow-hidden min-h-[440px]"
        >
          {/* Subtle Ambient Specular Floor */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.06] via-transparent to-transparent pointer-events-none"></div>

          {daySlots.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 text-sm relative z-10 font-bold">
              No classes scheduled for {selectedDay}. Enjoy your free day! 🎉
            </div>
          ) : (
            <div 
              style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d',
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10"
            >
              {daySlots.map((slot, index) => {
                const isCurrentActive = liveStatus.currentClass?.id === slot.id && selectedDay.toLowerCase() === todayDayName.toLowerCase();
                const currentRotX = (rotX + mouseParallax.y * 0.35).toFixed(2);
                const currentRotY = (rotY + mouseParallax.x * 0.35 + (index % 2 === 0 ? -2 : 2)).toFixed(2);

                return (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedClassModal(slot)}
                    style={{
                      transform: `perspective(1000px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) translateZ(${isCurrentActive ? 25 : zoomDepth}px)`,
                      transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease',
                    }}
                    className={`relative rounded-3xl p-6 border cursor-pointer hover:scale-[1.03] hover:-translate-y-2 transition-all ${
                      isCurrentActive
                        ? 'bg-white/15 border-white ring-2 ring-white/40 backdrop-blur-2xl shadow-[0_25px_50px_rgba(255,255,255,0.25)]'
                        : 'liquid-glass-interactive'
                    }`}
                  >
                    {/* Top Specular Light Reflection */}
                    <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

                    {/* Period Header */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black px-3 py-1 rounded-xl bg-white text-black shadow-md">
                          {slot.subjectCode}
                        </span>
                        <span className="liquid-glass-pill text-[10px] font-bold uppercase tracking-wider text-zinc-300 px-2.5 py-1 rounded-lg">
                          Period {slot.period || index + 1} • {slot.type}
                        </span>
                      </div>

                      {isCurrentActive ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-wider shadow-lg animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
                          <span>ACTIVE NOW</span>
                        </span>
                      ) : (
                        <span className="liquid-glass-pill text-xs font-mono font-bold text-zinc-300 px-3 py-1 rounded-xl">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      )}
                    </div>

                    {/* Subject Title */}
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight mb-4">
                      {slot.subject}
                    </h3>

                    {/* Details Strip */}
                    <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <User className="w-4 h-4 text-zinc-400" />
                        <span className="font-semibold truncate max-w-[170px]">{slot.faculty}</span>
                      </div>

                      <div className="liquid-glass-pill flex items-center gap-1.5 font-black text-white px-3 py-1.5 rounded-xl">
                        <MapPin className="w-3.5 h-3.5 text-white" />
                        <span>Room: {slot.room}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: FULL WEEK 3D MATRIX */}
      {viewStyle === '3d-matrix' && (
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white">Full Weekly Section D Schedule Grid</h3>
              <p className="text-xs text-zinc-400">Complete Monday through Friday breakdown</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {daysList.map(d => {
              const dayClasses = timetable
                .filter(t => t.day.toLowerCase() === d.toLowerCase())
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              const isToday = d.toLowerCase() === todayDayName.toLowerCase();

              return (
                <div
                  key={d}
                  className={`rounded-2xl p-4 space-y-3 transition-all ${
                    isToday
                      ? 'liquid-glass bg-white/10 border-white/40 shadow-lg ring-1 ring-white/30'
                      : 'liquid-glass'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-black uppercase tracking-wider text-white">{d}</span>
                    {isToday && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-black">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {dayClasses.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedClassModal(c)}
                        className="p-3 rounded-xl liquid-glass-interactive space-y-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-white">{c.subjectCode}</span>
                          <span className="text-zinc-300 font-bold">{c.room}</span>
                        </div>
                        <p className="text-xs font-bold text-white line-clamp-2 leading-snug">{c.subject}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{c.startTime} - {c.endTime}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 3: 3D CAMPUS ROOM NAVIGATOR */}
      {viewStyle === '3d-navigator' && (
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-white" />
                <span>Section D Campus Classroom & Lab Navigator</span>
              </h3>
              <p className="text-xs text-zinc-400">Quick spatial guide to help you reach your classes on time</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(roomDetails).map(([room, details]) => (
              <div 
                key={room}
                className="p-6 rounded-3xl liquid-glass-interactive space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black font-mono text-black bg-white px-3 py-1 rounded-xl shadow-md">
                      {room}
                    </span>
                    <span className="liquid-glass-pill text-xs font-bold text-zinc-300 px-2.5 py-1 rounded-lg">
                      {details.floor}
                    </span>
                  </div>
                  <MapPin className="w-5 h-5 text-zinc-400" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{details.building}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{details.desc}</p>
                </div>

                <div className="pt-2 border-t border-white/10 text-[11px] text-zinc-400 font-mono">
                  Subjects held here: {timetable.filter(t => t.room === room).map(t => t.subjectCode).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class Detail Modal */}
      {selectedClassModal && (
        <Modal
          isOpen={!!selectedClassModal}
          onClose={() => setSelectedClassModal(null)}
          title={`${selectedClassModal.subjectCode}: ${selectedClassModal.subject}`}
          subtitle={`${selectedClassModal.day} • Period ${selectedClassModal.period} (${selectedClassModal.startTime} to ${selectedClassModal.endTime})`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-black border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Allocated Room</span>
                <p className="text-base font-black text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span>{selectedClassModal.room}</span>
                </p>
                <p className="text-[11px] text-zinc-400">{roomDetails[selectedClassModal.room]?.floor || 'Academic Wing'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-black border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Session Type</span>
                <p className="text-base font-black text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-zinc-400" />
                  <span>{selectedClassModal.type}</span>
                </p>
                <p className="text-[11px] text-zinc-400">Scheduled for {selectedClassModal.day}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Faculty In-Charge</span>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" />
                <span>{selectedClassModal.faculty}</span>
              </p>
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setSelectedClassModal(null)}
                className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl shadow-lg transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
