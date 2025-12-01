import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface Scores {
  selenium: number;
  playwright: number;
  testim: number;
  mabl: number;
}

export const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scores, answers, projectName } = location.state as { scores: Scores; answers: any[]; projectName?: string };
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const analysisSteps = [
    { text: 'Analyzing your requirements and team capabilities...', duration: 2000 },
    { text: 'Evaluating tool compatibility with your workflow...', duration: 2000 },
    { text: 'Calculating optimal matches based on your answers...', duration: 2000 },
    { text: 'Setting up your test automation plan and analyzing your goals...', duration: 1500 },
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (!scores) {
      navigate('/questionnaire');
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    let currentStepIndex = 0;
    const stepInterval = setInterval(() => {
      if (currentStepIndex < analysisSteps.length - 1) {
        currentStepIndex++;
        setCurrentStep(currentStepIndex);
      } else {
        clearInterval(stepInterval);
      }
    }, 2000);

    const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0);
    const timeout = setTimeout(() => {
      // Use replace to prevent going back to analysis page
      navigate('/results', { state: { scores, answers, projectName }, replace: true });
    }, totalDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(timeout);
    };
  }, [scores, answers, projectName, navigate]);

  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (progress / 100) * circumference;

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
      <main className="flex-1 flex items-center justify-center relative z-10 min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center w-full max-w-2xl mx-auto"
          >
            <div className="relative inline-block mb-10">
              <svg
                width="200"
                height="200"
                className="transform -rotate-90"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(161, 143, 255, 0.3))' }}
              >
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#A18FFF"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{
                    transition: 'stroke-dashoffset 0.3s ease',
                  }}
                />
              </svg>
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #A18FFF, #C0A9FE)',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 4px 12px rgba(161, 143, 255, 0.3)',
                }}
              >
                <BarChart3 className="h-12 w-12 text-white" />
              </div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: '#2E1869',
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                fontWeight: 700,
              }}
            >
              Preparing your recommendations
            </motion.h1>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <p
                className="text-lg md:text-xl"
                style={{
                  color: '#FFFFFF',
                  fontFamily: "'Inter', 'Montserrat', sans-serif",
                  fontWeight: 300,
                }}
              >
                {analysisSteps[currentStep]?.text || 'Setting up your test automation plan and analyzing your goals...'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center gap-2 mt-6"
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: '#A18FFF',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
