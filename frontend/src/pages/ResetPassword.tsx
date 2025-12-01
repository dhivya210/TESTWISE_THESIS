import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { firebaseAuth } from '@/lib/firebaseAuth';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError('');
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError('Passwords do not match');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setPasswordError('');
    if (password && value !== password) {
      setPasswordError('Passwords do not match');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPasswordError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    const actionCode = searchParams.get('oobCode');
    if (!actionCode) {
      setErrorMessage('Invalid or missing reset code. Please request a new password reset email.');
      return;
    }

    setIsResetting(true);
    try {
      await firebaseAuth.confirmPasswordReset(actionCode, password);
      
      // Get email from the reset code (we need to extract it or get it from URL params)
      // For now, we'll sync the password after successful reset
      // The email should be available in the reset link or we can get it from Firebase
      // Since we don't have email here, we'll let the login flow handle the sync
      
      setIsSuccess(true);
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset successfully. You can now log in with your new password.',
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsResetting(false);
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
            {isSuccess ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1
                  className="text-3xl font-bold"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  Password Reset Successful!
                </h1>
                <p
                  className="text-base"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  Your password has been reset successfully. Redirecting to login page...
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6 text-center mb-6">
                  <h1
                    className="text-3xl font-bold"
                    style={{
                      color: '#2E1869',
                      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    Reset Your Password
                  </h1>
                  <p
                    className="text-base"
                    style={{
                      color: '#2E1869',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      fontWeight: 400,
                    }}
                  >
                    Enter your new password below
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium"
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                      }}
                    >
                      New Password
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
                      Confirm New Password
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
                    <div className="p-3 rounded-xl" style={{
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
                    disabled={isResetting || !!passwordError || !password || !confirmPassword}
                    className="w-full rounded-full font-bold mt-6"
                    style={{
                      background: isResetting || passwordError || !password || !confirmPassword ? 'rgba(161, 143, 255, 0.5)' : '#A18FFF',
                      color: '#FFFFFF',
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      border: 'none',
                      cursor: isResetting || passwordError || !password || !confirmPassword ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!isResetting && !passwordError && password && confirmPassword) {
                        e.currentTarget.style.background = '#8B7AFF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isResetting && !passwordError && password && confirmPassword) {
                        e.currentTarget.style.background = '#A18FFF';
                      }
                    }}
                  >
                    {isResetting ? 'Resetting Password...' : 'Reset Password'}
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm">
                  <Link
                    to="/login"
                    className="font-semibold hover:underline"
                    style={{
                      color: '#A18FFF',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                    }}
                  >
                    Back to login
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

