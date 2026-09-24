import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import { 
  MessageSquarePlus, 
  GraduationCap,
  Building2,
  ShieldAlert,
  ShieldCheck, 
  Lock, 
  EyeOff,
  Eye,
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  Users,
  Star,
  Flame,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Layers,
  Send,
  HelpCircle
} from 'lucide-react';

const FACULTY_LIST = [
  { name: "Dr. Antarleena Basu (26093)", subject: "Art of Listening, Speaking and Reading Skills", code: "AEC 101" },
  { name: "Dr. Mudavath Ravi (25358) / Dr. Sahadeb Shit", subject: "Fundamentals of Computing & Programming in C", code: "CSE 101" },
  { name: "Dr. Krishna Prasad Maity (24123)", subject: "Engineering Physics", code: "FIC 102" },
  { name: "Dr. Koyel Chakravarty (22108)", subject: "Calculus for Engineers", code: "FIC 103" },
  { name: "Dr. Kousik Das (22118)", subject: "Environmental Science", code: "VAC 101" },
  { name: "Mr. Skilling Course (Tmp124)", subject: "Analytical Reasoning & Aptitude Skills - I", code: "SEC 101" }
];

const CLASS_TOPICS = [
  "Classroom S 312 Facilities (AC, Projector, Mic, Seating)",
  "Lab Infrastructure (V 602 / V 403 / V 306 PC & Software)",
  "Timetable Schedule & Period Durations",
  "Exam, Mid-Term & Internal Assessment Coordination",
  "Syllabus Pace & Course Material Availability",
  "General Class / Section D Academic Issues"
];

export default function FeedbackPage() {
  const { user } = useAuth();
  const { 
    feedbackList, 
    submitFeedback, 
    surveyStats, 
    userSurveySubmitted, 
    submitSurvey 
  } = useData();
  const { addToast } = useToast();

  // Active Feedback Form Type: 'faculty' | 'class' | 'cr_complaint' | null
  const [feedbackType, setFeedbackType] = useState(null);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [submitting, setSubmitting] = useState(false);

  // Form State - Faculty Feedback (Non-Anonymous)
  const [selectedFaculty, setSelectedFaculty] = useState(FACULTY_LIST[0]);
  const [facultyTeachingPace, setFacultyTeachingPace] = useState('Optimal');
  const [facultyClarityRating, setFacultyClarityRating] = useState(5);
  const [facultyDoubtResolution, setFacultyDoubtResolution] = useState('Responsive');
  const [facultyComments, setFacultyComments] = useState('');

  // Form State - Class Feedback (Non-Anonymous)
  const [classTopic, setClassTopic] = useState(CLASS_TOPICS[0]);
  const [classTitle, setClassTitle] = useState('');
  const [classDescription, setClassDescription] = useState('');

  // Form State - CR Complaint (Anonymous or Non-Anonymous)
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintPriority, setComplaintPriority] = useState('Normal');
  const [complaintIsAnonymous, setComplaintIsAnonymous] = useState(false);

  // Form State - Live Mandatory Survey (Slide-Wise Multi-Step)
  const [surveyStep, setSurveyStep] = useState(0); // 0-5: Subjects, 6: Infra, 7: Overall & Review
  const [surveyFacultyRatings, setSurveyFacultyRatings] = useState(
    FACULTY_LIST.map(f => ({ 
      faculty: f.name, 
      subject: f.subject, 
      code: f.code, 
      rating: 5, 
      pace: 'Optimal',
      improvementSuggestion: ''
    }))
  );
  const [surveyInfraRating, setSurveyInfraRating] = useState(5);
  const [surveyInfraComments, setSurveyInfraComments] = useState('');
  const [surveyOverallThoughts, setSurveyOverallThoughts] = useState('');
  const [surveyRecommendations, setSurveyRecommendations] = useState('');
  const [submittingSurvey, setSubmittingSurvey] = useState(false);

  // Submit Specific Feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (feedbackType === 'faculty') {
        if (!facultyComments.trim()) {
          addToast('Please provide your constructive feedback comments.', 'error');
          setSubmitting(false);
          return;
        }

        await submitFeedback({
          category: 'Faculty Feedback',
          subject: selectedFaculty.subject,
          facultyName: selectedFaculty.name,
          title: `Faculty Review: ${selectedFaculty.name} (${selectedFaculty.code})`,
          description: `• Teaching Pace: ${facultyTeachingPace}\n• Concept Clarity: ${facultyClarityRating}/5 Stars\n• Doubt Resolution: ${facultyDoubtResolution}\n\nFeedback Comments:\n${facultyComments.trim()}`,
          isAnonymous: false // strictly non-anonymous
        });
        addToast(`Faculty feedback for ${selectedFaculty.name} submitted successfully!`, 'success');
        setFacultyComments('');
      } 
      else if (feedbackType === 'class') {
        if (!classTitle.trim() || !classDescription.trim()) {
          addToast('Please enter both topic title and description.', 'error');
          setSubmitting(false);
          return;
        }

        await submitFeedback({
          category: 'Class Feedback',
          subject: classTopic,
          facultyName: 'Section D Class Coordination',
          title: classTitle.trim(),
          description: `[Topic: ${classTopic}]\n\n${classDescription.trim()}`,
          isAnonymous: false // strictly non-anonymous
        });
        addToast('Class feedback recorded and forwarded to CR.', 'success');
        setClassTitle('');
        setClassDescription('');
      } 
      else if (feedbackType === 'cr_complaint') {
        if (!complaintTitle.trim() || !complaintDescription.trim()) {
          addToast('Please enter a complaint title and description.', 'error');
          setSubmitting(false);
          return;
        }

        await submitFeedback({
          category: 'Complaints to CR',
          subject: 'Direct CR Grievance',
          facultyName: 'CR Avigayan Jana',
          title: complaintTitle.trim(),
          description: complaintDescription.trim(),
          priority: complaintPriority,
          isAnonymous: complaintIsAnonymous
        });
        addToast(
          complaintIsAnonymous 
            ? 'Anonymous complaint safely submitted to CR Avigayan Jana.' 
            : 'Grievance submitted to CR Avigayan Jana with your student details.',
          'success'
        );
        setComplaintTitle('');
        setComplaintDescription('');
        setComplaintIsAnonymous(false);
      }

      setFeedbackType(null);
    } catch (err) {
      addToast(err.message || 'Failed to submit feedback.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Live Mandatory Survey
  const handleSubmitSurvey = async (e) => {
    if (e) e.preventDefault();
    setSubmittingSurvey(true);
    try {
      await submitSurvey({
        facultyReviews: surveyFacultyRatings,
        classInfrastructureRating: surveyInfraRating,
        infraComments: surveyInfraComments.trim(),
        overallFeedback: surveyOverallThoughts.trim(),
        recommendations: surveyRecommendations.trim()
      });
      addToast('Mandatory Term Feedback Survey completed! Thank you for participating.', 'success');
      setIsSurveyModalOpen(false);
    } catch (err) {
      addToast(err.message || 'Failed to submit mandatory survey.', 'error');
    } finally {
      setSubmittingSurvey(false);
    }
  };

  const filteredList = feedbackList.filter(item => {
    const matchCat = filterCategory === 'All' || item.category === filterCategory;
    const matchStat = filterStatus === 'All' || item.status === filterStatus;
    return matchCat && matchStat;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>

        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="liquid-glass-pill text-[11px] font-black uppercase tracking-wider text-white px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> CYBEX D Redressal Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Feedback & Grievance Redressal
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
            Direct communication channel for CSE Section D students. Submit verified faculty ratings, class infrastructure suggestions, or personal grievances to Class Representative <strong>Avigayan Jana</strong>.
          </p>
        </div>
      </div>

      {/* 🔴 LIVE CLASS FORUM BANNER (MANDATORY SURVEY FOR ALL 58 STUDENTS) */}
      <div className={`p-6 sm:p-7 rounded-3xl relative overflow-hidden transition ${
        userSurveySubmitted 
          ? 'liquid-glass border border-white/15' 
          : 'bg-gradient-to-r from-zinc-900 via-black to-zinc-900 border border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.08)]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-300">
                Live Class Forum • Mandatory Term Survey
              </span>
              <span className="liquid-glass-pill text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white">
                All 58 Students
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              CYBEX D Academic & Faculty Evaluation Survey
            </h3>

            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Mandatory survey for all currently enrolled students of Cyber Security - D to rate all 6 term subjects, lecture pace, and lab resources. Results are compiled by CR for departmental review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            {/* Live Counter Badge */}
            <div className="liquid-glass px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/15">
              <Users className="w-4 h-4 text-white" />
              <div className="text-left">
                <div className="text-xs font-black text-white">
                  {surveyStats.submittedCount || 0} / {surveyStats.totalEnrolled || 58} Submitted
                </div>
                <div className="text-[10px] text-zinc-400 font-semibold">
                  {surveyStats.percentage || 0}% Class Participation
                </div>
              </div>
            </div>

            {/* Submission Status CTA */}
            {userSurveySubmitted ? (
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Survey Completed by You</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSurveyStep(0);
                  setIsSurveyModalOpen(true);
                }}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs shadow-lg hover:scale-105 transition flex items-center gap-2"
              >
                <Flame className="w-4 h-4 text-black" />
                <span>Fill Mandatory Survey (Slide-Wise) →</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 h-1.5 rounded-full mt-5 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
            style={{ width: `${Math.min(100, Math.max(5, surveyStats.percentage || 0))}%` }}
          />
        </div>
      </div>

      {/* 3 Channels Guide Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Channel 1 */}
        <div 
          onClick={() => setFeedbackType('faculty')}
          className="p-5 rounded-2xl liquid-glass-interactive cursor-pointer space-y-2 border border-white/10 hover:border-white/30"
        >
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Faculty Feedback</h4>
            <span className="text-[10px] font-bold text-zinc-400 liquid-glass-pill px-2 py-0.5 rounded">
              Non-Anonymous
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Rate specific faculty on teaching clarity, pace, and doubt solving. Attached with your name and roll number.
          </p>
        </div>

        {/* Channel 2 */}
        <div 
          onClick={() => setFeedbackType('class')}
          className="p-5 rounded-2xl liquid-glass-interactive cursor-pointer space-y-2 border border-white/10 hover:border-white/30"
        >
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Class & Infrastructure</h4>
            <span className="text-[10px] font-bold text-zinc-400 liquid-glass-pill px-2 py-0.5 rounded">
              Non-Anonymous
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Report issues regarding Room S 312, Physics/C Labs (V 602 / V 403 / V 306), timetable adjustments, and mid-terms.
          </p>
        </div>

        {/* Channel 3 */}
        <div 
          onClick={() => setFeedbackType('cr_complaint')}
          className="p-5 rounded-2xl liquid-glass-interactive cursor-pointer space-y-2 border border-white/10 hover:border-white/30"
        >
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Complaints to CR</h4>
            <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded">
              Anonymous Toggle
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Submit personal or class grievances directly to CR Avigayan Jana. Choose whether to submit anonymously or openly.
          </p>
        </div>
      </div>

      {/* Submissions History & Live Tracker */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-white" />
              My Submissions & Status Tracking
            </h3>
            <p className="text-xs text-zinc-400">
              Track resolution progress and official action responses from CR Avigayan Jana
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-white/15 bg-black text-white text-xs outline-none focus:border-white font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Faculty Feedback">Faculty Feedback</option>
              <option value="Class Feedback">Class Feedback</option>
              <option value="Complaints to CR">Complaints to CR</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-white/15 bg-black text-white text-xs outline-none focus:border-white font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="py-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto border border-white/20">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No feedback submissions found</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Use the buttons above to submit faculty reviews, class infrastructure feedback, or direct complaints to the Class Representative.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((item) => {
              const isResolved = item.status === 'Resolved';
              const isInProgress = item.status === 'In Progress';

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl liquid-glass space-y-3 border border-white/10 hover:border-white/20 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="liquid-glass-pill text-[10px] font-black uppercase tracking-wider text-white px-2.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${
                        isResolved
                          ? 'bg-white text-black'
                          : isInProgress
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'liquid-glass-pill text-zinc-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">{item.title}</h4>
                    <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* CR Official Response if provided */}
                  {item.crResponse && (
                    <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/15 space-y-1 text-xs">
                      <div className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" /> Action by CR (Avigayan Jana):
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{item.crResponse}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>
                      {item.isAnonymous ? '👤 Anonymous Student' : `👤 ${item.studentName || 'Student'}`}
                    </span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: SUBMIT INDIVIDUAL FEEDBACK (BY TYPE) */}
      <Modal
        isOpen={Boolean(feedbackType)}
        onClose={() => setFeedbackType(null)}
        title={
          feedbackType === 'faculty' 
            ? "Submit Faculty Feedback (Non-Anonymous)" 
            : feedbackType === 'class' 
              ? "Submit Class & Infrastructure Feedback (Non-Anonymous)" 
              : "Submit Complaint / Grievance to CR"
        }
        subtitle="SRM University AP • CSE Section D"
      >
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          {/* Faculty Feedback Form */}
          {feedbackType === 'faculty' && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Select Faculty Member & Course *
                </label>
                <select
                  value={selectedFaculty.name}
                  onChange={(e) => {
                    const fac = FACULTY_LIST.find(f => f.name === e.target.value);
                    if (fac) setSelectedFaculty(fac);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
                >
                  {FACULTY_LIST.map(f => (
                    <option key={f.name} value={f.name}>
                      {f.name} — {f.subject} ({f.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Lecture Pace
                  </label>
                  <select
                    value={facultyTeachingPace}
                    onChange={(e) => setFacultyTeachingPace(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
                  >
                    <option value="Too Fast">Too Fast (Need slower explanations)</option>
                    <option value="Optimal">Optimal / Balanced Pace</option>
                    <option value="Too Slow">Too Slow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Concept Clarity Rating
                  </label>
                  <select
                    value={facultyClarityRating}
                    onChange={(e) => setFacultyClarityRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5 Excellent Clarity)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5 Good)</option>
                    <option value={3}>⭐⭐⭐ (3/5 Average)</option>
                    <option value={2}>⭐⭐ (2/5 Needs Improvement)</option>
                    <option value={1}>⭐ (1/5 Poor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  In-Class Doubt Resolution
                </label>
                <select
                  value={facultyDoubtResolution}
                  onChange={(e) => setFacultyDoubtResolution(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
                >
                  <option value="Responsive">Responsive (Answers all doubts clearly)</option>
                  <option value="Moderate">Moderate (Sometimes skips questions)</option>
                  <option value="Unresponsive">Unresponsive / Disapproving of questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Detailed Constructive Feedback & Comments *
                </label>
                <textarea
                  required
                  rows={4}
                  value={facultyComments}
                  onChange={(e) => setFacultyComments(e.target.value)}
                  placeholder="Explain what aspects are going well or what could be improved in lecture style, syllabus coverage, or practical examples..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm placeholder:text-zinc-600"
                />
              </div>

              <div className="p-3 rounded-xl liquid-glass text-[11px] text-zinc-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>Non-Anonymous: Submitted with your verified student name ({user?.name || 'Logged-in Student'}).</span>
              </div>
            </>
          )}

          {/* Class Feedback Form */}
          {feedbackType === 'class' && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Classroom / Infrastructure Area *
                </label>
                <select
                  value={classTopic}
                  onChange={(e) => setClassTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
                >
                  {CLASS_TOPICS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={classTitle}
                  onChange={(e) => setClassTitle(e.target.value)}
                  placeholder="e.g. AC cooling issue in S 312 during afternoon lecture"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Description & Proposed Improvement *
                </label>
                <textarea
                  required
                  rows={4}
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  placeholder="Describe the issue clearly and suggest any timing/facility adjustments..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm placeholder:text-zinc-600"
                />
              </div>

              <div className="p-3 rounded-xl liquid-glass text-[11px] text-zinc-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>Non-Anonymous: Submitted with your verified student name ({user?.name || 'Logged-in Student'}).</span>
              </div>
            </>
          )}

          {/* Complaints to CR Form */}
          {feedbackType === 'cr_complaint' && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Complaint / Grievance Subject *
                </label>
                <input
                  type="text"
                  required
                  value={complaintTitle}
                  onChange={(e) => setComplaintTitle(e.target.value)}
                  placeholder="e.g. Need lab timing reschedule before exam week"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Priority Urgency
                </label>
                <select
                  value={complaintPriority}
                  onChange={(e) => setComplaintPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent (Requires immediate CR intervention)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Detailed Complaint Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={complaintDescription}
                  onChange={(e) => setComplaintDescription(e.target.value)}
                  placeholder="Explain the grievance in full detail for CR Avigayan Jana..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs sm:text-sm placeholder:text-zinc-600"
                />
              </div>

              {/* Anonymous Toggle for CR Complaint */}
              <div className="p-3.5 rounded-2xl liquid-glass border border-white/15 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {complaintIsAnonymous ? (
                      <EyeOff className="w-4 h-4 text-white" />
                    ) : (
                      <Eye className="w-4 h-4 text-zinc-400" />
                    )}
                    <span className="text-xs font-bold text-white">
                      {complaintIsAnonymous ? 'Anonymous Mode (Identity Hidden)' : 'Non-Anonymous (Name & Roll Attached)'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setComplaintIsAnonymous(!complaintIsAnonymous)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      complaintIsAnonymous
                        ? 'bg-white text-black font-black'
                        : 'bg-white/10 text-zinc-300 hover:bg-white/20'
                    }`}
                  >
                    {complaintIsAnonymous ? '✓ Anonymous ON' : 'Turn Anonymous ON'}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {complaintIsAnonymous
                    ? 'Your identity (name, email, roll number) will be completely hidden from the CR.'
                    : `Your submission will be tagged with your verified details (${user?.name || 'Student'}).`}
                </p>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFeedbackType(null)}
              className="px-4 py-2 rounded-xl liquid-glass-pill text-xs font-bold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black shadow-lg hover:scale-105 transition"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: LIVE MANDATORY CLASS SURVEY (7-SLIDE WIZARD) */}
      <Modal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        title="Live Mandatory Term Survey"
        subtitle={`Cyber Security - D • Compulsory for all 58 students (Slide ${surveyStep + 1} of 7)`}
      >
        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Top Progress Bar & Steps indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-white" />
                {surveyStep < 6 && `Subject ${surveyStep + 1} of 6: ${surveyFacultyRatings[surveyStep]?.code}`}
                {surveyStep === 6 && 'Review & Final Recommendations'}
              </span>
              <span className="font-mono text-xs font-bold text-zinc-400">
                Step {surveyStep + 1} / 7 ({Math.round(((surveyStep + 1) / 7) * 100)}%)
              </span>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden p-0.5">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.6)]" 
                style={{ width: `${((surveyStep + 1) / 7) * 100}%` }}
              />
            </div>

            {/* Mini Step Indicator Dots */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {[0, 1, 2, 3, 4, 5, 6].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSurveyStep(s)}
                  className={`h-1.5 flex-1 rounded-full transition ${
                    s === surveyStep 
                      ? 'bg-white' 
                      : s < surveyStep 
                      ? 'bg-white/40 hover:bg-white/60' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title={
                    s < 6 
                      ? `Subject ${s + 1}: ${FACULTY_LIST[s].code}` 
                      : 'Final Review'
                  }
                />
              ))}
            </div>
          </div>

          {/* ==================================================== */}
          {/* SLIDES 0 TO 5: SUBJECT & FACULTY EVALUATIONS         */}
          {/* ==================================================== */}
          {surveyStep >= 0 && surveyStep <= 5 && (() => {
            const currentSub = surveyFacultyRatings[surveyStep];
            const starLabels = {
              1: '1/5 - Poor / Needs Major Help',
              2: '2/5 - Below Average / Hard to follow',
              3: '3/5 - Average / Satisfactory',
              4: '4/5 - Good / Clear Teaching',
              5: '5/5 - Outstanding / Excellent Clarity'
            };

            return (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Subject Header Card */}
                <div className="p-4 rounded-2xl liquid-glass border border-white/15 space-y-1 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-white text-black">
                      {currentSub.code}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                      Subject {surveyStep + 1} of 6
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white pt-1">{currentSub.subject}</h3>
                  <p className="text-xs text-zinc-300 font-medium flex items-center gap-1.5 pt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                    Faculty: <strong>{currentSub.faculty}</strong>
                  </p>
                </div>

                {/* 1. Star Rating: Concept Clarity */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white">
                    1. Concept Clarity & Teaching Quality *
                  </label>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            const updated = [...surveyFacultyRatings];
                            updated[surveyStep].rating = star;
                            setSurveyFacultyRatings(updated);
                          }}
                          className="p-1 text-white hover:scale-125 transition transform"
                        >
                          <Star 
                            className={`w-7 h-7 sm:w-8 sm:h-8 transition ${
                              star <= currentSub.rating 
                                ? 'fill-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' 
                                : 'text-zinc-600 hover:text-zinc-400'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                    <div className="text-xs font-bold text-zinc-200">
                      {starLabels[currentSub.rating] || `${currentSub.rating}/5 Stars`}
                    </div>
                  </div>
                </div>

                {/* 2. Pacing Option Buttons */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white">
                    2. Syllabus Pace & Lecture Speed *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Too Slow', label: '🐢 Too Slow', desc: 'Overly basic' },
                      { id: 'Optimal', label: '⚡ Optimal', desc: 'Well-balanced' },
                      { id: 'Too Fast', label: '🚀 Too Fast', desc: 'Rushing topics' },
                    ].map((p) => {
                      const isSelected = currentSub.pace === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            const updated = [...surveyFacultyRatings];
                            updated[surveyStep].pace = p.id;
                            setSurveyFacultyRatings(updated);
                          }}
                          className={`p-3 rounded-xl border text-left transition ${
                            isSelected
                              ? 'bg-white text-black border-white shadow-md font-bold'
                              : 'bg-white/[0.04] text-zinc-300 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="text-xs font-bold">{p.label}</div>
                          <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-zinc-800' : 'text-zinc-500'}`}>
                            {p.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Subject-Specific Comments on What Should Be Changed */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <span>3. What should be changed or improved in this course?</span>
                    <span className="text-[10px] text-zinc-400 font-normal lowercase">(optional comments)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={currentSub.improvementSuggestion || ''}
                    onChange={(e) => {
                      const updated = [...surveyFacultyRatings];
                      updated[surveyStep].improvementSuggestion = e.target.value;
                      setSurveyFacultyRatings(updated);
                    }}
                    placeholder={`e.g. Provide presentation slides earlier, solve more numerical problems, conduct dedicated doubt-clearing sessions, add more live programming examples...`}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs leading-relaxed placeholder:text-zinc-600"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Constructive feedback directly helps the CR present Section D academic requests to faculty.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* ==================================================== */}
          {/* SLIDE 6 (FINAL SLIDE): REVIEW & SECTION D SUGGESTIONS */}
          {/* ==================================================== */}
          {surveyStep === 6 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header Card */}
              <div className="p-4 rounded-2xl liquid-glass border border-white/15 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                  Slide 7 of 7 • Final Step
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  Overall Section D Feedback & Class Suggestions
                </h3>
                <p className="text-xs text-zinc-400">
                  Share overall academic recommendations and review your ratings before final submission.
                </p>
              </div>

              {/* Overall Feedback Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-white">
                  1. Overall Section D Improvements & Academic Experience *
                </label>
                <textarea
                  required
                  rows={3}
                  value={surveyOverallThoughts}
                  onChange={(e) => setSurveyOverallThoughts(e.target.value)}
                  placeholder="Provide your thoughts on Section D academics, class notes sharing, internal exam schedules, tutorials, or study materials..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs leading-relaxed placeholder:text-zinc-600"
                />
              </div>

              {/* Recommendations for CR / Class */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-white">
                  2. Suggestions or Requests for Class Representative (CR)
                </label>
                <textarea
                  rows={2}
                  value={surveyRecommendations}
                  onChange={(e) => setSurveyRecommendations(e.target.value)}
                  placeholder="Any specific requests for CR Avigayan Jana regarding class events, doubt sessions, or timetable representation..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black text-white focus:border-white outline-none text-xs leading-relaxed placeholder:text-zinc-600"
                />
              </div>

              {/* Compact Review of Ratings */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <span className="text-[11px] font-black uppercase text-zinc-300">Ratings Summary</span>
                  <span className="text-[10px] text-zinc-500">Click any step at top to change</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {surveyFacultyRatings.map((f, idx) => (
                    <div 
                      key={f.code}
                      onClick={() => setSurveyStep(idx)}
                      className="p-2 rounded-lg bg-black/40 hover:bg-white/10 cursor-pointer border border-white/5 flex items-center justify-between transition"
                    >
                      <span className="font-bold text-white font-mono text-[11px]">{f.code}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-400">{f.pace}</span>
                        <span className="font-bold text-white text-[11px] flex items-center gap-0.5">
                          ⭐ {f.rating}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SLIDE NAVIGATION CONTROLS                            */}
          {/* ==================================================== */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
            {surveyStep > 0 ? (
              <button
                type="button"
                onClick={() => setSurveyStep(prev => Math.max(0, prev - 1))}
                className="px-4 py-2.5 rounded-xl liquid-glass-pill text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSurveyModalOpen(false)}
                className="px-4 py-2.5 rounded-xl liquid-glass-pill text-xs font-bold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            )}

            {surveyStep < 6 ? (
              <button
                type="button"
                onClick={() => {
                  setSurveyStep(prev => Math.min(6, prev + 1));
                }}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black shadow-lg hover:scale-105 transition flex items-center gap-1.5"
              >
                <span>
                  {surveyStep === 5 
                    ? 'Next: Review & Submit →' 
                    : `Next: ${FACULTY_LIST[surveyStep + 1]?.code} →`}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitSurvey}
                disabled={submittingSurvey}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submittingSurvey ? 'Submitting Responses...' : 'Submit Mandatory Survey ✨'}</span>
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
