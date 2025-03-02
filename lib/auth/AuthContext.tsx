import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { verifyToken } from './utils';

// Update the AuthContextType to include user
type AuthContextType = {
  isAuthenticated: boolean;
  user: any | null; // You might want to define a proper User type
  login: (token: string, userData: any) => void;
  logout: () => void;
  signOut: () => void; // Alias for logout that Layout is using
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
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        // Validate token with your API
        const response = await fetch('/api/auth/validate', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
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
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, userData: any) => {
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 