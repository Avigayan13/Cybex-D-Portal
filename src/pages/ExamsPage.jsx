import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { 
  FileCheck2, 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Search, 
  Filter, 
  ShieldCheck, 
  Eye, 
  X, 
  GraduationCap, 
  Tag, 
  Layers, 
  Paperclip,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  Copy,
  Check,
  Award,
  BellRing
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

export default function ExamsPage() {
  const { user, isAdmin } = useAuth();
  const { exams, addExam, updateExam, deleteExam } = useData();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectTab, setSelectedSubjectTab] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [selectedExamDetail, setSelectedExamDetail] = useState(null);
  const [checkedSyllabusTopics, setCheckedSyllabusTopics] = useState({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [collapsedSubjects, setCollapsedSubjects] = useState({});

  // Exam Form State for CR
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Fundamentals of Computing & Programming in C');
  const [subjectCode, setSubjectCode] = useState('CSE 101');
  const [examType, setExamType] = useState('Mid-Term');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [duration, setDuration] = useState('1.5 Hours');
  const [venue, setVenue] = useState('S 312');
  const [syllabus, setSyllabus] = useState('');
  const [instructions, setInstructions] = useState('');
  const [totalMarks, setTotalMarks] = useState('50');
  const [weightage, setWeightage] = useState('25%');
  const [revisionDocUrl, setRevisionDocUrl] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const subjectsList = [
    { name: 'Fundamentals of Computing & Programming in C', code: 'CSE 101' },
    { name: 'Engineering Physics', code: 'FIC 102' },
    { name: 'Calculus for Engineers', code: 'FIC 103' },
    { name: 'Art of Listening, Speaking and Reading Skills', code: 'AEC 101' },
    { name: 'Analytical Reasoning & Aptitude Skills - I', code: 'SEC 101' },
    { name: 'Environmental Science', code: 'VAC 101' },
    { name: 'Operating Systems', code: 'CSE 203' },
    { name: 'Database Management Systems', code: 'CSE 202' },
    { name: 'Discrete Mathematics', code: 'MAT 201' },
    { name: 'General / Practical Evaluation', code: 'LAB' }
  ];

  const examTypes = [
    'Mid-Term',
    'End-Term (Semester Finals)',
    'Lab Practical Exam',
    'Continuous Assessment Quiz',
    'Class Evaluation Test',
    'Surprise Test'
  ];

  const handleSubjectChange = (subName) => {
    setSubject(subName);
    const match = subjectsList.find(s => s.name === subName);
    if (match) setSubjectCode(match.code);
  };

  const handleOpenModal = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setTitle(exam.title || '');
      setSubject(exam.subject || 'Fundamentals of Computing & Programming in C');
      setSubjectCode(exam.subjectCode || 'CSE 101');
      setExamType(exam.examType || 'Mid-Term');
      setDate(exam.date || '');
      setTime(exam.time || '10:00 AM');
      setDuration(exam.duration || '1.5 Hours');
      setVenue(exam.venue || 'S 312');
      setSyllabus(exam.syllabus || '');
      setInstructions(exam.instructions || '');
      setTotalMarks(exam.totalMarks || '50');
      setWeightage(exam.weightage || '25%');
      setRevisionDocUrl(exam.revisionDocUrl || '');
      setIsUrgent(Boolean(exam.isUrgent));
    } else {
      setEditingExam(null);
      setTitle('');
      setSubject('Fundamentals of Computing & Programming in C');
      setSubjectCode('CSE 101');
      setExamType('Mid-Term');
      setDate('');
      setTime('10:00 AM');
      setDuration('1.5 Hours');
      setVenue('S 312');
      setSyllabus('');
      setInstructions('Bring official student ID card. Standard blue/black pens only. Programmable calculators not permitted.');
      setTotalMarks('50');
      setWeightage('25%');
      setRevisionDocUrl('');
      setIsUrgent(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !date) {
      addToast('Title, subject, and date are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        subject: subject.trim(),
        subjectCode: subjectCode.trim(),
        examType,
        date,
        time: time.trim(),
        duration: duration.trim(),
        venue: venue.trim(),
        syllabus: syllabus.trim(),
        instructions: instructions.trim(),
        totalMarks: totalMarks.trim(),
        weightage: weightage.trim(),
        revisionDocUrl: revisionDocUrl.trim(),
        isUrgent
      };

      if (editingExam) {
        await updateExam(editingExam.id, payload);
        addToast('Exam notice updated successfully!', 'success');
      } else {
        await addExam(payload);
        addToast('New exam notice published to Section D!', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      addToast(err.message || 'Failed to save exam notice.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, examTitle) => {
    if (window.confirm(`Are you sure you want to delete exam notice "${examTitle}"?`)) {
      try {
        await deleteExam(id);
        addToast('Exam notice deleted successfully.', 'success');
        if (selectedExamDetail?.id === id) {
          setSelectedExamDetail(null);
        }
      } catch (err) {
        addToast(err.message || 'Failed to delete exam notice.', 'error');
      }
    }
  };

  // Helper for Days Countdown
  const getCountdownLabel = (examDateStr) => {
    if (!examDateStr) return null;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const examDate = new Date(examDateStr);
      examDate.setHours(0, 0, 0, 0);
      
      const diffTime = examDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { label: 'Concluded', isPast: true, color: 'text-zinc-500 bg-white/5 border-white/10' };
      if (diffDays === 0) return { label: '⚡ TODAY!', isPast: false, color: 'text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse' };
      if (diffDays === 1) return { label: '🔥 Tomorrow', isPast: false, color: 'text-amber-300 bg-amber-500/20 border-amber-500/40' };
      if (diffDays <= 5) return { label: `⏳ In ${diffDays} Days`, isPast: false, color: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30' };
      return { label: `📅 In ${diffDays} Days`, isPast: false, color: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30' };
    } catch {
      return null;
    }
  };

  // Filter exams
  const filteredExams = useMemo(() => {
    return (exams || []).filter(item => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.subject || '').toLowerCase().includes(q) ||
        (item.subjectCode || '').toLowerCase().includes(q) ||
        (item.venue || '').toLowerCase().includes(q) ||
        (item.syllabus || '').toLowerCase().includes(q);

      const matchesType = selectedTypeFilter === 'All' || item.examType === selectedTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [exams, searchTerm, selectedTypeFilter]);

  // Group exams by Subject
  const groupedExams = useMemo(() => {
    const groups = {};
    for (const item of filteredExams) {
      const sub = item.subject || 'General Assessment';
      if (!groups[sub]) {
        groups[sub] = {
          subjectName: sub,
          subjectCode: item.subjectCode || '',
          items: []
        };
      }
      groups[sub].items.push(item);
    }

    // Sort items within each subject by date ascending
    for (const sub in groups) {
      groups[sub].items.sort((a, b) => new Date(a.date || '2099-01-01') - new Date(b.date || '2099-01-01'));
    }

    return groups;
  }, [filteredExams]);

  const subjectNamesList = useMemo(() => {
    return Object.keys(groupedExams);
  }, [groupedExams]);

  const displayedGroups = useMemo(() => {
    if (selectedSubjectTab === 'All') return groupedExams;
    if (groupedExams[selectedSubjectTab]) {
      return { [selectedSubjectTab]: groupedExams[selectedSubjectTab] };
    }
    return {};
  }, [groupedExams, selectedSubjectTab]);

  // Statistics
  const stats = useMemo(() => {
    const exList = exams || [];
    const today = new Date();
    today.setHours(0,0,0,0);

    let upcomingCount = 0;
    let nextExam = null;
    let blueprintCount = 0;

    for (const ex of exList) {
      if (ex.revisionDocUrl) blueprintCount++;
      if (ex.date) {
        const d = new Date(ex.date);
        d.setHours(0,0,0,0);
        if (d >= today) {
          upcomingCount++;
          if (!nextExam || d < new Date(nextExam.date)) {
            nextExam = ex;
          }
        }
      }
    }

    return {
      totalExams: exList.length,
      upcomingCount,
      blueprintCount,
      totalSubjects: Object.keys(groupedExams).length,
      nextExam
    };
  }, [exams, groupedExams]);

  const toggleSection = (subName) => {
    setCollapsedSubjects(prev => ({
      ...prev,
      [subName]: !prev[subName]
    }));
  };

  const toggleTopicCheck = (topicKey) => {
    setCheckedSyllabusTopics(prev => ({
      ...prev,
      [topicKey]: !prev[topicKey]
    }));
  };

  const copyExamSummary = (exam) => {
    const text = `📢 *SRM AP CSE Section D - Exam Notice*\n📚 *Subject:* ${exam.subject} (${exam.subjectCode})\n📝 *Title:* ${exam.title}\n📅 *Date:* ${exam.date} at ${exam.time}\n📍 *Venue:* Room ${exam.venue} (Duration: ${exam.duration})\n🎯 *Weightage:* ${exam.weightage} | Marks: ${exam.totalMarks}\n\n📌 *Syllabus:*\n${exam.syllabus || 'As discussed in class.'}\n\n⚠️ *Instructions:*\n${exam.instructions || 'Standard hall rules apply.'}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    addToast('Exam notice summary copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* ==========================================
          HEADER BANNER WITH STUDY DOODLES
          ========================================== */}
      <div className="relative liquid-glass rounded-3xl p-6 sm:p-8 md:p-10 border border-white/10 shadow-2xl overflow-hidden text-left">
        {/* Subtle Background Glow and Study Doodles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Floating Background Study Doodles */}
        <div className="absolute top-6 right-8 opacity-25 hover:opacity-75 transition-opacity hidden md:block pointer-events-none">
          <DoodleGradCap className="w-16 h-16 text-amber-300" />
        </div>
        <div className="absolute bottom-6 right-32 opacity-20 hover:opacity-60 transition-opacity hidden lg:block pointer-events-none">
          <DoodleBook className="w-12 h-12 text-yellow-300" />
        </div>
        <div className="absolute top-1/2 right-64 opacity-20 hover:opacity-60 transition-opacity hidden xl:block pointer-events-none">
          <DoodleAtom className="w-10 h-10 text-cyan-300" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 liquid-glass-pill px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                SRM AP • Section D Examination & Assessment Portal
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> CR Verified
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Exams & Syllabus Hub</span>
              <span className="text-2xl sm:text-3xl">✍️</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Official midterm schedules, lab practicals, syllabus breakdown unit-by-unit, room allocations, and blueprint attachments curated for CSE Section D.
            </p>
          </div>

          {/* CR Publishing Action Button */}
          {isAdmin && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleOpenModal(null)}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Publish Exam Schedule</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Summary Cards with Doodles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-white/10">
          <div className="liquid-glass-pill p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute right-2 top-2 opacity-15 group-hover:opacity-40 transition-opacity">
              <DoodleBook className="w-8 h-8 text-amber-300" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Exams</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{stats.totalExams}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Across semester</p>
          </div>

          <div className="liquid-glass-pill p-4 rounded-2xl border border-amber-500/20 relative overflow-hidden group">
            <div className="absolute right-2 top-2 opacity-15 group-hover:opacity-40 transition-opacity">
              <DoodleLightbulb className="w-8 h-8 text-yellow-300" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">Upcoming Active</p>
            <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">{stats.upcomingCount}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Scheduled ahead</p>
          </div>

          <div className="liquid-glass-pill p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute right-2 top-2 opacity-15 group-hover:opacity-40 transition-opacity">
              <DoodlePencil className="w-8 h-8 text-indigo-300" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Subjects Covered</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{stats.totalSubjects}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Section D courses</p>
          </div>

          <div className="liquid-glass-pill p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute right-2 top-2 opacity-15 group-hover:opacity-40 transition-opacity">
              <DoodleCoffee className="w-8 h-8 text-rose-300" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Next Upcoming</p>
            <p className="text-xs sm:text-sm font-black text-white mt-1 truncate">
              {stats.nextExam ? stats.nextExam.subjectCode : 'None'}
            </p>
            <p className="text-[10px] text-zinc-400 truncate">
              {stats.nextExam ? stats.nextExam.date : 'All clear'}
            </p>
          </div>
        </div>
      </div>

      {/* ==========================================
          SEARCH BAR & FILTER TABS
          ========================================== */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by subject, exam type, unit, venue (e.g. S 312), or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 liquid-glass rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 border border-white/10 transition shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 p-1.5 liquid-glass rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
            {['All', 'Mid-Term', 'End-Term', 'Lab Practical Exam', 'Continuous Assessment Quiz'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedTypeFilter(type)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedTypeFilter === type
                    ? 'bg-white text-black shadow-md font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {type === 'Continuous Assessment Quiz' ? 'Quizzes' : type === 'Lab Practical Exam' ? 'Labs' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[10px] font-black uppercase text-amber-300 flex items-center gap-1 shrink-0 pl-1">
            <Tag className="w-3 h-3" /> Filter:
          </span>

          <button
            onClick={() => setSelectedSubjectTab('All')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
              selectedSubjectTab === 'All'
                ? 'bg-amber-400 text-black shadow-md font-black'
                : 'liquid-glass-pill text-zinc-300 hover:text-white border-white/10'
            }`}
          >
            All Subjects ({filteredExams.length})
          </button>

          {subjectNamesList.map(subName => {
            const count = groupedExams[subName]?.items?.length || 0;
            const code = groupedExams[subName]?.subjectCode || subName.slice(0, 10);
            return (
              <button
                key={subName}
                onClick={() => setSelectedSubjectTab(subName)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  selectedSubjectTab === subName
                    ? 'bg-white text-black shadow-md font-black'
                    : 'liquid-glass-pill text-zinc-400 hover:text-white border-white/10'
                }`}
              >
                <span>{code}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          SIDE-BY-SIDE SUBJECT-WISE EXAM SECTIONS
          ========================================== */}
      {Object.keys(displayedGroups).length === 0 ? (
        <div className="liquid-glass rounded-3xl p-12 text-center border border-white/10 my-8 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-300 flex items-center justify-center mx-auto border border-amber-500/20">
            <FileCheck2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Exam Notices Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              {searchTerm
                ? `No exam notice matching "${searchTerm}". Try a different search term.`
                : 'No upcoming exams are currently scheduled in this section.'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => handleOpenModal(null)}
              className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-black rounded-xl transition shadow-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publish First Exam Notice</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(displayedGroups).map(([subName, group]) => {
            const isCollapsed = collapsedSubjects[subName];

            return (
              <div 
                key={subName}
                className="liquid-glass rounded-3xl border border-white/15 overflow-hidden shadow-xl"
              >
                {/* Subject Group Header */}
                <div 
                  onClick={() => toggleSection(subName)}
                  className="flex items-center justify-between p-4 sm:p-5 bg-white/[0.03] hover:bg-white/[0.06] transition cursor-pointer border-b border-white/10 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black border border-amber-500/30 shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                          {subName}
                        </h3>
                        {group.subjectCode && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-zinc-300 border border-white/15">
                            {group.subjectCode}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {group.items.length} {group.items.length === 1 ? 'Exam Schedule' : 'Exam Schedules'} • Section D
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400 hidden sm:inline">
                      {isCollapsed ? 'Expand' : 'Collapse'}
                    </span>
                    <button className="p-1.5 rounded-xl liquid-glass-pill text-zinc-400 hover:text-white">
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Side-by-Side Exam Cards Grid */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.items.map(exam => {
                      const countdown = getCountdownLabel(exam.date);
                      const syllabusLines = (exam.syllabus || '').split('\n').filter(Boolean);

                      return (
                        <div
                          key={exam.id}
                          className="liquid-glass-interactive rounded-2xl p-5 border border-white/10 hover:border-amber-400/40 transition flex flex-col justify-between group relative cursor-pointer"
                          onClick={() => setSelectedExamDetail(exam)}
                        >
                          {/* Top Badges & Countdown */}
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 uppercase tracking-wider">
                                <FileCheck2 className="w-3 h-3" />
                                {exam.examType || 'Exam'}
                              </span>

                              {countdown && (
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1 ${countdown.color}`}>
                                  {countdown.label}
                                </span>
                              )}
                            </div>

                            {/* Title & Subject */}
                            <h4 className="text-base font-black text-white group-hover:text-amber-200 transition-colors line-clamp-1">
                              {exam.title}
                            </h4>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {exam.subject} {exam.subjectCode ? `(${exam.subjectCode})` : ''}
                            </p>

                            {/* Key Assessment Badges (Date, Time, Venue, Marks) */}
                            <div className="grid grid-cols-2 gap-2 my-4 text-xs">
                              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span className="text-zinc-200 font-semibold truncate">{exam.date || 'TBA'}</span>
                              </div>

                              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                                <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                <span className="text-zinc-200 font-semibold truncate">{exam.time || '10:00 AM'}</span>
                              </div>

                              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span className="text-zinc-200 font-semibold truncate">Room: {exam.venue || 'S 312'}</span>
                              </div>

                              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                                <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="text-zinc-200 font-semibold truncate">
                                  {exam.totalMarks ? `${exam.totalMarks} Marks (${exam.weightage || '25%'})` : 'Assessment'}
                                </span>
                              </div>
                            </div>

                            {/* Syllabus Preview snippet */}
                            {exam.syllabus && (
                              <div className="liquid-glass-pill p-3 rounded-xl border border-white/5 text-xs text-zinc-300 mb-3">
                                <p className="text-[10px] font-black uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1">
                                  <Layers className="w-3 h-3" /> Syllabus Breakdown ({syllabusLines.length} Units/Topics)
                                </p>
                                <p className="line-clamp-2 text-[11px] text-zinc-400 leading-relaxed">
                                  {exam.syllabus}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Card Footer Actions */}
                          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-2">
                            <div className="flex items-center gap-2">
                              {exam.revisionDocUrl && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                                  <Paperclip className="w-2.5 h-2.5" /> Blueprint Attached
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => handleOpenModal(exam)}
                                    className="p-2 rounded-xl liquid-glass-pill text-zinc-300 hover:text-white hover:bg-white/10 transition"
                                    title="Edit Exam Notice"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(exam.id, exam.title)}
                                    className="p-2 rounded-xl liquid-glass-pill text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition"
                                    title="Delete Exam Notice"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => setSelectedExamDetail(exam)}
                                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Details</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ==========================================
          INTERACTIVE POPUP MODAL ON CLICKING EXAM
          ========================================== */}
      {selectedExamDetail && (
        <Modal
          isOpen={Boolean(selectedExamDetail)}
          onClose={() => setSelectedExamDetail(null)}
          title="Official Exam Notice & Syllabus"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-left">
            {/* Header Subject Details */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {selectedExamDetail.examType || 'Examination'}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-zinc-300 border border-white/15">
                    {selectedExamDetail.subjectCode || 'CSE-D'}
                  </span>
                  {selectedExamDetail.isUrgent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      ⚡ Urgent Notice
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-white">{selectedExamDetail.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{selectedExamDetail.subject}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => copyExamSummary(selectedExamDetail)}
                  className="p-2.5 rounded-xl liquid-glass-pill text-zinc-300 hover:text-white transition flex items-center gap-1 text-xs font-bold"
                  title="Copy Notice Summary"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Assessment Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Exam Date</p>
                <p className="text-sm font-black text-white mt-0.5">{selectedExamDetail.date || 'TBA'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Time & Duration</p>
                <p className="text-sm font-black text-white mt-0.5">{selectedExamDetail.time || '10:00 AM'}</p>
                <p className="text-[10px] text-zinc-400">{selectedExamDetail.duration || '1.5 Hours'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Hall / Venue</p>
                <p className="text-sm font-black text-amber-300 mt-0.5">Room {selectedExamDetail.venue || 'S 312'}</p>
                <p className="text-[10px] text-zinc-400">SRM AP Campus</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Marks / Weightage</p>
                <p className="text-sm font-black text-emerald-400 mt-0.5">{selectedExamDetail.totalMarks || '50'} Marks</p>
                <p className="text-[10px] text-zinc-400">{selectedExamDetail.weightage || '25%'} Internal</p>
              </div>
            </div>

            {/* Interactive Syllabus Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Syllabus Breakdown & Study Tracker</span>
                </h4>
                <span className="text-[10px] text-zinc-400">Check off topics as you prepare</span>
              </div>

              {selectedExamDetail.syllabus ? (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {selectedExamDetail.syllabus.split('\n').filter(Boolean).map((line, idx) => {
                    const topicKey = `${selectedExamDetail.id}-topic-${idx}`;
                    const isChecked = checkedSyllabusTopics[topicKey];

                    return (
                      <div
                        key={idx}
                        onClick={() => toggleTopicCheck(topicKey)}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                            : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border transition ${
                          isChecked ? 'bg-emerald-400 border-emerald-400 text-black' : 'border-white/30 bg-black/40'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={`text-xs leading-relaxed ${isChecked ? 'line-through opacity-75' : ''}`}>
                          {line}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-400 text-center">
                  Syllabus units will be announced in class and updated here by CR.
                </div>
              )}
            </div>

            {/* Exam Rules & Instructions */}
            {selectedExamDetail.instructions && (
              <div className="p-4 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20 text-xs text-zinc-300 space-y-1.5">
                <h4 className="text-[11px] font-black uppercase text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>CR Notice & Instructions for Candidates</span>
                </h4>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {selectedExamDetail.instructions}
                </p>
              </div>
            )}

            {/* Revision Blueprint Drive Link */}
            {selectedExamDetail.revisionDocUrl && (
              <div className="p-4 rounded-2xl bg-indigo-500/[0.08] border border-indigo-500/25 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Paperclip className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">Question Paper Blueprint & PYQs</p>
                    <p className="text-[10px] text-zinc-400 truncate">{selectedExamDetail.revisionDocUrl}</p>
                  </div>
                </div>

                <a
                  href={selectedExamDetail.revisionDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition shadow-lg"
                >
                  <span>Open Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* CR Controls inside Popup */}
            {isAdmin && (
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[11px] text-zinc-400">Class Representative Access</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const ex = selectedExamDetail;
                      setSelectedExamDetail(null);
                      handleOpenModal(ex);
                    }}
                    className="px-3 py-1.5 rounded-xl liquid-glass-pill text-white hover:bg-white/10 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Notice</span>
                  </button>
                  <button
                    onClick={() => handleDelete(selectedExamDetail.id, selectedExamDetail.title)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition flex items-center gap-1 border border-rose-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ==========================================
          CR EXAM PUBLISHING MODAL
          ========================================== */}
      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingExam ? 'Edit Exam Notice' : 'Publish Section D Exam Schedule'}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subject Dropdown */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                >
                  {subjectsList.map(s => (
                    <option key={s.name} value={s.name} className="bg-zinc-900 text-white">
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Code */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Subject Code</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="e.g. CSE 101"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            {/* Exam Title */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Exam Notice Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mid-Term Assessment 1 (Units 1, 2 & 3)"
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Exam Type */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Assessment Type</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                >
                  {examTypes.map(t => (
                    <option key={t} value={t} className="bg-zinc-900 text-white">{t}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 10:00 AM - 11:30 AM"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 1.5 Hours"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>

              {/* Venue */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Room / Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. S 312 / Academic Block"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>

              {/* Total Marks & Weightage */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Marks & Weightage</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    placeholder="Marks (50)"
                    className="w-full px-2.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                  />
                  <input
                    type="text"
                    value={weightage}
                    onChange={(e) => setWeightage(e.target.value)}
                    placeholder="Weight (25%)"
                    className="w-full px-2.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
            </div>

            {/* Syllabus breakdown */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">
                Syllabus Topics (One unit/topic per line for interactive checklist)
              </label>
              <textarea
                rows={4}
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
                placeholder="Unit 1: Introduction to C Programming & Flowcharts&#10;Unit 2: Decision Making, Loops & Conditionals&#10;Unit 3: 1D & 2D Arrays, Matrix Operations"
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40 leading-relaxed"
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Official Instructions / Rules</label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Mandatory Student ID card. Bring blue/black pens."
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Revision Blueprint Drive Link */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Blueprint / Revision Drive Link (Optional)</label>
              <input
                type="url"
                value={revisionDocUrl}
                onChange={(e) => setRevisionDocUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Urgent Notice Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isUrgent"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded border-white/20 text-white focus:ring-0 cursor-pointer"
              />
              <label htmlFor="isUrgent" className="text-xs text-zinc-300 font-bold cursor-pointer">
                Mark as High Priority / Urgent Notice
              </label>
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl liquid-glass-pill text-xs font-bold text-zinc-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>{editingExam ? 'Save Changes' : 'Publish Exam Schedule'}</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
