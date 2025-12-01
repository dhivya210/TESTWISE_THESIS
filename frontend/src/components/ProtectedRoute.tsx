import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check sessionStorage as well (more reliable)
    // Wait a bit to allow login to complete and save data
    let checkCount = 0;
    const maxChecks = 10;
    
    const checkUser = () => {
      checkCount++;
      const storedUser = sessionStorage.getItem('testwise_user');
      console.log(`🔍 ProtectedRoute: Check ${checkCount}/${maxChecks} - User in storage:`, storedUser ? 'YES' : 'NO');
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData && userData.email) {
            console.log('✅ ProtectedRoute: User found in sessionStorage:', userData.email);
            setChecking(false);
            return true;
          }
        } catch (e) {
          console.error('Invalid user data in storage:', e);
        }
      }
      
      if (checkCount >= maxChecks) {
        console.log('⚠️ ProtectedRoute: No user found after', maxChecks, 'checks');
        setChecking(false);
        return false;
      }
      
      return false;
    };
    
    // Check immediately
    if (checkUser()) {
      return;
    }
    
    // Check multiple times with increasing delays
    const timeouts: NodeJS.Timeout[] = [];
    for (let i = 1; i < maxChecks; i++) {
      const timeout = setTimeout(() => {
        if (checkUser()) {
          // Clear remaining timeouts
          timeouts.forEach(t => clearTimeout(t));
        }
      }, i * 100); // 100ms, 200ms, 300ms, etc.
      timeouts.push(timeout);
    }
    
    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, []);

  // Wait a moment for auth state to initialize
  if (checking) {
    return <div>Loading...</div>;
  }

  // Check sessionStorage first (more reliable than state)
  const storedUser = sessionStorage.getItem('testwise_user');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      console.log('🔍 ProtectedRoute: Checking user data:', { email: userData?.email, isGuest: userData?.isGuest });
      if (userData && userData.email && !userData.isGuest) {
        console.log('✅ ProtectedRoute: Access granted');
        return <>{children}</>;
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
  }

  // Fallback to auth context
  if (isAuthenticated && user && user.email) {
    console.log('✅ ProtectedRoute: Access granted via auth context');
    return <>{children}</>;
  }

  // If not authenticated, redirect to login
  console.log('❌ ProtectedRoute: Access denied, redirecting to login');
  return <Navigate to="/login" replace />;
};

