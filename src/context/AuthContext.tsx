// =========================================================
// AuthContext: "la memoria de la sesión" para toda la app.
//
// Cualquier componente puede preguntar useAuth() para saber:
//   - quién está logueado (user)
//   - si está logueado (isAuthenticated)
//   - y llamar a login(), register() o logout().
//
// Así no tenemos que pasar el usuario manualmente de pantalla en pantalla.
// =========================================================
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

// La info de usuario que guardamos en memoria (sale del AuthResponse).
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
  // Actualiza algunos campos del usuario en memoria (ej. tras editar el perfil),
  // para que la Navbar y demás lo reflejen sin tener que volver a iniciar sesión.
  updateSessionUser: (partial: Partial<SessionUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Convierte la respuesta del backend en nuestro objeto de sesión.
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

  // Al cargar la app: si hay tokens guardados, recuperamos el usuario del
  // localStorage (lo guardamos junto a los tokens en login/register).
  useEffect(() => {
    const access = tokenStorage.getAccess();
    const saved = localStorage.getItem('sm_user');
    if (access && saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  function persistSession(res: AuthResponse) {
    tokenStorage.save(res.accessToken, res.refreshToken);
    const sessionUser = toSessionUser(res);
    localStorage.setItem('sm_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
  }

  async function login(payload: LoginRequest) {
    const res = await AuthApi.login(payload);
    persistSession(res);
  }

  async function register(payload: RegisterRequest) {
    const res = await AuthApi.register(payload);
    persistSession(res);
  }

  async function logout() {
    try {
      await AuthApi.logout();
    } catch {
      // Aunque el backend falle, limpiamos la sesión local igual.
    }
    tokenStorage.clear();
    localStorage.removeItem('sm_user');
    setUser(null);
  }

  // Mezcla campos nuevos en el usuario actual (y los guarda en localStorage).
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

// Hook práctico: useAuth() en cualquier componente.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
