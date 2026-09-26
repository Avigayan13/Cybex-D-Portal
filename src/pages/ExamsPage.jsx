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
  CheckSquare
} from 'lucide-react';

export default function ExamsPage() {
  const { user, isAdmin } = useAuth();
  const { exams, addExam, updateExam, deleteExam } = useData();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [expandedSyllabus, setExpandedSyllabus] = useState({});

  // Exam Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Operating Systems');
  const [subjectCode, setSubjectCode] = useState('CSE 203');
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
    { name: 'Data Communications & Networking', code: 'CSE 205' },
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
      setSubject(exam.subject || 'Operating Systems');
      setSubjectCode(exam.subjectCode || 'CSE 203');
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
      setInstructions('Bring official student ID card. Standard blue/black pens only. No programmable calculators.');
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
        addToast('Exam notice published to all Section D students!', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      addToast(err.message || 'Failed to save exam schedule.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, examTitle) => {
    if (window.confirm(`Are you sure you want to remove the exam notice for "${examTitle}"?`)) {
      try {
        await deleteExam(id);
        addToast('Exam notice deleted.', 'info');
      } catch (err) {
        addToast(err.message || 'Failed to delete exam.', 'error');
      }
    }
  };

  const toggleSyllabus = (id) => {
    setExpandedSyllabus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter and sort exams
  const filteredExams = useMemo(() => {
    return (exams || []).filter(exam => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        (exam.title || '').toLowerCase().includes(q) ||
        (exam.subject || '').toLowerCase().includes(q) ||
        (exam.subjectCode || '').toLowerCase().includes(q) ||
        (exam.venue || '').toLowerCase().includes(q) ||
        (exam.syllabus || '').toLowerCase().includes(q);

      const matchesType = selectedTypeFilter === 'All' || exam.examType === selectedTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [exams, searchTerm, selectedTypeFilter]);

  // Nearest upcoming exam calculation
  const nearestExam = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = (exams || []).filter(e => (e.date || '') >= today);
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming[0] || null;
  }, [exams]);

  const formatExamDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getDaysRemainingText = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    return 'Completed';
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ========================================== */}
      {/* HERO BANNER & CR CONTROLS                  */}
      {/* ========================================== */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-indigo-300">
              <FileCheck2 className="w-4 h-4 text-indigo-400" />
              <span>Examination & Evaluation Hub</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
              <span>Section D Exam Notices & Syllabus</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Official schedule, syllabus breakdowns, question paper blueprints, hall venues, and instructions for upcoming Mid-Terms, Finals, and Lab evaluations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => handleOpenModal()}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>+ Publish Exam Notice</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Highlights Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-800/40 rounded-2xl p-3.5 text-center border border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Scheduled</span>
            <span className="text-xl font-bold font-serif text-white">{exams.length} Exams</span>
          </div>

          <div className="bg-slate-800/40 rounded-2xl p-3.5 text-center border border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Upcoming</span>
            <span className="text-xs font-bold text-indigo-300 truncate block mt-0.5">
              {nearestExam ? `${nearestExam.subjectCode || nearestExam.subject} (${formatExamDate(nearestExam.date)})` : 'None currently scheduled'}
            </span>
          </div>

          <div className="bg-slate-800/40 rounded-2xl p-3.5 text-center border border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CR Publishing Status</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active & Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SEARCH & EXAM TYPE FILTERS                */}
      {/* ========================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exam by title, subject name, course code, or room..."
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

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['All', 'Mid-Term', 'Lab Practical Exam', 'End-Term (Semester Finals)', 'Continuous Assessment Quiz'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTypeFilter(tab)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedTypeFilter === tab
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab === 'All' ? 'All Exams' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* EXAMS LIST & SCHEDULE CARDS                */}
      {/* ========================================== */}
      {filteredExams.length === 0 ? (
        <div className="bg-slate-900/60 rounded-3xl p-12 text-center space-y-4 border border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <FileCheck2 className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-serif font-bold text-white">
              {exams.length === 0 ? 'No Exam Notices Published Yet' : 'No Exams Match Active Filters'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {exams.length === 0
                ? 'Official test timetables, syllabus breakdowns, and revision blueprints published by the CR will appear here.'
                : 'Try resetting your search query or selecting "All Exams" to view all schedule entries.'}
            </p>
          </div>

          {isAdmin && exams.length === 0 && (
            <div className="pt-2">
              <button
                onClick={() => handleOpenModal()}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-bold text-xs transition shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Publish First Exam Notice</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredExams.map((exam) => {
            const isSyllabusOpen = Boolean(expandedSyllabus[exam.id]);
            const daysRemaining = getDaysRemainingText(exam.date);

            return (
              <div
                key={exam.id}
                className={`bg-slate-900/80 border rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-lg transition hover:shadow-xl relative ${
                  exam.isUrgent ? 'border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-slate-900 to-slate-950' : 'border-slate-800'
                }`}
              >
                {/* Header: Subject Badge, Exam Type, Days Countdown */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/40 text-indigo-300 font-bold uppercase tracking-wider text-[11px]">
                        {exam.subjectCode || 'CSE Sec-D'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold">
                        {exam.examType || 'Examination'}
                      </span>
                    </div>

                    {daysRemaining && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        daysRemaining === 'Today'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : daysRemaining === 'Tomorrow'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      }`}>
                        {daysRemaining}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-serif font-bold text-white leading-snug">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-400 font-medium">
                    Subject: <strong className="text-slate-200">{exam.subject}</strong>
                  </p>
                </div>

                {/* Key Timings & Venue Logistics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" /> Date
                    </span>
                    <span className="font-semibold text-slate-200 block mt-0.5">{formatExamDate(exam.date)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> Time
                    </span>
                    <span className="font-semibold text-slate-200 block mt-0.5">{exam.time || '10:00 AM'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" /> Room / Hall
                    </span>
                    <span className="font-semibold text-slate-200 block mt-0.5">{exam.venue || 'S 312'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> Weightage
                    </span>
                    <span className="font-semibold text-amber-300 block mt-0.5">{exam.totalMarks} Marks ({exam.weightage})</span>
                  </div>
                </div>

                {/* Expandable Syllabus Checklist */}
                {exam.syllabus && (
                  <div className="space-y-2">
                    <button
                      onClick={() => toggleSyllabus(exam.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-indigo-300 border border-slate-700/50 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Syllabus Topics Covered</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isSyllabusOpen ? 'Hide' : 'View Breakdown'}
                      </span>
                    </button>

                    {isSyllabusOpen && (
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                        {exam.syllabus}
                      </div>
                    )}
                  </div>
                )}

                {/* Instructions Note */}
                {exam.instructions && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{exam.instructions}</span>
                  </div>
                )}

                {/* Footer: Revision Blueprint Attachment & CR Controls */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    {exam.revisionDocUrl ? (
                      <a
                        href={exam.revisionDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Question Blueprint / Revision Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No external blueprint attached.</span>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenModal(exam)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                        title="Edit Exam Notice"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id, exam.title)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                        title="Delete Exam Notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================== */}
      {/* PUBLISH / EDIT EXAM NOTICE MODAL (CR ADMIN)*/}
      {/* ========================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? "Edit Examination Notice" : "Publish Examination Notice"}
        subtitle="Broadcast official dates, syllabus, and room venues to all Section D students"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Subject Name *
            </label>
            <select
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-indigo-500"
            >
              {subjectsList.map(s => (
                <option key={s.code} value={s.name}>{s.code}: {s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Exam Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mid-Term 1 Examination"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Exam Type *
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-indigo-500"
              >
                {examTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Time (e.g. 10:00 AM) *
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:00 AM - 11:30 AM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Hall / Room Venue *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. S 312 / ALH 302"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Total Marks & Weightage
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  placeholder="50 Marks"
                  className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                />
                <input
                  type="text"
                  value={weightage}
                  onChange={(e) => setWeightage(e.target.value)}
                  placeholder="25% Weightage"
                  className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Revision Blueprint / Drive URL (Optional)
              </label>
              <input
                type="url"
                value={revisionDocUrl}
                onChange={(e) => setRevisionDocUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Syllabus Units & Topics Covered *
            </label>
            <textarea
              rows={3}
              required
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              placeholder="Unit 1: Introduction & Pointers&#10;Unit 2: File Handling and Dynamic Allocation"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Important Instructions / Rules
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Non-programmable calculators allowed. Blue book provided at hall."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isUrgent"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 bg-slate-900 border-slate-700"
            />
            <label htmlFor="isUrgent" className="text-xs font-bold text-rose-300 cursor-pointer">
              Mark as Urgent / Priority Exam Alert
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-bold text-xs shadow-md transition disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? 'Saving...' : editingExam ? 'Update Exam Notice' : 'Publish to Class'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
