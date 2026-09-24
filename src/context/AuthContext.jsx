import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('srmap_csed_token') || null);
  const [loading, setLoading] = useState(true);
  const [portalConfig, setPortalConfig] = useState({
    adminEmail: "cr.csed@srmap.edu.in",
    adminName: "Class Representative",
    sectionName: "CSE Section D",
    academicYear: "2025-2026 (Semester IV)"
  });

  // Safe JSON helper to handle non-JSON responses gracefully
  const safeJson = async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new Error(`Server returned error (${res.status}). Please check API credentials or connection.`);
      }
      throw new Error('Received unexpected non-JSON response from server.');
    }
  };

  // Fetch initial portal configuration
  useEffect(() => {
    fetch('/api/config')
      .then(safeJson)
      .then(data => {
        if (data && data.adminEmail) setPortalConfig(data);
      })
      .catch(err => console.error('Error fetching config:', err));
  }, []);

  // Check current session
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(safeJson)
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
        } else {
          logout();
        }
      })
      .catch(err => {
        console.error('Session verify error:', err);
        logout();
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const requestOtp = async (email, name) => {
    const res = await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to request OTP');
    }
    return data;
  };

  const verifyOtp = async (email, otp, name) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, name })
    });
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Failed to verify OTP');
    }
    localStorage.setItem('srmap_csed_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('srmap_csed_token');
    setToken(null);
    setUser(null);
  };

  const switchRole = async (targetRole) => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetRole })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem('srmap_csed_token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  const updateConfig = async (newConfig) => {
    if (!token || user?.role !== 'admin') return;
    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newConfig)
    });
    const data = await res.json();
    if (res.ok && data.config) {
      setPortalConfig(data.config);
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      portalConfig,
      requestOtp,
      verifyOtp,
      logout,
      switchRole,
      updateConfig,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
