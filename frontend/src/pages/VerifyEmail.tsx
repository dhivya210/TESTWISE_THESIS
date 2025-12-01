import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { firebaseAuth } from '@/lib/firebaseAuth';
import { initializeFirebase } from '@/lib/firebase';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
  const [message, setMessage] = useState('Verifying your email address...');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get action and mode from URL parameters (Firebase sends these)
        const mode = searchParams.get('mode');
        const actionCode = searchParams.get('oobCode');
        // Unused but kept for potential future use
        // const apiKey = searchParams.get('apiKey');
        // const continueUrl = searchParams.get('continueUrl');
        // const lang = searchParams.get('lang') || 'en';

        // Check if we have the necessary parameters
        if (!mode || !actionCode) {
          setStatus('error');
          setMessage('Invalid verification link. The link is missing required parameters. Please check your email and try again, or request a new verification email.');
          return;
        }

        if (mode === 'verifyEmail' && actionCode) {
          // Handle email verification
          if (!firebaseAuth.isConfigured()) {
            setStatus('error');
            setMessage('Firebase is not configured. Email verification is not available. Please contact support.');
            return;
          }

          try {
            const { auth } = await initializeFirebase();
            if (!auth) {
              setStatus('error');
              setMessage('Firebase authentication is not available. Please try again later.');
              return;
            }

            const { applyActionCode } = await import('firebase/auth');
            await applyActionCode(auth, actionCode);

            setStatus('success');
            setMessage('Your email has been verified successfully! You can now log in to your account.');
            
            toast({
              title: 'Email Verified!',
              description: 'Your email has been verified successfully. You can now log in.',
            });

            // Redirect to login after 3 seconds
            setTimeout(() => {
              navigate('/login', { 
                state: { 
                  message: 'Email verified successfully! You can now log in with your credentials.',
                } 
              });
            }, 3000);
          } catch (error: any) {
            console.error('Email verification error:', error);
            
            if (error.code === 'auth/expired-action-code') {
              setStatus('expired');
              setMessage('The verification link has expired. Verification links are valid for a limited time. Please request a new verification email from the login page.');
            } else if (error.code === 'auth/invalid-action-code') {
              setStatus('error');
              setMessage('The verification link is invalid or has already been used. Please request a new verification email from the login page.');
            } else if (error.code === 'auth/user-disabled') {
              setStatus('error');
              setMessage('This account has been disabled. Please contact support for assistance.');
            } else {
              setStatus('error');
              setMessage(error.message || 'Failed to verify email. Please try requesting a new verification email.');
            }
          }
        } else if (mode === 'resetPassword') {
          // Redirect to password reset page
          navigate(`/reset-password?oobCode=${actionCode}&mode=resetPassword`);
          return;
        } else if (mode === 'recoverEmail') {
          // Handle email recovery
          setStatus('error');
          setMessage('Email recovery functionality is not yet available. Please contact support for assistance.');
        } else {
          setStatus('error');
          setMessage(`Unknown verification mode: ${mode}. Please check your email and use the correct verification link.`);
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred during verification. Please try again or contact support.');
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate, toast]);

  // Unused function - kept for potential future use
  // const handleResendVerification = async () => {
  //   // This would require the user's email, which we don't have in the verification link
  //   // Redirect to login page where they can resend
  //   navigate('/login', { 
  //     state: { 
  //       message: 'Please log in to resend the verification email, or contact support if you need assistance.',
  //     } 
  //   });
  // };

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
        
        .gradient-bg {
          animation: gradientShift 15s ease infinite;
        }
      `}</style>
      
      <Navbar />
      <main className="flex-1 pt-[80px] pb-20 flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md px-4"
        >
          <div
            className="p-8 rounded-3xl text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
            }}
          >
            {status === 'verifying' && (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#A18FFF] border-t-transparent mx-auto"></div>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                  }}
                >
                  Verifying Email
                </h2>
                <p
                  className="text-base"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                  }}
                >
                  {message}
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                  }}
                >
                  Email Verified!
                </h2>
                <p
                  className="text-base"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                  }}
                >
                  {message}
                </p>
                <p
                  className="text-sm"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                  }}
                >
                  Redirecting to login page...
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full rounded-full font-bold mt-4"
                  style={{
                    background: '#A18FFF',
                    color: '#FFFFFF',
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                    border: 'none',
                  }}
                >
                  Go to Login
                </Button>
              </div>
            )}

            {(status === 'error' || status === 'expired') && (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                  }}
                >
                  {status === 'expired' ? 'Link Expired' : 'Verification Failed'}
                </h2>
                <p
                  className="text-base"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                  }}
                >
                  {message}
                </p>
                <div className="space-y-2 mt-6">
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full rounded-full font-bold"
                    style={{
                      background: '#A18FFF',
                      color: '#FFFFFF',
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      border: 'none',
                    }}
                  >
                    Go to Login
                  </Button>
                  <Link
                    to="/signup"
                    className="block text-center text-sm font-semibold hover:underline"
                    style={{
                      color: '#A18FFF',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                    }}
                  >
                    Create New Account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

