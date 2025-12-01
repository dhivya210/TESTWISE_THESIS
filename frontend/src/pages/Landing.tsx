import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { CheckCircle2, Shield, BarChart3, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import testimLogo from '@/assets/testim-logo.svg';
import mablLogo from '@/assets/mabl-logo.svg';

export const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redirect authenticated users to questionnaire page
  useEffect(() => {
    if (isAuthenticated && user && !user.isGuest) {
      navigate('/questionnaire', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleStartEvaluation = () => {
    if (isAuthenticated) {
      navigate('/questionnaire');
    } else {
      navigate('/login', { state: { redirectTo: '/questionnaire' } });
    }
  };

  const handleCompareTools = () => {
    if (isAuthenticated) {
      navigate('/comparison');
    } else {
      navigate('/login', { state: { redirectTo: '/comparison' } });
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Smart Recommendations',
      description: 'Get personalized tool recommendations based on your specific requirements and project needs.',
    },
    {
      icon: BarChart3,
      title: 'Data-Driven Insights',
      description: 'Visual dashboards and comparative metrics based on real performance data.',
    },
    {
      icon: Shield,
      title: 'Proven Methodology',
      description: 'Research backed evaluation framework comparing Selenium, Playwright, Testim, and Mabl.',
    },
    {
      icon: CheckCircle2,
      title: 'Comprehensive Analysis',
      description: '12-question assessment covering budget, team skills, scalability, and AI capabilities.',
    },
  ];

  const tools = [
    { 
      name: 'Selenium', 
      tagline: 'Industry Standard',
      logo: 'https://www.selenium.dev/images/selenium_logo_square_green.png',
    },
    { 
      name: 'Playwright', 
      tagline: 'Modern & Fast',
      logo: 'https://playwright.dev/img/playwright-logo.svg',
    },
    { 
      name: 'Testim', 
      tagline: 'AI-Powered',
      logo: testimLogo,
    },
    { 
      name: 'Mabl', 
      tagline: 'Intelligent Testing',
      logo: mablLogo,
    },
  ];

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden gradient-bg"
    >
      {/* Optimized Background Effects - Reduced for Performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Reduced from 3 to 2 blurred shapes */}
        <div 
          className="blurred-shape"
          style={{
            width: '400px',
            height: '400px',
            background: 'linear-gradient(135deg, #A18FFF, #C0A9FE)',
            top: '10%',
            left: '5%',
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
          }}
        />
        
        {/* Reduced from 2 to 1 wave layer */}
        <div 
          className="wave-layer"
          style={{
            top: '-50%',
            left: '-50%',
          }}
        />
        
        {/* Reflection Effect */}
        <div className="reflection-effect" />
        
        {/* Reduced from 2 to 1 ring */}
        <div 
          className="ring-3d"
          style={{
            top: '15%',
            right: '10%',
          }}
        />
      </div>
      
      <Navbar />
      <main className="flex-1 pt-[80px] pb-20 relative z-10">
        {/* Hero Section */}
        <section className="relative pt-12 pb-8 lg:pt-16 lg:pb-10">
          <div className="container mx-auto px-4 md:px-8 lg:px-16">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-8"
              >
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
                style={{
                  color: '#2E1869',
                  fontFamily: "'Manrope', 'Space Grotesk', 'Inter', sans-serif",
                  fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Choose the Right Test Automation Tool
                </h1>
                <p
                  className="text-xl md:text-2xl max-w-3xl mx-auto mb-8"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 300,
                    lineHeight: 1.6,
                    textShadow: '0 2px 4px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  Make confident decisions with data-driven insights. Compare Selenium, Playwright, Testim, and Mabl based on your unique project needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <button
                    onClick={handleStartEvaluation}
                    className="px-8 py-4 rounded-full font-bold text-white transition-all duration-300"
                    style={{
                      background: '#A18FFF',
                      color: '#FFFFFF',
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      boxShadow: 'none',
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
                    Start Evaluation
                  </button>
                  <button
                    onClick={handleCompareTools}
                    className="px-8 py-4 rounded-full font-bold transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(46, 24, 105, 0.3)',
                      color: '#2E1869',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Compare Tools
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why TestWise Section */}
        <section id="features" className="pt-8 pb-16 lg:pt-10 lg:pb-20 relative">
          <div className="container mx-auto px-4 md:px-8 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{
                  color: '#2E1869',
                  fontFamily: "'Manrope', 'Space Grotesk', 'Inter', sans-serif",
                  fontWeight: 700,
                }}
              >
                Why TestWise?
              </h2>
              <p
                className="text-xl max-w-2xl mx-auto"
                style={{
                  color: '#2E1869',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 300,
                  textShadow: '0 2px 4px rgba(255, 255, 255, 0.3)',
                }}
              >
                Our decision-support platform combines research insights with practical evaluation tools
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="h-full flex"
                >
                  <div
                    className="w-full p-6 rounded-3xl transition-all duration-300 flex flex-col"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 flex-shrink-0"
                      style={{
                        background: 'rgba(161, 143, 255, 0.2)',
                      }}
                    >
                      <feature.icon
                        className="h-7 w-7"
                        style={{ color: '#A18FFF' }}
                      />
                    </div>
                    <h3
                      className="text-lg font-semibold mb-3 flex-shrink-0"
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Manrope', 'Space Grotesk', 'Inter', sans-serif",
                        fontWeight: 600,
                        lineHeight: '1.4',
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed flex-grow"
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontWeight: 400,
                        lineHeight: '1.7',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Compared Testing Tools Section */}
        <section id="tools" className="py-16 lg:py-20 relative">
          <div className="container mx-auto px-4 md:px-8 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{
                  color: '#2E1869',
                  fontFamily: "'Manrope', 'Space Grotesk', 'Inter', sans-serif",
                  fontWeight: 700,
                }}
              >
                Compared Testing Tools
              </h2>
              <p
                className="text-xl max-w-2xl mx-auto"
                style={{
                  color: '#2E1869',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 300,
                  textShadow: '0 2px 4px rgba(255, 255, 255, 0.3)',
                }}
              >
                In-depth analysis of the leading test automation frameworks
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div
                    className="h-full p-6 rounded-3xl text-center transition-all duration-300 flex flex-col items-center"
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
                    <div 
                      className="mb-4 flex items-center justify-center"
                      style={{
                        width: '80px',
                        height: '80px',
                        marginBottom: '1rem',
                      }}
                    >
                      <img 
                        src={tool.logo} 
                        alt={`${tool.name} logo`}
                        className="max-w-full max-h-full object-contain"
                        style={{
                          width: 'auto',
                          height: 'auto',
                          maxWidth: '100%',
                          maxHeight: '100%',
                        }}
                        loading="lazy"
                        onError={(e) => {
                          // Fallback: show tool name initial if logo fails to load
                          const target = e.target as HTMLImageElement;
                          const container = target.parentElement;
                          if (container) {
                            target.style.display = 'none';
                            container.innerHTML = `<span style="color: #2E1869; font-size: 1.5rem; font-weight: 700; font-family: 'Space Grotesk', 'Inter', sans-serif;">${tool.name.charAt(0)}</span>`;
                          }
                        }}
                      />
                    </div>
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Manrope', 'Space Grotesk', 'Inter', sans-serif",
                        fontWeight: 700,
                      }}
                    >
                      {tool.name}
                    </h3>
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: '#A18FFF',
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}
                    >
                      {tool.tagline}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 lg:py-20 relative">
          <div className="container mx-auto px-4 md:px-8 lg:px-16">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center p-8 rounded-3xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
                }}
              >
                <h2
                  className="text-4xl md:text-5xl font-bold mb-6"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Manrope', 'Space Grotesk', 'Inter', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  Ready to Find Your Perfect Testing Tool?
                </h2>
                <p
                  className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 300,
                    textShadow: '0 2px 4px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  Take our 12-question assessment and get personalized recommendations in minutes.
                </p>
                <button
                  onClick={handleStartEvaluation}
                  className="px-8 py-4 rounded-full font-bold text-white transition-all duration-300"
                  style={{
                    background: '#A18FFF',
                    color: '#FFFFFF',
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    boxShadow: 'none',
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
                  Start Your Evaluation Now
                </button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
