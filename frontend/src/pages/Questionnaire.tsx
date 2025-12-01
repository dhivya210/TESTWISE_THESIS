import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2
} from 'lucide-react';
import { questions } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { Logo } from '@/components/Logo';

interface Answer {
  questionId: number;
  selectedValue: number;
}

// Parse option text to get title and description
const parseOptionText = (text: string) => {
  // Check for semicolon separator (common in the questions)
  if (text.includes(';')) {
    const parts = text.split(';');
    return {
      title: parts[0].trim(),
      description: parts.slice(1).join(';').trim()
    };
  }
  // Check for common separators
  if (text.includes('—') || text.includes('–') || (text.includes('-') && !text.match(/^\d+-\d+/))) {
    const separator = text.includes('—') ? '—' : text.includes('–') ? '–' : '-';
    const parts = text.split(separator);
    if (parts.length > 1) {
      return {
        title: parts[0].trim(),
        description: parts.slice(1).join(separator).trim()
      };
    }
  }
  // Check for parentheses
  if (text.includes('(') && text.includes(')')) {
    const match = text.match(/^(.+?)\s*\((.+?)\)$/);
    if (match) {
      return {
        title: match[1].trim(),
        description: match[2].trim()
      };
    }
  }
  // Check for colon
  if (text.includes(':')) {
    const parts = text.split(':');
    if (parts.length > 1) {
      return {
        title: parts[0].trim(),
        description: parts.slice(1).join(':').trim()
      };
    }
  }
  // For longer text, try to split intelligently
  const words = text.split(' ');
  if (words.length > 6) {
    // Try to find a natural break point (comma, or middle of sentence)
    const commaIndex = text.indexOf(',');
    if (commaIndex > 0 && commaIndex < text.length * 0.6) {
      return {
        title: text.substring(0, commaIndex).trim(),
        description: text.substring(commaIndex + 1).trim()
      };
    }
    // Split at roughly 40% of words for title
    const splitPoint = Math.ceil(words.length * 0.4);
    return {
      title: words.slice(0, splitPoint).join(' '),
      description: words.slice(splitPoint).join(' ')
    };
  }
  // Default: use entire text as title
  return {
    title: text,
    description: ''
  };
};

export const Questionnaire = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initial state from location if returning from preview
  const locationState = location.state as { 
    answers?: Answer[]; 
    projectName?: string; 
    returnToPreview?: boolean 
  } | null;
  
  const [projectName, setProjectName] = useState(locationState?.projectName || '');
  const [hasStarted, setHasStarted] = useState(!!locationState?.projectName);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(locationState?.answers || []);
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // Pagination: 6 questions per page
  const questionsPerPage = 6;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  // Get questions for current page
  const startIndex = currentPage * questionsPerPage;
  const endIndex = Math.min(startIndex + questionsPerPage, questions.length);
  const currentPageQuestions = questions.slice(startIndex, endIndex);

  // Check if all questions on current page are answered
  const allPageQuestionsAnswered = currentPageQuestions.every((q) =>
    answers.some((a) => a.questionId === q.id)
  );

  const handleAnswerSelect = (questionId: number, value: number) => {
    const updatedAnswers = answers.filter((a) => a.questionId !== questionId);
    updatedAnswers.push({ questionId, selectedValue: value });
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (!allPageQuestionsAnswered) {
      return;
    }
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Navigate to preview page instead of directly to analysis
      navigate('/preview', { state: { answers, projectName } });
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleStartQuestionnaire = () => {
    if (projectName.trim()) {
      setHasStarted(true);
    }
  };

  // Global keyboard navigation
  useEffect(() => {
    if (!hasStarted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'ArrowLeft' && currentPage > 0) {
        e.preventDefault();
        setCurrentPage(currentPage - 1);
      } else if (e.key === 'ArrowRight' && allPageQuestionsAnswered) {
        if (currentPage < totalPages - 1) {
          e.preventDefault();
          setCurrentPage(currentPage + 1);
        } else if (currentPage === totalPages - 1) {
          e.preventDefault();
          navigate('/preview', { state: { answers, projectName } });
        }
      } else if (e.key === 'Enter' && allPageQuestionsAnswered) {
        if (currentPage < totalPages - 1) {
          e.preventDefault();
          setCurrentPage(currentPage + 1);
        } else {
          e.preventDefault();
          navigate('/preview', { state: { answers, projectName } });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, currentPage, answers, allPageQuestionsAnswered, totalPages]);

  // Set current page based on answered questions when returning from preview
  useEffect(() => {
    if (locationState?.answers && locationState.answers.length > 0) {
      // Find the first unanswered question or go to the last page
      const firstUnansweredIndex = questions.findIndex(
        (q) => !locationState.answers?.some((a) => a.questionId === q.id)
      );
      if (firstUnansweredIndex >= 0) {
        setCurrentPage(Math.floor(firstUnansweredIndex / questionsPerPage));
      } else {
        // All answered, go to last page
        setCurrentPage(totalPages - 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    // Scroll the content area
    if (contentAreaRef.current) {
      contentAreaRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    // Also scroll the window to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  // Scroll to top when component mounts (navigating to this page)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Clear navigation flag if it exists
    if (sessionStorage.getItem('testwise_navigating') === 'true') {
      sessionStorage.removeItem('testwise_navigating');
      console.log('✅ Questionnaire page loaded - navigation flag cleared');
    }
  }, []);

  return (
    <div 
      className="h-screen flex flex-col relative overflow-hidden gradient-bg"
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
      <div className="flex-1 flex overflow-hidden">
          {!hasStarted ? (
        // Welcome Screen
        <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div 
              className="rounded-2xl p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
              }}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center mb-4">
                  <Logo size="lg" orientation="horizontal" showText={false} />
                </div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#2C2C2C' }}>
                  Welcome to TestWise
                </h2>
                <p style={{ color: '#9E9E9E', fontSize: '15px' }}>
                  Let's find the perfect test automation tool for your project
                </p>
              </div>
              
                <div className="space-y-4">
                  <div>
                  <Label htmlFor="projectName" className="text-sm font-medium mb-2 block" style={{ color: '#2C2C2C' }}>
                      Project Name
                    </Label>
                    <Input
                      id="projectName"
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g., E-commerce Platform"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && projectName.trim()) {
                          handleStartQuestionnaire();
                        }
                      }}
                    className="w-full"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #E0E0E0',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleStartQuestionnaire}
                    disabled={!projectName.trim()}
                    className="w-full font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: '#2C2C2C',
                      color: '#FFFFFF',
                      padding: '14px 32px',
                      fontSize: '15px',
                      fontWeight: 600,
                      borderRadius: '8px'
                    }}
                >
                  Start Evaluation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
        </div>
      ) : (
        // Main Questionnaire - Split Panel Layout
        <div className="flex-1 flex overflow-hidden relative z-10">
          {/* Left Sidebar - Progress */}
          <div 
            className="w-[21%] flex flex-col h-full" 
            style={{ 
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
            }}
          >
            {/* Header - Compact */}
            <div className="flex-shrink-0" style={{ padding: '24px 20px 12px 20px' }}>
              <div className="flex items-center gap-2 mb-3 mt-20">
                <div className="w-7 h-7 rounded-full bg-[#FF8C42] flex items-center justify-center text-white font-bold text-xs">
                  {projectName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold" style={{ color: '#2C2C2C' }}>
                    {projectName}
                  </h3>
                </div>
              </div>
              <h2 className="text-lg font-bold mb-1.5" style={{ color: '#2E1869', lineHeight: 1.2 }}>
                Test Automation Evaluation
              </h2>
              <p style={{ color: '#2E1869', fontSize: '11px', lineHeight: 1.3, opacity: 0.8, marginBottom: '10px' }}>
                Answer questions to find your perfect testing tool
              </p>
              
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ color: '#2E1869', fontSize: '10px', fontWeight: 600 }}>
                    Progress
                  </span>
                  <span style={{ color: '#2E1869', fontSize: '10px', fontWeight: 600, opacity: 0.8 }}>
                    {answers.length} / {questions.length}
                  </span>
                </div>
                <div 
                  className="w-full rounded-full overflow-hidden"
                  style={{
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(answers.length / questions.length) * 100}%`,
                      background: 'linear-gradient(90deg, #FF8C42 0%, #FFA366 100%)',
                      boxShadow: '0 1px 4px rgba(255, 140, 66, 0.4)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Vertical Timeline - Step List - Compact, No Scroll */}
            <div className="flex-1 relative overflow-hidden" style={{ padding: '0 20px 20px 20px' }}>
              <div className="relative h-full">
              {/* Vertical connector line */}
              <div 
                  className="absolute left-[8px] top-0 bottom-0 w-[2px]" 
                style={{ backgroundColor: '#E0E0E0' }}
              />
              
                <div className="space-y-3 h-full">
                {questions.map((q, index) => {
                  const isCompleted = answers.some(a => a.questionId === q.id);
                    const questionPage = Math.floor(index / questionsPerPage);
                    const isCurrentPage = questionPage === currentPage;
                    const isPending = questionPage > currentPage;
                  
                  return (
                    <div
                      key={q.id}
                        className="relative flex items-center gap-2.5 cursor-pointer py-0.5"
                      onClick={() => {
                          if (questionPage <= currentPage || isCompleted) {
                            setCurrentPage(questionPage);
                        }
                      }}
                    >
                      {/* Step Icon */}
                      <div className="relative z-10 flex-shrink-0">
                        {isCompleted ? (
                          <div 
                              className="w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#FF8C42' }}
                          >
                              <CheckCircle2 className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
                          </div>
                          ) : isCurrentPage ? (
                          <div 
                              className="w-4 h-4 rounded-full"
                            style={{ 
                              backgroundColor: '#FFFFFF',
                                border: '2px solid #FF8C42'
                            }}
                          />
                        ) : (
                          <div 
                              className="w-4 h-4 rounded-full"
                            style={{ 
                              backgroundColor: '#F5F5F5',
                              border: '2px solid #E0E0E0'
                            }}
                          />
                        )}
                      </div>
                      
                        {/* Step Content - Only Category */}
                        <div className="flex-1">
                        <h4 
                            className="text-sm font-medium"
                          style={{
                              color: isPending ? '#BDBDBD' : '#2E1869',
                              fontWeight: isPending ? 400 : 600,
                              lineHeight: 1.2
                          }}
                        >
                          {q.category}
                        </h4>
                        </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Question Content */}
          <div 
            ref={contentAreaRef}
            className="flex-1 overflow-y-auto" 
            style={{ 
              padding: '48px 60px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                {/* Page Header */}
                <div className="mb-8 mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 
                      className="text-3xl font-bold"
                      style={{ 
                        color: '#2C2C2C', 
                        fontSize: '28px', 
                        fontWeight: 700,
                        lineHeight: 1.3
                      }}
                    >
                      Page {currentPage + 1} of {totalPages}
                    </h2>
                    <div 
                      className="px-3 py-1.5 rounded-xl text-sm font-medium"
                      style={{ 
                        backgroundColor: '#E0E0E0',
                        color: '#2C2C2C',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      Questions {startIndex + 1}-{endIndex} of {questions.length}
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-12 flex-1">
                  {currentPageQuestions.map((question) => {
                    const currentAnswer = answers.find((a) => a.questionId === question.id);
                    
                    return (
                      <div key={question.id} className="space-y-6">
                        {/* Question Header */}
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="px-3 py-1 rounded-lg text-sm font-semibold"
                              style={{ 
                                backgroundColor: '#FF8C42',
                                color: '#FFFFFF',
                                fontSize: '12px'
                              }}
                            >
                              {question.category}
                            </div>
                            {currentAnswer && (
                              <CheckCircle2 className="h-5 w-5" style={{ color: '#FF8C42' }} strokeWidth={2.5} />
                            )}
                          </div>
                          <h3 
                            className="text-xl font-bold"
                            style={{ 
                              color: '#2E1869', 
                              fontSize: '20px', 
                              fontWeight: 700,
                              lineHeight: 1.4
                            }}
                          >
                            {question.text}
                          </h3>
                </div>

                {/* Options Grid - 2 columns */}
                        <div className="grid grid-cols-2 gap-4">
                  {question.options.map((option) => {
                    const isSelected = currentAnswer?.selectedValue === option.value;
                    const parsed = parseOptionText(option.text);
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleAnswerSelect(question.id, option.value)}
                        className="option-card relative flex flex-col items-center justify-center text-center p-6 rounded-2xl cursor-pointer"
                        style={{
                          background: isSelected 
                            ? 'rgba(255, 140, 66, 0.25)' 
                            : 'rgba(255, 255, 255, 0.25)',
                          backdropFilter: 'blur(10px)',
                          border: isSelected 
                            ? '2px solid rgba(255, 140, 66, 0.6)' 
                            : '2px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '16px',
                          minHeight: '120px',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected 
                            ? '0 4px 16px rgba(255, 140, 66, 0.3)' 
                            : '0 4px 16px rgba(46, 24, 105, 0.15)',
                        }}
                      >
                        {/* Checkmark for selected */}
                        {isSelected && (
                          <div 
                            className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#FF8C42' }}
                          >
                            <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                        
                        {/* Option Content */}
                                <h4 
                                  className="text-sm font-semibold mb-2"
                          style={{ 
                            color: '#2C2C2C',
                                    fontSize: '14px',
                            fontWeight: 600
                          }}
                        >
                          {parsed.title}
                                </h4>
                        
                        {parsed.description && (
                          <p 
                                    className="text-xs"
                            style={{ 
                              color: '#9E9E9E',
                                      fontSize: '12px',
                              lineHeight: 1.5
                            }}
                          >
                            {parsed.description}
                          </p>
                        )}
                      </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-end pt-6 border-t mt-8" style={{ borderColor: '#E0E0E0' }}>
                  <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentPage === 0}
                    className="flex items-center gap-2 disabled:opacity-50"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#2C2C2C',
                      padding: '14px 28px',
                      fontSize: '15px',
                      fontWeight: 600,
                      borderRadius: '8px'
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous Page
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={!allPageQuestionsAnswered}
                    className="flex items-center gap-2 disabled:opacity-50 transition-all"
                    style={{
                      backgroundColor: '#2C2C2C',
                      color: '#FFFFFF',
                      padding: '14px 32px',
                      fontSize: '15px',
                      fontWeight: 600,
                      borderRadius: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#1A1A1A';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2C2C2C';
                    }}
                  >
                    {currentPage === totalPages - 1 ? 'Review Answers' : 'Next Page'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
