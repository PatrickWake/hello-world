import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Define a proper User type
type User = {
  id: string;
  email: string;
  name?: string;
  // Add other user properties as needed
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  signOut: () => void;
  signIn?: (email: string, password: string) => Promise<void>;
  signUp?: (email: string, password: string, name?: string) => Promise<void>;
  loading?: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  signOut: () => {},
});

console.log('Loading AuthContext.tsx');

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setLoading(false);
          return;
        }

        // Validate token with your API
        const response = await fetch('/api/auth/validate', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          // Validate that userData has the required User properties
          if (typeof userData === 'object' && userData !== null && 
              'id' in userData && 'email' in userData) {
            setUser(userData as User);
            setIsAuthenticated(true);
          } else {
            console.error('Invalid user data format received');
            localStorage.removeItem('authToken');
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/auth/signin');
  };

  // Provide signOut as an alias for logout
  const signOut = logout;

  // Add signIn method to match what's used in signin.tsx
  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sign in');
      }

      const data = await response.json();
      login(data.token, data.user);
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Add signUp method to match what's used in signup.tsx
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sign up');
      }

      const data = await response.json();
      login(data.token, data.user);
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      signOut,
      signIn,
      signUp,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 