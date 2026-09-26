import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { 
  RefreshCw, 
  FileText, 
  ExternalLink, 
  Download, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  BookOpen, 
  Calendar, 
  User, 
  Link as LinkIcon, 
  Eye, 
  X, 
  GraduationCap, 
  Copy, 
  Check, 
  Folder, 
  Clock, 
  FileCode,
  Bookmark,
  ChevronDown,
  ChevronUp,
  BookMarked
} from 'lucide-react';

// ==========================================
// BESPOKE STUDY DOODLE SVG COMPONENTS
// ==========================================
function DoodleBook({ className = "w-6 h-6 text-amber-300" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 36c6-4 12-4 18 0 6-4 12-4 18 0V10c-6-4-12-4-18 0-6-4-12-4-18 0v26z" fill="currentColor" fillOpacity="0.12" />
      <path d="M24 10v26" />
      <path d="M12 18h6M12 24h6M30 18h6M30 24h6" strokeWidth="2" strokeDasharray="1 3" />
    </svg>
  );
}

function DoodlePencil({ className = "w-6 h-6 text-indigo-300" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M34 6l8 8L16 40H8v-8L34 6z" fill="currentColor" fillOpacity="0.12" />
      <path d="M28 12l8 8" />
      <path d="M8 40l4-1 1-4" />
      <path d="M38 10l-4-4" strokeDasharray="2 2" />
    </svg>
  );
}

function DoodleGradCap({ className = "w-6 h-6 text-emerald-300" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 8L4 18l20 10 20-10L24 8z" fill="currentColor" fillOpacity="0.12" />
      <path d="M10 21.5v11c0 5 6.3 9 14 9s14-4 14-9v-11" />
      <path d="M40 20v14c0 2-2 3-3 3" />
      <circle cx="37" cy="38" r="1.5" fill="currentColor" />
    </svg>
  );
}

function DoodleLightbulb({ className = "w-6 h-6 text-yellow-300" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 36h12m-10 4h8m-10-8h12c0-8 8-8 8-16a12 12 0 10-24 0c0 8 8 8 8 16z" fill="currentColor" fillOpacity="0.12" />
      <path d="M24 4v3M10 10l2 2M38 10l-2 2M6 24h3M39 24h3" strokeDasharray="2 3" />
    </svg>
  );
}

function DoodleCoffee({ className = "w-6 h-6 text-rose-300" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 18h24v14a8 8 0 01-8 8H16a8 8 0 01-8-8V18z" fill="currentColor" fillOpacity="0.12" />
      <path d="M32 22h4a4 4 0 010 8h-4" />
      <path d="M6 42h28" />
      <path d="M16 12c0-2 2-4 2-6M24 12c0-2 2-4 2-6" strokeDasharray="2 2" />
    </svg>
  );
}

function DoodleAtom({ className = "w-6 h-6 text-cyan-300" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(30 24 24)" />
      <ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(-30 24 24)" />
      <circle cx="24" cy="24" r="3.5" fill="currentColor" />
    </svg>
  );
}

function DoodlePaperclip({ className = "w-5 h-5 text-zinc-400" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export default function GoogleClassroomVault() {
  const { isAdmin } = useAuth();
  const { classroomFeed, classroomStatus, syncClassroomFeed, connectGoogleClassroom, disconnectGoogleClassroom } = useData();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectTab, setSelectedSubjectTab] = useState('All');
  const [selectedType, setSelectedType] = useState('All'); // 'All' | 'material' | 'announcement' | 'assignment'
  const [syncing, setSyncing] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});

  const localRefreshToken = localStorage.getItem('srmap_gc_refresh_token');

  // Filter feed items based on search & type
  const filteredFeed = useMemo(() => {
    return (classroomFeed || []).filter(item => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.text || '').toLowerCase().includes(q) ||
        (item.faculty || '').toLowerCase().includes(q) ||
        (item.courseName || '').toLowerCase().includes(q) ||
        (item.attachments || []).some(a => (a.title || '').toLowerCase().includes(q));

      const matchesType = selectedType === 'All' || item.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [classroomFeed, searchTerm, selectedType]);

  // Group items by Subject/Course
  const groupedCourses = useMemo(() => {
    const groups = {};
    for (const item of filteredFeed) {
      const subject = item.courseName || item.courseCode || 'General Section D Course';
      if (!groups[subject]) {
        groups[subject] = {
          courseName: subject,
          courseCode: item.courseCode || '',
          section: item.section || 'Section D',
          faculty: item.faculty || 'Course Instructor',
          items: []
        };
      }
      groups[subject].items.push(item);
    }

    // Sort items within each group newest first
    for (const sub in groups) {
      groups[sub].items.sort((a, b) => new Date(b.creationTime || 0) - new Date(a.creationTime || 0));
    }

    return groups;
  }, [filteredFeed]);

  const courseNamesList = useMemo(() => {
    return Object.keys(groupedCourses);
  }, [groupedCourses]);

  // Filter groups according to top tab selection
  const displayedGroups = useMemo(() => {
    if (selectedSubjectTab === 'All') return groupedCourses;
    if (groupedCourses[selectedSubjectTab]) {
      return { [selectedSubjectTab]: groupedCourses[selectedSubjectTab] };
    }
    return {};
  }, [groupedCourses, selectedSubjectTab]);

  // Compute stats dynamically
  const stats = useMemo(() => {
    const feed = classroomFeed || [];
    let pdfCount = 0;
    for (const item of feed) {
      for (const a of item.attachments || []) {
        if (a.fileType === 'pdf' || (a.title || '').toLowerCase().endsWith('.pdf')) {
          pdfCount++;
        }
      }
    }
    return {
      totalItems: feed.length,
      pdfCount,
      totalSubjects: Object.keys(groupedCourses).length
    };
  }, [classroomFeed, groupedCourses]);

  const toggleSection = (subjectName) => {
    setCollapsedSections(prev => ({
      ...prev,
      [subjectName]: !prev[subjectName]
    }));
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncClassroomFeed();
      addToast(`Classroom synced! Mirrored ${res.count || (classroomFeed || []).length} materials.`, 'success');
    } catch (err) {
      addToast(err.message || 'Sync failed. Please check connection.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleConnect = async () => {
    try {
      await connectGoogleClassroom();
    } catch (err) {
      addToast(err.message, 'error');
      setIsHelpModalOpen(true);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect Google Classroom? Cached feed will be cleared.')) {
      try {
        await disconnectGoogleClassroom();
        addToast('Google Classroom disconnected.', 'info');
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  const handleCopyRefreshToken = () => {
    if (!localRefreshToken) return;
    navigator.clipboard.writeText(localRefreshToken);
    setCopiedToken(true);
    addToast('Refresh token copied to clipboard!', 'success');
    setTimeout(() => setCopiedToken(false), 3000);
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ========================================== */}
      {/* CLASSIC ACADEMIC HEADER WITH STUDY DOODLES */}
      {/* ========================================== */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
        {/* Playful Floating Academic Doodles */}
        <div className="absolute -top-3 -right-3 opacity-20 pointer-events-none rotate-12 hover:opacity-40 transition">
          <DoodleGradCap className="w-28 h-28 text-indigo-300" />
        </div>
        <div className="absolute top-1/2 right-1/4 opacity-15 pointer-events-none -rotate-6">
          <DoodleBook className="w-16 h-16 text-amber-300" />
        </div>
        <div className="absolute bottom-3 right-12 opacity-15 pointer-events-none rotate-45">
          <DoodlePencil className="w-16 h-16 text-emerald-300" />
        </div>
        <div className="absolute top-4 left-1/3 opacity-15 pointer-events-none">
          <DoodleAtom className="w-14 h-14 text-cyan-300" />
        </div>
        <div className="absolute bottom-4 left-1/4 opacity-15 pointer-events-none rotate-12">
          <DoodleCoffee className="w-12 h-12 text-rose-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300 shadow-inner">
              <DoodleBook className="w-4 h-4 text-amber-400" />
              <span>SRM AP &bull; Section D Academic Vault</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Google Classroom Live Sync Hub</span>
              <DoodleLightbulb className="w-6 h-6 text-yellow-400 inline-block animate-pulse" />
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Mirroring lecture notes, reference PDFs, lab manuals, and notices organized neatly by classroom subjects for all Section D classmates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Connection Badge */}
            <div className="px-3.5 py-2 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center gap-2 text-xs">
              {classroomStatus.isConnected ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-emerald-300">Classroom Connected</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="font-semibold text-slate-300">Ready to Sync</span>
                </>
              )}
            </div>

            {/* Sync Now Button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 active:scale-95 text-slate-900 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-indigo-600' : 'text-slate-900'}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Feed'}</span>
            </button>

            {/* Admin Connect / Disconnect Controls */}
            {isAdmin && (
              classroomStatus.isConnected ? (
                <button
                  onClick={handleDisconnect}
                  className="px-3.5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition cursor-pointer"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Connect Google Account</span>
                </button>
              )
            )}

            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Classroom Setup Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Academic Quick Stat Chips */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-800/40 rounded-2xl p-3 text-center border border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subjects Enrolled</span>
            <span className="text-xl font-bold font-serif text-white">{stats.totalSubjects}</span>
          </div>
          <div className="bg-slate-800/40 rounded-2xl p-3 text-center border border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PDFs & Documents</span>
            <span className="text-xl font-bold font-serif text-cyan-300">{stats.pdfCount}</span>
          </div>
          <div className="bg-slate-800/40 rounded-2xl p-3 text-center border border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Materials</span>
            <span className="text-xl font-bold font-serif text-amber-300">{stats.totalItems}</span>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SEARCH & FILTER CONTROLS */}
      {/* ========================================== */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by topic, unit name, faculty, or PDF filename..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-700 bg-slate-900/90 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs sm:text-sm font-medium transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'All', label: 'All Resources' },
              { id: 'material', label: '📄 Notes & PDFs' },
              { id: 'announcement', label: '📌 Notices' },
              { id: 'assignment', label: '📝 Lab & Assignments' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedType === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course Jump Tabs Ribbon */}
        {courseNamesList.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 pl-1 flex-shrink-0">
              <Bookmark className="w-3.5 h-3.5 text-amber-400" /> Subjects:
            </span>
            <button
              onClick={() => setSelectedSubjectTab('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                selectedSubjectTab === 'All'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Subjects ({courseNamesList.length})
            </button>
            {courseNamesList.map(courseName => (
              <button
                key={courseName}
                onClick={() => setSelectedSubjectTab(courseName)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                  selectedSubjectTab === courseName
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {courseName} ({groupedCourses[courseName]?.items?.length || 0})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* SECTIONS FOR DIFFERENT CLASSROOM SUBJECTS */}
      {/* ========================================== */}
      {Object.keys(displayedGroups).length === 0 ? (
        <div className="bg-slate-900/60 rounded-3xl p-12 text-center space-y-4 border border-slate-800 relative overflow-hidden">
          <div className="flex justify-center items-center gap-4 text-slate-600">
            <DoodleBook className="w-8 h-8 text-amber-400/40" />
            <DoodleGradCap className="w-10 h-10 text-indigo-400/50" />
            <DoodlePencil className="w-8 h-8 text-emerald-400/40" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-serif font-bold text-white">
              {(classroomFeed || []).length === 0 
                ? 'No Classroom Courses Connected Yet' 
                : 'No Materials Found For This Filter'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {(classroomFeed || []).length === 0
                ? 'Connect your SRM AP Google Account or click "Sync Feed" to mirror all Section D Classroom subjects and PDF lecture notes.'
                : 'Try clearing your search keyword or switching to "All Resources" to view other course materials.'}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            {(classroomFeed || []).length === 0 ? (
              isAdmin ? (
                <button
                  onClick={handleConnect}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-bold text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Connect Google Account</span>
                </button>
              ) : (
                <button
                  onClick={handleSync}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-indigo-600" />
                  <span>Refresh Classroom Feed</span>
                </button>
              )
            ) : (
              <button
                onClick={() => { setSearchTerm(''); setSelectedSubjectTab('All'); setSelectedType('All'); }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer border border-slate-700"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(displayedGroups).map(([subjectName, group], groupIdx) => {
            const isCollapsed = Boolean(collapsedSections[subjectName]);
            const pdfsInGroup = group.items.reduce((acc, it) => {
              return acc + (it.attachments || []).filter(a => a.fileType === 'pdf' || (a.title || '').toLowerCase().endsWith('.pdf')).length;
            }, 0);

            return (
              <div 
                key={subjectName} 
                className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-lg transition-all"
              >
                {/* SECTION HEADER: Subject Folder Shelf */}
                <div 
                  onClick={() => toggleSection(subjectName)}
                  className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800/80 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-850/80 transition select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-950/60 border border-indigo-700/40 text-indigo-300 flex items-center justify-center flex-shrink-0 shadow-inner">
                      {groupIdx % 3 === 0 && <DoodleBook className="w-5 h-5 text-amber-300" />}
                      {groupIdx % 3 === 1 && <DoodleAtom className="w-5 h-5 text-cyan-300" />}
                      {groupIdx % 3 === 2 && <DoodlePencil className="w-5 h-5 text-emerald-300" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-serif font-bold text-white truncate">
                          {subjectName}
                        </h2>
                        {group.courseCode && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700">
                            {group.courseCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Instructor: <strong className="text-slate-300 font-medium">{group.faculty}</strong></span>
                        <span>&bull;</span>
                        <span>{group.items.length} {group.items.length === 1 ? 'post' : 'posts'}</span>
                        {pdfsInGroup > 0 && (
                          <>
                            <span>&bull;</span>
                            <span className="text-cyan-300 font-semibold">{pdfsInGroup} {pdfsInGroup === 1 ? 'PDF' : 'PDFs'}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {isCollapsed ? 'Expand' : 'Collapse'}
                    </span>
                    <button 
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                      aria-label="Toggle Section"
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* SECTION BODY: Grid of Cards for this subject */}
                {!isCollapsed && (
                  <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40">
                    {group.items.map((item) => (
                      <div 
                        key={item.id}
                        className="bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-3.5 transition shadow-sm hover:shadow-md group relative"
                      >
                        {/* Card Header */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                              item.type === 'assignment'
                                ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                                : item.type === 'announcement'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                            }`}>
                              {item.type === 'assignment' ? '📝 Assignment' : item.type === 'announcement' ? '📌 Notice' : '📄 Lecture Notes'}
                            </span>

                            <span className="text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {formatTime(item.creationTime)}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-200 transition-colors leading-snug">
                            {item.title}
                          </h3>

                          {item.text && (
                            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-normal whitespace-pre-line">
                              {item.text}
                            </p>
                          )}
                        </div>

                        {/* Card Attachments & Footer */}
                        <div className="space-y-2.5 pt-2.5 border-t border-slate-800/80">
                          {item.dueDate && (
                            <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Submission Deadline: {item.dueDate}</span>
                            </div>
                          )}

                          {(item.attachments && item.attachments.length > 0) ? (
                            <div className="space-y-2">
                              {item.attachments.map((att, attIdx) => {
                                const isPdf = att.fileType === 'pdf' || (att.title || '').toLowerCase().endsWith('.pdf');
                                return (
                                  <div 
                                    key={attIdx}
                                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        isPdf ? 'bg-rose-500/15 text-rose-400' : 'bg-indigo-500/15 text-indigo-400'
                                      }`}>
                                        {isPdf ? <FileText className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-200 truncate">
                                          {att.title}
                                        </p>
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                                          {isPdf ? 'PDF Slide/Doc' : (att.fileType || 'Drive Link')}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      {isPdf && att.driveFileId && (
                                        <button
                                          onClick={() => setPreviewFile({
                                            title: att.title,
                                            url: `https://drive.google.com/file/d/${att.driveFileId}/preview`,
                                            downloadUrl: att.url || att.alternateLink
                                          })}
                                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                                          title="Quick Preview PDF"
                                        >
                                          <Eye className="w-3 h-3" />
                                          <span className="hidden sm:inline">Preview</span>
                                        </button>
                                      )}

                                      <a
                                        href={att.url || att.alternateLink || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                                      >
                                        <span>{isPdf ? 'Open PDF' : 'View'}</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 italic">
                              Classroom announcement notice.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================== */}
      {/* INLINE PDF PREVIEW MODAL */}
      {/* ========================================== */}
      {previewFile && (
        <Modal
          isOpen={Boolean(previewFile)}
          onClose={() => setPreviewFile(null)}
          title={previewFile.title || 'PDF Document Viewer'}
        >
          <div className="space-y-4">
            <div className="w-full h-[65vh] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
              <iframe
                src={previewFile.url}
                title={previewFile.title}
                className="w-full h-full border-none"
                allow="autoplay"
              ></iframe>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <a
                href={previewFile.downloadUrl || previewFile.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Google Drive</span>
              </a>

              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================== */}
      {/* CLASSROOM SETUP & CLOUD SYNC MODAL */}
      {/* ========================================== */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Google Classroom Live Sync Guide"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          <p className="leading-relaxed">
            The <strong>Section D Google Classroom Vault</strong> automatically queries Google Classroom API to mirror PDF lecture slides, lab manuals, and notices directly to your classmates.
          </p>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <DoodleGradCap className="w-4 h-4 text-indigo-400" />
              <span>How to link your @srmap.edu.in account:</span>
            </h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-300 text-xs">
              <li>Click <strong>Connect Google Account</strong> as Class Representative.</li>
              <li>Sign in with your institutional SRM AP Google account (<code>avigayan_jana@srmap.edu.in</code>).</li>
              <li>Grant Read-Only permissions for Google Classroom courses and Drive attachments.</li>
              <li>Your Section D courses will instantly sync and be organized by subject for all classmates.</li>
            </ol>
          </div>

          {/* CR Refresh Token Box for Permanent 24/7 Serverless Sync */}
          {localRefreshToken && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>24/7 Cloud Background Sync Token</span>
                </span>
                <button
                  onClick={handleCopyRefreshToken}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedToken ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedToken ? 'Copied!' : 'Copy Token'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                To enable 24/7 automatic syncing on Vercel without keeping your browser active, add this in <strong>Vercel Project Settings &rarr; Environment Variables</strong>:
              </p>
              <div className="p-2 rounded-xl bg-black/60 font-mono text-[10px] text-indigo-300 select-all break-all border border-indigo-500/20">
                Key: <strong>GOOGLE_CLASSROOM_REFRESH_TOKEN</strong>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <strong>All Classmates Covered:</strong> Once authorized, all 58 students in Section D can view, preview, and download mirrored PDFs without needing individual Google Cloud API setups.
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="px-5 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-bold text-xs transition"
            >
              Got It
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
