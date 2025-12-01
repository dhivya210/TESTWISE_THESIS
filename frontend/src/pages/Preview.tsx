import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2,
  Edit3,
  FileText
} from 'lucide-react';
import { questions } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';

interface Answer {
  questionId: number;
  selectedValue: number;
}

// Parse option text to get title and description
const parseOptionText = (text: string) => {
  if (text.includes(';')) {
    const parts = text.split(';');
    return {
      title: parts[0].trim(),
      description: parts.slice(1).join(';').trim()
    };
  }
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
  if (text.includes('(') && text.includes(')')) {
    const match = text.match(/^(.+?)\s*\((.+?)\)$/);
    if (match) {
      return {
        title: match[1].trim(),
        description: match[2].trim()
      };
    }
  }
  if (text.includes(':')) {
    const parts = text.split(':');
    if (parts.length > 1) {
      return {
        title: parts[0].trim(),
        description: parts.slice(1).join(':').trim()
      };
    }
  }
  const words = text.split(' ');
  if (words.length > 6) {
    const commaIndex = text.indexOf(',');
    if (commaIndex > 0 && commaIndex < text.length * 0.6) {
      return {
        title: text.substring(0, commaIndex).trim(),
        description: text.substring(commaIndex + 1).trim()
      };
    }
    const splitPoint = Math.ceil(words.length * 0.4);
    return {
      title: words.slice(0, splitPoint).join(' '),
      description: words.slice(splitPoint).join(' ')
    };
  }
  return {
    title: text,
    description: ''
  };
};

export const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers: initialAnswers, projectName } = location.state as { 
    answers: Answer[]; 
    projectName?: string 
  };

  const [answers] = useState<Answer[]>(initialAnswers || []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Redirect if no answers
  if (!initialAnswers || initialAnswers.length === 0) {
    navigate('/questionnaire', { replace: true });
    return null;
  }

  const calculateScoresAndNavigate = () => {
    const counts = {
      selenium: 0,
      playwright: 0,
      testim: 0,
      mabl: 0,
    };

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

    const categoryWeightedScores: Record<string, number> = {
      selenium: 0,
      playwright: 0,
      testim: 0,
      mabl: 0,
    };

    answers.forEach((answer) => {
      const questionData = questions.find((q) => q.id === answer.questionId);
      const option = questionData?.options.find((o) => o.value === answer.selectedValue);
      if (option?.toolWeights && questionData) {
        const categoryWeight = categoryWeights[questionData.category] || 1.0;
        
        if (option.toolWeights.selenium === 10) {
          counts.selenium++;
          categoryWeightedScores.selenium += categoryWeight;
        }
        if (option.toolWeights.playwright === 10) {
          counts.playwright++;
          categoryWeightedScores.playwright += categoryWeight;
        }
        if (option.toolWeights.testim === 10) {
          counts.testim++;
          categoryWeightedScores.testim += categoryWeight;
        }
        if (option.toolWeights.mabl === 10) {
          counts.mabl++;
          categoryWeightedScores.mabl += categoryWeight;
        }
      }
    });

    // Calculate base scores using category-weighted scores for more granular scoring
    // This helps prevent ties by using weighted category importance
    const baseScores = {
      selenium: Math.round(categoryWeightedScores.selenium * 10 * 100) / 100,
      playwright: Math.round(categoryWeightedScores.playwright * 10 * 100) / 100,
      testim: Math.round(categoryWeightedScores.testim * 10 * 100) / 100,
      mabl: Math.round(categoryWeightedScores.mabl * 10 * 100) / 100,
    };

    // Start with base scores (category-weighted)
    const scores = { ...baseScores };

    const allTools: Array<{ tool: string; count: number; categoryWeight: number; baseScore: number }> = [
      { tool: 'selenium', count: counts.selenium, categoryWeight: categoryWeightedScores.selenium, baseScore: baseScores.selenium },
      { tool: 'playwright', count: counts.playwright, categoryWeight: categoryWeightedScores.playwright, baseScore: baseScores.playwright },
      { tool: 'testim', count: counts.testim, categoryWeight: categoryWeightedScores.testim, baseScore: baseScores.testim },
      { tool: 'mabl', count: counts.mabl, categoryWeight: categoryWeightedScores.mabl, baseScore: baseScores.mabl },
    ];

    // Group tools by their base score (rounded to 2 decimals for grouping)
    const scoreGroups = new Map<number, Array<{ tool: string; categoryWeight: number; baseScore: number }>>();
    allTools.forEach((tool) => {
      const roundedScore = Math.round(tool.baseScore * 100) / 100;
      if (!scoreGroups.has(roundedScore)) {
        scoreGroups.set(roundedScore, []);
      }
      scoreGroups.get(roundedScore)!.push({ tool: tool.tool, categoryWeight: tool.categoryWeight, baseScore: tool.baseScore });
    });

    // Apply tie-breaking for tools with the same rounded score
    scoreGroups.forEach((tools) => {
      if (tools.length > 1) {
        // Sort by category weight first (higher weight wins), then by tool name alphabetically
        tools.sort((a, b) => {
          const weightDiff = b.categoryWeight - a.categoryWeight;
          if (Math.abs(weightDiff) > 0.001) {
            return weightDiff;
          }
          return a.tool.localeCompare(b.tool);
        });

        // Apply tie-breaker: use 0.01 increments so differences are visible when displayed with 2 decimals
        // This ensures no two tools will have the same score when rounded to 2 decimal places
        tools.forEach((tool, tieIndex) => {
          const tieBreakValue = (tools.length - tieIndex) * 0.01;
          if (tool.tool === 'selenium') scores.selenium = Math.round((scores.selenium + tieBreakValue) * 100) / 100;
          else if (tool.tool === 'playwright') scores.playwright = Math.round((scores.playwright + tieBreakValue) * 100) / 100;
          else if (tool.tool === 'testim') scores.testim = Math.round((scores.testim + tieBreakValue) * 100) / 100;
          else if (tool.tool === 'mabl') scores.mabl = Math.round((scores.mabl + tieBreakValue) * 100) / 100;
        });
      }
    });

    navigate('/analysis', { state: { scores, answers, projectName } });
  };

  const handleEdit = () => {
    navigate('/questionnaire', { 
      state: { answers, projectName, returnToPreview: true } 
    });
  };

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
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar - Summary */}
        <div 
          className="w-[30%] flex flex-col h-full" 
          style={{ 
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
          }}
        >
          <div className="flex-shrink-0" style={{ padding: '24px 24px 16px 24px' }}>
            <div className="flex items-center gap-2 mb-3 mt-24">
              <div className="w-8 h-8 rounded-full bg-[#FF8C42] flex items-center justify-center text-white font-bold text-sm">
                {projectName?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold" style={{ color: '#2C2C2C' }}>
                  {projectName || 'Project'}
                </h3>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#2E1869', lineHeight: 1.2 }}>
              Review Your Preferences
            </h2>
            <p style={{ color: '#2E1869', fontSize: '12px', lineHeight: 1.4, opacity: 0.8, marginBottom: '12px' }}>
              Please review all your answers before proceeding to analysis
            </p>
          </div>

          {/* Summary Stats */}
          <div className="flex-1 overflow-y-auto" style={{ padding: '0 24px 24px 24px' }}>
            <div 
              className="rounded-xl p-4 mb-4" 
              style={{ 
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 16px rgba(46, 24, 105, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4" style={{ color: '#FF8C42' }} />
                <h3 className="text-sm font-semibold" style={{ color: '#2C2C2C' }}>
                  Summary
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: '#9E9E9E', fontSize: '12px' }}>Total Questions</span>
                  <span style={{ color: '#2C2C2C', fontSize: '12px', fontWeight: 600 }}>
                    {questions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#9E9E9E', fontSize: '12px' }}>Answered</span>
                  <span style={{ color: '#2C2C2C', fontSize: '12px', fontWeight: 600 }}>
                    {answers.length} / {questions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#9E9E9E', fontSize: '12px' }}>Categories</span>
                  <span style={{ color: '#2C2C2C', fontSize: '12px', fontWeight: 600 }}>
                    {new Set(questions.map(q => q.category)).size}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <Button
                onClick={handleEdit}
                variant="outline"
                className="w-full flex items-center gap-2"
                style={{
                  border: '2px solid #E0E0E0',
                  color: '#2C2C2C',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px'
                }}
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Answers
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Questions Review */}
        <div 
          className="flex-1 flex flex-col h-full" 
          style={{ 
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col h-full"
            style={{ padding: '32px 40px 32px 40px' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 mb-4 mt-16">
              <h1 
                className="text-2xl font-bold mb-2"
                style={{ 
                  color: '#2E1869', 
                  fontSize: '24px', 
                  fontWeight: 700,
                  lineHeight: 1.2
                }}
              >
                Review Your Preferences
              </h1>
              <p style={{ color: '#2E1869', fontSize: '13px', lineHeight: 1.4, opacity: 0.8 }}>
                Review all your responses before we analyze and generate your personalized recommendations
              </p>
            </div>

            {/* Categories and Answers List - 3 Columns Grid */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="grid grid-cols-3 gap-4">
              {questions.map((question, index) => {
                const answer = answers.find((a) => a.questionId === question.id);
                const selectedOption = answer 
                  ? question.options.find((o) => o.value === answer.selectedValue)
                  : null;

                if (!selectedOption) return null;

                const parsed = parseOptionText(selectedOption.text);

                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 4px 16px rgba(46, 24, 105, 0.15)',
                    }}
                  >
                    {/* Category Title */}
                    <div className="flex items-center justify-between mb-3">
                      <div 
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold"
                        style={{ 
                          backgroundColor: '#FF8C42',
                          color: '#FFFFFF',
                          fontSize: '14px'
                        }}
                      >
                        {question.category}
                      </div>
                      <CheckCircle2 
                        className="h-5 w-5 flex-shrink-0" 
                        style={{ color: '#FF8C42' }} 
                        strokeWidth={2.5} 
                      />
                    </div>

                    {/* Selected Answer */}
                    <div 
                      className="rounded-lg p-3 border-2"
                      style={{ 
                        background: 'rgba(255, 140, 66, 0.25)',
                        backdropFilter: 'blur(10px)',
                        borderColor: 'rgba(255, 140, 66, 0.6)',
                        boxShadow: '0 2px 8px rgba(255, 140, 66, 0.3)',
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <h4 
                            className="text-sm font-semibold mb-1"
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
                              className="text-sm"
                              style={{ 
                                color: '#9E9E9E',
                                fontSize: '13px',
                                lineHeight: 1.5
                              }}
                            >
                              {parsed.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex-shrink-0 flex items-center justify-between pt-4 mt-4 border-t" style={{ borderColor: '#E0E0E0' }}>
              <Button
                variant="ghost"
                onClick={handleEdit}
                className="flex items-center gap-2"
                style={{
                  backgroundColor: 'transparent',
                  color: '#2C2C2C',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px'
                }}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Edit Answers
              </Button>
              
              <Button
                onClick={calculateScoresAndNavigate}
                className="flex items-center gap-2 transition-all"
                style={{
                  backgroundColor: '#2C2C2C',
                  color: '#FFFFFF',
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1A1A1A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2C2C2C';
                }}
              >
                Proceed to Analysis
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

