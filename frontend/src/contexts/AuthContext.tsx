import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { firebaseAuth } from '@/lib/firebaseAuth';

interface User {
  id?: number;
  email: string;
  name?: string;
  username?: string;
  organizationName?: string;
  isGuest?: boolean;
  themePreference?: 'light' | 'dark';
  avatarUrl?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username?: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  clearAllCache: () => Promise<void>;
  error: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialize auth state from sessionStorage only once on mount
    if (initializedRef.current) return;
    
    try {
      const storedUser = sessionStorage.getItem('testwise_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          sessionStorage.removeItem('testwise_user');
        }
      }
      initializedRef.current = true;
    } catch (storageError) {
      console.warn('sessionStorage not available:', storageError);
      initializedRef.current = true;
    }
  }, []);

  /**
   * LOGIN FUNCTION - Enforces Email Verification
   * 1. If Firebase is configured: Check email verification FIRST (MANDATORY)
   * 2. Only proceed with backend login if email is verified
   * 3. Set user state synchronously before returning
   */
  const login = async (email: string, password: string) => {
    console.log('🔐 AuthContext.login called for:', email);
    setLoading(true);
    setError(null);
    
    try {
      // Step 1: If Firebase is configured, verify email FIRST (MANDATORY)
      const isFirebaseConfigured = firebaseAuth.isConfigured();
      console.log('🔥 Firebase configured:', isFirebaseConfigured);
      
      if (isFirebaseConfigured) {
        try {
          console.log('🔥 Attempting Firebase sign in...');
          // This will throw an error if email is not verified
          await firebaseAuth.signIn(email, password);
          console.log('✅ Firebase authentication successful - email is verified');
        } catch (firebaseError: any) {
          const errorCode = firebaseError?.code;
          const errorMessage = firebaseError?.message || 'Login failed';
          
          console.error('❌ Firebase login failed:', { code: errorCode, message: errorMessage });
          
          // Handle specific Firebase errors
          if (errorCode === 'auth/user-not-found') {
            const msg = 'No account found with this email address. Please sign up first.';
            setError(msg);
            throw new Error(msg);
          } else if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
            const msg = 'Incorrect email or password. Please check your credentials.';
            setError(msg);
            throw new Error(msg);
          } else if (errorCode === 'auth/invalid-email') {
            const msg = 'Invalid email address.';
            setError(msg);
            throw new Error(msg);
          } else if (errorCode === 'auth/user-disabled') {
            const msg = 'This account has been disabled. Please contact support.';
            setError(msg);
            throw new Error(msg);
          } else if (errorCode === 'auth/too-many-requests') {
            const msg = 'Too many failed login attempts. Please try again later.';
            setError(msg);
            throw new Error(msg);
          } else if (errorMessage.includes('verify your email') || errorMessage.includes('email before logging in')) {
            // Email not verified - this is the key check
            const msg = 'Please verify your email before logging in. Check your inbox for the verification link and click it to verify your account.';
            setError(msg);
            throw new Error('Email verification required. Please check your inbox and click the verification link.');
          } else {
            const msg = `Login failed: ${errorMessage}`;
            setError(msg);
            throw new Error(errorMessage);
          }
        }
      } else {
        console.log('ℹ️ Firebase not configured, skipping Firebase authentication');
      }

      // Step 2: Backend Database Authentication (only if Firebase check passed or Firebase not configured)
      console.log('📡 Attempting backend login...');
      let response;
      try {
        response = await api.login(email, password);
        console.log('✅ Backend login successful:', response);
      } catch (apiError: any) {
        console.error('❌ Backend login error:', {
          status: apiError?.status,
          message: apiError?.message,
          error: apiError
        });

        // Handle backend errors
        let errorMsg = 'Login failed. Please try again.';
        if (apiError?.message?.includes('Cannot connect to backend') || 
            apiError?.message?.includes('Network error')) {
          errorMsg = 'Cannot connect to backend server. Please check if the backend is running.';
        } else if (apiError?.status === 401) {
          errorMsg = 'Invalid email or password. Please check your credentials.';
        } else if (apiError?.message) {
          errorMsg = apiError.message;
        }
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Step 3: Backend login successful - create user data
      console.log('👤 Creating user data from response:', response);
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        username: response.user.username,
        organizationName: response.user.organizationName,
        isGuest: false,
        themePreference: response.user.themePreference || 'light',
      };

      // Step 4: Set user state and storage synchronously (CRITICAL for navigation)
      console.log('💾 Saving user data to sessionStorage:', userData);
      
      // Save to sessionStorage FIRST
      sessionStorage.setItem('testwise_user', JSON.stringify(userData));
      sessionStorage.removeItem('testwise_user_pending');
      
      // Then update state
      setUser(userData);
      
      // Verify it was saved
      const verifyUser = sessionStorage.getItem('testwise_user');
      console.log('✅ Login successful - User state updated');
      console.log('✅ Verification - User in storage:', verifyUser ? 'YES' : 'NO');
      
      if (!verifyUser) {
        console.error('❌ CRITICAL: User data not saved to sessionStorage!');
        throw new Error('Failed to save user data. Please try again.');
      }
    } catch (err) {
      console.error('❌ Login error in AuthContext:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      if (!error) {
        setError(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
      console.log('🏁 Login function completed, loading set to false');
    }
  };

  /**
   * SIGNUP FUNCTION - Clean and Simple
   * 1. If Firebase configured: Create Firebase user first
   * 2. Then create user in database
   * 3. Handle email verification flow
   */
  const signup = async (email: string, password: string, username?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let firebaseUser = null;
      
      // Step 1: Create Firebase User (if configured)
      if (firebaseAuth.isConfigured()) {
        try {
          firebaseUser = await firebaseAuth.signUp(email, password, username);
          console.log('✅ Firebase user created and verification email sent');
        } catch (firebaseError: any) {
          const errorCode = firebaseError?.code;
          const errorMessage = firebaseError?.message || 'Firebase signup failed';
          
          console.error('❌ Firebase signup error:', { code: errorCode, message: errorMessage });
          
          // Handle specific Firebase errors
          if (errorCode === 'auth/email-already-in-use' || errorMessage.includes('email-already-in-use')) {
            setError('An account with this email already exists. Please log in instead.');
            throw new Error('An account with this email already exists. Please log in instead.');
          } else if (errorCode === 'auth/invalid-email') {
            setError('Invalid email address. Please check your email and try again.');
            throw new Error('Invalid email address.');
          } else if (errorCode === 'auth/weak-password') {
            setError('Password is too weak. Please use a stronger password (at least 6 characters).');
            throw new Error('Password is too weak.');
          } else if (errorCode === 'auth/operation-not-allowed') {
            setError('Email/password authentication is not enabled in Firebase. Please contact support.');
            throw new Error('Email/password authentication is not enabled.');
          } else if (errorCode === 'auth/network-request-failed') {
            setError('Network error. Please check your internet connection and try again.');
            throw new Error('Network error.');
          } else {
            setError(`Failed to create account: ${errorMessage}`);
            throw new Error(errorMessage);
          }
        }
      }

      // Step 2: Create User in Database
      try {
        const response = await api.register(email, password, username);
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          username: username || response.user.username,
          organizationName: username || response.user.organizationName,
          isGuest: false,
          themePreference: 'light',
        };

        // Step 3: Handle Login State
        if (firebaseAuth.isConfigured()) {
          // Firebase is configured - email verification required
          if (firebaseUser && firebaseUser.emailVerified) {
            // Email already verified (rare) - log in immediately
            setUser(userData);
            sessionStorage.setItem('testwise_user', JSON.stringify(userData));
            console.log('✅ Signup successful - email already verified');
          } else {
            // Email verification required - don't log in yet
            sessionStorage.setItem('testwise_user_pending', JSON.stringify(userData));
            console.log('📧 Email verification required');
          }
        } else {
          // Firebase not configured - log in immediately
          setUser(userData);
          sessionStorage.setItem('testwise_user', JSON.stringify(userData));
          console.log('✅ Signup successful - no email verification needed');
        }
      } catch (dbError: any) {
        console.error('❌ Database signup error:', dbError);
        const errorMessage = dbError?.message || 'Failed to create account in database';
        
        // If user already exists in database
        if (dbError?.status === 409 || errorMessage.includes('already exists')) {
          setError('An account with this email already exists. Please log in instead.');
        } else {
          setError(errorMessage);
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = () => {
    const guestUser: User = { 
      email: 'guest@testwise.local', 
      isGuest: true,
      themePreference: 'light',
    };
    setUser(guestUser);
    sessionStorage.setItem('testwise_user', JSON.stringify(guestUser));
    setError(null);
  };

  const logout = async () => {
    const currentUser = user;
    
    // Sign out from Firebase
    if (currentUser && !currentUser.isGuest && firebaseAuth.isConfigured()) {
      try {
        await firebaseAuth.signOutUser();
      } catch (error) {
        console.error('Error signing out from Firebase:', error);
      }
    }
    
    // Clear all storage
    sessionStorage.removeItem('testwise_user');
    sessionStorage.removeItem('testwise_user_pending');
    localStorage.removeItem('testwise_user');
    
    if (currentUser?.isGuest) {
      localStorage.removeItem('testwise_evaluations');
    }
    
    // Clear state
    setUser(null);
    setError(null);
  };

  const clearAllCache = async () => {
    // Sign out from Firebase
    if (user && !user.isGuest && firebaseAuth.isConfigured()) {
      try {
        await firebaseAuth.signOutUser();
      } catch (error) {
        console.error('Error signing out from Firebase:', error);
      }
    }
    
    // Clear all sessionStorage
    try {
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.startsWith('testwise_') || key.startsWith('firebase:')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
    
    // Clear all localStorage
    try {
      const localKeys = Object.keys(localStorage);
      localKeys.forEach(key => {
        if (key.startsWith('testwise_') || key.startsWith('firebase:')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    // Clear state
    setUser(null);
    setError(null);
    initializedRef.current = false;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        loginAsGuest,
        logout,
        clearAllCache,
        error,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
