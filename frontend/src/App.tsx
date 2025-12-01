import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Questionnaire } from './pages/Questionnaire';
import { Preview } from './pages/Preview';
import { Analysis } from './pages/Analysis';
import { Results } from './pages/Results';
import { Comparison } from './pages/Comparison';
import { Profile } from './pages/Profile';
import { History } from './pages/History';
import { Help } from './pages/Help';
import { Resources } from './pages/Resources';
import { NotFound } from './pages/NotFound';
import { VerifyEmail } from './pages/VerifyEmail';
import { ResetPassword } from './pages/ResetPassword';
import { ChatWidget } from './components/ChatWidget';

// Component to handle refresh logout - must be inside AuthProvider
const RefreshHandler = () => {
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only run on actual browser refresh, not on initial load or navigation
    // Check if page was refreshed using Performance API
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    // Only logout on refresh if:
    // 1. It's actually a reload (not initial load or navigation)
    // 2. User is authenticated
    // 3. User is NOT a guest (guests should stay logged in)
    if (
      navigation && 
      navigation.type === 'reload' && 
      isAuthenticated && 
      user && 
      !user.isGuest
    ) {
      // Page was refreshed and user is authenticated (but not guest) - logout and redirect to landing
      logout().then(() => {
        navigate('/');
      });
    }
  }, [logout, navigate, isAuthenticated, user]);

  return null;
};

// Component to conditionally render ChatWidget only on landing page
const ConditionalChatWidget = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  if (!isLandingPage) {
    return null;
  }
  
  return <ChatWidget />;
};

// Inner App component that has access to AuthProvider
const AppContent = () => {
  return (
    <BrowserRouter>
      <RefreshHandler />
      <div style={{ position: 'relative' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/help" element={<Help />} />
          <Route path="/resources" element={<Resources />} />

          {/* Protected Routes */}
          <Route
            path="/questionnaire"
            element={
              <ProtectedRoute>
                <Questionnaire />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preview"
            element={
              <ProtectedRoute>
                <Preview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comparison"
            element={
              <ProtectedRoute>
                <Comparison />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* Chat Widget - Only shown on landing page */}
        <ConditionalChatWidget />
      </div>
      <Toaster />
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
