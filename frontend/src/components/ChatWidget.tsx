import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, ThumbsUp, ThumbsDown, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  confidence?: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  apiUrl?: string;
  toolFilter?: string[];
}

// ============================================================================
// Component
// ============================================================================

export const ChatWidget = ({ apiUrl = 'http://localhost:8000', toolFilter }: ChatWidgetProps) => {
  
  // ==========================================================================
  // State
  // ==========================================================================
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m TestWise Assistant. I can help you with questions about Selenium, Playwright, Testim, and Mabl. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string>('all');
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  // ==========================================================================
  // Refs
  // ==========================================================================
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // ==========================================================================
  // Constants
  // ==========================================================================
  const tools = ['all', 'Selenium', 'Playwright', 'Testim', 'Mabl'];

  // ==========================================================================
  // Effects
  // ==========================================================================
  useEffect(() => {
    // Only scroll within the messages container, not the entire page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const checkBackendStatus = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${apiUrl}/`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      setIsBackendOnline(response.ok);
    } catch (error) {
      setIsBackendOnline(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!isMinimized) {
      checkBackendStatus();
    } else {
      checkBackendStatus();
      const interval = setInterval(() => {
        checkBackendStatus();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isMinimized, checkBackendStatus]);

  // ==========================================================================
  // Helper Functions
  // ==========================================================================
  const parseResponse = (text: string): { answer: string; sources: string[]; confidence: string } => {
    let answer = text;
    const sources: string[] = [];
    let confidence = 'Medium';

    // Extract sources
    const sourcesMatch = text.match(/Sources:\s*\[([^\]]+)\]/);
    if (sourcesMatch) {
      sources.push(...sourcesMatch[1].split(',').map(s => s.trim()));
      answer = answer.replace(/Sources:\s*\[[^\]]+\]/g, '').trim();
    }

    // Extract confidence
    const confidenceMatch = text.match(/Confidence:\s*(High|Medium|Low)/i);
    if (confidenceMatch) {
      confidence = confidenceMatch[1];
      answer = answer.replace(/Confidence:\s*(High|Medium|Low)/gi, '').trim();
    }

    return { answer, sources, confidence };
  };

  // ==========================================================================
  // Event Handlers
  // ==========================================================================
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const filter = selectedTool === 'all' ? toolFilter : [selectedTool];
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage.content,
          tool_filter: filter,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.answer) {
        throw new Error('Invalid response from server');
      }
      
      const parsed = parseResponse(data.answer);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: parsed.answer,
        sources: parsed.sources,
        confidence: parsed.confidence,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      let errorContent = 'Sorry, I encountered an error. Please try again later.';
      
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        errorContent = 'Request timed out. The response is taking too long. Please try a simpler question or check if the backend is running properly.';
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorContent = 'Unable to connect to the chat service. Please check if the RAG backend is running.';
      } else if (error.message?.includes('503')) {
        errorContent = 'The chat service is temporarily unavailable. Please check if the backend is properly configured and the knowledge base is ingested.';
      } else if (error.message?.includes('500')) {
        errorContent = 'Server error occurred. Please check the backend logs for more details.';
      } else if (error.message) {
        errorContent = `Error: ${error.message}`;
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleFeedback = async (messageId: string, correct: boolean) => {
    try {
      await fetch(`${apiUrl}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: messageId,
          correct,
          notes: '',
        }),
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event from bubbling up to page level
      handleSend();
    }
  };

  // ==========================================================================
  // Render: Minimized Button
  // ==========================================================================
  if (isMinimized) {
    const button = (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMinimized(false)}
        className="chat-widget-button w-14 h-14 bg-gradient-to-br from-[#A18FFF] to-[#C0A9FE] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:from-[#8B7FE8] hover:to-[#B09AFE] relative"
        style={{
          position: 'absolute',
          top: '100px',
          right: '40px',
          zIndex: 99999,
          boxShadow: '0 4px 20px rgba(161, 143, 255, 0.4)',
          pointerEvents: 'auto',
        }}
        aria-label="Open chat"
      >
        <Bot className="h-6 w-6" strokeWidth={2.5} />
        
        {/* Status Badge */}
        {isBackendOnline === false ? (
          <>
            <span 
              className="absolute top-1 right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white shadow-sm z-10"
              aria-label="Offline"
            />
            <span 
              className="absolute top-1 right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white opacity-75"
              style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
              aria-hidden="true"
            />
          </>
        ) : (
          <>
            <span 
              className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm z-10"
              aria-label="Online"
            />
            <span 
              className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white opacity-75"
              style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
              aria-hidden="true"
            />
          </>
        )}
      </motion.button>
    );
    
    return button;
  }

  // ==========================================================================
  // Render: Expanded Chat Panel
  // ==========================================================================
  const chatPanel = (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="w-[320px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-2rem)] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden chat-widget-container"
      style={{
        position: 'absolute',
        top: '100px',
        right: '40px',
        zIndex: 99999,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#A18FFF] to-[#C0A9FE] text-white px-4 py-3 rounded-t-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="bg-white/20 p-1.5 rounded-full shrink-0">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight">TestWise Assistant</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${isBackendOnline === false ? 'bg-yellow-500' : 'bg-green-500'} shadow-sm`} />
              <p className="text-xs opacity-95 font-medium">
                {isBackendOnline === false ? 'Offline' : 'Online'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          {/* Tool Filter */}
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/20 text-white text-xs px-2 py-1 rounded-md border border-white/30 focus:outline-none focus:ring-1 focus:ring-white/50 cursor-pointer hover:bg-white/30 transition-colors"
            style={{ 
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              paddingRight: '1.75rem',
            }}
          >
            {tools.map(tool => (
              <option key={tool} value={tool} style={{ color: '#000' }}>
                {tool === 'all' ? 'All Tools' : tool}
              </option>
            ))}
          </select>
          
          {/* Close Button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-white chat-scrollbar"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-[#8B7FE8] to-[#A18FFF]' 
                  : 'bg-gradient-to-br from-[#A18FFF] to-[#C0A9FE]'
              }`}>
                {message.role === 'user' ? (
                  <User className="h-3.5 w-3.5 text-white" />
                ) : (
                  <Bot className="h-3.5 w-3.5 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#A18FFF] to-[#8B7FE8] text-white'
                      : 'bg-gray-50 text-gray-900 border border-gray-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>

                {/* Assistant Message Metadata */}
                {message.role === 'assistant' && (
                  <div className="mt-1.5 space-y-1.5 w-full">
                    {/* Confidence & Sources */}
                    {(message.confidence || (message.sources && message.sources.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Confidence Badge */}
                        {message.confidence && (
                          <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${
                            message.confidence === 'High' 
                              ? 'bg-green-100 text-green-700' 
                              : message.confidence === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {message.confidence}
                          </span>
                        )}

                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <>
                            {message.sources.slice(0, 2).map((source, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium hover:bg-purple-100 transition-colors cursor-pointer"
                                title={`Source: ${source}`}
                              >
                                {source}
                                <ExternalLink className="h-2.5 w-2.5" />
                              </span>
                            ))}
                            {message.sources.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{message.sources.length - 2}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Feedback Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleFeedback(message.id, true)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-600"
                        title="Helpful"
                        aria-label="Helpful"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, false)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-600"
                        title="Not helpful"
                        aria-label="Not helpful"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-[#A18FFF] to-[#C0A9FE] rounded-full flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-3 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
        {/* Offline Warning */}
        {isBackendOnline === false && (
          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <span className="font-semibold">⚠️ Backend Offline</span> - Start server on port 8000
          </div>
        )}
        
        {/* Input Form */}
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about testing tools..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A18FFF] focus:border-[#A18FFF] text-sm bg-white transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isLoading || isBackendOnline === false}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isBackendOnline === false}
            className="bg-gradient-to-br from-[#A18FFF] to-[#8B7FE8] text-white p-2 rounded-lg hover:from-[#8B7FE8] hover:to-[#7A6FD8] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
  
  return chatPanel;
};
