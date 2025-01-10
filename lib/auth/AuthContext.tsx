import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../db/users';
import { sessionStore } from './sessions';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const sessionId = localStorage.getItem('sessionId');
      
      if (!token || !sessionId) {
        setLoading(false);
        return;
      }

      const session = await sessionStore.getSession(sessionId);
      if (!session) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionId');
        setLoading(false);
        return;
      }

      const userData = await db.findUserById(session.userId);
      if (userData) {
        const { password: _, ...userWithoutPassword } = userData;
        setUser(userWithoutPassword);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const { token, sessionId, user } = await response.json();
    localStorage.setItem('authToken', token);
    localStorage.setItem('sessionId', sessionId);
    setUser(user);
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
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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