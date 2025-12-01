import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

const faqs = [
  {
    question: 'What is TestWise?',
    answer:
      'TestWise is a decision-support web application that helps you choose the best test automation tool (Selenium, Playwright, Testim, or Mabl) based on your project requirements through an interactive questionnaire.',
  },
  {
    question: 'What tools are compared?',
    answer:
      'TestWise compares four leading test automation tools: Selenium (open-source), Playwright (modern framework), Testim (AI-powered), and Mabl (intelligent platform). Each tool has unique strengths for different use cases.',
  },
  {
    question: 'How is the recommendation generated?',
    answer:
      'The recommendation is generated based on your answers to 12 questions covering team size, technical expertise, project complexity, budget, timeline, and feature requirements. Each answer contributes weighted points to each tool, and the tool with the highest score is recommended.',
  },
  {
    question: 'Can I compare tools manually?',
    answer:
      'Yes! You can visit the Comparison page to see a side-by-side comparison of all four tools across various categories including strengths, weaknesses, pricing, learning curve, and more.',
  },
  {
    question: 'Is my data saved?',
    answer:
      'Currently, TestWise uses localStorage to save your session. Guest mode is available for anonymous access. In a production environment, your data would be securely stored on servers.',
  },
  {
    question: 'How accurate are the recommendations?',
    answer:
      'Recommendations are based on research best practices and tool characteristics. However, you should consider your specific context, team preferences, and project requirements when making the final decision. The tool provides guidance, but the final choice should align with your unique situation.',
  },
];

export const Help = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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
        <div className="container mx-auto px-4 max-w-4xl">
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
              Help Center
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
              Find answers to frequently asked questions about TestWise
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
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
              <div className="mb-6">
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  Frequently Asked Questions
                </h2>
                <p
                  className="text-sm"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                    fontWeight: 400,
                    opacity: 0.9,
                  }}
                >
                  Common questions and answers about using TestWise
                </p>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-b border-white/20"
                  >
                    <AccordionTrigger
                      className="text-left hover:no-underline"
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                        fontWeight: 400,
                        opacity: 0.9,
                      }}
                    >
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
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
              <div className="mb-6">
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  Need More Help?
                </h2>
                <p
                  className="text-sm"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                    fontWeight: 400,
                    opacity: 0.9,
                  }}
                >
                  Contact our support team for additional assistance
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Mail
                    className="h-5 w-5"
                    style={{ color: '#A18FFF' }}
                  />
                  <div>
                    <p
                      className="font-medium"
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      Email Support
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: '#2E1869',
                        fontFamily: "'Inter', 'Montserrat', sans-serif",
                        fontWeight: 400,
                        opacity: 0.8,
                      }}
                    >
                      support@testwise.com
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => window.location.href = 'mailto:support@testwise.com'}
                  className="rounded-full font-bold"
                  style={{
                    background: '#A18FFF',
                    color: '#FFFFFF',
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: "'Inter', 'Montserrat', sans-serif",
                    border: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#8B7AFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#A18FFF';
                  }}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
