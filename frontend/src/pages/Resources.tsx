import { motion } from 'framer-motion';
import { ExternalLink, Code, Lightbulb, Bot, BookOpen, Video, FileText, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const toolResources = {
  selenium: {
    name: 'Selenium',
    icon: Code,
    color: '#10B981',
    setupSteps: [
      { step: 1, title: 'Install Java Development Kit (JDK)', description: 'Download and install JDK 8 or higher from Oracle or OpenJDK.' },
      { step: 2, title: 'Install IDE', description: 'Set up IntelliJ IDEA, Eclipse, or your preferred IDE for Java development.' },
      { step: 3, title: 'Add Selenium WebDriver', description: 'Add Selenium WebDriver dependency using Maven or Gradle.' },
      { step: 4, title: 'Download Browser Drivers', description: 'Download ChromeDriver, GeckoDriver, or other browser drivers.' },
      { step: 5, title: 'Write Your First Test', description: 'Create a simple test script to verify your setup.' },
    ],
    links: [
      { label: 'Official Documentation', url: 'https://www.selenium.dev/documentation/', type: 'documentation' },
      { label: 'Getting Started Guide', url: 'https://www.selenium.dev/documentation/webdriver/getting_started/', type: 'guide' },
      { label: 'Installation Guide', url: 'https://www.selenium.dev/documentation/selenium/installation/', type: 'guide' },
      { label: 'Selenium Grid Setup', url: 'https://www.selenium.dev/documentation/grid/', type: 'guide' },
      { label: 'Best Practices', url: 'https://www.selenium.dev/documentation/test_practices/', type: 'guide' },
      { label: 'Community Resources', url: 'https://www.selenium.dev/support/', type: 'community' },
      { label: 'GitHub Repository', url: 'https://github.com/SeleniumHQ/selenium', type: 'community' },
    ],
  },
  playwright: {
    name: 'Playwright',
    icon: Code,
    color: '#3B82F6',
    setupSteps: [
      { step: 1, title: 'Install Node.js', description: 'Install Node.js 16+ from nodejs.org.' },
      { step: 2, title: 'Create Project', description: 'Initialize a new Node.js project with npm or yarn.' },
      { step: 3, title: 'Install Playwright', description: 'Run: npm install @playwright/test' },
      { step: 4, title: 'Install Browsers', description: 'Run: npx playwright install to install browser binaries.' },
      { step: 5, title: 'Configure Playwright', description: 'Create playwright.config.js for test configuration.' },
      { step: 6, title: 'Write Your First Test', description: 'Create a test file and run your first Playwright test.' },
    ],
    links: [
      { label: 'Official Documentation', url: 'https://playwright.dev/', type: 'documentation' },
      { label: 'Getting Started Guide', url: 'https://playwright.dev/docs/intro', type: 'guide' },
      { label: 'Installation Guide', url: 'https://playwright.dev/docs/installation', type: 'guide' },
      { label: 'API Reference', url: 'https://playwright.dev/docs/api/class-playwright', type: 'documentation' },
      { label: 'Best Practices', url: 'https://playwright.dev/docs/best-practices', type: 'guide' },
      { label: 'Community Resources', url: 'https://playwright.dev/community/welcome', type: 'community' },
      { label: 'GitHub Repository', url: 'https://github.com/microsoft/playwright', type: 'community' },
    ],
  },
  testim: {
    name: 'Testim',
    icon: Lightbulb,
    color: '#A18FFF',
    setupSteps: [
      { step: 1, title: 'Create Account', description: 'Sign up for a Testim account at testim.io.' },
      { step: 2, title: 'Install Testim Extension', description: 'Install the Testim browser extension for Chrome or Firefox.' },
      { step: 3, title: 'Connect Your Application', description: 'Connect Testim to your application URL.' },
      { step: 4, title: 'Record First Test', description: 'Use the visual recorder to create your first test.' },
      { step: 5, title: 'Configure Test Settings', description: 'Set up test execution settings and schedules.' },
      { step: 6, title: 'Integrate CI/CD', description: 'Integrate Testim with your CI/CD pipeline for automated runs.' },
    ],
    links: [
      { label: 'Official Documentation', url: 'https://help.testim.io/', type: 'documentation' },
      { label: 'Getting Started Guide', url: 'https://help.testim.io/docs', type: 'guide' },
      { label: 'Installation Guide', url: 'https://help.testim.io/docs/installation', type: 'guide' },
      { label: 'CI/CD Integration', url: 'https://help.testim.io/docs/ci-cd-integration', type: 'guide' },
      { label: 'Best Practices', url: 'https://help.testim.io/docs/best-practices', type: 'guide' },
      { label: 'Community Resources', url: 'https://www.testim.io/resources/', type: 'community' },
      { label: 'Video Tutorials', url: 'https://www.testim.io/videos/', type: 'video' },
    ],
  },
  mabl: {
    name: 'Mabl',
    icon: Bot,
    color: '#F97316',
    setupSteps: [
      { step: 1, title: 'Create Account', description: 'Sign up for a Mabl account at mabl.com.' },
      { step: 2, title: 'Create Application', description: 'Create a new application in the Mabl dashboard.' },
      { step: 3, title: 'Install Mabl Trainer', description: 'Install the Mabl Trainer browser extension.' },
      { step: 4, title: 'Record First Test', description: 'Use the trainer to record your first test flow.' },
      { step: 5, title: 'Configure Environments', description: 'Set up test environments (dev, staging, production).' },
      { step: 6, title: 'Set Up Integrations', description: 'Integrate with Jira, Slack, or your preferred tools.' },
    ],
    links: [
      { label: 'Official Documentation', url: 'https://help.mabl.com/', type: 'documentation' },
      { label: 'Getting Started Guide', url: 'https://help.mabl.com/docs/getting-started', type: 'guide' },
      { label: 'Installation Guide', url: 'https://help.mabl.com/docs/installation', type: 'guide' },
      { label: 'CI/CD Integration', url: 'https://help.mabl.com/docs/ci-cd', type: 'guide' },
      { label: 'Best Practices', url: 'https://help.mabl.com/docs/best-practices', type: 'guide' },
      { label: 'Community Resources', url: 'https://www.mabl.com/resources', type: 'community' },
      { label: 'API Documentation', url: 'https://help.mabl.com/docs/api', type: 'documentation' },
    ],
  },
};

export const Resources = () => {
  const location = useLocation();
  const [selectedTool, setSelectedTool] = useState<string | null>(() => {
    // Check location state first
    const locationTool = (location.state as { tool?: string })?.tool;
    if (locationTool) {
      return locationTool;
    }
    // Check sessionStorage to preserve state when returning from external links
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('resources_selected_tool');
      if (stored) {
        return stored;
      }
    }
    return null;
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Save selected tool to sessionStorage whenever it changes
  useEffect(() => {
    if (selectedTool) {
      sessionStorage.setItem('resources_selected_tool', selectedTool);
    } else {
      sessionStorage.removeItem('resources_selected_tool');
    }
  }, [selectedTool]);

  const handleBack = () => {
    setSelectedTool(null);
    sessionStorage.removeItem('resources_selected_tool');
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
      <main className="flex-1 pt-28 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section with Proper Spacing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center relative"
            style={{
              paddingTop: '2rem',
              paddingBottom: '1rem',
            }}
          >
            {/* Back Button - Only show when a tool is selected */}
            {selectedTool && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                onClick={handleBack}
                className="absolute left-0 top-1/2 -translate-y-1/2 md:left-4 flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all z-10"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#2E1869',
                  fontFamily: "'Inter', 'Montserrat', sans-serif",
                  border: '1px solid rgba(46, 24, 105, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(46, 24, 105, 0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(46, 24, 105, 0.4)';
                  e.currentTarget.style.transform = 'translateX(-4px) translateY(-50%)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(46, 24, 105, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(46, 24, 105, 0.2)';
                  e.currentTarget.style.transform = 'translateX(0) translateY(-50%)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 24, 105, 0.15)';
                }}
              >
                <ArrowLeft className="h-4 w-4" style={{ strokeWidth: 2.5 }} />
                <span className="hidden sm:inline">Back</span>
              </motion.button>
            )}
            
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
              Resources
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
              Explore documentation and resources for each test automation tool
            </p>
          </motion.div>

          {/* Tool Filter */}
          {!selectedTool && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex flex-wrap gap-3 justify-center">
                {Object.keys(toolResources).map((toolKey) => {
                  const tool = toolResources[toolKey as keyof typeof toolResources];
                  return (
                    <button
                      key={toolKey}
                      onClick={() => setSelectedTool(toolKey)}
                      className="px-6 py-3 rounded-full font-semibold transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: '#2E1869',
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                        border: '1px solid rgba(46, 24, 105, 0.2)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = tool.color + '40';
                        e.currentTarget.style.borderColor = tool.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(46, 24, 105, 0.2)';
                      }}
                    >
                      {tool.name}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Setup Guide Section - Shown when tool is selected */}
          {selectedTool && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              {(() => {
                const tool = toolResources[selectedTool as keyof typeof toolResources];
                if (!tool) return null;
                
                return (
                  <div
                    className="p-8 rounded-3xl mb-8"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${tool.color}40`,
                      boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
                    }}
                  >
                    <div className="flex items-center mb-6">
                      <div className="flex items-center gap-4">
                        <tool.icon className="h-10 w-10" style={{ color: tool.color }} />
                        <div>
                          <h2
                            className="text-3xl font-bold"
                            style={{
                              color: '#2E1869',
                              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                              fontWeight: 700,
                            }}
                          >
                            {tool.name} Setup Guide
                          </h2>
                          <p
                            className="text-sm"
                            style={{
                              color: '#2E1869',
                              fontFamily: "'Inter', 'Montserrat', sans-serif",
                              opacity: 0.8,
                            }}
                          >
                            Step-by-step installation and setup instructions
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Setup Steps */}
                    <div className="space-y-4 mb-8">
                      {tool.setupSteps.map((step, index) => (
                        <motion.div
                          key={step.step}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="flex gap-4 p-4 rounded-xl"
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          <div
                            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold"
                            style={{
                              background: tool.color,
                              color: '#FFFFFF',
                              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                            }}
                          >
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <h3
                              className="text-lg font-bold mb-1"
                              style={{
                                color: '#2E1869',
                                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                                fontWeight: 600,
                              }}
                            >
                              {step.title}
                            </h3>
                            <p
                              className="text-sm"
                              style={{
                                color: '#2E1869',
                                fontFamily: "'Inter', 'Montserrat', sans-serif",
                                opacity: 0.9,
                              }}
                            >
                              {step.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Resource Links */}
                    <div>
                      <h3
                        className="text-xl font-bold mb-4"
                        style={{
                          color: '#2E1869',
                          fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                          fontWeight: 700,
                        }}
                      >
                        Resources & Documentation
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tool.links.map((link, index) => {
                          const getIcon = () => {
                            switch (link.type) {
                              case 'documentation':
                                return <FileText className="h-4 w-4" />;
                              case 'guide':
                                return <BookOpen className="h-4 w-4" />;
                              case 'video':
                                return <Video className="h-4 w-4" />;
                              case 'community':
                                return <ExternalLink className="h-4 w-4" />;
                              default:
                                return <ExternalLink className="h-4 w-4" />;
                            }
                          };

                          return (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300"
                              style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: '#2E1869',
                                fontFamily: "'Inter', 'Montserrat', sans-serif",
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                              onClick={(e) => {
                                // Ensure link opens in new tab
                                e.preventDefault();
                                window.open(link.url, '_blank', 'noopener,noreferrer');
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = tool.color + '20';
                                e.currentTarget.style.borderColor = tool.color;
                                e.currentTarget.style.transform = 'translateX(4px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                e.currentTarget.style.transform = 'translateX(0)';
                              }}
                            >
                              {getIcon()}
                              <span>{link.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* All Tools Grid - Shown when no tool is selected */}
          {!selectedTool && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {Object.entries(toolResources).map(([toolKey, tool], index) => (
                <motion.div
                  key={toolKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div
                    className="h-full p-6 rounded-3xl transition-all duration-300 cursor-pointer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
                    }}
                    onClick={() => setSelectedTool(toolKey)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(46, 24, 105, 0.3)';
                      e.currentTarget.style.borderColor = tool.color + '60';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(46, 24, 105, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <tool.icon
                          className="h-8 w-8"
                          style={{ color: tool.color }}
                        />
                        <h2
                          className="text-xl font-bold"
                          style={{
                            color: '#2E1869',
                            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          {tool.name}
                        </h2>
                      </div>
                      <p
                        className="text-sm"
                        style={{
                          color: '#2E1869',
                          fontFamily: "'Inter', 'Montserrat', sans-serif",
                          fontWeight: 400,
                          opacity: 0.9,
                        }}
                      >
                        Documentation and learning resources
                      </p>
                    </div>
                    <div className="space-y-3">
                      {tool.links.slice(0, 3).map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Ensure link opens in new tab
                            e.preventDefault();
                            window.open(link.url, '_blank', 'noopener,noreferrer');
                          }}
                          className="flex items-center gap-2 transition-all duration-300"
                          style={{
                            color: '#2E1869',
                            fontFamily: "'Inter', 'Montserrat', sans-serif",
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = tool.color;
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#2E1869';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <ExternalLink className="h-4 w-4" style={{ color: 'inherit' }} />
                          {link.label}
                        </a>
                      ))}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTool(toolKey);
                        }}
                        className="w-full mt-4 px-4 py-2 rounded-full font-semibold transition-all"
                        style={{
                          background: tool.color + '20',
                          color: tool.color,
                          fontFamily: "'Inter', 'Montserrat', sans-serif",
                          border: `1px solid ${tool.color}40`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = tool.color + '30';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = tool.color + '20';
                        }}
                      >
                        View Setup Guide →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
