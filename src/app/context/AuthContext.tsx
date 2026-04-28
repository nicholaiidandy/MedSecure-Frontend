import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '../services/authService';

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; isLocked?: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
  failedAttempts: number;
  isLocked: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService
      .getMe()
      .then((response) => {
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        }
      })
      .catch(() => {
        // Not logged in — cookie missing or invalid, silently ignore
      })
      .finally(() => {
        setIsLoading(false);
      });

    const locked = localStorage.getItem('accountLocked');
    if (locked === 'true') {
      setIsLocked(true);
    }

    const attempts = localStorage.getItem('failedAttempts');
    if (attempts) {
      setFailedAttempts(parseInt(attempts, 10));
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; isLocked?: boolean }> => {
    if (isLocked) {
      return { success: false, message: 'Account is locked', isLocked: true };
    }

    try {
      const response = await authService.login({ email, password });

      if (response.success && response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);

        setFailedAttempts(0);
        localStorage.setItem('failedAttempts', '0');
        localStorage.removeItem('accountLocked');
        setIsLocked(false);

        return { success: true };
      }

      return { success: false, message: response.message || 'Login failed' };
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid credentials';

      if (error.message?.includes('locked')) {
        setIsLocked(true);
        localStorage.setItem('accountLocked', 'true');
        return { success: false, message: errorMessage, isLocked: true };
      }

      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('failedAttempts', newAttempts.toString());

      if (newAttempts >= 5) {
        setIsLocked(true);
        localStorage.setItem('accountLocked', 'true');
      }

      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore server error — still clear local state
    }

    authService.clearLocalAuth();
    setUser(null);
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        failedAttempts,
        isLocked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
