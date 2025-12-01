import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DollarSign, Wrench, Gauge, Brain, CheckCircle2, XCircle } from 'lucide-react';
import { ComparisonCharts } from '@/components/ComparisonCharts';

const comparisonData = {
  selenium: {
    name: 'Selenium',
    tagline: 'Industry Standard',
    color: '#10B981', // Green
    metrics: {
      cost: 'Free',
      ease: 'Complex',
      speed: 'Moderate',
      ai: 'None',
    },
    strengths: [
      'Free and open-source',
      'Largest community support',
      'Maximum flexibility',
      'Multi-language support',
      'Enterprise-scale proven',
    ],
    considerations: [
      'Complex setup required',
      'High maintenance effort',
      'No built-in AI features',
      'Slower execution',
      'Steeper learning curve',
    ],
  },
  playwright: {
    name: 'Playwright',
    tagline: 'Modern & Fast',
    color: '#3B82F6', // Blue
    metrics: {
      cost: 'Free',
      ease: 'Moderate',
      speed: 'Very Fast',
      ai: 'Limited',
    },
    strengths: [
      'Fastest execution speed',
      'Modern async architecture',
      'Strong documentation',
      'Multi-browser support',
      'Free and open-source',
    ],
    considerations: [
      'Newer, smaller community',
      'Limited AI capabilities',
      'Requires coding skills',
      'Less mature ecosystem',
    ],
  },
  testim: {
    name: 'Testim',
    tagline: 'AI-Powered',
    color: '#A18FFF', // Purple
    metrics: {
      cost: 'Mid-range',
      ease: 'Very Easy',
      speed: 'Fast',
      ai: 'Advanced',
    },
    strengths: [
      'AI self-healing tests',
      'Low-code interface',
      '90% less maintenance',
      'Quick onboarding',
      'Strong visual tools',
    ],
    considerations: [
      'Commercial license required',
      'Less flexibility than code-based',
      'Vendor lock-in risk',
      'Limited for complex scenarios',
    ],
  },
  mabl: {
    name: 'Mabl',
    tagline: 'Intelligent Testing',
    color: '#F97316', // Orange
    metrics: {
      cost: 'Premium',
      ease: 'Easy',
      speed: 'Fast',
      ai: 'Advanced',
    },
    strengths: [
      'Cloud-based automation',
      'Advanced analytics',
      'Auto-healing capabilities',
      '24/7 premium support',
      'Easy CI/CD Integration',
    ],
    considerations: [
      'Higher cost',
      'Less control vs code-based',
      'Requires cloud connectivity',
      'Learning curve for advanced features',
    ],
  },
};

export const Comparison = () => {
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const tools = ['selenium', 'playwright', 'testim', 'mabl'] as const;

  const keyTakeaways = [
    {
      tag: 'Best for Speed',
      tagColor: '#14B8A6', // Teal
      content: 'Playwright - Fastest execution with modern async architecture',
    },
    {
      tag: 'Best for Budget',
      tagColor: '#60A5FA', // Light Blue
      content: 'Selenium & Playwright - Free and open-source options',
    },
    {
      tag: 'Best for AI',
      tagColor: '#3B82F6', // Dark Blue
      content: 'Testim & Mabl - Advanced self-healing and AI-driven testing',
    },
    {
      tag: 'Best for Ease',
      tagColor: '#34D399', // Light Green
      content: 'Testim - Low-code interface with minimal learning curve',
    },
  ];

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
      <main className="flex-1 pt-28 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
            style={{
              paddingTop: '2rem',
              paddingBottom: '1rem',
            }}
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{
                color: '#2E1869',
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                fontWeight: 700,
                lineHeight: '1.2',
                textShadow: '0 2px 8px rgba(255, 255, 255, 0.3)',
              }}
            >
              Tool Comparison
            </h1>
            <p
              className="text-base md:text-lg lg:text-xl max-w-2xl mx-auto"
              style={{
                color: '#2E1869',
                fontFamily: "'Inter', 'Montserrat', sans-serif",
                fontWeight: 400,
                opacity: 0.9,
                lineHeight: '1.6',
                textShadow: '0 1px 4px rgba(255, 255, 255, 0.3)',
              }}
            >
              Side-by-side analysis of Selenium, Playwright, Testim, and Mabl
            </p>
          </motion.div>

          {/* Tool Comparison Grid - 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {tools.map((toolKey, index) => {
              const tool = comparisonData[toolKey];
              return (
          <motion.div
                  key={toolKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div
                    className="h-full p-6 rounded-3xl transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
              }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(46, 24, 105, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(46, 24, 105, 0.2)';
                      }}
                    >
                    {/* Header */}
                    <div className="mb-6">
                      <h2
                        className="text-3xl font-bold mb-1"
                        style={{
                          color: tool.color,
                          fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                          fontWeight: 700,
                        }}
                      >
                        {tool.name}
                      </h2>
                      <p
                        className="text-sm"
                        style={{
                          color: '#2E1869',
                          fontFamily: "'Inter', 'Montserrat', sans-serif",
                          fontWeight: 400,
                          opacity: 0.8,
                        }}
                      >
                        {tool.tagline}
                      </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      <div className="flex flex-col items-center">
                        <DollarSign className="h-5 w-5 mb-1" style={{ color: tool.color }} />
                        <span
                          className="text-xs font-semibold text-center"
                          style={{
                            color: '#2E1869',
                            fontFamily: "'Inter', 'Montserrat', sans-serif",
                          }}
                        >
                          {tool.metrics.cost}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Wrench className="h-5 w-5 mb-1" style={{ color: tool.color }} />
                        <span
                          className="text-xs font-semibold text-center"
                          style={{
                            color: '#2E1869',
                            fontFamily: "'Inter', 'Montserrat', sans-serif",
                          }}
                        >
                          {tool.metrics.ease}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Gauge className="h-5 w-5 mb-1" style={{ color: tool.color }} />
                        <span
                          className="text-xs font-semibold text-center"
                          style={{
                            color: '#2E1869',
                            fontFamily: "'Inter', 'Montserrat', sans-serif",
                          }}
                        >
                          {tool.metrics.speed}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Brain className="h-5 w-5 mb-1" style={{ color: tool.color }} />
                        <span
                          className="text-xs font-semibold text-center"
                          style={{
                            color: '#2E1869',
                            fontFamily: "'Inter', 'Montserrat', sans-serif",
                          }}
                        >
                          {tool.metrics.ai}
                        </span>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5" style={{ color: '#10B981' }} />
                        <h3
                          className="font-semibold"
                          style={{
                            color: '#2E1869',
                            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                            fontWeight: 600,
                          }}
                        >
                          Strengths
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {tool.strengths.map((strength, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2"
                        style={{
                              color: '#2E1869',
                              fontFamily: "'Inter', 'Montserrat', sans-serif",
                              fontSize: '0.875rem',
                              fontWeight: 400,
                            }}
                          >
                            <span style={{ color: '#10B981', marginTop: '0.25rem' }}>•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Considerations */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="h-5 w-5" style={{ color: '#EF4444' }} />
                        <h3
                          className="font-semibold"
                          style={{
                            color: '#2E1869',
                            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                            fontWeight: 600,
                          }}
                        >
                          Considerations
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {tool.considerations.map((consideration, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2"
                            style={{
                              color: '#2E1869',
                              fontFamily: "'Inter', 'Montserrat', sans-serif",
                              fontSize: '0.875rem',
                              fontWeight: 400,
                            }}
                          >
                            <span style={{ color: '#EF4444', marginTop: '0.25rem' }}>•</span>
                            <span>{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Key Takeaways Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <div
              className="p-6 rounded-3xl"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{
                  color: '#2E1869',
                  fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                  fontWeight: 700,
                }}
              >
                Key Takeaways
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keyTakeaways.map((takeaway, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white flex-shrink-0"
                      style={{
                        background: takeaway.tagColor,
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                      }}
                    >
                      {takeaway.tag}
                    </span>
                    <p
                      className="text-sm"
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      {takeaway.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Interactive Comparison Charts Section */}
          <ComparisonCharts />

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
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
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(161, 143, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#A18FFF';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(161, 143, 255, 0.4)';
              }}
            >
              Start Evaluation
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
