'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createLogger } from '@/lib/logger';

const logger = createLogger('trust-recovery-ui');

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  challenged?: boolean;
}

interface Artifact {
  title: string;
  content: string;
}

// Memoized individual message component for performance
const MessageComponent = React.memo(({ 
  message, 
  index, 
  onChallenge, 
  isAlreadyChallenged,
  isLoading 
}: {
  message: Message;
  index: number;
  onChallenge: (index: number) => void;
  isAlreadyChallenged: boolean;
  isLoading: boolean;
}) => {
  const handleChallenge = useCallback(() => onChallenge(index), [onChallenge, index]);

  return (
    <div className="group">
      {message.role === 'user' ? (
        <div className="flex justify-end">
          <div className="max-w-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl rounded-br-md shadow-lg">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
            <div className="text-xs text-slate-500 mt-2 text-right">
              {new Date(message.timestamp!).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-start">
          <div className="max-w-2xl">
            <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl rounded-bl-md shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-slate-600">N</span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-slate-500">
                      {new Date(message.timestamp!).toLocaleTimeString()}
                    </div>
                    {!isAlreadyChallenged && !isLoading && (
                      <button
                        onClick={handleChallenge}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        Challenge this →
                      </button>
                    )}
                    {isAlreadyChallenged && (
                      <div className="text-xs text-green-600 font-medium">
                        ✓ Challenged
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MessageComponent.displayName = 'MessageComponent';

export default function TrustRecoveryProtocol() {
  // Trust Recovery Protocol state (preserved)
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [showReasoning] = useState(false);
  const [reasoning] = useState('');
  const [skepticMode, setSkepticMode] = useState(false);
  const [trustLevel, setTrustLevel] = useState(50);
  const [challengedMessages, setChallengedMessages] = useState<Set<number>>(new Set());
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Optimized auto-scroll - debounced to prevent performance issues with long conversations
  useEffect(() => {
    if (messages.length > 0) {
      // Debounce scroll to prevent excessive calls during rapid message updates
      const scrollTimeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [messages.length]); // Only depend on length, not full messages array

  // Initialize messages and focus input on page load
  useEffect(() => {
    // Ensure page starts at the top
    window.scrollTo(0, 0);

    // Set initial message
    setMessages([
      {
        role: 'assistant',
        content: "Hi, I'm Noah. I don't know why you're here or what you expect. Most AI tools oversell and underdeliver. This one's different, but you'll have to see for yourself. Want to test it with something small?",
        timestamp: Date.now()
      }
    ]);

    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Note: Artifact logging now handled automatically by the chat API

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    const newMessages = [...messages, {
      role: 'user' as const,
      content: userMessage,
      timestamp: Date.now()
    }];
    setMessages(newMessages);

    try {
      // Call our API route with streaming
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-streaming': 'true'
        },
        body: JSON.stringify({
          messages: newMessages,
          skepticMode: skepticMode
        }),
      });

      // Capture session ID from response headers for artifact logging
      const sessionIdFromResponse = response.headers.get('x-session-id');
      if (sessionIdFromResponse && !currentSessionId) {
        setCurrentSessionId(sessionIdFromResponse);
      }

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        // Add placeholder message for streaming
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '',
          timestamp: Date.now()
        }]);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            accumulatedContent += chunk;

            // Update the last message with accumulated content
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: accumulatedContent
              };
              return updated;
            });
          }
        } finally {
          reader.releaseLock();
        }

        // Adjust trust level based on response quality
        if (accumulatedContent.toLowerCase().includes('uncertain') || accumulatedContent.toLowerCase().includes('not sure')) {
          setTrustLevel(prev => Math.min(100, prev + 5));
        }

        // Note: Artifacts will be handled separately since streaming responses don't include them
      } else {
        // Fallback to non-streaming if no body
        const data = await response.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.content,
          timestamp: Date.now()
        }]);

        if (data.artifact) {
          logger.info('Artifact received from API', { title: data.artifact.title });
          setTimeout(() => {
            setArtifact({
              title: data.artifact.title,
              content: data.artifact.content
            });
          }, 800);
        }
      }

    } catch (error) {
      logger.error('Chat request failed', { error: error instanceof Error ? error.message : String(error) });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong on my end. Want to try that again? I learn from failures.',
        timestamp: Date.now()
      }]);
    }

    setIsLoading(false);
  };

  const downloadArtifact = useCallback(() => {
    logger.debug('Download initiated', { title: artifact?.title });
    if (!artifact) {
      logger.warn('Download attempted with no artifact available');
      return;
    }

    const content = `${artifact.title}\n\n${artifact.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logger.info('Artifact download completed', { filename: artifact.title });
  }, [artifact]);

  const toggleSkepticMode = useCallback(() => {
    setSkepticMode(prev => !prev);
    setTrustLevel(prev => Math.max(0, prev - 10));
  }, []);

  const challengeMessage = useCallback(async (messageIndex: number) => {
    if (isLoading) return;

    const message = messages[messageIndex];
    if (message.role !== 'assistant') return;

    // Mark as challenged
    setChallengedMessages(prev => new Set(prev).add(messageIndex));

    // Increase trust level for challenging (shows the system respects skepticism)
    setTrustLevel(prev => Math.min(100, prev + 3));

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.slice(0, messageIndex + 1),
            {
              role: 'user',
              content: `I want to challenge your previous response: "${message.content}". Can you think about this differently or explain your reasoning more clearly?`
            }
          ],
          trustLevel,
          skepticMode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Add the challenge response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        timestamp: Date.now()
      }]);

      // Adjust trust level based on response quality
      if (data.content.toLowerCase().includes('uncertain') || data.content.toLowerCase().includes('not sure')) {
        setTrustLevel(prev => Math.min(100, prev + 5));
      }

      // Handle artifact if present in challenge response
      if (data.artifact) {
        logger.info('Challenge artifact received', { title: data.artifact.title });

        // Set artifact state with smooth animation
        setTimeout(() => {
          setArtifact({
            title: data.artifact.title,
            content: data.artifact.content
          });
        }, 800);
      }

    } catch (error) {
      logger.error('Challenge request failed', { error: error instanceof Error ? error.message : String(error) });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I appreciate the challenge, but I\'m having trouble responding right now. Want to try that again?',
        timestamp: Date.now()
      }]);
    }

    setIsLoading(false);
  }, [messages, trustLevel, skepticMode, isLoading]);

  // Memoized message list to prevent unnecessary re-renders
  const messagesWithMemoization = useMemo(() => {
    return messages.map((message, index) => (
      <MessageComponent
        key={`${index}-${message.timestamp}`} // Better key for memoization
        message={message}
        index={index}
        onChallenge={challengeMessage}
        isAlreadyChallenged={challengedMessages.has(index)}
        isLoading={isLoading}
      />
    ));
  }, [messages, challengedMessages, isLoading, challengeMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Header */}
      <header className="border-b border-slate-200/60 backdrop-blur-sm bg-white/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">TryIt-AI Kit</h1>
                <p className="text-sm text-slate-500">Trust Recovery Protocol</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Trust Level Indicator */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-slate-600">Trust Level</span>
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000 ease-out"
                    style={{ width: `${trustLevel}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-slate-500 w-8">{trustLevel}%</span>
              </div>

              {/* Skeptic Mode Toggle */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleSkepticMode}
                  className={`inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    skepticMode ? 'bg-red-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      skepticMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-slate-600">
                  {skepticMode ? 'Skeptic Mode ON' : 'Skeptic Mode OFF'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Hero Section */}
            <div className="mb-12">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 mb-4">
                <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                For people who choose discernment over blind trust
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Your skepticism is <span className="text-blue-600">wisdom</span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
            Most AI tools want your blind trust. This one earns it by letting you help define what good technology looks like.
          </p>
            </div>

            {/* Conversation */}
            <div className="space-y-6">
              {messagesWithMemoization}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-2xl">
                    <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-slate-600">N</span>
                        </div>
                        <div className="flex-1">
                          <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Section */}
            <div className="mt-8 border-t border-slate-200 pt-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder={skepticMode ? "Question everything. What would you like to test?" : "What would you like to try?"}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-500 bg-white shadow-sm"
                    rows={3}
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                    <div className="text-xs text-slate-400">
                      Press Enter to send
                    </div>
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Artifact Display */}
            {artifact && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Generated Tool</h3>
                  <button
                    onClick={downloadArtifact}
                    className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    title="Download artifact"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-800">{artifact.title}</h4>
                  <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">{artifact.content}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Reasoning Display */}
            {showReasoning && reasoning && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm animate-fade-in-up mt-6">
                <h3 className="text-lg font-semibold text-amber-900 mb-4">Reasoning Process</h3>
                <div className="text-sm text-amber-800 whitespace-pre-wrap">{reasoning}</div>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">System Health</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Trust Recovery</span>
                    <span className="font-mono text-slate-500">{trustLevel}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${trustLevel}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {skepticMode ? '🔍 Skeptic mode enables deeper verification' : '👍 Standard interaction mode'}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm mt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">How This Works</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">1.</span>
                  <span>Ask for anything you&apos;d like built or tested</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">2.</span>
                  <span>Challenge responses if they seem off</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">3.</span>
                  <span>Enable skeptic mode for stricter verification</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">4.</span>
                  <span>Trust level adjusts based on system reliability</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}