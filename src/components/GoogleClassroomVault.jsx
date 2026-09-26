import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { 
  FolderGit2, 
  RefreshCw, 
  FileText, 
  ExternalLink, 
  Download, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  BookOpen, 
  Calendar, 
  User, 
  Link as LinkIcon, 
  Video, 
  Layers,
  FileCode,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  Copy,
  Check
} from 'lucide-react';

export default function GoogleClassroomVault() {
  const { isAdmin } = useAuth();
  const { classroomFeed, classroomStatus, syncClassroomFeed, connectGoogleClassroom, disconnectGoogleClassroom } = useData();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedType, setSelectedType] = useState('All'); // 'All' | 'material' | 'announcement' | 'assignment'
  const [syncing, setSyncing] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const localRefreshToken = localStorage.getItem('srmap_gc_refresh_token');

  // Extract unique courses from feed
  const availableCourses = ['All', ...new Set((classroomFeed || []).map(f => f.courseName || f.courseCode).filter(Boolean))];

  // Filter items based on search and filters
  const filteredItems = (classroomFeed || []).filter(item => {
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.faculty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.courseName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.attachments || []).some(a => (a.title || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCourse = selectedCourse === 'All' || 
      (item.courseName || '').toLowerCase().includes(selectedCourse.toLowerCase()) ||
      (item.courseCode || '').toLowerCase().includes(selectedCourse.toLowerCase());

    const matchesType = selectedType === 'All' || item.type === selectedType;

    return matchesSearch && matchesCourse && matchesType;
  });

  // Calculate stats
  const totalPdfCount = (classroomFeed || []).reduce((acc, item) => {
    return acc + (item.attachments || []).filter(a => a.fileType === 'pdf' || (a.title || '').toLowerCase().endsWith('.pdf')).length;
  }, 0);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncClassroomFeed();
      addToast(`Classroom synced! Loaded ${res.count || (classroomFeed || []).length} materials and notices.`, 'success');
    } catch (err) {
      addToast(err.message || 'Sync completed with cached classroom feed.', 'info');
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
    if (window.confirm('Are you sure you want to disconnect Google Classroom?')) {
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

  // Helper to format timestamps
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
    <div className="space-y-6">
      {/* Top Banner & Sync Control Header */}
      <div className="liquid-glass p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-bold text-indigo-300">
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Google Classroom Live Sync Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Classroom Files, PDFs & Notices
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              Directly mirrors materials, lecture PDFs, lab sheets, and faculty announcements from your Section D Google Classroom courses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Indicator */}
            <div className="liquid-glass px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/15 text-xs">
              {classroomStatus.isConnected ? (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="font-bold text-emerald-400">Classroom Live Connected</span>
                </>
              ) : (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                  <span className="font-bold text-zinc-300">Section D Course Vault</span>
                </>
              )}
            </div>

            {/* Sync Now Button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Feed'}</span>
            </button>

            {/* Admin Connection Control */}
            {isAdmin && (
              classroomStatus.isConnected ? (
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-2 rounded-2xl liquid-glass-pill text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 text-xs font-bold transition cursor-pointer"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  className="px-4 py-2.5 rounded-2xl liquid-glass-pill hover:bg-white/10 text-indigo-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Connect Google Account</span>
                </button>
              )
            )}

            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="p-2.5 rounded-2xl liquid-glass-pill text-zinc-400 hover:text-white transition cursor-pointer"
              title="Classroom Setup Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="liquid-glass p-3 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Items</span>
            <span className="text-xl font-black text-white">{(classroomFeed || []).length}</span>
          </div>
          <div className="liquid-glass p-3 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">PDF Documents</span>
            <span className="text-xl font-black text-indigo-400">{totalPdfCount}</span>
          </div>
          <div className="liquid-glass p-3 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Active Courses</span>
            <span className="text-xl font-black text-emerald-400">{Math.max(1, availableCourses.length - 1)}</span>
          </div>
          <div className="liquid-glass p-3 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Real-Time Sync</span>
            <span className="text-xl font-black text-amber-400">100%</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search PDF titles, topics, faculty names, or keywords..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md text-white placeholder:text-zinc-600 focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none text-xs sm:text-sm font-medium transition"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'All', label: 'All' },
              { id: 'material', label: '📄 PDFs & Notes' },
              { id: 'announcement', label: '📌 Notices' },
              { id: 'assignment', label: '📝 Assignments' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedType === tab.id
                    ? 'bg-white text-black shadow-md'
                    : 'liquid-glass text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1 pl-1">
            <Filter className="w-3 h-3" /> Courses:
          </span>
          {availableCourses.map(course => (
            <button
              key={course}
              onClick={() => setSelectedCourse(course)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCourse === course
                  ? 'bg-indigo-600 text-white border border-indigo-400'
                  : 'liquid-glass text-zinc-400 hover:text-white border border-white/5 hover:border-white/20'
              }`}
            >
              {course}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="liquid-glass rounded-3xl p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-zinc-400 border border-white/10">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No classroom materials match your filters</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Try resetting your search query or click "Sync Feed" above to refresh posts from Google Classroom.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCourse('All'); setSelectedType('All'); }}
            className="mt-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="liquid-glass p-6 rounded-3xl border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between space-y-4 group relative overflow-hidden"
            >
              {/* Subtle Ambient Hover Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition duration-500 pointer-events-none"></div>

              {/* Card Header: Subject, Type Tag, Date */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="liquid-glass text-indigo-300 border border-indigo-500/30 text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {item.courseName || item.courseCode || 'Section D Course'}
                  </span>

                  <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    {formatTime(item.creationTime)}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-indigo-200 transition-colors line-clamp-2">
                  {item.title}
                </h3>

                {item.text && (
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 font-normal">
                    {item.text}
                  </p>
                )}
              </div>

              {/* Attachments & Action Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-white/5">
                {/* Faculty badge */}
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{item.faculty || 'Course Faculty'}</span>
                  </span>
                  {item.dueDate && (
                    <span className="text-amber-400 font-bold">
                      Due: {item.dueDate}
                    </span>
                  )}
                </div>

                {/* Attached Files List */}
                {(item.attachments && item.attachments.length > 0) ? (
                  <div className="space-y-2 pt-1">
                    {item.attachments.map((att, idx) => {
                      const isPdf = att.fileType === 'pdf' || (att.title || '').toLowerCase().endsWith('.pdf');
                      return (
                        <div 
                          key={idx}
                          className="p-3 rounded-2xl bg-black/50 border border-white/10 hover:border-white/30 transition flex items-center justify-between gap-3 group/att"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isPdf ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            }`}>
                              {isPdf ? <FileText className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate group-hover/att:text-indigo-300 transition">
                                {att.title}
                              </p>
                              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                {isPdf ? 'PDF Document' : (att.fileType || 'Link')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <a
                              href={att.url || att.alternateLink || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-[11px] font-black transition flex items-center gap-1 shadow hover:scale-105"
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
                  <div className="text-[11px] text-zinc-500 italic pt-1">
                    Notice announcement with no attached files.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Google Classroom Connection Setup Modal */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Google Classroom Integration Setup"
      >
        <div className="space-y-4 text-xs sm:text-sm text-zinc-300">
          <p className="leading-relaxed">
            The <strong>CYBEX D Google Classroom Vault</strong> automatically mirrors PDF lecture notes, lab sheets, and notices from Section D courses directly to all 58 students.
          </p>

          <div className="p-4 rounded-2xl liquid-glass border border-indigo-500/30 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>How to authorize your @srmap.edu.in account:</span>
            </h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-zinc-300 text-xs">
              <li>Make sure <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> are set in Vercel Environment Variables.</li>
              <li>Click <strong>Connect Google Account</strong> as Class Representative.</li>
              <li>Sign in with your institutional SRM AP Google account.</li>
              <li>Grant Read-Only permissions for Classroom courses and Drive attachments.</li>
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
              <p className="text-[11px] text-zinc-300 leading-normal">
                Want 24/7 auto-sync without opening the website? Add this variable in <strong>Vercel Project Settings &rarr; Environment Variables</strong>:
              </p>
              <div className="p-2 rounded-xl bg-black/60 font-mono text-[10px] text-indigo-300 select-all break-all border border-indigo-500/20">
                Key: <strong>GOOGLE_CLASSROOM_REFRESH_TOKEN</strong>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-zinc-400">
            <strong>All Classmates Covered:</strong> Once authorized, all 58 students in Section D can view and download mirrored PDFs without needing individual Google Cloud API setups.
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition"
            >
              Got It
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
