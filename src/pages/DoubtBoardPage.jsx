import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import DoubtDetailPage from './DoubtDetailPage';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  User, 
  Clock, 
  BookOpen,
  Filter
} from 'lucide-react';

export default function DoubtBoardPage() {
  const { user } = useAuth();
  const { doubtsList, submitDoubt } = useData();
  const { addToast } = useToast();

  const [selectedDoubtId, setSelectedDoubtId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [subjectCode, setSubjectCode] = useState('CSE 201');
  const [description, setDescription] = useState('');

  const subjectsList = [
    { name: 'Data Structures & Algorithms', code: 'CSE 201' },
    { name: 'Database Management Systems', code: 'CSE 202' },
    { name: 'Operating Systems', code: 'CSE 203' },
    { name: 'Computer Organization & Architecture', code: 'CSE 204' },
    { name: 'Discrete Mathematics', code: 'MAT 201' },
    { name: 'Design & Analysis of Algorithms', code: 'CSE 205' },
    { name: 'General / Other', code: 'GEN' }
  ];

  const handleSubjectChange = (subName) => {
    setSubject(subName);
    const match = subjectsList.find(s => s.name === subName);
    if (match) setSubjectCode(match.code);
  };

  const handleCreateDoubt = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      addToast('Please provide a doubt title and clear explanation.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const newDoubt = await submitDoubt({
        title: title.trim(),
        subject,
        subjectCode,
        description: description.trim()
      });

      addToast('Your doubt has been posted to the board!', 'success');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setSelectedDoubtId(newDoubt.id);
    } catch (err) {
      addToast(err.message || 'Failed to post doubt.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedDoubtId) {
    return (
      <DoubtDetailPage
        doubtId={selectedDoubtId}
        onBack={() => setSelectedDoubtId(null)}
      />
    );
  }

  // Filter doubts
  const filteredDoubts = doubtsList.filter(d => {
    const matchesSearch = 
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = selectedSubject === 'All' || d.subject.toLowerCase() === selectedSubject.toLowerCase();

    const matchesStatus = 
      selectedStatus === 'All' ||
      (selectedStatus === 'Resolved' && d.isResolved) ||
      (selectedStatus === 'Open' && !d.isResolved && (!d.replies || d.replies.length === 0)) ||
      (selectedStatus === 'Answered' && !d.isResolved && d.replies && d.replies.length > 0);

    return matchesSearch && matchesSubject && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Academic Peer & CR Support
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Academic Doubt Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Ask questions on coursework, numericals, lab coding, or exam concepts. Get answers from the Class Representative and fellow classmates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-srm-600 hover:bg-srm-700 text-white font-bold text-sm shadow-md shadow-srm-600/25 transition flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Post an Academic Doubt</span>
        </button>
      </div>

      {/* Search & Subject Filter Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doubts by keyword, algorithm, or subject..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-srm-600 focus:ring-2 focus:ring-srm-100 outline-none text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              {['All', 'Open', 'Answered', 'Resolved'].map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedStatus === st
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <button
            onClick={() => setSelectedSubject('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedSubject === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Subjects
          </button>
          {subjectsList.map(s => (
            <button
              key={s.code}
              onClick={() => setSelectedSubject(s.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedSubject === s.name
                  ? 'bg-srm-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.code}: {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Doubt Cards Grid */}
      {filteredDoubts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">No doubts matching your filter</h4>
          <p className="text-xs text-slate-500">
            Have a question on your coursework? Be the first to ask!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 text-xs font-bold text-srm-600 bg-srm-50 px-4 py-2 rounded-xl border border-srm-200"
          >
            + Ask a Doubt Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoubts.map(dbt => {
            const hasCRReply = dbt.replies?.some(r => r.isCR);
            return (
              <div
                key={dbt.id}
                onClick={() => setSelectedDoubtId(dbt.id)}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-srm-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-srm-50 text-srm-800 border border-srm-200">
                      {dbt.subjectCode || dbt.subject}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      dbt.isResolved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : dbt.replies?.length > 0
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {dbt.isResolved ? 'Resolved' : dbt.replies?.length > 0 ? `${dbt.replies.length} Replies` : 'Open'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-srm-600 transition leading-snug line-clamp-2">
                    {dbt.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {dbt.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{dbt.studentName || 'Classmate'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasCRReply && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        CR Replied
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-semibold text-srm-600 group-hover:translate-x-0.5 transition-transform">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{dbt.replies?.length || 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Doubt Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post an Academic Doubt"
        subtitle="Shared with CSE Section D classmates and the Class Representative"
      >
        <form onSubmit={handleCreateDoubt} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject *
            </label>
            <select
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-srm-600 focus:ring-2 focus:ring-srm-100 outline-none text-sm text-slate-900 bg-white"
            >
              {subjectsList.map(s => (
                <option key={s.code} value={s.name}>{s.code}: {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Question Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to compute time complexity of Dijkstra with Fibonacci Heap?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-srm-600 focus:ring-2 focus:ring-srm-100 outline-none text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Explanation / Code / Formula Snippet *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide the context, what you tried, and what part is unclear..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-srm-600 focus:ring-2 focus:ring-srm-100 outline-none text-sm text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-srm-600 hover:bg-srm-700 disabled:opacity-60 text-white text-xs font-bold shadow-sm shadow-srm-600/30 transition flex items-center gap-2"
            >
              {submitting ? 'Posting...' : 'Post Doubt'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
