import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { login, loginAsGuest, error, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { message, email: locationEmail, redirectTo } = (location.state as { message?: string; email?: string; redirectTo?: string }) || {};

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Redirect if already authenticated (but only on mount, not after login)
  useEffect(() => {
    // Skip if we're in the middle of navigating
    if (sessionStorage.getItem('testwise_navigating') === 'true') {
      console.log('⏸️ Navigation in progress, skipping redirect check');
      return;
    }
    
    // Only redirect if user is already authenticated when page loads
    // Don't redirect during login process
    const storedUser = sessionStorage.getItem('testwise_user');
    if (isAuthenticated && storedUser && !loading) {
      try {
        // Verify stored user is valid
        const userData = JSON.parse(storedUser);
        if (userData && userData.email && !userData.isGuest) {
          const destination = redirectTo || '/questionnaire';
          const fullUrl = window.location.origin + destination;
          console.log('User already authenticated, redirecting to:', destination);
          // Use window.location to avoid React Router issues
          window.location.href = fullUrl;
        } else {
          throw new Error('Invalid user data');
        }
      } catch (error) {
        // Invalid user data, clear it
        console.error('Invalid stored user data:', error);
        sessionStorage.removeItem('testwise_user');
      }
    }
  }, [isAuthenticated, redirectTo, loading]); // Removed navigate from dependencies

  useEffect(() => {
    if (locationEmail) {
      setEmail(locationEmail);
    }
    if (message) {
      toast({ title: 'Info', description: message });
      const isVerificationMessage = message.toLowerCase().includes('verify') || 
                                     message.toLowerCase().includes('verification');
      if (isVerificationMessage) {
        setShowResendVerification(true);
      }
    }
  }, [message, locationEmail, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // CRITICAL: Prevent form submission and page refresh
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔐 Login form submitted');
    setShowResendVerification(false);
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return false;
    }

    console.log('📧 Attempting login for:', email);

    try {
      // Call login - it will set user state and sessionStorage synchronously
      console.log('⏳ Calling login function...');
      await login(email, password);
      console.log('✅ Login function completed successfully');
      
      // Wait a moment for sessionStorage to be updated by login function
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check sessionStorage multiple times to ensure data is saved
      let storedUser = sessionStorage.getItem('testwise_user');
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!storedUser && attempts < maxAttempts) {
        console.log(`⏳ Waiting for user data... (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 100));
        storedUser = sessionStorage.getItem('testwise_user');
        attempts++;
      }
      
      console.log('📦 Stored user check:', storedUser ? 'Found' : 'Not found');
      console.log('📦 Stored user content:', storedUser ? storedUser.substring(0, 100) + '...' : 'null');
      
      if (!storedUser) {
        console.error('❌ No user data in sessionStorage after login');
        console.error('❌ This means the login function did not save user data properly');
        console.error('❌ Checking what login function returned...');
        setErrorMessage('Login failed. User data not found. Please try again.');
        return false;
      }

      // Verify it's valid JSON
      let userData;
      try {
        userData = JSON.parse(storedUser);
        console.log('👤 User data:', userData);
        
        if (!userData || !userData.email) {
          throw new Error('Invalid user data');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse user data:', parseError);
        setErrorMessage('Login succeeded but user data is invalid. Please try again.');
        sessionStorage.removeItem('testwise_user');
        return false;
      }
      
      // All checks passed - proceed with navigation
      console.log('✅ Login successful, navigating to questionnaire...');
      
      // Navigate IMMEDIATELY - don't wait for anything
      const destination = redirectTo || '/questionnaire';
      const fullUrl = window.location.origin + destination;
      console.log('🚀 Navigating to:', destination);
      console.log('🚀 Full URL:', fullUrl);
      console.log('🚀 Current location:', window.location.href);
      
      // CRITICAL: Save navigation flag to prevent redirect loops
      sessionStorage.setItem('testwise_navigating', 'true');
      
      // Show success message briefly
      toast({
        title: 'Success!',
        description: 'You have been logged in successfully.',
        duration: 1000,
      });
      
      // Force navigation immediately using window.location
      // Try multiple methods to ensure navigation works
      console.log('🚀 Executing navigation...');
      
      // Method 1: Try window.location.assign (most reliable)
      try {
        window.location.assign(fullUrl);
        console.log('✅ window.location.assign called');
      } catch (e1) {
        console.error('❌ window.location.assign failed:', e1);
        // Method 2: Fallback to href
        try {
          window.location.href = fullUrl;
          console.log('✅ window.location.href called');
        } catch (e2) {
          console.error('❌ window.location.href failed:', e2);
          // Method 3: Last resort - use React Router
          console.log('⚠️ Using React Router navigate as last resort...');
          navigate(destination, { replace: true });
        }
      }
      
      // Emergency fallback: if still on login page after 100ms, force reload
      setTimeout(() => {
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/') {
          console.error('❌ Navigation failed! Still on:', currentPath);
          console.log('⚠️ Using emergency force reload...');
          // Force full page reload to questionnaire
          window.location.href = fullUrl;
        } else {
          console.log('✅ Navigation successful! Now on:', currentPath);
          // Clear navigation flag
          sessionStorage.removeItem('testwise_navigating');
        }
      }, 100);
      
      return false;
    } catch (err: any) {
      console.error('❌ Login error caught:', err);
      console.error('Error details:', {
        message: err?.message,
        code: err?.code,
        stack: err?.stack,
        error: err
      });
      
      const errorMsg = err?.message || error || 'Invalid email or password.';
      const isVerificationError = errorMsg.toLowerCase().includes('verify') || 
                                   errorMsg.toLowerCase().includes('verification');
      
      if (isVerificationError) {
        setShowResendVerification(true);
      }
      
      setErrorMessage(errorMsg);
      console.error('❌ Login failed with error:', errorMsg);
      return false;
    }
  };

  const handleResendVerification = async () => {
    if (!email || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your email and password to resend the verification email.',
        variant: 'destructive',
      });
      return;
    }

    setResending(true);
    try {
      const { firebaseAuth } = await import('@/lib/firebaseAuth');
      await firebaseAuth.resendVerificationEmail(email, password);
      toast({
        title: 'Verification Email Sent',
        description: 'A new verification email has been sent to your email address. Please check your inbox.',
      });
      setShowResendVerification(false);
    } catch (err: any) {
      toast({
        title: 'Failed to Resend Email',
        description: err?.message || 'Failed to resend verification email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address to reset your password.');
      return;
    }

    setSendingResetEmail(true);
    setErrorMessage('');
    try {
      const { firebaseAuth } = await import('@/lib/firebaseAuth');
      await firebaseAuth.sendPasswordResetEmail(email);
      setResetEmailSent(true);
      toast({
        title: 'Password Reset Email Sent',
        description: 'A password reset link has been sent to your email address. Please check your inbox and follow the instructions.',
        duration: 8000,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setSendingResetEmail(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    const guestUser = { 
      email: 'guest@testwise.local', 
      isGuest: true,
      themePreference: 'light',
    };
    sessionStorage.setItem('testwise_user', JSON.stringify(guestUser));
    
    toast({
      title: 'Guest Mode',
      description: 'You are now logged in as a guest. Your data will be saved locally only.',
    });
    
    navigate('/questionnaire');
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden gradient-bg"
      style={{
        background: 'linear-gradient(135deg, #A18FFF 0%, #C0A9FE 25%, #EABDFF 50%, #98F3FE 75%, #A18FFF 100%)',
        backgroundSize: '400% 400%',
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        
        @keyframes drift {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(20px) translateY(-10px); }
          50% { transform: translateX(-15px) translateY(15px); }
          75% { transform: translateX(10px) translateY(-5px); }
        }
        
        .gradient-bg {
          animation: gradientShift 15s ease infinite;
        }
        
        .blurred-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: pulse 8s ease-in-out infinite;
        }
        
        .wave-layer {
          position: absolute;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, rgba(161, 143, 255, 0.1), rgba(152, 243, 254, 0.1));
          border-radius: 45% 55% 60% 40%;
          animation: float 20s ease-in-out infinite;
        }
        
        .reflection-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .ring-3d {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          border: 4px solid transparent;
          background: linear-gradient(45deg, #EABDFF, #98F3FE, #D9AFFE) padding-box,
                      linear-gradient(45deg, #EABDFF, #98F3FE, #D9AFFE) border-box;
          box-shadow: 0 20px 60px rgba(234, 189, 255, 0.4),
                      0 0 40px rgba(152, 243, 254, 0.3),
                      inset 0 0 30px rgba(255, 255, 255, 0.2);
          animation: float 15s ease-in-out infinite;
          filter: drop-shadow(0 10px 30px rgba(46, 24, 105, 0.3));
        }
        
        .floating-particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          filter: blur(2px);
          animation: drift 12s ease-in-out infinite;
        }
      `}</style>
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Blurred Shapes */}
        <div 
          className="blurred-shape"
          style={{
            width: '400px',
            height: '400px',
            background: 'linear-gradient(135deg, #A18FFF, #C0A9FE)',
            top: '10%',
            left: '5%',
            animationDelay: '0s',
          }}
        />
        <div 
          className="blurred-shape"
          style={{
            width: '500px',
            height: '500px',
            background: 'linear-gradient(135deg, #EABDFF, #98F3FE)',
            bottom: '10%',
            right: '5%',
            animationDelay: '2s',
          }}
        />
        <div 
          className="blurred-shape"
          style={{
            width: '350px',
            height: '350px',
            background: 'linear-gradient(135deg, #C0A9FE, #D9AFFE)',
            top: '50%',
            right: '20%',
            animationDelay: '4s',
          }}
        />
        <div 
          className="blurred-shape"
          style={{
            width: '300px',
            height: '300px',
            background: 'linear-gradient(135deg, #98F3FE, #A18FFF)',
            bottom: '30%',
            left: '15%',
            animationDelay: '6s',
          }}
        />
        
        {/* Layered Waves */}
        <div 
          className="wave-layer"
          style={{
            top: '-50%',
            left: '-50%',
            animationDelay: '0s',
          }}
        />
        <div 
          className="wave-layer"
          style={{
            top: '-30%',
            right: '-50%',
            animationDelay: '5s',
            animationDuration: '25s',
          }}
        />
        
        {/* Reflection Effect */}
        <div className="reflection-effect" />
        
        {/* 3D Ring Accent Shapes */}
        <div 
          className="ring-3d"
          style={{
            top: '15%',
            right: '10%',
            animationDelay: '0s',
            width: '250px',
            height: '250px',
          }}
        />
        <div 
          className="ring-3d"
          style={{
            width: '180px',
            height: '180px',
            bottom: '25%',
            left: '10%',
            animationDelay: '3s',
            animationDuration: '12s',
          }}
        />
        <div 
          className="ring-3d"
          style={{
            width: '150px',
            height: '150px',
            top: '60%',
            left: '50%',
            animationDelay: '6s',
            animationDuration: '18s',
          }}
        />
        
        {/* Floating Particles */}
        <div 
          className="floating-particle"
          style={{
            width: '8px',
            height: '8px',
            top: '20%',
            left: '30%',
            animationDelay: '0s',
          }}
        />
        <div 
          className="floating-particle"
          style={{
            width: '12px',
            height: '12px',
            top: '70%',
            left: '70%',
            animationDelay: '2s',
          }}
        />
        <div 
          className="floating-particle"
          style={{
            width: '6px',
            height: '6px',
            top: '40%',
            left: '80%',
            animationDelay: '4s',
          }}
        />
        <div 
          className="floating-particle"
          style={{
            width: '10px',
            height: '10px',
            top: '80%',
            left: '25%',
            animationDelay: '6s',
          }}
        />
      </div>
      <Navbar />
      <main className="flex-1 pt-[120px] pb-20 flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md px-4"
        >
          <div
            className="p-8 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
            }}
          >
            <div className="space-y-6 text-center mb-6">
              <h1
                className="text-3xl font-bold"
                style={{
                  color: '#2E1869',
                  fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                  fontWeight: 700,
                }}
              >
                Welcome Back
              </h1>
              <p
                className="text-base"
                style={{
                  color: '#2E1869',
                  fontFamily: "'Inter', 'Montserrat', sans-serif",
                  fontWeight: 400,
                }}
              >
                Sign in to your account to continue
              </p>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }} 
              className="space-y-4" 
              noValidate
            >
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                  }}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="off"
                  className="rounded-xl border-2 bg-white/90 backdrop-blur-sm border-white/50 focus:border-[#A18FFF]"
                  style={{
                    color: '#2E1869',
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                  }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="rounded-xl border-2 bg-white/90 backdrop-blur-sm border-white/50 focus:border-[#A18FFF] pr-10"
                    style={{
                      color: '#2E1869',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {!showForgotPassword && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-medium hover:underline"
                    style={{
                      color: '#A18FFF',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              {showForgotPassword && !resetEmailSent && (
                <div className="p-4 rounded-xl" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}>
                  <p
                    className="text-sm mb-3"
                    style={{
                      color: '#2E1869',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                    }}
                  >
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  <Button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={sendingResetEmail || !email}
                    className="w-full rounded-full font-bold"
                    style={{
                      background: sendingResetEmail || !email ? 'rgba(161, 143, 255, 0.5)' : '#A18FFF',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      cursor: sendingResetEmail || !email ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {sendingResetEmail ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmailSent(false);
                    }}
                    className="w-full mt-2 text-sm font-medium hover:underline"
                    style={{
                      color: '#A18FFF',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                    }}
                  >
                    Back to login
                  </button>
                </div>
              )}
              {resetEmailSent && (
                <div className="p-4 rounded-xl" style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}>
                  <p
                    className="text-sm font-medium text-center"
                    style={{
                      color: '#16a34a',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                    }}
                  >
                    Password reset email sent! Please check your inbox and follow the instructions to reset your password.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmailSent(false);
                    }}
                    className="w-full mt-3 text-sm font-medium hover:underline"
                    style={{
                      color: '#A18FFF',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                    }}
                  >
                    Back to login
                  </button>
                </div>
              )}
              {errorMessage && (
                <div className="mt-4 p-3 rounded-xl" style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}>
                  <p
                    className="text-sm font-medium text-center"
                    style={{
                      color: '#dc2626',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                    }}
                  >
                    {errorMessage}
                  </p>
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full font-bold mt-6"
                style={{
                  background: loading ? 'rgba(161, 143, 255, 0.5)' : '#A18FFF',
                  color: '#FFFFFF',
                  fontSize: '1rem',
                  fontWeight: 700,
                  fontFamily: "'Inter', 'Montserrat', sans-serif",
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = '#8B7AFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = '#A18FFF';
                  }
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            {showResendVerification && (
              <div className="mt-4 p-4 rounded-xl" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <p
                  className="text-sm mb-3"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                  }}
                >
                  Your email address is not verified. Please check your inbox for the verification email, or click below to resend it.
                </p>
                <Button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="w-full rounded-full font-bold"
                  style={{
                    background: resending ? 'rgba(161, 143, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(46, 24, 105, 0.3)',
                    color: '#2E1869',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                    cursor: resending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </div>
            )}
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full font-bold"
                onClick={handleGuestLogin}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(46, 24, 105, 0.3)',
                  color: '#2E1869',
                  fontSize: '1rem',
                  fontWeight: 700,
                  fontFamily: "'Inter', 'Montserrat', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                Continue as Guest
              </Button>
            </div>
            <div className="mt-6 text-center text-sm">
              <span
                style={{
                  color: '#2E1869',
                  fontFamily: "'Inter', 'Montserrat', sans-serif",
                  fontWeight: 400,
                }}
              >
                Don't have an account?{' '}
              </span>
              <Link
                to="/signup"
                className="font-semibold hover:underline"
                style={{
                  color: '#A18FFF',
                  fontFamily: "'Inter', 'Montserrat', sans-serif",
                }}
              >
                Sign up
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};
