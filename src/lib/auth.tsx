import React, { createContext, useContext, useEffect, useState } from 'react';
import { postToken, getProfile, API_BASE } from './api';

interface AuthContextValue {
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial authentication check
  useEffect(() => {
    const token = window.localStorage.getItem('accessToken');
    if (token) {
      getProfile(token)
        .then(setUser)
        .catch(() => {
          window.localStorage.removeItem('accessToken');
          window.localStorage.removeItem('refreshToken');
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

  const login = async (username: string, password: string) => {
    const tokenData = await postToken(username, password);
    window.localStorage.setItem('accessToken', tokenData.access);
    window.localStorage.setItem('refreshToken', tokenData.refresh);
    const profile = await getProfile(tokenData.access);
    setUser(profile);
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
