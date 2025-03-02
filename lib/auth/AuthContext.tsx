import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthResponse {
  token: string;
  sessionId: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const sessionId = localStorage.getItem('sessionId');

        if (!token || !sessionId) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json() as { user: User };
          setUser(data.user);
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('sessionId');
        }
      } catch (error) {
        setError('Authentication check failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const { token, sessionId, user } = await response.json();
      localStorage.setItem('authToken', token);
      localStorage.setItem('sessionId', sessionId);
      setUser(user);
    } catch (error) {
      setError('Authentication failed');
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const { token, sessionId, user } = await response.json();
    localStorage.setItem('authToken', token);
    localStorage.setItem('sessionId', sessionId);
    setUser(user);
  };

  const signOut = async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      await sessionStore.invalidateSession(sessionId);
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionId');
    setUser(null);
    router.push('/auth/signin');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut, signUp }}>
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