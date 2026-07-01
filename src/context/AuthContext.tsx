import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { AuthApi } from '../api/AuthApi';
import { tokenStorage } from '../utils/tokenStorage';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../api/types/Auth';

interface SessionUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  type: string;
  roles: string[];
}

interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;

  updateSessionUser: (partial: Partial<SessionUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toSessionUser(res: AuthResponse): SessionUser {
  return {
    userId: res.userId,
    email: res.email,
    firstName: res.firstName,
    lastName: res.lastName,
    type: res.type,
    roles: res.roles,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const access = tokenStorage.getAccess();
    const saved = localStorage.getItem('sm_user');
    if (access && saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);
  function persistSession(res: AuthResponse) {
    tokenStorage.save(res.accessToken, res.refreshToken); const sessionUser = toSessionUser(res);
    localStorage.setItem('sm_user', JSON.stringify(sessionUser)); setUser(sessionUser);
  }
  async function login(payload: LoginRequest) {
    const res = await AuthApi.login(payload); persistSession(res);
  }
  async function register(payload: RegisterRequest) {
    const res = await AuthApi.register(payload); persistSession(res);}

  async function logout() {
    try {
      await AuthApi.logout();
    } catch {

    }
    tokenStorage.clear();
    localStorage.removeItem('sm_user');
    setUser(null);
  }

  function updateSessionUser(partial: Partial<SessionUser>) {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem('sm_user', JSON.stringify(next));
      return next;
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateSessionUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
