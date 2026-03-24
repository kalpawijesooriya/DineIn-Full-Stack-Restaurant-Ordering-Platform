import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api, setToken, clearToken, getToken } from '@/api/client';

interface AuthUser {
  username: string;
  displayName: string;
  role: 'admin' | 'cashier';
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('admin_user');
    const token = getToken();
    if (stored && token) {
      try {
        return JSON.parse(stored) as AuthUser;
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.post<{ token: string; displayName: string; username: string; role: 'admin' | 'cashier' }>(
      '/auth/login',
      { username, password },
    );
    setToken(res.token);
    const authUser: AuthUser = { username: res.username, displayName: res.displayName, role: res.role };
    localStorage.setItem('admin_user', JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
