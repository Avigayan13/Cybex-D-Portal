import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  Clock, 
  MapPin, 
  User, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Coffee, 
  Calendar, 
  Navigation, 
  ListTodo, 
  Plus, 
  Trash2, 
  Check, 
  Info, 
  X, 
  Layers,
  ChevronRight,
  BookOpen,
  FlaskConical,
  SlidersHorizontal
} from 'lucide-react';

// SRM AP Campus Room & Navigation Directory
const ROOM_DIRECTORY = {
  'S 312': {
    name: 'S 312',
    building: 'Sarvepalli Radhakrishnan Block (S-Block)',
    shortBuilding: 'S-Block',
    floor: '3rd Floor',
    type: 'Smart Lecture Classroom',
    capacity: '70 Students',
    elevators: 'Central S-Block Elevators (Exit left on 3rd Floor)',
    directions: 'Enter S-Block main lobby, take central elevators or stairs to Level 3. Room 312 is located on the East corridor.',
    features: ['Projector & Smart Screen', 'Audio Podiums', 'Air Conditioned', 'Power Outlets at Benches']
  },
  'V 602': {
    name: 'V 602',
    building: 'Sir M. Vishvesvaraya Block (V-Block)',
    shortBuilding: 'V-Block',
    floor: '6th Floor',
    type: 'Advanced Computing & Programming Lab',
    capacity: '65 Workstations',
    elevators: 'V-Block North & South Elevator Banks (6th Floor)',
    directions: 'Enter V-Block main portico, take high-speed elevators to the 6th Floor. Lab 602 is on the North computing wing.',
    features: ['High-Performance Linux/Windows PCs', 'GCC / Clang Development Environment', 'Gigabit Ethernet', 'Dual Monitors for Faculty']
  },
  'V 403': {
    name: 'V 403',
    building: 'Sir M. Vishvesvaraya Block (V-Block)',
    shortBuilding: 'V-Block',
    floor: '4th Floor',
    type: 'Computer Science Lab - 3',
    capacity: '60 Workstations',
    elevators: 'V-Block Elevator Bank (Level 4)',
    directions: 'Take V-Block central elevators to Level 4. Walk towards the CSE Lab corridor on the west side.',
    features: ['Modern Desktop Terminals', 'Central Air Conditioning', 'Networked Printers', 'Whiteboards for Lab Demos']
  },
  'V 306': {
    name: 'V 306',
    building: 'Sir M. Vishvesvaraya Block (V-Block)',
    shortBuilding: 'V-Block',
    floor: '3rd Floor',
    type: 'Engineering Physics & Optics Lab',
    capacity: '50 Students',
    elevators: 'V-Block Elevator Bank (Level 3)',
    directions: 'Head to V-Block 3rd Floor. Room 306 is located in the Sciences & Physics laboratory wing.',
    features: ['Darkroom Optics Setup', 'Laser & Spectroscopy Benches', 'Precision Measurement Meters', 'Safety Equipment']
  }
};

export default function LiveClassCard({ onViewTimetable }) {
  const { liveStatus, currentTime, timetable } = useData();
  const { currentClass, nextClass, timeRemainingText, statusType } = liveStatus;

  // Selected room for interactive navigation modal
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Selected period to preview from the timeline strip
  const [previewPeriod, setPreviewPeriod] = useState(null);

  // Active sub-tab in card: 'overview' | 'timeline' | 'tasks'
  const [activeTab, setActiveTab] = useState('overview');

  // Local Storage Tasks / Scratchpad
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('cybex_d_tasks');
      return saved ? JSON.parse(saved) : [
        { id: 1, text: 'Review C Programming arrays & pointers for lab', completed: false, subject: 'CSE 101' },
        { id: 2, text: 'Submit Engineering Physics lab observation', completed: true, subject: 'FIC 102' }
      ];
    } catch {
      return [];
    }
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState(currentClass?.subjectCode || 'General');

  // Save tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cybex_d_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  // Update default task subject when active class changes
  useEffect(() => {
    if (currentClass?.subjectCode) {
      setNewTaskSubject(currentClass.subjectCode);
    }
  }, [currentClass]);

  const addTask = (e) => {
    e?.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      subject: newTaskSubject || 'General',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Format real-time clock
  const timeFormatted = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateFormatted = currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  // Get current day name and next active day name
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayIndex = currentTime.getDay();
  const currentDayName = daysOfWeek[currentDayIndex];

  // Next active academic day (skip weekend to Monday)
  let nextDayIndex = (currentDayIndex + 1) % 7;
  if (nextDayIndex === 0) nextDayIndex = 1; // Sunday -> Monday
  if (nextDayIndex === 6) nextDayIndex = 1; // Saturday -> Monday
  const nextDayName = daysOfWeek[nextDayIndex];

  // Today's classes sorted
  const todayClasses = (timetable || [])
    .filter(t => t.day.toLowerCase() === currentDayName.toLowerCase())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Next academic day classes sorted
  const nextDayClasses = (timetable || [])
    .filter(t => t.day.toLowerCase() === nextDayName.toLowerCase())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Remaining upcoming classes today
  const nowTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const remainingClassesToday = todayClasses.filter(c => {
    const [sh, sm] = c.startTime.split(':').map(Number);
    return (sh * 60 + sm) > nowTotalMinutes;
  });

  // Compute period progress percentage & elapsed time
  let elapsedMinutes = 0;
  let totalDurationMinutes = 50;
  let progressPercent = 0;

  if (statusType === 'ongoing' && currentClass) {
    const [sh, sm] = currentClass.startTime.split(':').map(Number);
    const [eh, em] = currentClass.endTime.split(':').map(Number);
    const startTotalSec = sh * 3600 + sm * 60;
    const endTotalSec = eh * 3600 + em * 60;
    const currentTotalSec = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();
    
    const totalSec = Math.max(1, endTotalSec - startTotalSec);
    const elapsedSec = Math.max(0, Math.min(totalSec, currentTotalSec - startTotalSec));
    
    totalDurationMinutes = Math.round(totalSec / 60);
    elapsedMinutes = Math.round(elapsedSec / 60);
    progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSec / totalSec) * 100)));
  }

  // Check if upcoming class involves a building change (e.g., S-Block to V-Block)
  const isTransitRequired = currentClass && nextClass && currentClass.room?.charAt(0) !== nextClass.room?.charAt(0);

  return (
    <>
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Specular Top Edge Light Beam */}
        <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-sky-400/40 to-transparent pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          
          {/* Top Bar: Title, Live Status Indicator, Navigation Tabs & Clock */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-400"></span>
              </span>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                  Live Class Monitor <span className="text-zinc-500">•</span> <span className="text-zinc-400">CYBEX D</span>
                </span>
              </div>
            </div>

            {/* Quick Interactive Sub-Tabs */}
            <div className="flex items-center gap-1.5 liquid-glass-pill p-1 rounded-2xl">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'overview' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live View</span>
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'timeline' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Today's Track ({todayClasses.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'tasks' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Tasks ({tasks.filter(t => !t.completed).length})</span>
              </button>
            </div>

            {/* Live Time Clock */}
            <div className="liquid-glass-pill flex items-center gap-2 text-xs text-zinc-300 font-mono px-3.5 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{timeFormatted}</span>
              <span className="text-zinc-600">|</span>
              <span className="text-white font-sans font-bold">{dateFormatted}</span>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & LIVE MONITOR */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Ongoing Class Details or Status */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {statusType === 'ongoing' && currentClass && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-black text-xs font-black uppercase tracking-wider shadow-lg">
                          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                          <span>CLASS IN SESSION</span>
                        </span>

                        {currentClass.type && (
                          <span className="liquid-glass-pill text-xs font-bold text-sky-300 px-3 py-1 rounded-xl border border-sky-400/20 flex items-center gap-1">
                            {currentClass.type === 'Lab' ? <FlaskConical className="w-3.5 h-3.5 text-sky-400" /> : <BookOpen className="w-3.5 h-3.5 text-sky-400" />}
                            <span>{currentClass.type}</span>
                          </span>
                        )}

                        <span className="liquid-glass-pill text-xs font-mono font-bold text-zinc-300 px-3 py-1 rounded-xl">
                          Period {currentClass.period} ({currentClass.startTime} - {currentClass.endTime})
                        </span>
                      </div>

                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                          {currentClass.subject}
                        </h2>
                      </div>

                      {/* Faculty & Interactive Room Navigator Button */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {currentClass.subjectCode && (
                          <span className="liquid-glass-pill text-white px-3 py-1 rounded-xl font-mono text-xs font-bold border border-white/20">
                            {currentClass.subjectCode}
                          </span>
                        )}
                        
                        <span className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-300 font-medium">
                          <User className="w-4 h-4 text-zinc-400" />
                          <span>{currentClass.faculty}</span>
                        </span>

                        {/* Interactive Room Button */}
                        <button
                          onClick={() => setSelectedRoom(ROOM_DIRECTORY[currentClass.room] || { name: currentClass.room, building: 'SRM AP Campus', floor: 'Check with CR', directions: 'Follow campus signage' })}
                          className="liquid-glass-interactive flex items-center gap-1.5 font-bold text-sky-300 hover:text-white px-3.5 py-1 rounded-xl text-xs border border-sky-400/30 group"
                          title="Click to view building, floor and elevator directions"
                        >
                          <MapPin className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                          <span>Room: <strong>{currentClass.room}</strong></span>
                          <Navigation className="w-3 h-3 text-sky-400 ml-0.5 opacity-80" />
                        </button>
                      </div>

                      {/* Real-Time Period Progress Bar */}
                      <div className="pt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-sky-400" />
                            <span>Progress: <strong className="text-white font-sans">{elapsedMinutes}m</strong> elapsed of {totalDurationMinutes}m</span>
                          </span>
                          <span className="text-sky-300 font-bold">{progressPercent}% complete</span>
                        </div>

                        {/* Visual Bar */}
                        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden relative border border-white/10 p-[1px]">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-400 to-sky-300 transition-all duration-1000 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {statusType === 'break' && (
                    <div className="space-y-3">
                      <div className="liquid-glass-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-amber-300 border border-amber-400/30">
                        <Coffee className="w-3.5 h-3.5 text-amber-400" />
                        <span>BREAK / TRANSIT PERIOD</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        No active lecture right now
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        Take a break or prepare for your upcoming lecture. Check the upcoming classes queue below.
                      </p>
                    </div>
                  )}

                  {statusType === 'done' && (
                    <div className="space-y-3">
                      <div className="liquid-glass-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>DAY CONCLUDED</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        All scheduled classes finished for today
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        Great job today! Below is the upcoming class schedule for <strong className="text-white">{nextDayName}</strong>.
                      </p>
                    </div>
                  )}

                  {statusType === 'weekend' && (
                    <div className="space-y-3">
                      <div className="liquid-glass-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-sky-300 border border-sky-400/30">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>WEEKEND</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Have a restful weekend!
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        No academic sessions today. Check below for Monday's upcoming class schedule.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column: Time Remaining Box & Next Up Card */}
                <div className="lg:col-span-5 liquid-glass rounded-2xl p-5 space-y-4">
                  
                  {/* Remaining Countdown Box */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black mb-1.5 flex items-center justify-between">
                      <span>{statusType === 'ongoing' ? 'Time Remaining in Class' : 'Next Scheduled Class'}</span>
                      {statusType === 'ongoing' && (
                        <span className="text-sky-400 text-[10px] font-mono font-bold">LIVE SYNC</span>
                      )}
                    </p>
                    <div className="text-2xl sm:text-3xl font-mono font-black text-white flex items-center gap-2.5">
                      <Clock className="w-5 h-5 text-sky-400 animate-pulse" />
                      <span className="tracking-tight">{timeRemainingText || '00h 00m remaining'}</span>
                    </div>
                  </div>

                  {/* Immediate Next Class Details */}
                  {nextClass ? (
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black flex items-center gap-1.5">
                          <span>Upcoming Next</span>
                          <ArrowRight className="w-3 h-3 text-sky-400" />
                        </p>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {nextClass.startTime} - {nextClass.endTime}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-white leading-snug">
                        {nextClass.subject}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-zinc-400 font-medium">
                          {nextClass.faculty}
                        </span>
                        <button
                          onClick={() => setSelectedRoom(ROOM_DIRECTORY[nextClass.room] || { name: nextClass.room, building: 'SRM AP Campus', floor: 'Check Floor Map', directions: 'Follow signage' })}
                          className="text-xs font-bold text-sky-300 hover:text-white flex items-center gap-1 liquid-glass-pill px-2.5 py-0.5 rounded-lg border border-sky-400/20"
                        >
                          <MapPin className="w-3 h-3 text-sky-400" />
                          <span>Room {nextClass.room}</span>
                        </button>
                      </div>

                      {/* Transit Alert if changing buildings */}
                      {isTransitRequired && (
                        <div className="p-2.5 rounded-xl liquid-glass border border-amber-400/30 text-[11px] text-amber-200 flex items-center gap-2 mt-2">
                          <Navigation className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Transit note: Next period moves from {currentClass.room?.charAt(0)}-Block to {nextClass.room?.charAt(0)}-Block.</span>
                        </div>
                      )}
                    </div>
                  ) : statusType === 'ongoing' ? (
                    <div className="pt-3 border-t border-white/10 text-xs text-zinc-500 font-medium">
                      ✨ This is the final lecture period scheduled for today.
                    </div>
                  ) : null}

                  {/* Quick Timetable CTA */}
                  {onViewTimetable && (
                    <button
                      onClick={onViewTimetable}
                      className="w-full text-xs font-black text-center text-black bg-white hover:bg-zinc-200 py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-1.5 mt-2 hover:scale-[1.02]"
                    >
                      <span>Explore Full Timetable</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* COMPREHENSIVE UPCOMING CLASSES RADAR / QUEUE */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">
                      {remainingClassesToday.length > 0 
                        ? `Upcoming Classes Remaining Today (${remainingClassesToday.length})`
                        : `Upcoming Classes for ${nextDayName} (${nextDayClasses.length})`}
                    </h3>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                    {remainingClassesToday.length > 0 ? 'Today\'s Upcoming Queue' : `Next Session: ${nextDayName}`}
                  </span>
                </div>

                {/* Queue Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(remainingClassesToday.length > 0 ? remainingClassesToday : nextDayClasses).map((item, idx) => {
                    const isNextDirectly = idx === 0 && remainingClassesToday.length > 0;
                    return (
                      <div
                        key={item.id || idx}
                        className={`p-4 rounded-2xl transition-all relative overflow-hidden group ${
                          isNextDirectly 
                            ? 'liquid-glass border-sky-400/40 bg-sky-500/[0.06] shadow-[0_0_20px_rgba(56,189,248,0.15)]' 
                            : 'liquid-glass-interactive'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg liquid-glass text-white border border-white/10">
                              Period {item.period}
                            </span>
                            {item.type && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md liquid-glass text-sky-300 border border-sky-400/20">
                                {item.type}
                              </span>
                            )}
                          </div>
                          
                          <span className="text-[11px] font-mono font-bold text-sky-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.startTime} - {item.endTime}</span>
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-sky-200 transition">
                          {item.subject}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2.5 pt-2 border-t border-white/5">
                          <span className="truncate max-w-[140px] flex items-center gap-1 text-zinc-300">
                            <User className="w-3 h-3 text-zinc-500" />
                            {item.faculty?.split('(')[0] || item.faculty}
                          </span>
                          
                          <button
                            onClick={() => setSelectedRoom(ROOM_DIRECTORY[item.room] || { name: item.room, building: 'SRM AP Campus', floor: 'Level 3', directions: 'Follow signage' })}
                            className="text-[11px] font-bold text-sky-300 hover:text-white flex items-center gap-1 liquid-glass-pill px-2 py-0.5 rounded-lg border border-sky-400/20"
                          >
                            <MapPin className="w-3 h-3 text-sky-400" />
                            <span>Room {item.room}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TODAY'S DAY AT A GLANCE TIMELINE STRIP */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-400" />
                    <span>Today's Complete Schedule ({currentDayName})</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Click any period below to inspect room location, faculty, or transit guide.
                  </p>
                </div>
                <span className="liquid-glass-pill text-xs font-mono px-3 py-1 rounded-full text-zinc-300">
                  {todayClasses.length} Periods Scheduled
                </span>
              </div>

              {todayClasses.length === 0 ? (
                <div className="p-8 text-center liquid-glass rounded-2xl">
                  <Coffee className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">No classes scheduled for {currentDayName}</p>
                  <p className="text-xs text-zinc-500 mt-1">Enjoy your free day or prepare with study materials.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-1">
                  {todayClasses.map((item, idx) => {
                    const isLive = currentClass?.id === item.id;
                    const [eh, em] = item.endTime.split(':').map(Number);
                    const isPast = (currentTime.getHours() * 3600 + currentTime.getMinutes() * 60) >= (eh * 3600 + em * 60);

                    return (
                      <div
                        key={item.id || idx}
                        onClick={() => setPreviewPeriod(item)}
                        className={`p-4 rounded-2xl cursor-pointer transition-all ${
                          isLive
                            ? 'liquid-glass border-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.25)] ring-1 ring-sky-400/40 bg-sky-500/10'
                            : isPast
                            ? 'liquid-glass opacity-60 hover:opacity-100 hover:border-white/30'
                            : 'liquid-glass-interactive'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg liquid-glass text-white">
                            Period {item.period}
                          </span>
                          
                          {isLive ? (
                            <span className="text-[10px] font-black uppercase text-sky-300 flex items-center gap-1 animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-sky-400"></span> Live Now
                            </span>
                          ) : isPast ? (
                            <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" /> Done
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-zinc-400">
                              {item.startTime}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug mb-2">
                          {item.subject}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/5 font-mono">
                          <span>{item.startTime} - {item.endTime}</span>
                          <span className="font-bold text-sky-300">Room {item.room}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLASSROOM TASK NOTEPAD & SCRATCHPAD */}
          {activeTab === 'tasks' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-sky-400" />
                    <span>Class Tasks & Quick Reminders</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Save homework, lab record submissions, and quick study notes locally on your device.
                  </p>
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  {tasks.filter(t => t.completed).length} / {tasks.length} Completed
                </div>
              </div>

              {/* Add New Task Form */}
              <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="e.g. Complete CSE 101 Lab 4 array exercise before 4 PM..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 bg-black/60 text-white placeholder:text-zinc-600 text-xs font-medium focus:outline-none focus:border-sky-400 transition"
                />
                
                <select
                  value={newTaskSubject}
                  onChange={(e) => setNewTaskSubject(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-white/15 bg-black text-white text-xs font-bold focus:outline-none focus:border-sky-400"
                >
                  <option value="General">General Task</option>
                  <option value="CSE 101">CSE 101 (C Prog)</option>
                  <option value="FIC 102">FIC 102 (Physics)</option>
                  <option value="FIC 103">FIC 103 (Calculus)</option>
                  <option value="SEC 101">SEC 101 (Aptitude)</option>
                  <option value="AEC 101">AEC 101 (Skills)</option>
                  <option value="VAC 101">VAC 101 (EVS)</option>
                </select>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs transition flex items-center justify-center gap-1.5 shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Note</span>
                </button>
              </form>

              {/* Task Items List */}
              <div className="space-y-2 pt-2 max-h-60 overflow-y-auto pr-1">
                {tasks.length === 0 ? (
                  <div className="p-6 text-center liquid-glass rounded-xl text-xs text-zinc-500">
                    No active tasks. Add a reminder for your upcoming lectures or assignments above.
                  </div>
                ) : (
                  tasks.map(task => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl liquid-glass flex items-center justify-between gap-3 transition-all ${
                        task.completed ? 'opacity-50' : 'hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition border ${
                            task.completed
                              ? 'bg-sky-500 border-sky-400 text-black'
                              : 'border-white/30 hover:border-sky-400 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <div className="min-w-0">
                          <p className={`text-xs font-medium text-white truncate ${task.completed ? 'line-through text-zinc-400' : ''}`}>
                            {task.text}
                          </p>
                          <span className="text-[10px] font-mono text-sky-300/80">
                            {task.subject}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-zinc-500 hover:text-rose-400 transition p-1"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL 1: CAMPUS ROOM NAVIGATOR & DIRECTIONS */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setSelectedRoom(null)} 
          />
          <div className="relative w-full max-w-lg liquid-glass bg-black/95 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-sky-400/30 z-10 space-y-5 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Room {selectedRoom.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {selectedRoom.building}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedRoom(null)}
                className="p-1.5 rounded-xl liquid-glass text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="liquid-glass p-3 rounded-2xl">
                <p className="text-[10px] uppercase font-black tracking-wider text-zinc-400">Floor Level</p>
                <p className="text-sm font-bold text-white mt-0.5">{selectedRoom.floor || 'Level 3'}</p>
              </div>
              <div className="liquid-glass p-3 rounded-2xl">
                <p className="text-[10px] uppercase font-black tracking-wider text-zinc-400">Facility Type</p>
                <p className="text-sm font-bold text-white mt-0.5 truncate">{selectedRoom.type || 'Lecture Classroom'}</p>
              </div>
            </div>

            {/* Elevator & Walking Directions */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                <span>Indoor Walking Directions</span>
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed liquid-glass p-3.5 rounded-2xl border border-white/10">
                {selectedRoom.directions || 'Follow central corridor signs in the academic block.'}
              </p>
            </div>

            {/* Room Features */}
            {selectedRoom.features && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Room Amenities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRoom.features.map((f, i) => (
                    <span key={i} className="text-[10px] font-bold text-zinc-300 liquid-glass-pill px-2.5 py-1 rounded-xl">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedRoom(null)}
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs transition shadow-md"
            >
              Close Navigator
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: TIMELINE PERIOD PREVIEW MODAL */}
      {previewPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setPreviewPeriod(null)} 
          />
          <div className="relative w-full max-w-md liquid-glass bg-black/95 rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-sky-400/30 z-10 space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                  Period {previewPeriod.period} Details
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {previewPeriod.subject}
                </h3>
              </div>
              <button
                onClick={() => setPreviewPeriod(null)}
                className="p-1.5 rounded-xl liquid-glass text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-zinc-400 font-medium">Subject Code:</span>
                <span className="text-white font-mono font-bold">{previewPeriod.subjectCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-zinc-400 font-medium">Faculty:</span>
                <span className="text-white font-bold">{previewPeriod.faculty}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-zinc-400 font-medium">Scheduled Time:</span>
                <span className="text-white font-mono font-bold">{previewPeriod.startTime} - {previewPeriod.endTime}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5 items-center">
                <span className="text-zinc-400 font-medium">Classroom / Lab:</span>
                <button
                  onClick={() => {
                    const roomInfo = ROOM_DIRECTORY[previewPeriod.room] || { name: previewPeriod.room, building: 'SRM AP Campus', floor: 'Level 3', directions: 'Follow signage' };
                    setPreviewPeriod(null);
                    setSelectedRoom(roomInfo);
                  }}
                  className="text-sky-300 font-bold liquid-glass-pill px-2.5 py-0.5 rounded-lg flex items-center gap-1 hover:text-white"
                >
                  <MapPin className="w-3 h-3 text-sky-400" />
                  <span>Room {previewPeriod.room} (Directions)</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setPreviewPeriod(null)}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs transition mt-2"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
