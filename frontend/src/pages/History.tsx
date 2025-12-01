import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Evaluation {
  id: number | string;
  date: string;
  time: string;
  tool: string;
  score: number;
  projectName?: string;
}

export const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const loadEvaluations = async () => {
      setLoading(true);
      setError(null);

      try {
        // Guest users: load from localStorage
        if (user?.isGuest) {
          const storedEvaluations = localStorage.getItem('testwise_evaluations');
          if (storedEvaluations) {
            const parsed: any[] = JSON.parse(storedEvaluations);
            // Remove duplicates based on ID
            const uniqueEvaluations = new Map();
            parsed.forEach((evaluation) => {
              if (!uniqueEvaluations.has(evaluation.id)) {
                uniqueEvaluations.set(evaluation.id, evaluation);
              }
            });
            
            const formatted: Evaluation[] = Array.from(uniqueEvaluations.values())
              .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
              .map((evaluation) => {
                const timestamp = evaluation.timestamp ? new Date(evaluation.timestamp) : new Date();
                const dateStr = timestamp.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit',
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                });
                const timeStr = timestamp.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true,
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                });
                
                return {
                  id: evaluation.id,
                  date: evaluation.date || dateStr,
                  time: timeStr,
                  tool: evaluation.recommendedTool,
                  score: Math.max(evaluation.scores.selenium, evaluation.scores.playwright, evaluation.scores.testim, evaluation.scores.mabl),
                  projectName: evaluation.projectName,
                };
              });
            setEvaluations(formatted);
          } else {
            setEvaluations([]);
          }
        }
        // Authenticated users: load from API
        else if (user?.id) {
          try {
            const response = await api.getEvaluations(user.id);
            // Remove duplicates based on ID
            const uniqueEvaluations = new Map();
            response.evaluations.forEach((evaluation: any) => {
              if (!uniqueEvaluations.has(evaluation.id)) {
                uniqueEvaluations.set(evaluation.id, evaluation);
              }
            });
            
            const formatted: Evaluation[] = Array.from(uniqueEvaluations.values())
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((evaluation: any) => {
                // Parse the date properly - SQLite CURRENT_TIMESTAMP stores UTC time
                // Format is usually 'YYYY-MM-DD HH:MM:SS' without timezone info
                let createdAt: Date;
                if (evaluation.createdAt instanceof Date) {
                  createdAt = evaluation.createdAt;
                } else if (typeof evaluation.createdAt === 'string') {
                  // SQLite DATETIME format: 'YYYY-MM-DD HH:MM:SS' (stored as UTC but without timezone indicator)
                  // If it has 'T' or 'Z', it's ISO format
                  if (evaluation.createdAt.includes('T') || evaluation.createdAt.includes('Z')) {
                    // ISO format with timezone - parse directly
                    createdAt = new Date(evaluation.createdAt);
                  } else {
                    // SQLite format 'YYYY-MM-DD HH:MM:SS' - SQLite stores this as UTC
                    // Add 'Z' to indicate UTC, then JavaScript will convert to local time
                    const utcString = evaluation.createdAt.replace(' ', 'T') + 'Z';
                    createdAt = new Date(utcString);
                  }
                } else {
                  createdAt = new Date();
                }
                
                // Format using local timezone (JavaScript automatically converts UTC to local)
                const dateStr = createdAt.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit'
                });
                const timeStr = createdAt.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true
                });
                
                return {
                  id: evaluation.id,
                  date: dateStr,
                  time: timeStr,
                  tool: evaluation.recommendedTool,
                  score: Math.max(evaluation.scores.selenium, evaluation.scores.playwright, evaluation.scores.testim, evaluation.scores.mabl),
                  projectName: evaluation.projectName,
                };
              });
            setEvaluations(formatted);
          } catch (err) {
            console.error('Failed to load evaluations from API:', err);
            setError('Failed to load evaluations. Please try again.');
            // Fallback to localStorage if API fails
            const storedEvaluations = localStorage.getItem('testwise_evaluations');
            if (storedEvaluations) {
              const parsed: any[] = JSON.parse(storedEvaluations);
              // Remove duplicates from localStorage too
              const uniqueParsed = new Map();
              parsed.forEach((evaluation) => {
                if (!uniqueParsed.has(evaluation.id)) {
                  uniqueParsed.set(evaluation.id, evaluation);
                }
              });
              
            const formatted: Evaluation[] = Array.from(uniqueParsed.values())
              .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
              .map((evaluation) => {
                const timestamp = evaluation.timestamp ? new Date(evaluation.timestamp) : new Date();
                const dateStr = timestamp.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit',
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                });
                const timeStr = timestamp.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true,
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                });
                
                return {
                  id: evaluation.id,
                  date: evaluation.date || dateStr,
                  time: timeStr,
                  tool: evaluation.recommendedTool,
                  score: Math.max(evaluation.scores.selenium, evaluation.scores.playwright, evaluation.scores.testim, evaluation.scores.mabl),
                  projectName: evaluation.projectName,
                };
              });
              setEvaluations(formatted);
            }
          }
        } else {
          setEvaluations([]);
        }
      } catch (err) {
        console.error('Error loading evaluations:', err);
        setError('Failed to load evaluations.');
      } finally {
        setLoading(false);
      }
    };

    loadEvaluations();
  }, [user]);

  const handleClearHistory = async () => {
    try {
      if (user?.isGuest) {
        // Clear localStorage for guest users
        localStorage.removeItem('testwise_evaluations');
        setEvaluations([]);
        toast({
          title: 'Success!',
          description: 'All evaluations cleared successfully.',
        });
      } else if (user?.id) {
        // Clear from API for authenticated users - delete each evaluation
        try {
          const deletePromises = evaluations.map((evaluation) => {
            if (typeof evaluation.id === 'number' && user.id) {
              return api.deleteEvaluation(evaluation.id, user.id);
            }
            return Promise.resolve();
          });
          await Promise.all(deletePromises);
          // Also clear localStorage as backup
          localStorage.removeItem('testwise_evaluations');
          setEvaluations([]);
          toast({
            title: 'Success!',
            description: 'All evaluations cleared successfully.',
          });
        } catch (err) {
          console.error('Failed to clear evaluations from API:', err);
          // Fallback: clear localStorage
          localStorage.removeItem('testwise_evaluations');
          setEvaluations([]);
          toast({
            title: 'Cleared Locally',
            description: 'Evaluations cleared from local storage.',
            variant: 'destructive',
          });
        }
      }
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Error clearing evaluations:', err);
      toast({
        title: 'Error',
        description: 'Failed to clear evaluations.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
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
        `}</style>
        <Navbar />
        <main className="flex-1 pt-[80px] pb-20 relative z-10 flex items-center justify-center">
          <p style={{ color: '#1a0d47', fontFamily: "'Inter', system-ui, sans-serif" }}>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (evaluations.length === 0) {
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
        `}</style>
        <Navbar />
        <main className="flex-1 pt-[80px] pb-20 relative z-10">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{
                  color: '#1a0d47',
                  fontFamily: "'Poppins', system-ui, sans-serif",
                  fontWeight: 700,
                }}
              >
                Evaluation History
              </h1>
              <p
                style={{
                  color: '#1a0d47',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 400,
                  opacity: 0.8,
                }}
              >
                View your past test automation tool evaluations
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
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
                <p
                  className="mb-4"
                  style={{
                    color: '#1a0d47',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 400,
                    opacity: 0.8,
                  }}
                >
                  No evaluations yet
                </p>
                <button
                  onClick={() => navigate('/questionnaire')}
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
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#A18FFF';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Start Your First Evaluation
                </button>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
      <main className="flex-1 pt-[80px] pb-20 relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{
                    color: '#1a0d47',
                    fontFamily: "'Poppins', system-ui, sans-serif",
                    fontWeight: 700,
                  }}
                >
                  Evaluation History
                </h1>
                <p
                  style={{
                    color: '#1a0d47',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 400,
                    opacity: 0.8,
                  }}
                >
                  View your past test automation tool evaluations
                </p>
              </div>
              {evaluations.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 font-bold transition-all duration-300 text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear History
                </button>
              )}
            </div>
            {error && (
              <p
                style={{
                  color: '#ef4444',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 400,
                  marginTop: '0.5rem',
                }}
              >
                {error}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
              }}
            >
              <div className="p-6">
                <div className="mb-6">
                  <h2
                    className="text-xl font-bold mb-2"
                    style={{
                      color: '#1a0d47',
                      fontFamily: "'Poppins', system-ui, sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    Past Evaluations
                  </h2>
                  <p
                    style={{
                      color: '#1a0d47',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontWeight: 400,
                      opacity: 0.8,
                    }}
                  >
                    All your previous assessment results
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderBottom: '1px solid rgba(26, 13, 71, 0.2)',
                        }}
                      >
                        <th
                          className="text-left p-4 font-bold"
                          style={{
                            color: '#1a0d47',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          Date
                        </th>
                        <th
                          className="text-left p-4 font-bold"
                          style={{
                            color: '#1a0d47',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          Time
                        </th>
                        <th
                          className="text-left p-4 font-bold"
                          style={{
                            color: '#1a0d47',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          Recommended Tool
                        </th>
                        <th
                          className="text-left p-4 font-bold"
                          style={{
                            color: '#1a0d47',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          Score
                        </th>
                        <th
                          className="text-right p-4 font-bold"
                          style={{
                            color: '#1a0d47',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {evaluations.map((evaluation, idx) => (
                        <tr
                          key={evaluation.id}
                          style={{
                            borderBottom: idx < evaluations.length - 1 ? '1px solid rgba(26, 13, 71, 0.1)' : 'none',
                          }}
                        >
                          <td
                            className="p-4"
                            style={{
                              color: '#1a0d47',
                              fontFamily: "'Inter', system-ui, sans-serif",
                              fontWeight: 400,
                            }}
                          >
                            {evaluation.date}
                          </td>
                          <td
                            className="p-4"
                            style={{
                              color: '#1a0d47',
                              fontFamily: "'Inter', system-ui, sans-serif",
                              fontWeight: 400,
                            }}
                          >
                            {evaluation.time}
                          </td>
                          <td
                            className="p-4 font-medium"
                            style={{
                              color: '#1a0d47',
                              fontFamily: "'Inter', system-ui, sans-serif",
                              fontWeight: 600,
                            }}
                          >
                            {evaluation.tool}
                          </td>
                          <td
                            className="p-4"
                            style={{
                              color: '#1a0d47',
                              fontFamily: "'Inter', system-ui, sans-serif",
                              fontWeight: 400,
                            }}
                          >
                            {evaluation.score}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => navigate('/questionnaire')}
                                className="rounded-lg px-4 py-2 text-sm font-bold transition-all duration-300"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.2)',
                                  border: '1px solid rgba(26, 13, 71, 0.3)',
                                  color: '#1a0d47',
                                  fontFamily: "'Inter', system-ui, sans-serif",
                                  fontWeight: 600,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                Re-run
                              </button>
                              <button
                                onClick={() => navigate('/comparison')}
                                className="rounded-lg px-4 py-2 text-sm font-bold transition-all duration-300"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.2)',
                                  border: '1px solid rgba(26, 13, 71, 0.3)',
                                  color: '#1a0d47',
                                  fontFamily: "'Inter', system-ui, sans-serif",
                                  fontWeight: 600,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                Compare
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowClearConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl p-6 max-w-md mx-4"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(46, 24, 105, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-xl font-bold mb-3"
              style={{
                color: '#1a0d47',
                fontFamily: "'Poppins', system-ui, sans-serif",
                fontWeight: 700,
              }}
            >
              Clear All History?
            </h3>
            <p
              className="mb-6"
              style={{
                color: '#1a0d47',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 400,
                opacity: 0.8,
              }}
            >
              This action cannot be undone. All your evaluation history will be permanently deleted.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg px-4 py-2 font-bold transition-all duration-300 text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(26, 13, 71, 0.3)',
                  color: '#1a0d47',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="rounded-lg px-4 py-2 font-bold transition-all duration-300 text-sm flex items-center gap-2"
                style={{
                  background: '#ef4444',
                  color: '#FFFFFF',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 600,
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
