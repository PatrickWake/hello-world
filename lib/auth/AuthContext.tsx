import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Define a proper User type
type User = {
  id: string;
  email: string;
  name?: string;
  // Add other user properties as needed
};

// Define response types
type SignInResponse = {
  token: string;
  user: User;
  sessionId?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  signOut: () => void;
  signIn: (email: string, password: string) => Promise<SignInResponse>;
  signUp: (email: string, password: string, name?: string) => Promise<SignInResponse>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  signOut: () => {},
  signIn: async () => {
    throw new Error('Not implemented');
  },
  signUp: async () => {
    throw new Error('Not implemented');
  },
  loading: false
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
  const signIn = async (email: string, password: string): Promise<SignInResponse> => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          typeof errorData === 'object' && errorData !== null && 'message' in errorData
            ? String(errorData.message)
            : 'Failed to sign in'
        );
      }

      const responseData = await response.json();
      
      // Validate the response data
      if (!isValidSignInResponse(responseData)) {
        throw new Error('Invalid response format from server');
      }
      
      login(responseData.token, responseData.user);
      return responseData;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Add signUp method to match what's used in signup.tsx
  const signUp = async (email: string, password: string, name?: string): Promise<SignInResponse> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          typeof errorData === 'object' && errorData !== null && 'message' in errorData
            ? String(errorData.message)
            : 'Failed to sign up'
        );
      }

      const responseData = await response.json();
      
      // Validate the response data
      if (!isValidSignInResponse(responseData)) {
        throw new Error('Invalid response format from server');
      }
      
      login(responseData.token, responseData.user);
      return responseData;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Helper function to validate response format
  function isValidSignInResponse(data: unknown): data is SignInResponse {
    return (
      typeof data === 'object' && 
      data !== null &&
      'token' in data &&
      typeof data.token === 'string' &&
      'user' in data &&
      typeof data.user === 'object' &&
      data.user !== null &&
      'id' in data.user &&
      'email' in data.user
    );
  }

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