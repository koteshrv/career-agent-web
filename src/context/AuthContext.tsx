import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'email' | 'guest';
  createdAt: string;
  plan: 'free' | 'pro' | 'byok';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, name?: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'careeragent_auth_user';
const AUTH_TOKEN_KEY = 'careeragent_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load user session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const demoUser: User = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        name: 'Alex Morgan',
        email: 'alex.morgan@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        provider: 'google',
        plan: 'free',
        createdAt: new Date().toISOString(),
      };

      const demoToken = `jwt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(demoUser));
      localStorage.setItem(AUTH_TOKEN_KEY, demoToken);
      setUser(demoUser);
      setIsAuthModalOpen(false);

      window.postMessage(
        {
          source: 'CAREERAGENT_WEB',
          type: 'AUTH_STATE_CHANGE',
          user: demoUser,
          token: demoToken,
        },
        '*'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, name?: string) => {
    setIsLoading(true);
    try {
      const fallbackName = name || email.split('@')[0];
      const newUser: User = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        name: fallbackName,
        email,
        provider: 'email',
        plan: 'free',
        createdAt: new Date().toISOString(),
      };

      const token = `jwt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      setUser(newUser);
      setIsAuthModalOpen(false);

      window.postMessage(
        {
          source: 'CAREERAGENT_WEB',
          type: 'AUTH_STATE_CHANGE',
          user: newUser,
          token,
        },
        '*'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: `guest_${Math.random().toString(36).substring(2, 7)}`,
      name: 'Local Guest',
      email: 'guest@local.device',
      provider: 'guest',
      plan: 'free',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    window.postMessage(
      {
        source: 'CAREERAGENT_WEB',
        type: 'AUTH_STATE_CHANGE',
        user: null,
        token: null,
      },
      '*'
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginWithEmail,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
