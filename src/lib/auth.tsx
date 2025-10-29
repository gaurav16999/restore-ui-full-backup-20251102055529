import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { postToken, getProfile, postRefreshToken } from './api';

interface AuthContextValue {
  user: any | null;
  accessToken: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string>('');
  const [refreshToken, setRefreshToken] = useState<string>('');
  const refreshIntervalRef = useRef<number | null>(null);

  // Initial authentication check
  useEffect(() => {
    const token = window.localStorage.getItem('accessToken') || '';
    const rtoken = window.localStorage.getItem('refreshToken') || '';
    setAccessToken(token);
    setRefreshToken(rtoken);
    if (token) {
      getProfile(token)
        .then(setUser)
        .catch(() => {
          // On failure try one refresh attempt before logging out
          if (rtoken) {
            postRefreshToken(rtoken)
              .then((data) => {
                if (data.access) {
                  window.localStorage.setItem('accessToken', data.access);
                  setAccessToken(data.access);
                  return getProfile(data.access).then(setUser);
                }
                throw new Error('No access token in refresh response');
              })
              .catch(() => {
                window.localStorage.removeItem('accessToken');
                window.localStorage.removeItem('refreshToken');
                setAccessToken('');
                setRefreshToken('');
              })
              .finally(() => setLoading(false));
          } else {
            window.localStorage.removeItem('accessToken');
            setAccessToken('');
            setLoading(false);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Auto-logout after 2 hours of inactivity
  useEffect(() => {
    if (!user) return; // Only run if user is logged in

    const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const WARNING_BEFORE_LOGOUT = 5 * 60 * 1000; // Show warning 5 minutes before logout
    let inactivityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    const performLogout = () => {
      setUser(null);
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    };

    const resetInactivityTimer = () => {
      // Clear existing timers
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      if (warningTimer) {
        clearTimeout(warningTimer);
      }

      // Set warning timer (1 hour 55 minutes)
      warningTimer = setTimeout(() => {
        const userResponse = confirm(
          'You have been inactive for 1 hour and 55 minutes.\n\n' +
          'You will be automatically logged out in 5 minutes.\n\n' +
          'Click OK to stay logged in, or Cancel to logout now.'
        );
        
        if (userResponse) {
          // User wants to stay logged in, reset timer
          resetInactivityTimer();
        } else {
          // User chose to logout
          performLogout();
        }
      }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);

      // Set main logout timer (2 hours)
      inactivityTimer = setTimeout(() => {
        alert('You have been logged out due to inactivity.');
        performLogout();
      }, INACTIVITY_TIMEOUT);
    };

    // Activity events to track
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Throttle the reset function to avoid excessive calls
    let isThrottled = false;
    const throttledReset = () => {
      if (!isThrottled) {
        isThrottled = true;
        resetInactivityTimer();
        setTimeout(() => {
          isThrottled = false;
        }, 1000); // Throttle to once per second
      }
    };

    // Add event listeners for user activity
    activityEvents.forEach(event => {
      window.addEventListener(event, throttledReset, { passive: true });
    });

    // Initialize the timer
    resetInactivityTimer();

    // Cleanup on unmount or when user changes
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      if (warningTimer) {
        clearTimeout(warningTimer);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, throttledReset);
      });
    };
  }, [user]);

  // Token auto-refresh every 30 minutes
  useEffect(() => {
    if (!refreshToken) return;

    const doRefresh = async () => {
      try {
        const data = await postRefreshToken(refreshToken);
        if (data?.access) {
          window.localStorage.setItem('accessToken', data.access);
          setAccessToken(data.access);
        }
      } catch (e) {
        // On refresh failure, logout to avoid using invalid tokens
        logout();
      }
    };

    // Kick off an immediate refresh attempt only if token looks missing/expired soon
    if (!accessToken) {
      doRefresh();
    }

    // Set interval ~30 minutes
    const id = window.setInterval(doRefresh, 30 * 60 * 1000);
    refreshIntervalRef.current = id;

    // Also refresh when tab gains visibility (user returns)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') doRefresh();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (refreshIntervalRef.current) window.clearInterval(refreshIntervalRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refreshToken]);

  const login = async (email: string, password: string) => {
    try {
      const tokenData = await postToken(email, password);
      window.localStorage.setItem('accessToken', tokenData.access);
      window.localStorage.setItem('refreshToken', tokenData.refresh);
      setAccessToken(tokenData.access);
      setRefreshToken(tokenData.refresh);
      const profile = await getProfile(tokenData.access);
      setUser(profile);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Only use demo mode for network/connection errors, not authentication errors
      const isNetworkError = error.message?.includes('fetch') || 
                           error.message?.includes('NetworkError') || 
                           error.message?.includes('Failed to fetch') ||
                           error.message?.includes('ECONNREFUSED') ||
                           error.message?.includes('timeout') ||
                           error.message?.includes('Server endpoint not found');
      
      if (isNetworkError) {
        console.log('Network error detected, using demo login mode');
        // Demo login mode when backend is unavailable
  const demoToken = 'demo_token_' + Date.now();
  window.localStorage.setItem('accessToken', demoToken);
  setAccessToken(demoToken);
        
        // Create demo user profile based on email
        let demoProfile;
        if (email.toLowerCase().includes('admin')) {
          demoProfile = {
            id: 1,
            username: 'admin',
            email: 'admin@school.edu',
            first_name: 'John',
            last_name: 'Administrator',
            role: 'admin',
            profile_picture: null
          };
        } else if (email.toLowerCase().includes('teacher')) {
          demoProfile = {
            id: 2,
            username: 'teacher',
            email: 'teacher@school.edu',
            first_name: 'Prof. Michael',
            last_name: 'Anderson',
            role: 'teacher',
            profile_picture: null
          };
        } else {
          demoProfile = {
            id: 3,
            username: 'student',
            email: 'student@school.edu',
            first_name: 'Alex',
            last_name: 'Student',
            role: 'student',
            profile_picture: null
          };
        }
        
        setUser(demoProfile);
        
        // Re-throw error with demo mode message
        throw new Error('Demo mode activated - Backend server unavailable. You are now logged in with demo data.');
      } else {
        // Re-throw the original error for authentication failures
        throw error;
      }
    }
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
    setAccessToken('');
    setRefreshToken('');
    if (refreshIntervalRef.current) window.clearInterval(refreshIntervalRef.current);
  };

  return <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
