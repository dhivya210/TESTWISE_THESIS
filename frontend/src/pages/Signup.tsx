import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (password && value !== password) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      setErrorMessage('Passwords do not match. Please try again.');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      await signup(email, password, username);
      
      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if email verification is required
      const pendingUser = sessionStorage.getItem('testwise_user_pending');
      const loggedInUser = sessionStorage.getItem('testwise_user');
      
      if (pendingUser && !loggedInUser) {
        // Email verification required - Firebase is configured
        toast({
          title: 'Account Created Successfully!',
          description: 'A verification email has been sent to your email address. Please check your inbox (and spam folder) and click the verification link to activate your account.',
          duration: 10000,
        });
        navigate('/login', { 
          state: { 
            email, 
            message: 'Please check your email and verify your account before logging in. Click the verification link in the email we sent you. If you don\'t see it, check your spam folder.' 
          } 
        });
      } else if (loggedInUser) {
        // User is logged in - navigate to questionnaire
        // Check if Firebase is configured
        const { firebaseAuth } = await import('@/lib/firebaseAuth');
        if (!firebaseAuth.isConfigured()) {
          // Firebase not configured - show info message
          toast({
            title: 'Account Created!',
            description: 'Your account has been created successfully. Note: Email verification is disabled because Firebase is not configured.',
            duration: 8000,
          });
        } else {
          // Firebase configured but email already verified (unlikely on signup)
          toast({
            title: 'Account Created!',
            description: 'Your account has been created successfully. You are now logged in.',
          });
        }
        navigate('/questionnaire', { replace: true });
      } else {
        // Fallback - navigate to login
        navigate('/login', { 
          state: { 
            email, 
            message: 'Account created. Please log in to continue.' 
          } 
        });
      }
    } catch (err: any) {
      let errorMsg = err?.message || error || 'Failed to create account. Please try again.';
      
      // Provide more helpful error messages
      if (errorMsg.includes('Cannot connect to backend server') || 
          errorMsg.includes('Network error occurred')) {
        errorMsg = 'Cannot connect to backend server. Please check if the backend is running.';
      }
      
      setErrorMessage(errorMsg);
    }
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
                Create an Account
              </h1>
              <p
                className="text-base"
                style={{
                  color: '#2E1869',
                  fontFamily: "'Inter', 'Montserrat', sans-serif",
                  fontWeight: 400,
                }}
              >
                Enter your information to get started
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                  }}
                >
                  Username / Organization Name
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="John Doe or Acme Corp"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="rounded-xl border-2 bg-white/90 backdrop-blur-sm border-white/50 focus:border-[#A18FFF]"
                  style={{
                    color: '#2E1869',
                  }}
                />
              </div>
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
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    minLength={6}
                    className="rounded-xl border-2 bg-white/90 backdrop-blur-sm border-white/50 focus:border-[#A18FFF] pr-10"
                    style={{
                      color: '#2E1869',
                      borderColor: passwordError ? '#ef4444' : undefined,
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
                {password && password.length < 6 && (
                  <p className="text-xs text-red-500">Password must be at least 6 characters</p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                  }}
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    required
                    className="rounded-xl border-2 bg-white/90 backdrop-blur-sm border-white/50 focus:border-[#A18FFF] pr-10"
                    style={{
                      color: '#2E1869',
                      borderColor: passwordError ? '#ef4444' : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-red-500">{passwordError}</p>
                )}
              </div>
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
                disabled={loading || !!passwordError}
                className="w-full rounded-full font-bold mt-6"
                style={{
                  background: loading || passwordError ? 'rgba(161, 143, 255, 0.5)' : '#A18FFF',
                  color: '#FFFFFF',
                  fontSize: '1rem',
                  fontWeight: 700,
                  fontFamily: "'Inter', 'Montserrat', sans-serif",
                  border: 'none',
                  cursor: loading || passwordError ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!loading && !passwordError) {
                    e.currentTarget.style.background = '#8B7AFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && !passwordError) {
                    e.currentTarget.style.background = '#A18FFF';
                  }
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span
                style={{
                  color: '#2E1869',
                  fontFamily: "'Inter', 'Montserrat', sans-serif",
                  fontWeight: 400,
                }}
              >
                Already have an account?{' '}
              </span>
              <Link
                to="/login"
                className="font-semibold hover:underline"
                style={{
                  color: '#A18FFF',
                  fontFamily: "'Inter', 'Montserrat', sans-serif",
                }}
              >
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};
