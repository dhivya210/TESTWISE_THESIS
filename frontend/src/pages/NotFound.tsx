import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const NotFound = () => {
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #A18FFF 0%, #C0A9FE 25%, #EABDFF 50%, #98F3FE 75%, #A18FFF 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* Abstract Blurred Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(161, 143, 255, 0.4) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            top: '-200px',
            left: '-200px',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(152, 243, 254, 0.4) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            top: '50%',
            right: '-150px',
            animation: 'float 10s ease-in-out infinite 2s',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(234, 189, 255, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            bottom: '-150px',
            left: '20%',
            animation: 'float 12s ease-in-out infinite 4s',
          }}
        />
        
        {/* Layered Waves */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 200" preserveAspectRatio="none" style={{ opacity: 0.3 }}>
          <path
            d="M0,100 Q300,50 600,100 T1200,100 L1200,200 L0,200 Z"
            fill="url(#waveGradient1)"
          />
          <path
            d="M0,120 Q400,80 800,120 T1200,120 L1200,200 L0,200 Z"
            fill="url(#waveGradient2)"
            style={{ opacity: 0.5 }}
          />
          <defs>
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EABDFF" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#98F3FE" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#C0A9FE" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#98F3FE" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#A18FFF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#EABDFF" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <Navbar />
      <main className="flex-1 pt-[80px] pb-20 flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1
            className="text-6xl md:text-8xl font-bold mb-4"
            style={{
              color: '#2E1869',
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontWeight: 700,
            }}
          >
            404
          </h1>
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{
              color: '#2E1869',
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontWeight: 700,
            }}
          >
            Page not found
          </h2>
          <p
            className="mb-8 max-w-md mx-auto"
            style={{
              color: '#FFFFFF',
              fontFamily: "'Inter', 'Montserrat', sans-serif",
              fontWeight: 300,
            }}
          >
            The page you're looking for doesn't exist or has been moved.
          </p>
          <button
            onClick={() => navigate('/')}
            className="rounded-full font-bold px-8 py-4 transition-all duration-300"
            style={{
              background: '#A18FFF',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: "'Inter', 'Montserrat', sans-serif",
              border: 'none',
              boxShadow: '0 4px 20px rgba(161, 143, 255, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#8B7AFF';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(161, 143, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#A18FFF';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(161, 143, 255, 0.4)';
            }}
          >
            Go Home
          </button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};
