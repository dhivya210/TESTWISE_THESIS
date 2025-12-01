import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell, PieChart, Pie } from 'recharts';
import { jsPDF } from 'jspdf';
import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { Download, RotateCcw, Eye, Trophy, ChevronDown, ChevronUp, BookOpen, Users, DollarSign, Zap, Code, Sparkles, ChevronRight, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { questions } from '@/data/questions';
import testimLogo from '@/assets/testim-logo.svg';
import mablLogo from '@/assets/mabl-logo.svg';
import testwiseLogo from '@/assets/logo.ico';

interface Scores {
  selenium: number;
  playwright: number;
  testim: number;
  mabl: number;
}

interface EvaluationHistory {
  id: string;
  date: string;
  timestamp: number;
  recommendedTool: string;
  scores: Scores;
  answers: any[];
}

export const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { scores, answers, projectName } = location.state as { scores: Scores; answers: any[]; projectName?: string };
  const [evaluationCount, setEvaluationCount] = useState(0);
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [confettiShown, setConfettiShown] = useState(false);
  const hasSavedRef = useRef(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Prevent back navigation after viewing results
  useEffect(() => {
    // Replace current history entry to prevent going back
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = () => {
      // Prevent navigation back - redirect to questionnaire instead
      window.history.pushState(null, '', window.location.href);
      navigate('/questionnaire', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  // Redirect if no scores (prevents direct access)
  useEffect(() => {
    if (!scores) {
      navigate('/questionnaire', { replace: true });
    }
  }, [scores, navigate]);

  // Technical term glossary
  const glossary = {
    'CI/CD': 'Continuous Integration/Continuous Deployment - Automated processes for building, testing, and deploying code changes.',
    'Self-healing': 'Tests that automatically adapt and fix themselves when application UI changes, reducing maintenance overhead.',
    'AI maintenance': 'Artificial intelligence-powered features that automatically update and maintain test scripts when applications change.',
  };

  // Calculate sorted scores early (needed for useEffects)
  const toolColors = scores ? {
    Selenium: { primary: '#A18FFF', secondary: '#C0A9FE', gradient: 'linear-gradient(135deg, #A18FFF, #C0A9FE)' },
    Playwright: { primary: '#EABDFF', secondary: '#98F3FE', gradient: 'linear-gradient(135deg, #EABDFF, #98F3FE)' },
    Testim: { primary: '#C0A9FE', secondary: '#EABDFF', gradient: 'linear-gradient(135deg, #C0A9FE, #EABDFF)' },
    Mabl: { primary: '#98F3FE', secondary: '#A18FFF', gradient: 'linear-gradient(135deg, #98F3FE, #A18FFF)' },
  } : null;

  // Category importance weights for tie-breaking
  const categoryWeights: Record<string, number> = {
    'Budget': 1.2,
    'Execution': 1.15,
    'Team': 1.1,
    'Technical': 1.15,
    'Learning': 1.05,
    'Setup': 1.0,
    'Interface': 1.0,
    'Resources': 1.0,
    'Support': 1.1,
    'Performance': 1.15,
    'Maintenance': 1.2,
    'Scale': 1.15,
  };

  // Calculate category-weighted scores for tie-breaking only
  const calculateCategoryWeightedScore = (toolName: string) => {
    if (!answers || answers.length === 0) return 0;
    
    let weightedScore = 0;
    answers.forEach((answer: any) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) return;
      
      const option = question.options.find((opt) => opt.value === answer.selectedValue);
      if (!option) return;
      
      const categoryWeight = categoryWeights[question.category] || 1.0;
      const toolScore = option.toolWeights[toolName.toLowerCase() as keyof typeof option.toolWeights];
      weightedScore += toolScore * categoryWeight;
    });
    
    return weightedScore;
  };

  // Sort scores with category-weighted tie-breaking
  const sortedScores = scores ? [
    { name: 'Selenium', score: scores.selenium, weightedScore: calculateCategoryWeightedScore('Selenium'), ...toolColors!.Selenium },
    { name: 'Playwright', score: scores.playwright, weightedScore: calculateCategoryWeightedScore('Playwright'), ...toolColors!.Playwright },
    { name: 'Testim', score: scores.testim, weightedScore: calculateCategoryWeightedScore('Testim'), ...toolColors!.Testim },
    { name: 'Mabl', score: scores.mabl, weightedScore: calculateCategoryWeightedScore('Mabl'), ...toolColors!.Mabl },
  ].sort((a, b) => {
    // Primary sort: by base score (descending)
    const scoreDiff = b.score - a.score;
    if (Math.abs(scoreDiff) > 0.001) {
      return scoreDiff;
    }
    // Tie detected: use category-weighted scores for tie-breaking
    const weightedDiff = b.weightedScore - a.weightedScore;
    if (Math.abs(weightedDiff) > 0.001) {
      return weightedDiff;
    }
    // Still tied: alphabetical by name (final fallback)
    return a.name.localeCompare(b.name);
  }) : [];

  // Auto-save to history (only once on mount)
  useEffect(() => {
    // Only run once when component mounts and has scores
    if (scores && sortedScores.length > 0 && !hasSavedRef.current) {
      // Mark as saved IMMEDIATELY to prevent duplicate saves
      hasSavedRef.current = true;
      
      const saveEvaluation = async () => {
        const recommendedTool = sortedScores[0].name;
        
        // Check if user is guest - use localStorage only
        if (user?.isGuest) {
          const history: EvaluationHistory[] = JSON.parse(localStorage.getItem('testwise_evaluations') || '[]');
          
          const newEvaluation: EvaluationHistory = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            timestamp: Date.now(),
            recommendedTool,
            scores,
            answers: answers || [],
          };
          
          // Add to beginning of array
          const updatedHistory = [newEvaluation, ...history];
          localStorage.setItem('testwise_evaluations', JSON.stringify(updatedHistory));
          
          // Update evaluation count
          setEvaluationCount(updatedHistory.length);
          
          toast({
            title: 'Saved!',
            description: 'Your evaluation has been saved to local history.',
          });
        } 
        // Authenticated user - save to database
        else if (user?.id) {
          try {
            await api.createEvaluation({
              userId: user.id,
              projectName: projectName || undefined,
              recommendedTool,
              scores,
              answers: answers || [],
            });
            
            // Also update local count by fetching from API
            try {
              const response = await api.getEvaluations(user.id);
              setEvaluationCount(response.count);
            } catch (err) {
              console.error('Failed to fetch evaluation count:', err);
            }
            
            toast({
              title: 'Saved!',
              description: 'Your evaluation has been saved to your account.',
            });
          } catch (err) {
            console.error('Failed to save evaluation to database:', err);
            
            // Fallback to localStorage if API fails
            const history: EvaluationHistory[] = JSON.parse(localStorage.getItem('testwise_evaluations') || '[]');
            const newEvaluation: EvaluationHistory = {
              id: Date.now().toString(),
              date: new Date().toLocaleDateString(),
              timestamp: Date.now(),
              recommendedTool,
              scores,
              answers: answers || [],
            };
            const updatedHistory = [newEvaluation, ...history];
            localStorage.setItem('testwise_evaluations', JSON.stringify(updatedHistory));
            setEvaluationCount(updatedHistory.length);
            
            toast({
              title: 'Saved Locally',
              description: 'Evaluation saved to local storage. Could not connect to server.',
              variant: 'destructive',
            });
          }
        }
      };

      saveEvaluation();
    }
    // Empty dependency array - only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Celebration: Subtle confetti on first load
  useEffect(() => {
    if (scores && sortedScores.length > 0 && !confettiShown) {
      const timer = setTimeout(() => {
        // Subtle confetti burst from center
          confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: sortedScores[0] ? [sortedScores[0].primary, sortedScores[0].secondary] : ['#A18FFF', '#C0A9FE'],
          gravity: 0.8,
          ticks: 100,
        });
        setConfettiShown(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [scores, sortedScores, confettiShown]);

  // Trigger animations and loading
  useEffect(() => {
    if (scores && sortedScores.length > 0) {
      // Simulate data loading
      // Loading state removed - show visualizations immediately

      // Animate bars after a short delay
      const barsTimer = setTimeout(() => {
        setBarsAnimated(true);
      }, 300);

      return () => {
        clearTimeout(barsTimer);
      };
    }
  }, [scores, sortedScores]);

  // Load evaluation count on mount
  useEffect(() => {
    const history: EvaluationHistory[] = JSON.parse(localStorage.getItem('testwise_evaluations') || '[]');
    setEvaluationCount(history.length);
  }, []);

  if (!scores || !sortedScores || sortedScores.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #A18FFF 0%, #C0A9FE 25%, #EABDFF 50%, #98F3FE 75%, #A18FFF 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
        }}
      >
        <p style={{ color: '#2E1869', fontFamily: "'Inter', system-ui, sans-serif" }}>No results found</p>
      </div>
    );
  }

  const recommendedTool = sortedScores[0].name.toLowerCase();

  const generateExplanation = (tool: string) => {
    const explanations: Record<string, string> = {
      selenium: 'Selenium is recommended for your team because you value open-source solutions, have strong technical expertise, and need maximum flexibility. It offers extensive community support and works well for large teams with complex testing requirements.',
      playwright: 'Playwright is recommended for your team because you need modern, fast, and reliable test automation. It excels in cross-browser testing, has excellent CI/CD integration, and provides great developer experience with strong documentation.',
      testim: 'Testim is recommended for your team because you need AI-powered test automation with minimal maintenance. It\'s perfect for teams that want to reduce test flakiness and maintenance overhead while still having powerful automation capabilities. Testim offers AI maintenance features to keep your tests up-to-date.',
      mabl: 'Mabl is recommended for your team because you prioritize intelligent test automation with self-healing capabilities. It\'s ideal for teams that want enterprise-grade support and AI-driven test maintenance without extensive coding knowledge.',
    };
    return explanations[tool] || 'This tool matches your requirements based on your questionnaire answers.';
  };

  // Generate criteria-based reasoning from answers
  const generateCriteriaReasoning = () => {
    if (!answers || answers.length === 0) {
      return [];
    }

    const toolName = sortedScores[0].name.toLowerCase();
    const reasoning: Array<{ category: string; reason: string }> = [];

    answers.forEach((answer: any) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) return;

      const selectedOption = question.options.find((opt) => opt.value === answer.selectedValue);
      if (!selectedOption) return;

      // Check which tool got the highest weight for this answer
      const toolWeights = selectedOption.toolWeights;
      const highestWeightTool = Object.entries(toolWeights).reduce((a, b) => 
        toolWeights[a[0] as keyof typeof toolWeights] > toolWeights[b[0] as keyof typeof toolWeights] ? a : b
      )[0];

      if (highestWeightTool === toolName) {
        reasoning.push({
          category: question.category,
          reason: `Your answer "${selectedOption.text}" strongly aligns with ${sortedScores[0].name}'s strengths in ${question.category.toLowerCase()}.`,
        });
      }
    });

    return reasoning;
  };

  const criteriaReasoning = generateCriteriaReasoning();

  const totalScore = sortedScores.reduce((sum, tool) => sum + tool.score, 0);
  const maxScore = Math.max(...sortedScores.map((s) => s.score));
  const recommendationPercentage = Math.round((maxScore / totalScore) * 100);

  // Bar chart data for score comparison
  const barData = sortedScores.map((tool) => ({
    name: tool.name,
    Score: tool.score,
    color: tool.primary,
  }));

  // Pie chart data for score distribution
  const pieData = sortedScores.map((tool) => ({
    name: tool.name,
    value: parseFloat(tool.score.toFixed(2)),
    fill: tool.primary,
  }));

  // Tool metadata for enhanced visualizations
  const toolMetadata = {
    Selenium: {
      icon: Code,
      logo: 'https://www.selenium.dev/images/selenium_logo_square_green.png',
      communitySize: '2M+',
      cost: 'Free',
      performance: 75,
      learningCurve: 60,
      support: 85,
      maintenance: 40,
      scalability: 90,
    },
    Playwright: {
      icon: Zap,
      logo: 'https://playwright.dev/img/playwright-logo.svg',
      communitySize: '500K+',
      cost: 'Free',
      performance: 95,
      learningCurve: 70,
      support: 80,
      maintenance: 65,
      scalability: 85,
    },
    Testim: {
      icon: Sparkles,
      logo: testimLogo,
      communitySize: '50K+',
      cost: 'Paid',
      performance: 70,
      learningCurve: 90,
      support: 75,
      maintenance: 95,
      scalability: 60,
    },
    Mabl: {
      icon: Sparkles,
      logo: mablLogo,
      communitySize: '30K+',
      cost: 'Paid',
      performance: 80,
      learningCurve: 85,
      support: 95,
      maintenance: 90,
      scalability: 75,
    },
  };

  // Generate gauge data for winning tool only
  const gaugeData = sortedScores.length > 0 && maxScore > 0 ? [{
    name: sortedScores[0].name,
    score: Math.round((sortedScores[0].score / maxScore) * 100),
    fill: sortedScores[0].primary,
    performance: toolMetadata[sortedScores[0].name as keyof typeof toolMetadata]?.performance || 0,
    learningCurve: toolMetadata[sortedScores[0].name as keyof typeof toolMetadata]?.learningCurve || 0,
    support: toolMetadata[sortedScores[0].name as keyof typeof toolMetadata]?.support || 0,
  }] : [];

  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();

      // Convert logo to base64 and add to PDF
      try {
        // Try to load logo as image first
        const loadLogo = async () => {
          return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                // Set canvas size to match image or use default
                canvas.width = img.naturalWidth || img.width || 200;
                canvas.height = img.naturalHeight || img.height || 200;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                  // Draw white background for .ico files
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  
                  const imgData = canvas.toDataURL('image/png');
                  pdf.addImage(imgData, 'PNG', 20, 10, 15, 15);
                  resolve();
                } else {
                  reject(new Error('Canvas context not available'));
                }
              } catch (err) {
                reject(err);
              }
            };
            
            img.onerror = async () => {
              // Fallback: try fetching as blob
              try {
                const response = await fetch(testwiseLogo);
                if (response.ok) {
                  const blob = await response.blob();
                  const reader = new FileReader();
                  
                  reader.onload = () => {
                    try {
                      const imgData = reader.result as string;
                      pdf.addImage(imgData, 'PNG', 20, 10, 15, 15);
                      resolve();
                    } catch (err) {
                      reject(err);
                    }
                  };
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                } else {
                  reject(new Error('Failed to fetch logo'));
                }
              } catch (fetchErr) {
                reject(fetchErr);
              }
            };
            
            img.src = testwiseLogo;
          });
        };
        
        await loadLogo();
      } catch (logoError) {
        console.warn('Could not load logo, continuing without it:', logoError);
        // Add text-based logo as fallback
        pdf.setFontSize(16);
        pdf.setTextColor(46, 24, 105);
        pdf.text('TestWise', 20, 18);
      }

      pdf.setFontSize(24);
      pdf.setTextColor(46, 24, 105); // #2E1869
      pdf.text('TestWise Evaluation Report', 38, 20);

      pdf.setFontSize(10);
      pdf.setTextColor(46, 24, 105);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 32);

      // Add "Truly Research Based Recommendations" text
      pdf.setFontSize(12);
      pdf.setTextColor(161, 143, 255); // #A18FFF
      pdf.setFont('helvetica', 'italic');
      pdf.text('Truly Research Based Recommendations', 20, 40);
      pdf.setFont('helvetica', 'normal');

      pdf.setFontSize(16);
      pdf.setTextColor(46, 24, 105);
      pdf.text('Recommended Tool:', 20, 50);
      pdf.setFontSize(20);
      pdf.setTextColor(161, 143, 255); // #A18FFF
      pdf.text(sortedScores[0].name.toUpperCase(), 20, 60);

      pdf.setFontSize(12);
      pdf.setTextColor(46, 24, 105);
      pdf.text(`Score: ${sortedScores[0].score.toFixed(2)}`, 20, 70);

      pdf.setFontSize(14);
      pdf.setTextColor(46, 24, 105);
      pdf.text('Why this tool?', 20, 83);
      pdf.setFontSize(10);
      pdf.setTextColor(46, 24, 105);
      const explanation = generateExplanation(recommendedTool);
      const splitExplanation = pdf.splitTextToSize(explanation, pageWidth - 40);
      pdf.text(splitExplanation, 20, 88);

      pdf.setFontSize(14);
      pdf.setTextColor(46, 24, 105);
      pdf.text('Tool Comparison Scores', 20, 110);
      let yPosition = 120;
      sortedScores.forEach((tool) => {
        pdf.setFontSize(11);
        pdf.setTextColor(46, 24, 105);
        pdf.text(`${tool.name}:`, 25, yPosition);
        const barWidth = (tool.score / maxScore) * 100;
        pdf.setFillColor(161, 143, 255); // #A18FFF
        pdf.rect(60, yPosition - 3, barWidth, 5, 'F');
        pdf.setTextColor(46, 24, 105);
        pdf.text(`${tool.score.toFixed(2)}`, 165, yPosition);
        yPosition += 10;
      });

      pdf.setFontSize(9);
      pdf.setTextColor(46, 24, 105);
      const note = 'This recommendation is based on your specific requirements and team characteristics. Consider your unique context when making your final decision.';
      pdf.text(pdf.splitTextToSize(note, pageWidth - 40), 20, yPosition + 10);

      pdf.save(`TestWise-Evaluation-${new Date().toISOString().split('T')[0]}.pdf`);
      toast({
        title: 'Success!',
        description: 'PDF exported successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export PDF.',
        variant: 'destructive',
      });
    }
  };

  // Helper function to add tooltips to text with technical terms
  const addTooltipsToText = (text: string) => {
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    const terms = Object.keys(glossary);
    
    // Escape special regex characters and create pattern
    const escapedTerms = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    const matches = [...text.matchAll(regex)];
    
    if (matches.length === 0) {
      return text;
    }
    
    matches.forEach((match, index) => {
      if (match.index !== undefined) {
        // Add text before match
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        
        // Add tooltip for the term (case-insensitive match to glossary key)
        const matchedTerm = match[0];
        const glossaryKey = terms.find(key => key.toLowerCase() === matchedTerm.toLowerCase()) || matchedTerm;
        const tooltipText = glossary[glossaryKey as keyof typeof glossary] || matchedTerm;
        
        parts.push(
          <TooltipProvider key={`tooltip-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  style={{
                    borderBottom: '1px dashed #A18FFF',
                    cursor: 'help',
                    fontWeight: 600,
                    color: '#2E1869',
                  }}
                >
                  {matchedTerm}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p style={{ maxWidth: '300px', fontSize: '0.875rem', margin: 0 }}>
                  {tooltipText}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
        
        lastIndex = match.index + match[0].length;
      }
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return <>{parts}</>;
  };

  return (
    <div
      className="h-screen flex flex-col relative overflow-hidden gradient-bg"
    >
      {/* Optimized Background Effects - Reduced for Performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Reduced from 5 to 2 blurred shapes */}
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
        
        {/* Reduced from 3 to 1 wave layer */}
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
        <div 
          className="floating-particle"
          style={{
            width: '7px',
            height: '7px',
            top: '50%',
            left: '10%',
            animationDelay: '8s',
          }}
        />
        <div 
          className="floating-particle"
          style={{
            width: '9px',
            height: '9px',
            top: '15%',
            left: '60%',
            animationDelay: '10s',
          }}
        />
        
        {/* Layered Wave SVG at bottom */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 200" preserveAspectRatio="none" style={{ opacity: 0.2 }}>
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
      <main className="flex-1 pt-[80px] relative z-10 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="min-h-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-3 flex flex-col">
          {/* Progress Badge */}
          {evaluationCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-1 flex justify-center"
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <span
                  className="text-xs font-medium"
                  style={{
                    color: '#2E1869',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  You've evaluated {evaluationCount} project{evaluationCount !== 1 ? 's' : ''} so far
                </span>
              </div>
            </motion.div>
          )}

          {/* Dashboard Grid Layout */}
          <div className="grid grid-cols-12 gap-2 flex-1">
            {/* Left Column - Stats Cards */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
              {/* Stats Cards - Dashboard Style */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 flex-1">
            {/* Top Match Card */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.1, 
                  type: 'spring',
                  stiffness: 100
                }}
                className="relative w-full h-full"
              >
                {/* Glow Pulse Effect */}
                <motion.div
                  animate={{
                    boxShadow: [
                      `0 8px 32px rgba(46, 24, 105, 0.2), 0 0 0 1px ${sortedScores[0].primary}30, 0 0 20px ${sortedScores[0].primary}20`,
                      `0 8px 32px rgba(46, 24, 105, 0.2), 0 0 0 1px ${sortedScores[0].primary}30, 0 0 40px ${sortedScores[0].primary}40`,
                      `0 8px 32px rgba(46, 24, 105, 0.2), 0 0 0 1px ${sortedScores[0].primary}30, 0 0 20px ${sortedScores[0].primary}20`,
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                />
                {/* Shine Effect */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{
                    duration: 2,
                    delay: 1,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)`,
                    transform: 'skewX(-20deg)',
                  }}
                />
                <div
                className="p-3 rounded-2xl relative overflow-hidden w-full h-full flex flex-col"
                  style={{
                  background: `linear-gradient(135deg, ${sortedScores[0].primary}15, ${sortedScores[0].secondary}10)`,
                    backdropFilter: 'blur(20px)',
                  border: `2px solid ${sortedScores[0].primary}40`,
                  boxShadow: `0 8px 32px rgba(46, 24, 105, 0.2), 0 0 0 1px ${sortedScores[0].primary}30`,
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 opacity-20" style={{ background: `radial-gradient(circle, ${sortedScores[0].primary} 0%, transparent 70%)` }} />
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="text-xs font-semibold uppercase tracking-wider" 
                      style={{
                      color: '#1a0d47', 
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                    }}
                  >
                    🏆 Top Recommendation: {sortedScores[0].name}
                  </span>
                    <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 200, 
                      damping: 10,
                      delay: 0.5,
                        }}
                      >
                        <motion.div
                          animate={{ 
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.2, 1],
                          }}
                          transition={{ 
                        duration: 0.6,
                        delay: 1,
                        repeat: 1,
                      }}
                    >
                      <Trophy className="h-5 w-5" style={{ color: sortedScores[0].primary, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                        </motion.div>
                  </motion.div>
                </div>
                
                {/* Tool Logo for Top Recommendation */}
                {toolMetadata[sortedScores[0].name as keyof typeof toolMetadata]?.logo && (
                  <div className="flex items-center justify-start mb-3" style={{ minHeight: '70px' }}>
                    <motion.img
                      src={toolMetadata[sortedScores[0].name as keyof typeof toolMetadata]?.logo}
                      alt={`${sortedScores[0].name} logo`}
                      className="object-contain"
                      style={{
                        maxWidth: '100px',
                        maxHeight: '70px',
                        filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))',
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    />
                  </div>
                )}
                
                <div 
                  className="text-xl font-bold mb-2 flex-1" 
                        style={{
                    color: '#1a0d47',
                    fontFamily: "'Poppins', system-ui, sans-serif",
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {sortedScores[0].name}
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                        <span
                    className="text-2xl font-bold" 
                          style={{
                      color: '#1a0d47',
                      fontFamily: "'Poppins', system-ui, sans-serif",
                            fontWeight: 700,
                    }}
                  >
                    {sortedScores[0].score.toFixed(2)}
                  </span>
                        <span
                    className="text-xs font-medium" 
                          style={{
                      color: '#1a0d47', 
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    points
                        </span>
                </div>
                <div className="mt-auto">
                  <div 
                    className="text-xs font-medium mb-2" 
                    style={{ 
                      color: '#1a0d47', 
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {recommendationPercentage}% match
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: barsAnimated ? `${recommendationPercentage}%` : 0 }}
                      transition={{ duration: 1, delay: 0.3 }}
                      style={{ 
                        height: '100%', 
                        background: sortedScores[0].gradient,
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
                      </div>
                    </motion.div>

            {/* Other Tool Cards */}
            {sortedScores.slice(1).map((tool, index) => {
              const toolMeta = toolMetadata[tool.name as keyof typeof toolMetadata];
              const toolLogo = toolMeta?.logo;
              
              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: (index + 1) * 0.1,
                    type: 'spring',
                    stiffness: 100
                  }}
                  className="relative w-full h-full"
                >
                  <div
                    className="p-3 rounded-2xl relative overflow-hidden w-full h-full flex flex-col"
                        style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
                    }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 opacity-10" style={{ background: `radial-gradient(circle, ${tool.primary} 0%, transparent 70%)` }} />
                    <div className="flex items-center justify-between mb-3">
                          <span
                        className="text-xs font-semibold uppercase tracking-wider" 
                            style={{
                              color: '#1a0d47',
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                        }}
                      >
                        #{index + 2} Rank
                          </span>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold" 
                        style={{
                          background: `${tool.primary}40`, 
                          color: tool.primary,
                          fontFamily: "'Poppins', system-ui, sans-serif",
                          fontWeight: 700,
                          boxShadow: `0 2px 8px ${tool.primary}30`,
                        }}
                      >
                        {index + 2}
                      </div>
                    </div>
                    
                    {/* Tool Logo - Added in the space between rank and tool name */}
                    {toolLogo && (
                      <div className="flex items-center justify-start mb-3" style={{ minHeight: '60px' }}>
                        <motion.img
                          src={toolLogo}
                          alt={`${tool.name} logo`}
                          className="object-contain"
                          style={{
                            maxWidth: '80px',
                            maxHeight: '60px',
                            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))',
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: (index + 1) * 0.15 }}
                        />
                      </div>
                    )}
                    
                      <div
                      className="text-lg font-bold mb-2 flex-1" 
                      style={{
                          color: '#1a0d47',
                        fontFamily: "'Poppins', system-ui, sans-serif",
                        fontWeight: 700,
                        lineHeight: 1.2,
                        }}
                      >
                      {tool.name}
                      </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span 
                        className="text-xl font-bold" 
                      style={{
                          color: '#1a0d47',
                        fontFamily: "'Poppins', system-ui, sans-serif",
                          fontWeight: 700,
                      }}
                    >
                        {tool.score.toFixed(2)}
                      </span>
                      <span 
                        className="text-xs font-medium" 
                      style={{
                          color: '#1a0d47', 
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        points
                      </span>
                      </div>
                    <div className="h-2 rounded-full overflow-hidden mt-auto" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: barsAnimated ? `${(tool.score / maxScore) * 100}%` : 0 }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        style={{
                          height: '100%',
                          background: tool.gradient,
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
              </div>
          </div>

            {/* Right Column - Main Content */}
            <div className="col-span-12 lg:col-span-9 grid grid-cols-1 xl:grid-cols-2 gap-2 flex-1">
          {/* Recommended Tool Banner */}
          <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.4,
                  type: 'spring',
                  stiffness: 100,
                }}
                className="xl:col-span-2 relative"
              >
                {/* Subtle Glow Pulse */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, ${sortedScores[0].primary}20, transparent 70%)`,
                  }}
                />
                <div
                  className="p-3 rounded-2xl h-full flex flex-col relative"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
                borderLeft: `4px solid ${sortedScores[0].primary}`,
              }}
            >
              <div className="flex items-start justify-between flex-col md:flex-row gap-3 flex-1">
                <div className="flex-1">
                  <div
                    className="text-xs font-bold mb-2"
                    style={{
                      color: '#1a0d47',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      letterSpacing: '0.5px',
                      fontWeight: 700,
                    }}
                  >
                    RECOMMENDED TOOL
                  </div>
                  <h1
                    className="text-xl font-bold mb-1"
                    style={{
                      color: '#1a0d47',
                      fontFamily: "'Poppins', system-ui, sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    {sortedScores[0].name}
                  </h1>
                  <div className="flex items-center gap-4 mb-2">
                    <div>
                      <div
                        className="text-2xl font-bold"
                        style={{
                          color: '#1a0d47',
                          fontFamily: "'Poppins', system-ui, sans-serif",
                          fontWeight: 700,
                        }}
                      >
                        {sortedScores[0].score.toFixed(2)}
                      </div>
                      <div
                        className="text-xs font-medium"
                        style={{
                          color: '#1a0d47',
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        Score
                      </div>
                    </div>
                  </div>
                  {/* Star Rating - Always 5 stars for recommended tool (rank 1) */}
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      // Recommended tool is always rank 1, so show 5 stars
                      const isFilled = true;
                      return (
                        <Star
                          key={star}
                          className="h-5 w-5"
                          style={{
                            fill: isFilled ? '#FFD700' : 'transparent',
                            color: isFilled ? '#FFD700' : '#E0E0E0',
                            strokeWidth: isFilled ? 0 : 1.5,
                          }}
                        />
                      );
                    })}
                    <span
                      className="text-xs font-medium ml-1"
                      style={{
                        color: '#1a0d47',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      (5/5)
                    </span>
                  </div>
                  <p
                    className="text-xs mb-2 line-clamp-2"
                    style={{
                      color: '#1a0d47',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {addTooltipsToText(generateExplanation(recommendedTool))}
                  </p>

                  {/* Show Reasoning Button */}
                  <button
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full font-semibold transition-all duration-300 mb-2 text-xs"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: '#1a0d47',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      border: '1px solid rgba(26, 13, 71, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    {showReasoning ? 'Hide' : 'Show'} Reasoning
                    {showReasoning ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {/* Criteria-based Reasoning */}
                  {showReasoning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 p-4 rounded-xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <h4
                        className="text-lg font-bold mb-3"
                        style={{
                          color: '#1a0d47',
                          fontFamily: "'Poppins', system-ui, sans-serif",
                          fontWeight: 700,
                        }}
                      >
                        Criteria-Based Reasoning
                      </h4>
                      <div className="space-y-3">
                        {criteriaReasoning.length > 0 ? (
                          criteriaReasoning.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div
                                className="px-2 py-1 rounded text-xs font-semibold flex-shrink-0"
                                style={{
                                  background: sortedScores[0].primary + '40',
                                  color: '#1a0d47',
                                  fontFamily: "'Inter', system-ui, sans-serif",
                                  fontWeight: 600,
                                }}
                              >
                                {item.category}
                              </div>
                              <p
                                className="text-sm flex-1"
                                style={{
                          color: '#1a0d47',
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontWeight: 500,
                                }}
                              >
                                {item.reason}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p
                            className="text-sm"
                            style={{
                          color: '#1a0d47',
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontWeight: 500,
                            }}
                          >
                            Reasoning data is being calculated based on your answers...
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleExportPDF}
                    className="rounded-full font-bold px-4 py-2 transition-all duration-300 flex items-center gap-2 text-xs"
                    style={{
                      background: '#A18FFF',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontFamily: "'Inter', system-ui, sans-serif",
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
                    <Download className="h-4 w-4" />
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

              {/* Score Comparison Bar Chart */}
              {sortedScores.length > 0 && barData.length > 0 && (
            <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex flex-col"
                  style={{ marginTop: '24px' }}
            >
              <div
                    className="p-3 rounded-2xl flex flex-col"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
                  minHeight: '280px',
                }}
              >
                  <div className="mb-3">
                  <h3
                      className="text-sm font-bold"
                    style={{
                        color: '#1a0d47',
                        fontFamily: "'Poppins', system-ui, sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    Score Comparison
                  </h3>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                    className="w-full"
                    style={{ height: '250px' }}
                  >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(26, 13, 71, 0.1)" />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 12,
                          fill: '#000000',
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontWeight: 700,
                        }}
                        axisLine={{ stroke: 'rgba(26, 13, 71, 0.2)' }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 12,
                          fill: '#000000',
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontWeight: 700,
                        }}
                        axisLine={{ stroke: 'rgba(26, 13, 71, 0.2)' }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                          fontFamily: "'Inter', system-ui, sans-serif",
                        boxShadow: '0 4px 12px rgba(46, 24, 105, 0.2)',
                          color: '#1a0d47',
                      }}
                        formatter={(value: any) => [`${value.toFixed(2)}`, 'Score']}
                    />
                      <Bar 
                        dataKey="Score" 
                        radius={[12, 12, 0, 0]}
                        animationBegin={barsAnimated ? 0 : 1000}
                        animationDuration={barsAnimated ? 1500 : 0}
                        animationEasing="ease-out"
                      >
                      {barData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          style={{
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </motion.div>
              </div>
            </motion.div>
              )}

              {/* Score Distribution Pie Chart */}
              {sortedScores.length > 0 && pieData.length > 0 && (
            <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="flex flex-col"
                  style={{ marginTop: '24px' }}
            >
              <div
                    className="p-3 rounded-xl flex flex-col"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
                      minHeight: '280px',
                }}
              >
                    <div className="mb-2">
                  <h3
                        className="text-xs font-bold"
                    style={{
                          color: '#1a0d47',
                          fontFamily: "'Poppins', system-ui, sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    Score Distribution
                  </h3>
                </div>
                <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.9 }}
                      className="w-full flex items-center justify-center"
                      style={{ height: '250px' }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                            labelLine={{ stroke: 'rgba(0, 0, 0, 0.3)', strokeWidth: 1 }}
                            label={({ cx, cy, midAngle, outerRadius, name, percent }: any) => {
                              const RADIAN = Math.PI / 180;
                              // Position labels outside the pie chart
                              const radius = outerRadius + 20;
                              const x = cx + radius * Math.cos(-midAngle * RADIAN);
                              const y = cy + radius * Math.sin(-midAngle * RADIAN);
                              
                              return (
                                <text
                                  x={x}
                                  y={y}
                                  fill="#1a0d47"
                                  textAnchor={x > cx ? 'start' : 'end'}
                                  dominantBaseline="central"
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    fontFamily: "'Inter', system-ui, sans-serif",
                                  }}
                                >
                                  {`${name}: ${(percent * 100).toFixed(0)}%`}
                                </text>
                              );
                            }}
                            outerRadius={80}
                            fill="#8884d8"
                      dataKey="value"
                            animationBegin={barsAnimated ? 0 : 1500}
                            animationDuration={1500}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                                fill={entry.fill}
                          style={{
                            transition: 'all 0.3s ease',
                                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                          }}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                              fontFamily: "'Inter', system-ui, sans-serif",
                        boxShadow: '0 4px 12px rgba(46, 24, 105, 0.2)',
                              color: '#1a0d47',
                      }}
                            formatter={(value: any, name: any) => [`${value.toFixed(2)}`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                </motion.div>
              </div>
            </motion.div>
              )}

              {/* Individual Tool Performance and Deep Dive - Side by Side */}
              <div className="xl:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-2 flex-1">
              {/* Individual Tool Performance */}
              {sortedScores.length > 0 && gaugeData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="flex flex-col h-full"
          >
            <div
                    className="p-3 rounded-xl flex flex-col h-full"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
              }}
            >
                  <div className="mb-1">
                <h3
                      className="text-[10px] font-bold"
                  style={{
                        color: '#1a0d47',
                        fontFamily: "'Poppins', system-ui, sans-serif",
                    fontWeight: 700,
                  }}
                >
                      Individual Tool Performance
                </h3>
              </div>
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-[180px] mx-auto">
                    {gaugeData.map((tool) => {
                      const Icon = toolMetadata[tool.name as keyof typeof toolMetadata]?.icon || Code;
                      const meta = toolMetadata[tool.name as keyof typeof toolMetadata];
                      
                      return (
                  <motion.div
                    key={tool.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.1 }}
                          className="relative w-full h-full"
                        >
                          <div
                            className="p-2 rounded-lg cursor-pointer transition-all duration-300 flex flex-col"
                          style={{
                              background: `linear-gradient(135deg, ${tool.fill}20, ${tool.fill}10)`,
                              border: `2px solid ${tool.fill}40`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = `0 12px 24px ${tool.fill}30`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            onClick={() => setExpandedTool(expandedTool === tool.name ? null : tool.name)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1">
                                <Icon className="h-2.5 w-2.5" style={{ color: tool.fill }} />
                                <span className="text-[9px] font-bold" style={{ color: '#1a0d47' }}>
                          {tool.name}
                        </span>
                      </div>
                              {expandedTool === tool.name ? (
                                <ChevronUp className="h-2 w-2" style={{ color: '#1a0d47' }} />
                              ) : (
                                <ChevronRight className="h-2 w-2" style={{ color: '#1a0d47' }} />
                              )}
                    </div>
                            <div className="w-full flex items-center justify-center" style={{ height: '100px' }}>
                    <div
                                className="flex items-center justify-center"
                      style={{
                                  width: '80px',
                                  height: '80px',
                                }}
                              >
                                <img 
                                  src={toolMetadata[tool.name as keyof typeof toolMetadata]?.logo || ''} 
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
                                      const fallback = document.createElement('span');
                                      fallback.textContent = tool.name.charAt(0);
                                      fallback.style.cssText = `color: ${tool.fill}; font-size: 2rem; font-weight: 700; font-family: 'Space Grotesk', 'Inter', sans-serif;`;
                                      container.appendChild(fallback);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <div className="text-center mt-1">
                              <div className="text-xs font-bold" style={{ color: tool.fill, textShadow: '0 0 2px rgba(0, 0, 0, 0.9), 0 0 4px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0, 0, 0, 0.9)' }}>
                                {tool.score}%
                              </div>
                              <div className="text-[9px] font-medium" style={{ color: '#1a0d47', fontWeight: 600 }}>
                                Overall Score
                              </div>
                            </div>
                            
                            {/* Expanded Details */}
                            {expandedTool === tool.name && (
                    <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-1 pt-1 border-t border-white/20 space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-medium" style={{ color: '#1a0d47', fontWeight: 600 }}>
                                    Performance
                      </span>
                                  <span className="text-[10px] font-bold" style={{ color: tool.fill, textShadow: '0 0 2px rgba(0, 0, 0, 0.9), 0 0 4px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0, 0, 0, 0.9)' }}>
                                    {meta.performance}%
                                  </span>
                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-medium" style={{ color: '#1a0d47', fontWeight: 600 }}>
                                    Learning Curve
                                  </span>
                                  <span className="text-[10px] font-bold" style={{ color: tool.fill, textShadow: '0 0 2px rgba(0, 0, 0, 0.9), 0 0 4px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0, 0, 0, 0.9)' }}>
                                    {meta.learningCurve}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-medium" style={{ color: '#1a0d47', fontWeight: 600 }}>
                                    Support
                                  </span>
                                  <span className="text-[10px] font-bold" style={{ color: tool.fill, textShadow: '0 0 2px rgba(0, 0, 0, 0.9), 0 0 4px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0, 0, 0, 0.9)' }}>
                                    {meta.support}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-medium" style={{ color: '#1a0d47', fontWeight: 600 }}>
                                    Maintenance
                                  </span>
                                  <span className="text-[10px] font-bold" style={{ color: tool.fill, textShadow: '0 0 2px rgba(0, 0, 0, 0.9), 0 0 4px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0, 0, 0, 0.9)' }}>
                                    {meta.maintenance}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-medium" style={{ color: '#1a0d47', fontWeight: 600 }}>
                                    Community
                                  </span>
                                  <span className="text-[10px] font-bold" style={{ color: tool.fill, textShadow: '0 0 2px rgba(0, 0, 0, 0.9), 0 0 4px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0, 0, 0, 0.9)' }}>
                                    {meta.communitySize}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-medium" style={{ color: '#1a0d47', fontWeight: 600 }}>
                                    Cost
                                  </span>
                                  <span className="text-[10px] font-bold" style={{ color: tool.fill, textShadow: '0 0 2px rgba(0, 0, 0, 0.9), 0 0 4px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0, 0, 0, 0.9)' }}>
                                    {meta.cost}
                                  </span>
                    </div>
                  </motion.div>
                            )}
          </div>
                        </motion.div>
                      );
                    })}
                    </div>
              </div>
            </div>
          </motion.div>
              )}

              {/* Winning Tool Deep Dive */}
              {sortedScores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="flex flex-col h-full"
          >
            <div
                    className="p-3 rounded-xl relative overflow-hidden flex flex-col h-full"
              style={{
                background: `linear-gradient(135deg, ${sortedScores[0].primary}20, ${sortedScores[0].secondary}10)`,
                backdropFilter: 'blur(20px)',
                border: `2px solid ${sortedScores[0].primary}40`,
                      boxShadow: `0 8px 32px rgba(46, 24, 105, 0.2), 0 0 0 1px ${sortedScores[0].primary}30`,
              }}
            >
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: `radial-gradient(circle, ${sortedScores[0].primary} 0%, transparent 70%)` }} />
                    <div className="relative flex flex-col">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Trophy className="h-3 w-3" style={{ color: sortedScores[0].primary }} />
                        <h3
                          className="text-xs font-bold"
                    style={{
                            color: '#1a0d47',
                            fontFamily: "'Poppins', system-ui, sans-serif",
                      fontWeight: 700,
                    }}
                  >
                          {sortedScores[0].name} - Deep Dive
                  </h3>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { label: 'Community Size', value: toolMetadata[sortedScores[0].name as keyof typeof toolMetadata]?.communitySize || 'N/A', icon: Users },
                          { label: 'Cost', value: toolMetadata[sortedScores[0].name as keyof typeof toolMetadata]?.cost || 'N/A', icon: DollarSign },
                          { label: 'Performance Score', value: `${toolMetadata[sortedScores[0].name as keyof typeof toolMetadata]?.performance || 0}%`, icon: Zap },
                        ].map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                  <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.3 + index * 0.1 }}
                            className="p-2 rounded-lg flex flex-col"
                    style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                            }}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <Icon className="h-3 w-3" style={{ color: sortedScores[0].primary }} />
                              <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#1a0d47', fontWeight: 700 }}>
                                {stat.label}
                        </span>
                </div>
                            <div className="text-sm font-bold" style={{ color: sortedScores[0].primary, textShadow: '0 0 2px rgba(0, 0, 0, 0.9), 0 0 4px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0, 0, 0, 0.9)' }}>
                              {stat.value}
                    </div>
              </motion.div>
                        );
                      })}
                      </div>
                      
                      {/* All CTAs Section - Compressed, Below Stats */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 1.5 }}
                        className="mt-2 pt-2 border-t border-white/20"
                      >
                        <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('/resources', { state: { tool: sortedScores[0].name.toLowerCase() } })}
                            className="rounded-lg font-bold px-4 py-3 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                  style={{
                    background: sortedScores[0].primary,
                    color: '#FFFFFF',
                    fontWeight: 700,
                              fontFamily: "'Inter', system-ui, sans-serif",
                    border: 'none',
                              boxShadow: `0 1px 4px ${sortedScores[0].primary}40`,
                              WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.3)',
                              textShadow: '0 0 1px rgba(0, 0, 0, 0.5), 0 0 2px rgba(0, 0, 0, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = `0 2px 6px ${sortedScores[0].primary}60`;
                  }}
                  onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = `0 1px 4px ${sortedScores[0].primary}40`;
                  }}
                >
                            <BookOpen className="h-4 w-4" />
                  Get Setup Guide
                </button>
            <button
              onClick={() => navigate('/comparison')}
                            className="rounded-lg font-bold px-4 py-3 transition-all duration-300 text-sm flex items-center justify-center gap-2"
              style={{
                background: '#A18FFF',
                color: '#FFFFFF',
                fontWeight: 700,
                              fontFamily: "'Inter', system-ui, sans-serif",
                border: 'none',
                              boxShadow: '0 1px 4px rgba(161, 143, 255, 0.4)',
                              WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.3)',
                              textShadow: '0 0 1px rgba(0, 0, 0, 0.5), 0 0 2px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#8B7AFF';
                              e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#A18FFF';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Compare All Tools
            </button>
            <button
              onClick={() => navigate('/questionnaire')}
                            className="rounded-lg font-bold px-4 py-3 transition-all duration-300 text-sm flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(46, 24, 105, 0.3)',
                color: '#2E1869',
                fontWeight: 700,
                              fontFamily: "'Inter', system-ui, sans-serif",
                              WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.2)',
                              textShadow: '0 0 1px rgba(255, 255, 255, 0.8), 0 0 2px rgba(255, 255, 255, 0.5)',
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
                            <RotateCcw className="h-4 w-4" />
              Retake Assessment
            </button>
            <button
              onClick={() => navigate('/history')}
                            className="rounded-lg font-bold px-4 py-3 transition-all duration-300 text-sm flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(46, 24, 105, 0.3)',
                color: '#2E1869',
                fontWeight: 700,
                              fontFamily: "'Inter', system-ui, sans-serif",
                              WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.2)',
                              textShadow: '0 0 1px rgba(255, 255, 255, 0.8), 0 0 2px rgba(255, 255, 255, 0.5)',
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
                            <Eye className="h-4 w-4" />
              View History
            </button>
                        </div>
          </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
