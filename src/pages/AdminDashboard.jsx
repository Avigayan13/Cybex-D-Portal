import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { 
  ShieldCheck, 
  MessageSquarePlus, 
  CalendarDays, 
  Bell, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Pin, 
  Lock,
  Users,
  Search,
  Download,
  UserPlus,
  Edit3,
  BarChart3,
  Star,
  GraduationCap,
  Building2,
  ShieldAlert,
  Sparkles,
  Clock,
  Eye
} from 'lucide-react';

export default function AdminDashboard({ onNavigate }) {
  const { user, portalConfig, updateConfig } = useAuth();
  const { 
    feedbackList, 
    timetable, 
    announcements, 
    studentsList,
    surveyStats,
    updateFeedbackStatus,
    addAnnouncement,
    deleteAnnouncement,
    deleteFeedback,
    addStudent,
    updateStudent,
    deleteStudent
  } = useData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'survey' | 'feedback' | 'students' | 'notices' | 'settings'
  
  // Feedback Response State
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [fbStatus, setFbStatus] = useState('In Progress');
  const [fbResponse, setFbResponse] = useState('');
  const [updatingFb, setUpdatingFb] = useState(false);

  // Survey Tracker State
  const [surveyFilter, setSurveyFilter] = useState('All'); // 'All' | 'Submitted' | 'Pending'
  const [surveySearch, setSurveySearch] = useState('');
  const [selectedSurveyItem, setSelectedSurveyItem] = useState(null);

  // New Notice State
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState('Academic');
  const [noticePriority, setNoticePriority] = useState('Normal');
  const [noticePinned, setNoticePinned] = useState(false);
  const [submittingNotice, setSubmittingNotice] = useState(false);

  // Student Directory State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({ rollNumber: '', name: '', email: '', section: 'D', batch: '2024-2028', role: 'Student' });
  const [savingStudent, setSavingStudent] = useState(false);

  // Settings State
  const [adminEmail, setAdminEmail] = useState(portalConfig.adminEmail || '');
  const [adminName, setAdminName] = useState(portalConfig.adminName || '');
  const [sectionName, setSectionName] = useState(portalConfig.sectionName || '');
  const [academicYear, setAcademicYear] = useState(portalConfig.academicYear || '');
  const [savingSettings, setSavingSettings] = useState(false);

  // Filter feedback
  const [fbCategoryFilter, setFbCategoryFilter] = useState('All');
  const [fbStatusFilter, setFbStatusFilter] = useState('All');

  const handleOpenStudentModal = (student = null) => {
    if (student) {
      setSelectedStudent(student);
      setStudentForm({ ...student });
    } else {
      setSelectedStudent(null);
      setStudentForm({ rollNumber: '', name: '', email: '', section: 'D', batch: '2024-2028', role: 'Student' });
    }
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setSavingStudent(true);
    try {
      if (selectedStudent) {
        await updateStudent(selectedStudent.id, studentForm);
        addToast(`Updated details for ${studentForm.name}`, 'success');
      } else {
        await addStudent(studentForm);
        addToast(`Added ${studentForm.name} to class directory!`, 'success');
      }
      setIsStudentModalOpen(false);
    } catch (err) {
      addToast(err.message || 'Failed to save student record.', 'error');
    } finally {
      setSavingStudent(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to remove ${student.name} (${student.rollNumber})?`)) return;
    try {
      await deleteStudent(student.id);
      addToast(`Student ${student.name} removed.`, 'info');
    } catch (err) {
      addToast(err.message || 'Failed to remove student.', 'error');
    }
  };

  const handleExportSurveyStatus = () => {
    if (!studentsList || studentsList.length === 0) return;
    const submittedEmails = new Set((surveyStats?.surveys || []).map(s => s.studentEmail.toLowerCase()));
    const headers = ["S.No", "Roll Number", "Student Name", "Institutional Email", "Survey Status", "Submitted At"];
    
    const rows = studentsList.map((s, idx) => {
      const isDone = submittedEmails.has(s.email.toLowerCase());
      const surveyRecord = (surveyStats?.surveys || []).find(sr => sr.studentEmail.toLowerCase() === s.email.toLowerCase());
      return [
        idx + 1,
        `"${s.rollNumber}"`,
        `"${s.name}"`,
        `"${s.email}"`,
        `"${isDone ? 'SUBMITTED' : 'PENDING'}"`,
        `"${surveyRecord ? new Date(surveyRecord.createdAt).toLocaleString() : 'N/A'}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CYBEX_D_Survey_Status_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Survey participation roster exported!", "success");
  };

  const handleExportSurveyResponses = () => {
    const surveys = surveyStats?.surveys || [];
    if (surveys.length === 0) {
      addToast("No survey responses submitted yet.", "info");
      return;
    }

    const headers = [
      "Survey ID",
      "Submitted At",
      "Roll Number",
      "Student Name",
      "Email",
      "Infra Rating (/5)",
      "Faculty 1 (AEC 101)",
      "Faculty 2 (CSE 101)",
      "Faculty 3 (FIC 102)",
      "Faculty 4 (FIC 103)",
      "Faculty 5 (VAC 101)",
      "Faculty 6 (SEC 101)",
      "Overall Feedback",
      "Recommendations"
    ];

    const rows = surveys.map(s => {
      const revMap = {};
      (s.facultyReviews || []).forEach(r => {
        revMap[r.code] = `${r.rating}/5 (${r.pace})`;
      });

      return [
        `"${s.id}"`,
        `"${new Date(s.createdAt).toLocaleString()}"`,
        `"${s.studentRoll || 'N/A'}"`,
        `"${s.studentName}"`,
        `"${s.studentEmail}"`,
        `"${s.classInfrastructureRating || 5}"`,
        `"${revMap['AEC 101'] || 'N/A'}"`,
        `"${revMap['CSE 101'] || 'N/A'}"`,
        `"${revMap['FIC 102'] || 'N/A'}"`,
        `"${revMap['FIC 103'] || 'N/A'}"`,
        `"${revMap['VAC 101'] || 'N/A'}"`,
        `"${revMap['SEC 101'] || 'N/A'}"`,
        `"${(s.overallFeedback || '').replace(/"/g, '""')}"`,
        `"${(s.recommendations || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CYBEX_D_Survey_Detailed_Responses_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Detailed survey responses exported!", "success");
  };

  const handleExportCSV = () => {
    if (!studentsList || studentsList.length === 0) return;
    const headers = ["S.No", "Roll Number", "Student Name", "Institutional Email", "Section", "Batch", "Role"];
    const rows = studentsList.map((s, idx) => [
      idx + 1,
      `"${s.rollNumber}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.section || 'D'}"`,
      `"${s.batch || '2024-2028'}"`,
      `"${s.role || 'Student'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CYBEX_D_Students_Roster_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Student roster CSV downloaded!", "success");
  };

  const handleOpenFeedbackModal = (fb) => {
    setSelectedFeedback(fb);
    setFbStatus(fb.status);
    setFbResponse(fb.crResponse || '');
  };

  const handleSaveFeedbackStatus = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    setUpdatingFb(true);
    try {
      await updateFeedbackStatus(selectedFeedback.id, fbStatus, fbResponse);
      addToast('Feedback status and CR response updated!', 'success');
      setSelectedFeedback(null);
    } catch (err) {
      addToast(err.message || 'Failed to update feedback.', 'error');
    } finally {
      setUpdatingFb(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      addToast('Please provide a title and content for the notice.', 'error');
      return;
    }

    setSubmittingNotice(true);
    try {
      await addAnnouncement({
        title: noticeTitle.trim(),
        content: noticeContent.trim(),
        category: noticeCategory,
        priority: noticePriority,
        isPinned: noticePinned
      });

      addToast('Announcement broadcasted to all students!', 'success');
      setIsNoticeModalOpen(false);
      setNoticeTitle('');
      setNoticeContent('');
      setNoticePinned(false);
    } catch (err) {
      addToast(err.message || 'Failed to publish notice.', 'error');
    } finally {
      setSubmittingNotice(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateConfig({
        adminEmail: adminEmail.trim(),
        adminName: adminName.trim(),
        sectionName: sectionName.trim(),
        academicYear: academicYear.trim()
      });
      addToast('CYBEX D settings saved successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredFeedback = feedbackList.filter(f => {
    const matchCat = fbCategoryFilter === 'All' || f.category === fbCategoryFilter;
    const matchStat = fbStatusFilter === 'All' || f.status === fbStatusFilter;
    return matchCat && matchStat;
  });

  const unresolvedFeedbacks = feedbackList.filter(f => f.status !== 'Resolved');

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="liquid-glass-pill text-xs font-black uppercase tracking-wider text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> CR Control Center • CYBEX D
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Class Representative Panel
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage student grievances, track live mandatory class surveys, and broadcast urgent circulars.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNoticeModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition flex items-center gap-1.5"
          >
            <Bell className="w-4 h-4" />
            <span>+ Broadcast Notice</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 liquid-glass p-2 rounded-2xl">
        {[
          { id: 'overview', label: 'Overview', icon: ShieldCheck },
          { id: 'survey', label: `Mandatory Survey (${surveyStats?.submittedCount || 0}/${surveyStats?.totalEnrolled || 58})`, icon: BarChart3 },
          { id: 'feedback', label: `Feedback Redressal (${unresolvedFeedbacks.length} open)`, icon: MessageSquarePlus },
          { id: 'students', label: `Class Roster (${studentsList.length || 58})`, icon: Users },
          { id: 'notices', label: `Notices (${announcements.length})`, icon: Bell },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-white text-black shadow-md font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Survey Progress"
              value={`${surveyStats?.percentage || 0}%`}
              subtitle={`${surveyStats?.submittedCount || 0}/${surveyStats?.totalEnrolled || 58} Students Done`}
              icon={BarChart3}
              color="indigo"
              onClick={() => setActiveTab('survey')}
            />
            <StatCard
              title="Open Grievances"
              value={unresolvedFeedbacks.length}
              subtitle={`${feedbackList.length} Total Submissions`}
              icon={AlertCircle}
              color="amber"
              onClick={() => setActiveTab('feedback')}
            />
            <StatCard
              title="Enrolled Students"
              value={studentsList.length || 58}
              subtitle="Section D Roster"
              icon={Users}
              color="blue"
              onClick={() => setActiveTab('students')}
            />
            <StatCard
              title="Broadcast Notices"
              value={announcements.length}
              subtitle="Active Circulars"
              icon={Bell}
              color="emerald"
              onClick={() => setActiveTab('notices')}
            />
          </div>

          {/* Survey Progress Highlight */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="liquid-glass-pill text-[10px] uppercase font-black px-2.5 py-1 rounded-full text-white inline-flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3 text-white" /> Mandatory Academic Feedback Forum
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Live Class Participation: {surveyStats?.submittedCount || 0} of {surveyStats?.totalEnrolled || 58} Students Submitted ({surveyStats?.percentage || 0}%)
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('survey')}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs transition shadow-md self-start sm:self-auto"
              >
                Open Survey Tracker →
              </button>
            </div>

            <div className="w-full bg-white/10 rounded-full h-3.5 overflow-hidden p-0.5 border border-white/10">
              <div 
                className="h-full bg-white rounded-full transition-all duration-700" 
                style={{ width: `${Math.max(4, surveyStats?.percentage || 0)}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>{surveyStats?.pendingCount || (58 - (surveyStats?.submittedCount || 0))} Students Pending</span>
              <span>{surveyStats?.submittedCount || 0} Submitted</span>
            </div>
          </div>

          {/* Action Queue */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold text-white">Pending Feedback & Issues Queue</h3>
              </div>
              <button
                onClick={() => setActiveTab('feedback')}
                className="text-xs font-bold text-zinc-300 hover:text-white"
              >
                Manage All ({unresolvedFeedbacks.length}) →
              </button>
            </div>

            {unresolvedFeedbacks.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">No pending student grievances. All caught up! ✨</p>
            ) : (
              <div className="space-y-3">
                {unresolvedFeedbacks.slice(0, 4).map(fb => (
                  <div
                    key={fb.id}
                    onClick={() => handleOpenFeedbackModal(fb)}
                    className="p-4 rounded-2xl liquid-glass-interactive cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-zinc-300 liquid-glass-pill px-2 py-0.5 rounded text-[10px]">
                        {fb.category}
                      </span>
                      <span className="text-zinc-500 text-[11px]">
                        {new Date(fb.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{fb.title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{fb.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE MANDATORY SURVEY TRACKER */}
      {activeTab === 'survey' && (
        <div className="space-y-6">
          {/* Header & Stats Banner */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="liquid-glass-pill text-[10px] uppercase font-black px-2.5 py-1 rounded-full text-white inline-flex items-center gap-1 mb-2">
                  <BarChart3 className="w-3.5 h-3.5 text-white" /> Live Feedback Forum Control
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Mandatory Class Survey Tracker
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Track submissions from all 58 enrolled Section D students across 6 subjects & infrastructure.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportSurveyStatus}
                  className="px-4 py-2.5 rounded-xl liquid-glass-pill hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  title="Export submission list"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Status CSV</span>
                </button>
                <button
                  onClick={handleExportSurveyResponses}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs shadow-md hover:scale-105 transition flex items-center gap-1.5"
                  title="Export detailed feedback responses"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Responses CSV</span>
                </button>
              </div>
            </div>

            {/* Participation Progress */}
            <div className="space-y-2 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Total Participation: {surveyStats?.submittedCount || 0} / {surveyStats?.totalEnrolled || 58} Students
                </span>
                <span className="font-black text-white text-base">
                  {surveyStats?.percentage || 0}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-700" 
                  style={{ width: `${Math.max(2, surveyStats?.percentage || 0)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'All', label: `All Students (${studentsList.length || 58})` },
                { id: 'Submitted', label: `Submitted (${surveyStats?.submittedCount || 0})` },
                { id: 'Pending', label: `Pending (${(studentsList.length || 58) - (surveyStats?.submittedCount || 0)})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSurveyFilter(f.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    surveyFilter === f.id
                      ? 'bg-white text-black font-black shadow'
                      : 'liquid-glass-pill text-zinc-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={surveySearch}
                onChange={(e) => setSurveySearch(e.target.value)}
                placeholder="Search Roll No or Student Name..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/15 bg-black/60 text-white placeholder-zinc-500 focus:border-white outline-none text-xs"
              />
            </div>
          </div>

          {/* Students Survey Tracking Table */}
          <div className="liquid-glass rounded-3xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-zinc-400 bg-white/[0.02]">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Roll Number</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4 text-center">Survey Status</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {studentsList
                    .filter(s => {
                      const submittedEmails = new Set((surveyStats?.surveys || []).map(sr => sr.studentEmail.toLowerCase()));
                      const isSubmitted = submittedEmails.has(s.email.toLowerCase());
                      
                      if (surveyFilter === 'Submitted' && !isSubmitted) return false;
                      if (surveyFilter === 'Pending' && isSubmitted) return false;

                      if (!surveySearch.trim()) return true;
                      const q = surveySearch.toLowerCase();
                      return (
                        s.rollNumber?.toLowerCase().includes(q) ||
                        s.name?.toLowerCase().includes(q) ||
                        s.email?.toLowerCase().includes(q)
                      );
                    })
                    .map((student, idx) => {
                      const surveyRecord = (surveyStats?.surveys || []).find(sr => sr.studentEmail.toLowerCase() === student.email.toLowerCase());
                      const isSubmitted = Boolean(surveyRecord);

                      return (
                        <tr key={student.id || student.rollNumber} className="hover:bg-white/[0.03] transition">
                          <td className="py-3 px-4 text-center text-zinc-500 text-xs">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            <span className="bg-white/10 px-2 py-1 rounded text-xs border border-white/10">
                              {student.rollNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-white">
                            {student.name}
                          </td>
                          <td className="py-3 px-4 text-zinc-400 font-mono text-xs">
                            {student.email}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isSubmitted ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black font-black text-[11px] shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-black" /> Submitted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill text-amber-300 font-bold text-[11px] border border-amber-400/30">
                                <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Mandatory
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isSubmitted ? (
                              <button
                                onClick={() => setSelectedSurveyItem(surveyRecord)}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white text-zinc-300 hover:text-black font-bold text-xs transition inline-flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Response
                              </button>
                            ) : (
                              <span className="text-zinc-600 text-xs italic">Awaiting fill</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEEDBACK & GRIEVANCES TRIAGE */}
      {activeTab === 'feedback' && (
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Feedback & Grievance Triage ({feedbackList.length})</h3>
              <p className="text-xs text-zinc-400">Review Faculty Feedback, Class Feedback, and Complaints to CR</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={fbCategoryFilter}
                onChange={(e) => setFbCategoryFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 bg-black text-white outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Faculty Feedback">Faculty Feedback</option>
                <option value="Class Feedback">Class Feedback</option>
                <option value="Complaints to CR">Complaints to CR</option>
                <option value="Classroom">Classroom</option>
                <option value="Lab Infrastructure">Lab Infrastructure</option>
                <option value="Timetable">Timetable</option>
                <option value="General Problems">General</option>
              </select>

              <select
                value={fbStatusFilter}
                onChange={(e) => setFbStatusFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 bg-black text-white outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredFeedback.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">No feedback entries found matching filter.</p>
            ) : (
              filteredFeedback.map(fb => (
                <div
                  key={fb.id}
                  className="p-5 rounded-2xl liquid-glass-interactive space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="liquid-glass-pill text-xs font-bold px-2.5 py-0.5 rounded-lg text-zinc-200">
                        {fb.category}
                      </span>
                      {fb.isAnonymous ? (
                        <span className="liquid-glass-pill text-[11px] font-bold text-zinc-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Anonymous to Class
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-300 font-medium">
                          By <strong className="text-white">{fb.studentName}</strong> ({fb.studentEmail})
                        </span>
                      )}
                      <span className="text-xs text-zinc-500">
                        {new Date(fb.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        fb.status === 'Resolved' ? 'bg-white text-black font-black' :
                        fb.status === 'In Progress' ? 'bg-white/20 text-white border-white/40' :
                        'liquid-glass-pill text-zinc-400'
                      }`}>
                        {fb.status}
                      </span>
                      <button
                        onClick={() => handleOpenFeedbackModal(fb)}
                        className="text-xs font-black bg-white hover:bg-zinc-200 text-black px-4 py-1.5 rounded-xl transition shadow-md hover:scale-105"
                      >
                        Update / Reply
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm("Delete this feedback entry?")) {
                            await deleteFeedback(fb.id);
                            addToast("Feedback deleted.", "info");
                          }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                        title="Delete Feedback"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-white">{fb.title}</h4>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{fb.description}</p>

                  {fb.crResponse && (
                    <div className="p-3.5 rounded-xl liquid-glass border border-white/20 text-xs text-white mt-2">
                      <strong className="text-white">Current CR Response:</strong> {fb.crResponse}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NOTICE BOARD */}
      {activeTab === 'notices' && (
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Broadcast Notice Board</h3>
              <p className="text-xs text-zinc-400">Official circulars and announcements shown to Section D students</p>
            </div>
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-black shadow-lg transition flex items-center gap-1.5 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>New Announcement</span>
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs font-bold">
              No notices currently posted. Click "+ New Announcement" to broadcast a notice.
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map(ann => (
                <div
                  key={ann.id}
                  className="p-5 rounded-2xl liquid-glass-interactive space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-white text-black">
                        {ann.priority}
                      </span>
                      {ann.isPinned && (
                        <span className="liquid-glass-pill text-[11px] font-bold text-zinc-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      <span className="text-xs text-zinc-500">
                        {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <button
                      onClick={async () => {
                        if (window.confirm("Delete this announcement?")) {
                          await deleteAnnouncement(ann.id);
                          addToast("Announcement removed.", "info");
                        }
                      }}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-white">{ann.title}</h4>
                  <p className="text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STUDENT DIRECTORY & DATABASE */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                Cyber Security - D Student Directory
              </h3>
              <p className="text-xs text-zinc-400">
                Official class roster ({studentsList.length || 58} students enrolled) with verified institutional roll numbers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-xl liquid-glass-pill hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition"
                title="Download CSV roster"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleOpenStudentModal()}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs shadow-md hover:scale-105 transition flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Student</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search student by Roll Number (e.g. AP26110090265), Name, or Email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-white/15 bg-black/60 text-white placeholder-zinc-500 focus:border-white outline-none text-xs sm:text-sm"
            />
          </div>

          {/* Student Roster Table */}
          <div className="liquid-glass rounded-3xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-zinc-400 bg-white/[0.02]">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Roll Number</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Institutional Email</th>
                    <th className="py-3.5 px-4 text-center">Section</th>
                    <th className="py-3.5 px-4 text-center">Role</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {studentsList
                    .filter(s => {
                      if (!studentSearch.trim()) return true;
                      const q = studentSearch.toLowerCase();
                      return (
                        s.rollNumber?.toLowerCase().includes(q) ||
                        s.name?.toLowerCase().includes(q) ||
                        s.email?.toLowerCase().includes(q)
                      );
                    })
                    .map((student, idx) => {
                      const isCR = student.role === 'CR' || student.rollNumber === 'AP26110090265';
                      return (
                        <tr key={student.id || student.rollNumber} className="hover:bg-white/[0.03] transition">
                          <td className="py-3 px-4 text-center text-zinc-500 text-xs">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded-md border border-white/10">
                              {student.rollNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-white">
                            {student.name}
                          </td>
                          <td className="py-3 px-4 text-zinc-400 font-mono text-xs">
                            {student.email}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="liquid-glass-pill text-[11px] font-bold text-zinc-300 px-2 py-0.5 rounded">
                              Sec {student.section || 'D'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isCR ? (
                              <span className="bg-white text-black font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow-sm">
                                Class Rep (CR)
                              </span>
                            ) : (
                              <span className="text-zinc-400 text-xs">
                                Student
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenStudentModal(student)}
                                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                                title="Edit Student"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {!isCR && (
                                <button
                                  onClick={() => handleDeleteStudent(student)}
                                  className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-white/10 transition"
                                  title="Remove Student"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PORTAL SETTINGS */}
      {activeTab === 'settings' && (
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 max-w-2xl space-y-6">
          <div className="pb-4 border-b border-white/10">
            <h3 className="text-base font-bold text-white">CYBEX D Portal Settings</h3>
            <p className="text-xs text-zinc-400">Configure admin email, section title, and academic term details</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Class Representative Admin Email *
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-sm"
              />
              <p className="text-[11px] text-zinc-500 mt-1">This institutional email is granted full CR administrative privileges.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                CR Full Name / Title
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. CYBEX D - Class Representative"
                className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Section Name
                </label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Academic Term / Batch
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-sm"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-60 text-black text-xs font-black shadow-xl transition hover:scale-105"
              >
                {savingSettings ? 'Saving Configuration...' : 'Save Portal Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add / Edit Student Record */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title={selectedStudent ? "Edit Student Details" : "Add Student to Section D"}
        subtitle="SRM University AP • Cyber Security - D"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Roll Number *
            </label>
            <input
              type="text"
              required
              value={studentForm.rollNumber}
              onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. AP26110090265"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none font-mono text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Full Student Name *
            </label>
            <input
              type="text"
              required
              value={studentForm.name}
              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value.toUpperCase() })}
              placeholder="e.g. AVIGAYAN JANA"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Institutional Email *
            </label>
            <input
              type="email"
              required
              value={studentForm.email}
              onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value.toLowerCase() })}
              placeholder="e.g. avigayan_jana@srmap.edu.in"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Section
              </label>
              <input
                type="text"
                value={studentForm.section}
                onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <select
                value={studentForm.role}
                onChange={(e) => setStudentForm({ ...studentForm, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
              >
                <option value="Student">Student</option>
                <option value="CR">Class Representative (CR)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsStudentModalOpen(false)}
              className="px-4 py-2 rounded-xl liquid-glass-pill text-xs font-bold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingStudent}
              className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black shadow-lg hover:scale-105 transition"
            >
              {savingStudent ? 'Saving...' : (selectedStudent ? 'Save Changes' : 'Add Student')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Update Feedback Status & Write CR Response */}
      <Modal
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        title="Update Feedback Status & Response"
        subtitle={`Grievance #${selectedFeedback?.id} • ${selectedFeedback?.category}`}
      >
        <form onSubmit={handleSaveFeedbackStatus} className="space-y-4">
          <div className="p-4 rounded-2xl liquid-glass space-y-1 text-xs">
            <p className="font-bold text-white text-sm">{selectedFeedback?.title}</p>
            <p className="text-zinc-300 leading-relaxed">{selectedFeedback?.description}</p>
            <p className="text-[11px] text-zinc-500 pt-1">
              From: {selectedFeedback?.isAnonymous ? 'Anonymous Student' : `${selectedFeedback?.studentName} (${selectedFeedback?.studentEmail})`}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Current Resolution Status *
            </label>
            <select
              value={fbStatus}
              onChange={(e) => setFbStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-sm"
            >
              <option value="New">New (Under Review)</option>
              <option value="In Progress">In Progress (Action Taken with Dept/Faculty)</option>
              <option value="Resolved">Resolved (Completed)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Official CR Response & Action Taken *
            </label>
            <textarea
              required
              rows={4}
              value={fbResponse}
              onChange={(e) => setFbResponse(e.target.value)}
              placeholder="Explain what steps were taken to resolve this..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedFeedback(null)}
              className="px-4 py-2 rounded-xl liquid-glass-pill text-xs font-bold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingFb}
              className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black shadow-lg hover:scale-105 transition"
            >
              {updatingFb ? 'Saving...' : 'Update & Notify Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Broadcast New Notice */}
      <Modal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        title="Broadcast Notice to Section D"
        subtitle="This circular will be visible to all students on CYBEX D"
      >
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              placeholder="e.g. Physics Lab Shifted to Room V 306"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Priority Level
              </label>
              <select
                value={noticePriority}
                onChange={(e) => setNoticePriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent Alert</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Notice Category
              </label>
              <select
                value={noticeCategory}
                onChange={(e) => setNoticeCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
              >
                <option value="Academic">Academic</option>
                <option value="Exam">Exam / Mid-Term</option>
                <option value="Infrastructure">Infrastructure / Room</option>
                <option value="General">General Notice</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Notice Content *
            </label>
            <textarea
              required
              rows={4}
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder="Write the announcement details clearly..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pin-notice-cybex-bw"
              checked={noticePinned}
              onChange={(e) => setNoticePinned(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black text-white"
            />
            <label htmlFor="pin-notice-cybex-bw" className="text-xs text-zinc-300 font-semibold cursor-pointer">
              Pin to top of notice banner
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsNoticeModalOpen(false)}
              className="px-4 py-2 rounded-xl liquid-glass-pill text-xs font-bold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingNotice}
              className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black shadow-lg hover:scale-105 transition"
            >
              {submittingNotice ? 'Publishing...' : 'Broadcast Notice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Survey Response Details */}
      <Modal
        isOpen={!!selectedSurveyItem}
        onClose={() => setSelectedSurveyItem(null)}
        title="Student Mandatory Survey Response"
        subtitle={`Submitted by ${selectedSurveyItem?.studentName} (${selectedSurveyItem?.studentRoll || 'Section D'})`}
      >
        {selectedSurveyItem && (
          <div className="space-y-5 text-xs sm:text-sm max-h-[70vh] overflow-y-auto pr-1">
            {/* Student Meta */}
            <div className="p-4 rounded-2xl liquid-glass grid grid-cols-1 sm:grid-cols-3 gap-3 border border-white/10">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">Roll Number</span>
                <span className="font-mono font-bold text-white text-xs">{selectedSurveyItem.studentRoll || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">Student Name</span>
                <span className="font-bold text-white text-xs">{selectedSurveyItem.studentName}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">Submitted On</span>
                <span className="text-zinc-300 text-xs">{new Date(selectedSurveyItem.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Infrastructure Rating */}
            <div className="p-4 rounded-2xl liquid-glass space-y-2 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-white" /> Classroom & Lab Infrastructure Rating
                </span>
                <span className="bg-white text-black font-black text-xs px-2 py-0.5 rounded-md">
                  {selectedSurveyItem.classInfrastructureRating || 5} / 5 Stars
                </span>
              </div>
              {selectedSurveyItem.infraComments && (
                <p className="text-xs text-zinc-300 pt-1 border-t border-white/10">
                  <strong className="text-white">Facility Maintenance Remarks:</strong> {selectedSurveyItem.infraComments}
                </p>
              )}
            </div>

            {/* Faculty Reviews */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-white" /> Faculty Evaluations ({selectedSurveyItem.facultyReviews?.length || 0} Subjects)
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {(selectedSurveyItem.facultyReviews || []).map((rev, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl liquid-glass border border-white/10 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black text-black bg-white px-2 py-0.5 rounded">
                            {rev.code}
                          </span>
                          <span className="font-bold text-white text-xs">{rev.subject}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{rev.faculty}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1 text-white font-black text-xs">
                          <Star className="w-3 h-3 fill-white text-white" />
                          <span>{rev.rating}/5</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium">{rev.pace} Pace</span>
                      </div>
                    </div>

                    {rev.improvementSuggestion && (
                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-zinc-300">
                        <span className="font-bold text-white">Suggested Changes: </span>
                        {rev.improvementSuggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Feedback */}
            {selectedSurveyItem.overallFeedback && (
              <div className="p-4 rounded-2xl liquid-glass space-y-1 border border-white/10">
                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">
                  Overall Academic & Classroom Experience
                </span>
                <p className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {selectedSurveyItem.overallFeedback}
                </p>
              </div>
            )}

            {/* Recommendations */}
            {selectedSurveyItem.recommendations && (
              <div className="p-4 rounded-2xl liquid-glass space-y-1 border border-white/10">
                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">
                  Suggestions & Requests for Section D
                </span>
                <p className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {selectedSurveyItem.recommendations}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSurveyItem(null)}
                className="px-5 py-2 bg-white text-black font-black text-xs rounded-xl hover:bg-zinc-200 transition"
              >
                Close Response
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
