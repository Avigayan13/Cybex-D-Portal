import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { token, user } = useAuth();
  
  const cleanFeedItems = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(item => 
      item &&
      item.id !== 'gc-os-unit3-threads' &&
      item.id !== 'gc-dbms-er-sql-lab' &&
      item.id !== 'gc-dcn-socket-prog' &&
      item.id !== 'gc-math-discrete-recurrence'
    );
  };

  const [announcements, setAnnouncements] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [classroomFeed, setClassroomFeed] = useState(() => {
    try {
      const cached = localStorage.getItem('srmap_gc_feed');
      if (cached) {
        return cleanFeedItems(JSON.parse(cached));
      }
      return [];
    } catch {
      return [];
    }
  });
  const [classroomStatus, setClassroomStatus] = useState(() => {
    const hasTokens = Boolean(localStorage.getItem('srmap_gc_tokens') || localStorage.getItem('srmap_gc_refresh_token'));
    return { isConfigured: true, isConnected: hasTokens, totalItems: 0 };
  });
  const [feedbackList, setFeedbackList] = useState([]);
  const [doubtsList, setDoubtsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [surveyStats, setSurveyStats] = useState({ totalEnrolled: 58, submittedCount: 0, percentage: 0, pendingStudents: [] });
  const [userSurveySubmitted, setUserSurveySubmitted] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live status state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveStatus, setLiveStatus] = useState({
    currentClass: null,
    nextClass: null,
    timeRemainingText: '',
    timeRemainingSeconds: 0,
    statusType: 'free' // 'ongoing' | 'break' | 'free' | 'done' | 'weekend'
  });

  // Ticker for current local time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Safe JSON helper to prevent syntax crashes
  const parseSafe = async (res) => {
    try {
      const text = await res.text();
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  // Fetch public and authenticated data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const localTokens = localStorage.getItem('srmap_gc_tokens');
      const gcHeaders = localTokens ? { 'x-classroom-tokens': localTokens } : {};

      const [annRes, ttRes, matRes, dbtRes, stuRes, srvRes, gcRes, gcStatusRes] = await Promise.all([
        fetch('/api/announcements'),
        fetch('/api/timetable'),
        fetch('/api/materials'),
        fetch('/api/doubts'),
        fetch('/api/students'),
        fetch('/api/surveys/stats'),
        fetch('/api/classroom/feed', { headers: gcHeaders }),
        fetch('/api/classroom/status', { headers: gcHeaders })
      ]);

      if (annRes.ok) { const d = await parseSafe(annRes); if (d) setAnnouncements(d); }
      if (ttRes.ok) { const d = await parseSafe(ttRes); if (d) setTimetable(d); }
      if (matRes.ok) { const d = await parseSafe(matRes); if (d) setMaterials(d); }
      if (dbtRes.ok) { const d = await parseSafe(dbtRes); if (d) setDoubtsList(d); }
      if (stuRes.ok) { const d = await parseSafe(stuRes); if (d) setStudentsList(d); }
      if (srvRes.ok) { const d = await parseSafe(srvRes); if (d) setSurveyStats(d); }
      
      if (gcRes.ok) { 
        const d = await parseSafe(gcRes); 
        if (d && Array.isArray(d)) {
          const cleaned = cleanFeedItems(d);
          setClassroomFeed(cleaned);
          try { localStorage.setItem('srmap_gc_feed', JSON.stringify(cleaned)); } catch {}
        }
      }
      
      if (gcStatusRes.ok) { 
        const d = await parseSafe(gcStatusRes); 
        if (d) {
          const hasLocalToken = Boolean(localStorage.getItem('srmap_gc_tokens') || localStorage.getItem('srmap_gc_refresh_token'));
          setClassroomStatus({
            ...d,
            isConnected: d.isConnected || hasLocalToken
          });
        }
      }

      if (token) {
        const [fbRes, srvStatusRes] = await Promise.all([
          fetch('/api/feedback', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/surveys/my-status', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (fbRes.ok) { const d = await parseSafe(fbRes); if (d) setFeedbackList(d); }
        if (srvStatusRes.ok) {
          const srvData = await parseSafe(srvStatusRes);
          if (srvData) setUserSurveySubmitted(Boolean(srvData.submitted));
        }

        if (user?.role === 'admin') {
          const stRes = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (stRes.ok) { const d = await parseSafe(stRes); if (d) setStats(d); }
        }
      } else {
        setFeedbackList([]);
        setUserSurveySubmitted(false);
        setStats(null);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle OAuth callback tokens from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gcTokensParam = params.get('gc_tokens');
    const authStatus = params.get('classroom_auth');

    if (gcTokensParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(gcTokensParam));
        localStorage.setItem('srmap_gc_tokens', JSON.stringify(decoded));
        if (decoded.refresh_token) {
          localStorage.setItem('srmap_gc_refresh_token', decoded.refresh_token);
        }
        setClassroomStatus(prev => ({ ...prev, isConnected: true }));
      } catch (e) {
        console.warn('Failed to parse gc_tokens:', e);
      }
      // Clean query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (authStatus === 'success' || gcTokensParam) {
      setTimeout(() => {
        syncClassroomFeed().catch(e => console.warn('Post-auth auto sync:', e));
      }, 500);
    }
  }, []);

  // Compute Live Class Status based on current time & timetable (Shows Hours & Minutes)
  useEffect(() => {
    if (!timetable || timetable.length === 0) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[currentTime.getDay()];

    if (currentDayName === 'Saturday' || currentDayName === 'Sunday') {
      setLiveStatus({
        currentClass: null,
        nextClass: null,
        timeRemainingText: 'Weekend - No classes scheduled today',
        timeRemainingSeconds: 0,
        statusType: 'weekend'
      });
      return;
    }

    // Get today's classes sorted by start time
    const todayClasses = timetable
      .filter(t => t.day.toLowerCase() === currentDayName.toLowerCase())
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (todayClasses.length === 0) {
      setLiveStatus({
        currentClass: null,
        nextClass: null,
        timeRemainingText: 'No classes scheduled for today',
        timeRemainingSeconds: 0,
        statusType: 'free'
      });
      return;
    }

    const nowHours = currentTime.getHours();
    const nowMinutes = currentTime.getMinutes();
    const nowSeconds = currentTime.getSeconds();
    const currentTotalSec = nowHours * 3600 + nowMinutes * 60 + nowSeconds;

    let activeClass = null;
    let upcomingClass = null;
    let statusType = 'free';
    let remainingSec = 0;
    let remainingText = '';

    for (let i = 0; i < todayClasses.length; i++) {
      const c = todayClasses[i];
      const [sh, sm] = c.startTime.split(':').map(Number);
      const [eh, em] = c.endTime.split(':').map(Number);
      const startSec = sh * 3600 + sm * 60;
      const endSec = eh * 3600 + em * 60;

      if (currentTotalSec >= startSec && currentTotalSec < endSec) {
        activeClass = c;
        remainingSec = endSec - currentTotalSec;
        upcomingClass = todayClasses[i + 1] || null;
        statusType = 'ongoing';
        break;
      } else if (currentTotalSec < startSec) {
        upcomingClass = c;
        statusType = 'break';
        remainingSec = startSec - currentTotalSec;
        break;
      }
    }

    // Format helper to show Hours, Minutes, and Seconds
    const formatDuration = (totalSeconds) => {
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      if (hrs > 0) {
        return `${hrs}h ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
      }
      return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    };

    if (!activeClass && !upcomingClass) {
      statusType = 'done';
      remainingText = 'Classes finished for today';
    } else if (activeClass) {
      remainingText = `${formatDuration(remainingSec)} remaining`;
    } else if (upcomingClass) {
      remainingText = `Starts in ${formatDuration(remainingSec)}`;
    }

    setLiveStatus({
      currentClass: activeClass,
      nextClass: upcomingClass,
      timeRemainingText: remainingText,
      timeRemainingSeconds: remainingSec,
      statusType
    });
  }, [currentTime, timetable]);

  // Actions for Feedback
  const submitFeedback = async (data) => {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit feedback');
    }
    const newFb = await res.json();
    setFeedbackList(prev => [newFb, ...prev]);
    return newFb;
  };

  const updateFeedbackStatus = async (id, status, crResponse) => {
    const res = await fetch(`/api/feedback/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, crResponse })
    });
    if (!res.ok) throw new Error('Failed to update status');
    const updated = await res.json();
    setFeedbackList(prev => prev.map(f => f.id === id ? updated : f));
    if (user?.role === 'admin') fetchData();
    return updated;
  };

  // Actions for Announcements (CR Admin)
  const addAnnouncement = async (annData) => {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(annData)
    });
    if (!res.ok) throw new Error('Failed to post announcement');
    const newAnn = await res.json();
    setAnnouncements(prev => [newAnn, ...prev]);
    return newAnn;
  };

  const deleteAnnouncement = async (id) => {
    const res = await fetch(`/api/announcements/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete announcement');
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const deleteFeedback = async (id) => {
    const res = await fetch(`/api/feedback/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete feedback');
    setFeedbackList(prev => prev.filter(f => f.id !== id));
  };

  // Actions for Students (CR Admin)
  const addStudent = async (studentData) => {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(studentData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add student');
    setStudentsList(prev => [...prev, data]);
    return data;
  };

  const updateStudent = async (id, studentData) => {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(studentData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update student');
    setStudentsList(prev => prev.map(s => (s.id === id || s.id === Number(id)) ? data : s));
    return data;
  };

  const deleteStudent = async (id) => {
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to remove student');
    setStudentsList(prev => prev.filter(s => s.id !== id && s.id !== Number(id)));
  };

  // Actions for Live Mandatory Survey
  const submitSurvey = async (surveyData) => {
    const res = await fetch('/api/surveys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(surveyData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit class survey');
    setUserSurveySubmitted(true);
    fetchData();
    return data;
  };

  // Google Classroom Actions
  const syncClassroomFeed = async (overrideTokens = null) => {
    let tokensToSend = overrideTokens;
    if (!tokensToSend) {
      try {
        const raw = localStorage.getItem('srmap_gc_tokens');
        if (raw) tokensToSend = JSON.parse(raw);
      } catch {}
    }

    const res = await fetch('/api/classroom/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(tokensToSend ? { 'x-classroom-tokens': JSON.stringify(tokensToSend) } : {})
      },
      body: JSON.stringify({ tokens: tokensToSend })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sync Google Classroom');
    
    if (data.items && Array.isArray(data.items)) {
      setClassroomFeed(data.items);
      try { localStorage.setItem('srmap_gc_feed', JSON.stringify(data.items)); } catch {}
    }

    setClassroomStatus(prev => ({
      ...prev,
      isConnected: true,
      totalItems: data.items ? data.items.length : prev.totalItems
    }));

    return data;
  };

  const connectGoogleClassroom = async () => {
    if (!token) throw new Error('Admin authentication required');
    const res = await fetch('/api/classroom/auth-url', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get Google Classroom authorization URL');
    if (data.url) {
      window.location.href = data.url;
    }
  };

  const disconnectGoogleClassroom = async () => {
    localStorage.removeItem('srmap_gc_tokens');
    localStorage.removeItem('srmap_gc_refresh_token');
    
    if (token) {
      try {
        await fetch('/api/classroom/disconnect', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {
        console.warn('Disconnect error:', e);
      }
    }
    
    setClassroomStatus(prev => ({ ...prev, isConnected: false }));
    fetchData();
  };

  return (
    <DataContext.Provider value={{
      announcements,
      timetable,
      materials,
      classroomFeed,
      classroomStatus,
      feedbackList,
      doubtsList,
      studentsList,
      surveyStats,
      userSurveySubmitted,
      stats,
      loading,
      currentTime,
      liveStatus,
      refreshData: fetchData,
      syncClassroomFeed,
      connectGoogleClassroom,
      disconnectGoogleClassroom,
      submitFeedback,
      updateFeedbackStatus,
      deleteFeedback,
      addAnnouncement,
      deleteAnnouncement,
      addStudent,
      updateStudent,
      deleteStudent,
      submitSurvey
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
