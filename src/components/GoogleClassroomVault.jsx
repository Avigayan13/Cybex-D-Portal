import React, { useState, useMemo } from 'react';
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
  Check,
  Eye,
  X,
  FileSpreadsheet,
  Clock,
  ArrowUpDown,
  BookMarked
} from 'lucide-react';

export default function GoogleClassroomVault() {
  const { isAdmin } = useAuth();
  const { classroomFeed, classroomStatus, syncClassroomFeed, connectGoogleClassroom, disconnectGoogleClassroom } = useData();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedType, setSelectedType] = useState('All'); // 'All' | 'material' | 'announcement' | 'assignment'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'course'
  const [syncing, setSyncing] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const localRefreshToken = localStorage.getItem('srmap_gc_refresh_token');

  // Extract unique courses from real synced feed
  const availableCourses = useMemo(() => {
    const list = ['All'];
    const seen = new Set();
    for (const f of classroomFeed || []) {
      const name = f.courseName || f.courseCode;
      if (name && !seen.has(name)) {
        seen.add(name);
        list.push(name);
      }
    }
    return list;
  }, [classroomFeed]);

  // Compute stats dynamically
  const stats = useMemo(() => {
    const feed = classroomFeed || [];
    let pdfs = 0;
    let notices = 0;
    let assignments = 0;

    for (const item of feed) {
      if (item.type === 'announcement') notices++;
      if (item.type === 'assignment') assignments++;
      for (const a of item.attachments || []) {
        if (a.fileType === 'pdf' || (a.title || '').toLowerCase().endsWith('.pdf')) {
          pdfs++;
        }
      }
    }

    return {
      total: feed.length,
      pdfs,
      notices,
      assignments,
      coursesCount: Math.max(0, availableCourses.length - 1)
    };
  }, [classroomFeed, availableCourses]);

  // Filter & Sort Items
  const filteredAndSortedItems = useMemo(() => {
    let result = (classroomFeed || []).filter(item => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.text || '').toLowerCase().includes(q) ||
        (item.faculty || '').toLowerCase().includes(q) ||
        (item.courseName || '').toLowerCase().includes(q) ||
        (item.attachments || []).some(a => (a.title || '').toLowerCase().includes(q));

      const matchesCourse = selectedCourse === 'All' || 
        (item.courseName || '').toLowerCase().includes(selectedCourse.toLowerCase()) ||
        (item.courseCode || '').toLowerCase().includes(selectedCourse.toLowerCase());

      const matchesType = selectedType === 'All' || item.type === selectedType;

      return matchesSearch && matchesCourse && matchesType;
    });

    result.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.creationTime || 0) - new Date(b.creationTime || 0);
      }
      if (sortBy === 'course') {
        return (a.courseName || '').localeCompare(b.courseName || '');
      }
      return new Date(b.creationTime || 0) - new Date(a.creationTime || 0);
    });

    return result;
  }, [classroomFeed, searchTerm, selectedCourse, selectedType, sortBy]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncClassroomFeed();
      addToast(`Classroom synced! Loaded ${res.count || (classroomFeed || []).length} materials.`, 'success');
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

  // Subject color mapper for visual tags
  const getSubjectColorClass = (name = '') => {
    const s = name.toLowerCase();
    if (s.includes('os') || s.includes('operating')) return 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10';
    if (s.includes('dbms') || s.includes('database')) return 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10';
    if (s.includes('network') || s.includes('dcn')) return 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10';
    if (s.includes('math') || s.includes('mat')) return 'border-purple-500/30 text-purple-300 bg-purple-500/10';
    if (s.includes('uhv') || s.includes('value')) return 'border-amber-500/30 text-amber-300 bg-amber-500/10';
    if (s.includes('evs') || s.includes('environment')) return 'border-lime-500/30 text-lime-300 bg-lime-500/10';
    return 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Sync Control Header */}
      <div className="liquid-glass p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs font-bold text-indigo-300">
              <FolderGit2 className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Google Classroom Live Sync Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Section D Classroom Feed & Materials
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              Directly mirrors real-time lecture slides, PDF documents, lab sheets, and faculty announcements from your Section D Google Classroom courses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Connection Status Badge */}
            <div className="liquid-glass px-4 py-2.5 rounded-2xl flex items-center gap-2.5 border border-white/15 text-xs shadow-inner">
              {classroomStatus.isConnected ? (
                <>
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                  </div>
                  <span className="font-black text-emerald-400 tracking-wide uppercase text-[11px]">Classroom Live Connected</span>
                </>
              ) : (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <span className="font-bold text-zinc-300">Ready to Connect</span>
                </>
              )}
            </div>

            {/* Sync Now Button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Feed'}</span>
            </button>

            {/* Admin Connect / Disconnect Buttons */}
            {isAdmin && (
              classroomStatus.isConnected ? (
                <button
                  onClick={handleDisconnect}
                  className="px-3.5 py-2.5 rounded-2xl liquid-glass-pill text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 text-xs font-bold transition cursor-pointer border border-rose-500/20"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 hover:scale-105"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Connect Google Account</span>
                </button>
              )
            )}

            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="p-2.5 rounded-2xl liquid-glass-pill text-zinc-400 hover:text-white transition cursor-pointer border border-white/10"
              title="Classroom Setup & Info"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Sync Stats Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="liquid-glass p-3.5 rounded-2xl text-center border border-white/5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Synced Items</span>
            <span className="text-2xl font-black text-white">{stats.total}</span>
          </div>
          <div className="liquid-glass p-3.5 rounded-2xl text-center border border-white/5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">PDF Materials</span>
            <span className="text-2xl font-black text-cyan-400">{stats.pdfs}</span>
          </div>
          <div className="liquid-glass p-3.5 rounded-2xl text-center border border-white/5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Classroom Courses</span>
            <span className="text-2xl font-black text-emerald-400">{stats.coursesCount}</span>
          </div>
          <div className="liquid-glass p-3.5 rounded-2xl text-center border border-white/5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Assignments</span>
            <span className="text-2xl font-black text-purple-400">{stats.assignments}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3">
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
              placeholder="Search PDF titles, topics, faculty names, assignments, or notices..."
              className="w-full pl-10 pr-9 py-3 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md text-white placeholder:text-zinc-500 focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none text-xs sm:text-sm font-medium transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'All', label: 'All Items' },
              { id: 'material', label: '📄 Lecture Notes & PDFs' },
              { id: 'announcement', label: '📌 Notices' },
              { id: 'assignment', label: '📝 Assignments' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedType === tab.id
                    ? 'bg-white text-black shadow-lg scale-102'
                    : 'liquid-glass text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort classroom materials"
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/10 text-xs font-bold text-zinc-300 outline-none focus:border-white/30 cursor-pointer"
            >
              <option value="newest">📅 Newest First</option>
              <option value="oldest">⏳ Oldest First</option>
              <option value="course">📚 Sort by Course</option>
            </select>
          </div>
        </div>

        {/* Dynamic Course Filter Pills */}
        {availableCourses.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1 pl-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter Course:
            </span>
            {availableCourses.map(course => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCourse === course
                    ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'liquid-glass text-zinc-400 hover:text-white border border-white/5 hover:border-white/20'
                }`}
              >
                {course}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feed Cards Grid / Empty State */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="liquid-glass rounded-3xl p-12 text-center space-y-4 border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <BookMarked className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">
              {(classroomFeed || []).length === 0 
                ? 'No Classroom Materials Synced Yet' 
                : 'No materials match your active filter'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {(classroomFeed || []).length === 0
                ? 'Click "Connect Google Account" or "Sync Feed" to mirror your Section D Google Classroom courses and PDF lecture notes.'
                : 'Try clearing your search query or selecting "All Items" to view all synced classroom materials.'}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            {(classroomFeed || []).length === 0 ? (
              isAdmin ? (
                <button
                  onClick={handleConnect}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs transition shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Connect Google Account</span>
                </button>
              ) : (
                <button
                  onClick={handleSync}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Feed</span>
                </button>
              )
            ) : (
              <button
                onClick={() => { setSearchTerm(''); setSelectedCourse('All'); setSelectedType('All'); }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAndSortedItems.map((item) => (
            <div 
              key={item.id} 
              className="liquid-glass p-6 rounded-3xl border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between space-y-4 group relative overflow-hidden shadow-xl"
            >
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition duration-500 pointer-events-none"></div>

              {/* Card Top: Subject Pill, Type Badge, Timestamp */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-[11px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${getSubjectColorClass(item.courseName || item.courseCode)}`}>
                    {item.courseName || item.courseCode || 'Section D Course'}
                  </span>

                  <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    {formatTime(item.creationTime)}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-indigo-200 transition-colors line-clamp-2">
                  {item.title}
                </h3>

                {item.text && (
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 font-normal whitespace-pre-line">
                    {item.text}
                  </p>
                )}
              </div>

              {/* Attachments & Actions Footer */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                {/* Faculty & Due Date Metadata */}
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{item.faculty || 'Course Instructor'}</span>
                  </span>
                  {item.dueDate && (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due: {item.dueDate}</span>
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
                          className="p-3 rounded-2xl bg-black/60 border border-white/10 hover:border-indigo-500/40 transition flex items-center justify-between gap-3 group/att"
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
                                {isPdf ? 'PDF Document' : (att.fileType || 'Attachment')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Inline Preview Trigger */}
                            {isPdf && att.driveFileId && (
                              <button
                                onClick={() => setPreviewFile({
                                  title: att.title,
                                  url: `https://drive.google.com/file/d/${att.driveFileId}/preview`,
                                  downloadUrl: att.url || att.alternateLink
                                })}
                                className="px-2.5 py-1.5 rounded-xl liquid-glass-pill hover:bg-white/10 text-indigo-300 hover:text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Quick Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Preview</span>
                              </button>
                            )}

                            {/* Direct Open Link */}
                            <a
                              href={att.url || att.alternateLink || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-[11px] font-black transition flex items-center gap-1 shadow hover:scale-105 active:scale-95"
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

      {/* Inline PDF Preview Modal */}
      {previewFile && (
        <Modal
          isOpen={Boolean(previewFile)}
          onClose={() => setPreviewFile(null)}
          title={previewFile.title || 'Classroom PDF Document Preview'}
        >
          <div className="space-y-4">
            <div className="w-full h-[65vh] rounded-2xl overflow-hidden bg-black/90 border border-white/10 relative">
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
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Google Classroom Setup & Cloud Sync Modal */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Google Classroom Live Sync Setup"
      >
        <div className="space-y-4 text-xs sm:text-sm text-zinc-300">
          <p className="leading-relaxed">
            The <strong>CYBEX D Google Classroom Vault</strong> mirrors real-time lecture slides, PDF documents, lab sheets, and notices from your SRM AP Section D courses for all 58 students.
          </p>

          <div className="p-4 rounded-2xl liquid-glass border border-indigo-500/30 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>How to authorize with your @srmap.edu.in account:</span>
            </h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-zinc-300 text-xs">
              <li>Click <strong>Connect Google Account</strong> as Class Representative.</li>
              <li>Sign in with your institutional SRM AP Google account (<code>avigayan_jana@srmap.edu.in</code>).</li>
              <li>Grant Read-Only permissions for Google Classroom courses and Drive attachments.</li>
              <li>Your Section D courses will instantly sync and be mirrored to all classmates.</li>
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
                Want 24/7 automatic sync on Vercel without keeping your browser open? Add this variable in <strong>Vercel Project Settings &rarr; Environment Variables</strong>:
              </p>
              <div className="p-2 rounded-xl bg-black/60 font-mono text-[10px] text-indigo-300 select-all break-all border border-indigo-500/20">
                Key: <strong>GOOGLE_CLASSROOM_REFRESH_TOKEN</strong>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-zinc-400">
            <strong>All Classmates Covered:</strong> Once authorized, all 58 students in Section D can view, preview, and download mirrored PDFs without needing individual Google Cloud API setups.
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
