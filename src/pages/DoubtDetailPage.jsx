import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import { 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  Clock, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export default function DoubtDetailPage({ doubtId, onBack }) {
  const { user, isAdmin } = useAuth();
  const { doubtsList, replyDoubt, toggleDoubtResolved } = useData();
  const { addToast } = useToast();

  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const doubt = doubtsList.find(d => d.id === doubtId);

  if (!doubt) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
        <p className="text-sm text-slate-500">Doubt not found or has been removed.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-srm-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Doubt Board
        </button>
      </div>
    );
  }

  const isAuthor = user?.email.toLowerCase() === doubt.studentEmail?.toLowerCase();
  const canResolve = isAuthor || isAdmin;

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSubmitting(true);
    try {
      await replyDoubt(doubt.id, replyMessage.trim());
      setReplyMessage('');
      addToast('Reply posted successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to post reply.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleResolve = async () => {
    try {
      const newState = !doubt.isResolved;
      await toggleDoubtResolved(doubt.id, newState);
      addToast(newState ? 'Doubt marked as Resolved! 🎉' : 'Doubt reopened.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update status.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doubt Board</span>
      </button>

      {/* Main Doubt Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-srm-50 text-srm-800 border border-srm-200">
              {doubt.subject} {doubt.subjectCode ? `(${doubt.subjectCode})` : ''}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              doubt.isResolved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {doubt.isResolved ? 'Resolved' : 'Open Doubt'}
            </span>
          </div>

          {canResolve && (
            <button
              onClick={handleToggleResolve}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                doubt.isResolved
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20'
              }`}
            >
              {doubt.isResolved ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen Doubt</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Resolved</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Title & Question */}
        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight leading-snug">
            {doubt.title}
          </h1>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {doubt.description}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>Asked by {doubt.studentName || 'Classmate'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(doubt.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Discussion & Replies Thread */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-srm-600" />
            <h3 className="text-base font-bold text-slate-900">
              Responses & Solutions ({doubt.replies?.length || 0})
            </h3>
          </div>
        </div>

        {/* Replies List */}
        {!doubt.replies || doubt.replies.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 font-medium">
              No replies yet. Be the first to help or wait for the Class Representative's solution.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {doubt.replies.map(rep => (
              <div
                key={rep.id}
                className={`p-5 rounded-2xl border transition-all ${
                  rep.isCR
                    ? 'bg-srm-50/60 border-srm-200 shadow-2xs'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {rep.isCR ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-srm-800 bg-srm-100 px-2.5 py-0.5 rounded-lg border border-srm-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-srm-600" />
                        <span>Class Representative</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-800">
                        {rep.authorName || 'Classmate'}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(rep.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {rep.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add Reply Box */}
        <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {isAdmin ? 'Post Official CR Solution' : 'Add Your Answer / Reply'}
          </label>
          <textarea
            required
            rows={3}
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder={isAdmin ? "Type the detailed explanation, formula, or solution..." : "Type your answer or follow-up question..."}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-srm-600 focus:ring-2 focus:ring-srm-100 outline-none text-xs sm:text-sm text-slate-900"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Keep academic discussions respectful and constructive.
            </span>
            <button
              type="submit"
              disabled={submitting || !replyMessage.trim()}
              className="px-5 py-2.5 rounded-xl bg-srm-600 hover:bg-srm-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-srm-600/30 transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Posting...' : 'Post Reply'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
