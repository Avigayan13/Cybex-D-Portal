import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import FeedbackPage from './pages/FeedbackPage';
import TimetablePage from './pages/TimetablePage';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const { user, loading, isAdmin } = useAuth();
  
  // Clean navigation: 'dashboard' | 'timetable' | 'feedback' | 'admin'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState(null); // null | 'student' | 'admin'

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black text-zinc-400 tracking-widest uppercase">Loading CYBEX D...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in
  if (!user) {
    if (authView) {
      return (
        <AuthPage
          initialRole={authView}
          onBack={() => setAuthView(null)}
          onSuccess={() => {
            setAuthView(null);
            setActiveTab('dashboard');
          }}
        />
      );
    }
    return (
      <LandingPage
        onGetStarted={() => setAuthView('student')}
        onAdminLogin={() => setAuthView('admin')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area - Expansive Full Screen */}
      <main className="w-full max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-10 pt-5 pb-24 md:pb-12 flex-1">
        {activeTab === 'dashboard' && (
          <StudentDashboard onNavigate={setActiveTab} />
        )}

        {activeTab === 'timetable' && (
          <TimetablePage />
        )}

        {activeTab === 'feedback' && (
          <FeedbackPage />
        )}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard onNavigate={setActiveTab} />
          ) : (
            <div className="liquid-glass p-8 rounded-3xl text-center space-y-3 max-w-lg mx-auto my-12">
              <p className="text-sm font-bold text-rose-400">Access Denied</p>
              <p className="text-xs text-zinc-400">Only the authorized Class Representative can access the CR Control Center.</p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-black rounded-xl shadow-lg transition"
              >
                Return to Dashboard
              </button>
            </div>
          )
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Footer */}
      <footer className="hidden md:block border-t border-white/10 bg-black/80 backdrop-blur-xl py-6">
        <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400">
          <div>
            <span className="font-black text-white tracking-wide">CYBEX D</span> • SRM University AP • CSE Section D
          </div>
          <div className="text-[11px] text-zinc-500 font-medium">
            CYT - AVIGAYAN JANA CSE CS-D
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}
