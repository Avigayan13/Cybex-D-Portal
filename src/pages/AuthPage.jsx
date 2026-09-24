import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { 
  Mail, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft
} from 'lucide-react';

export default function AuthPage({ initialRole = 'student', onBack, onSuccess }) {
  const { requestOtp, verifyOtp, portalConfig } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState(initialRole === 'admin' ? (portalConfig.adminEmail || 'avigayan_jana@srmap.edu.in') : '');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [detectedStudent, setDetectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    setError('');

    const cleanInput = email.trim().toLowerCase();
    if (!cleanInput) {
      setError('Please enter your institutional email or SRM Roll Number.');
      return;
    }

    setLoading(true);
    try {
      const data = await requestOtp(cleanInput, name);
      if (data.email) setEmail(data.email);
      setGeneratedOtp(data.previewOtp || '');
      setEmailSent(Boolean(data.emailSent));
      if (data.detectedName) {
        setName(data.detectedName);
        setDetectedStudent({ name: data.detectedName, roll: data.rollNumber });
      }
      setStep('otp');
      addToast(data.message || 'OTP verification code generated', 'success');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check the email/roll number entered.');
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification OTP code.');
      return;
    }

    setLoading(true);
    try {
      const user = await verifyOtp(email.trim().toLowerCase(), otp.trim(), name);
      addToast(`Welcome back, ${user.name}! Logged in as ${user.role === 'admin' ? 'Class Representative' : 'Student'}.`, 'success');
      if (onSuccess) onSuccess(user);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the OTP.');
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillOtp = () => {
    if (generatedOtp) {
      setOtp(generatedOtp);
      addToast('OTP auto-filled into form', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white selection:bg-white selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition liquid-glass-pill px-3 py-1.5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to CYBEX D Overview</span>
          </button>
        )}

        <div className="flex justify-center">
          <div className="h-16 sm:h-20 px-4 py-2 rounded-2xl bg-black border border-white/20 flex items-center justify-center shadow-2xl">
            <img 
              src="/srm_full_logo.png" 
              alt="SRM University AP Logo" 
              className="h-full w-auto object-contain brightness-110 contrast-125"
              onError={(e) => {
                e.target.src = '/srm_logo.png';
              }}
            />
          </div>
        </div>

        <h2 className="mt-4 text-center text-3xl font-black text-white tracking-tight">
          CYBEX <span className="text-zinc-400">D</span>
        </h2>
        <p className="mt-1 text-center text-xs font-black text-zinc-400 uppercase tracking-widest">
          CSE Section D • SRM University AP
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="liquid-glass py-8 px-6 shadow-[0_20px_50px_rgba(0,0,0,0.95)] rounded-3xl sm:px-8 relative overflow-hidden">
          {/* Specular rim */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"></div>

          {/* Form Step 1: Institutional Email or Roll Number */}
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Institutional Email or Roll Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="e.g. AP26110090265 or avigayan_jana@srmap.edu.in"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/15 bg-black text-white focus:border-white focus:ring-1 focus:ring-white outline-none text-sm transition placeholder:text-zinc-600 font-medium"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-zinc-400" />
                  <span>Enter Roll Number (e.g. <strong>AP26110090206</strong>) or <strong>@srmap.edu.in</strong> email</span>
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl liquid-glass border border-rose-500/40 text-xs font-medium text-rose-300 leading-relaxed">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-60 text-black font-black text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span>Checking & Generating OTP...</span>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form Step 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto mb-2 border border-white/20 shadow-lg">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Enter Verification Code</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Code generated for <span className="font-semibold text-white">{detectedStudent ? `${detectedStudent.name} (${detectedStudent.roll || email})` : email}</span>
                </p>
              </div>

              {/* Real Email vs Dev simulated alert */}
              {emailSent ? (
                <div className="p-3.5 rounded-2xl liquid-glass text-xs text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Real verification email sent to <strong>{email}</strong>. Please check your SRM AP inbox!</span>
                </div>
              ) : (
                generatedOtp && (
                  <div className="p-3.5 rounded-2xl liquid-glass text-xs text-zinc-200 flex items-center justify-between gap-2 border border-white/20">
                    <div>
                      <span className="font-bold text-zinc-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-white" /> Verification OTP:
                      </span>
                      <span className="text-base font-mono font-black tracking-widest text-white ml-0.5">
                        {generatedOtp}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutofillOtp}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-[11px] shadow transition hover:scale-105"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 text-center">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-xl border border-white/15 bg-black text-white focus:border-white focus:ring-1 focus:ring-white outline-none transition"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl liquid-glass border border-rose-500/40 text-xs font-medium text-rose-300 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-60 text-black font-black text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Enter CYBEX D</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setError('');
                  }}
                  className="text-xs font-medium text-zinc-400 hover:text-white transition"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="text-xs font-bold text-zinc-300 hover:text-white transition"
                >
                  Resend OTP Code
                </button>
              </div>
            </form>
          )}

        </div>

        <div className="mt-6 text-center space-y-1">
          <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>CYBEX D • SRM AP Computer Science & Engineering</span>
          </p>
        </div>
      </div>
    </div>
  );
}
