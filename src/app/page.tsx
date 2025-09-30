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

export default function TrustRecoveryProtocol() {
  // State - Initialize with Noah's greeting to avoid hydration issues
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi, I'm Noah. I don't know why you're here or what you expect. Most AI tools oversell and underdeliver. This one's different, but you'll have to see for yourself. Want to test it with something small?",
      timestamp: 0 // Will be set to actual timestamp on client
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [sessionArtifacts, setSessionArtifacts] = useState<Array<{
    title: string;
    content: string;
    timestamp: number;
    agent: string;
    id: string;
  }>>([]);
  const [showReasoning, setShowReasoning] = useState(false);
  const [reasoning] = useState('');
  const [skepticMode, setSkepticMode] = useState(false);
  const [trustLevel, setTrustLevel] = useState(50);
  const [challengedMessages, setChallengedMessages] = useState<Set<number>>(new Set());
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [interfaceLocked, setInterfaceLocked] = useState(false);
  const [showFeedbackTooltip, setShowFeedbackTooltip] = useState(false);
  const [showSkepticsTooltip, setShowSkepticsTooltip] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const personas = [
    { id: 'collaborative', name: 'Collaborative Partner', icon: '✨', active: true },
    { id: 'teacher', name: 'Patient Teacher', icon: '📚', active: false },
    { id: 'analyst', name: 'Data Analyst', icon: '📊', active: false },
    { id: 'engineer', name: 'Tech Expert', icon: '⚙️', active: false }
  ];

  // Focus input on mount and update timestamp (no auto-scroll)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Update timestamp for initial message on client
    if (messages.length === 1 && messages[0].timestamp === 0) {
      setMessages(prev => [{
        ...prev[0],
        timestamp: Date.now()
      }]);
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || interfaceLocked) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    }]);

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          trustLevel,
          skepticMode,
          sessionId: currentSessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const sessionIdFromResponse = response.headers.get('X-Session-Id');
      if (sessionIdFromResponse && !currentSessionId) {
        setCurrentSessionId(sessionIdFromResponse);
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

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
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    accumulatedContent += parsed.content;
                    setMessages(prev => {
                      const updated = [...prev];
                      updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: accumulatedContent
                      };
                      return updated;
                    });
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        if (accumulatedContent.toLowerCase().includes('uncertain') || accumulatedContent.toLowerCase().includes('not sure')) {
          setTrustLevel(prev => Math.min(100, prev + 5));
        }
      } else {
        const data = await response.json();
        
        if (data.status === 'interface_locked') {
          setInterfaceLocked(true);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.content,
            timestamp: Date.now()
          }]);
          return;
        }
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.content,
          timestamp: Date.now()
        }]);

        if (data.artifact) {
          setTimeout(() => {
            setArtifact({
              title: data.artifact.title,
              content: data.artifact.content
            });
          }, 800);
        }

        if (data.sessionArtifacts) {
          setSessionArtifacts(data.sessionArtifacts);
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

  const downloadIndividualArtifact = useCallback((sessionArtifact: {
    title: string;
    content: string;
    id: string;
  }) => {
    if (interfaceLocked) return;
    const content = `${sessionArtifact.title}\n\n${sessionArtifact.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionArtifact.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const toggleSkepticMode = useCallback(() => {
    if (interfaceLocked) return;
    setSkepticMode(prev => !prev);
    setTrustLevel(prev => Math.max(0, prev - 10));
  }, [interfaceLocked]);

  const challengeMessage = useCallback(async (messageIndex: number) => {
    if (isLoading || interfaceLocked) return;

    const message = messages[messageIndex];
    if (message.role !== 'assistant') return;

    setChallengedMessages(prev => new Set(prev).add(messageIndex));
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

      if (data.status === 'radio_silence') {
        return;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        timestamp: Date.now()
      }]);

      if (data.content.toLowerCase().includes('uncertain') || data.content.toLowerCase().includes('not sure')) {
        setTrustLevel(prev => Math.min(100, prev + 5));
      }

      if (data.artifact) {
        setTimeout(() => {
          setArtifact({
            title: data.artifact.title,
            content: data.artifact.content
          });
        }, 800);
      }

      if (data.sessionArtifacts) {
        setSessionArtifacts(data.sessionArtifacts);
      }

    } catch (error) {
      logger.error('Challenge request failed', { error });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I appreciate the challenge, but I\'m having trouble responding right now. Want to try that again?',
        timestamp: Date.now()
      }]);
    }

    setIsLoading(false);
  }, [messages, trustLevel, skepticMode, isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  TryIt-AI Kit
                </h1>
                <p className="text-sm text-slate-600">Our collaboration, your way</p>
              </div>
            </div>
            
            {/* Feedback & Skeptics Welcome */}
            <div className="flex items-center gap-8">
              {/* Feedback */}
              <div 
                className="relative text-center cursor-help"
                onMouseEnter={() => setShowFeedbackTooltip(true)}
                onMouseLeave={() => setShowFeedbackTooltip(false)}
              >
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-slate-500 mt-1">Feedback</div>
                {showFeedbackTooltip && (
                  <div className="absolute z-10 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl -left-24 top-20">
                    <div className="font-semibold mb-1">Trust Tracking - In Development</div>
                    <div className="text-slate-300">This will track our collaboration quality based on your feedback and challenges</div>
                  </div>
                )}
              </div>

              {/* Skeptics Welcome */}
              <div 
                className="relative text-center cursor-help"
                onMouseEnter={() => setShowSkepticsTooltip(true)}
                onMouseLeave={() => setShowSkepticsTooltip(false)}
              >
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-slate-500 mt-1">Skeptics Welcome</div>
                {showSkepticsTooltip && (
                  <div className="absolute z-10 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl -left-24 top-20">
                    <div className="font-semibold mb-1">Source Verification - In Development</div>
                    <div className="text-slate-300">This will show source strength and evidence quality for each response</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skeptic Mode Indicator */}
          {skepticMode && (
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-amber-800">Skeptic mode active - requesting additional verification and showing more sources</span>
              <button 
                onClick={() => setSkepticMode(false)}
                className="ml-auto text-amber-600 hover:text-amber-800"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* Persona Selector & Skeptic Mode */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 font-medium">Noah's Role:</span>
              <div className="flex space-x-2">
                {personas.map(persona => (
                  <button
                    key={persona.id}
                    disabled={!persona.active}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border-2 shadow-md ${
                      persona.active
                        ? 'bg-purple-100 text-purple-700 border-purple-300'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span className="mr-2">{persona.icon}</span>
                    {persona.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Skeptic Mode Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 font-medium">Skeptic Mode</span>
              <button
                onClick={toggleSkepticMode}
                disabled={interfaceLocked}
                className={`inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  skepticMode ? 'bg-amber-500' : 'bg-slate-300'
                } ${interfaceLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    skepticMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs text-slate-500">
                {skepticMode ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Main Conversation Canvas - 2/3 width */}
          <div className="col-span-2 space-y-8">
            {/* Story Timeline */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
                <h2 className="font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  Our Collaboration So Far
                </h2>
              </div>
              
              <div className="p-8 space-y-8 max-h-[600px] overflow-y-auto">
                {messages.map((message, index) => {
                  const chapterNumber = index + 1;
                  const isUser = message.role === 'user';
                  
                  return (
                    <div key={`${index}-${message.timestamp}`} className="relative">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isUser ? 'bg-gradient-to-b from-indigo-300 to-purple-300' : 'bg-gradient-to-b from-purple-300 to-pink-300'} rounded-full`}></div>
                      <div className="pl-6">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-6 h-6 ${isUser ? 'bg-gradient-to-br from-indigo-400 to-purple-400' : 'bg-gradient-to-br from-purple-400 to-pink-400'} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                            {chapterNumber}
                          </div>
                          <h3 className="font-semibold text-slate-900">{isUser ? 'Your Goal' : 'Working Together'}</h3>
                        </div>
                        <div className={`${isUser ? 'bg-indigo-50 border-indigo-100' : 'bg-purple-50 border-purple-100'} rounded-xl p-4 border`}>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{message.content}</p>
                          
                          {!isUser && !challengedMessages.has(index) && !isLoading && !interfaceLocked && (
                            <button 
                              onClick={() => challengeMessage(index)}
                              className="mt-3 w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Something seem off? Challenge this response
                            </button>
                          )}
                          {challengedMessages.has(index) && (
                            <div className="mt-3 text-xs text-green-600 font-medium">✓ Challenged</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-300 to-pink-300 rounded-full"></div>
                    <div className="pl-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                          <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-slate-900">Thinking...</h3>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input at Bottom of Timeline */}
              <div className="border-t border-slate-200 p-4 bg-white/50">
                <form onSubmit={handleSubmit} className="space-y-2">
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
                    placeholder="What would you like to try?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-slate-900 placeholder-slate-500 bg-white/70 backdrop-blur-sm"
                    rows={2}
                    disabled={isLoading || interfaceLocked}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <span>Send</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Sidebar - 1/3 width */}
          <div className="col-span-1 space-y-6">
            {/* Collaboration Progress */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <h3 className="font-semibold text-slate-900">Collaboration Progress</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Steps Together</span>
                  <span className="text-2xl font-bold text-indigo-600">{messages.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Artifacts Created</span>
                  <span className="text-2xl font-bold text-purple-600">{sessionArtifacts.length}</span>
                </div>
              </div>
            </div>

            {/* Created Artifacts */}
            {sessionArtifacts.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Created Artifacts</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {sessionArtifacts.map((sessionArtifact, idx) => {
                    const colors = [
                      'from-blue-400 to-blue-600',
                      'from-purple-400 to-purple-600',
                      'from-green-400 to-green-600',
                      'from-orange-400 to-orange-600',
                      'from-pink-400 to-pink-600'
                    ];
                    const color = colors[idx % colors.length];
                    
                    return (
                      <div key={sessionArtifact.id} className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{sessionArtifact.title}</h4>
                            <p className="text-xs opacity-90">{sessionArtifact.agent}</p>
                          </div>
                          <button 
                            onClick={() => downloadIndividualArtifact(sessionArtifact)}
                            className="text-white/80 hover:text-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs opacity-75">{new Date(sessionArtifact.timestamp).toLocaleTimeString()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Data Visualizer */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Data Visualizer</h3>
              {sessionArtifacts.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">Most Recent Artifact:</p>
                  <p className="text-xs font-semibold text-purple-600">{sessionArtifacts[sessionArtifacts.length - 1].title}</p>
                  <div className="bg-slate-900 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                      {sessionArtifacts[sessionArtifacts.length - 1].content.substring(0, 500)}
                      {sessionArtifacts[sessionArtifacts.length - 1].content.length > 500 ? '\n\n... (see full code in Created Artifacts)' : ''}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No artifacts generated yet</p>
              )}
            </div>

            {/* API Integration - Placeholder */}
            <div className="bg-slate-100 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-6 opacity-60">
              <h3 className="font-semibold text-slate-500 mb-2">API Integration</h3>
              <p className="text-xs text-slate-400">Coming Soon</p>
            </div>

            {/* Quick Tips - Placeholder */}
            <div className="bg-slate-100 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-6 opacity-60">
              <h3 className="font-semibold text-slate-500 mb-2">Quick Tips</h3>
              <p className="text-xs text-slate-400">Coming Soon</p>
            </div>
          </div>
        </div>

        {/* Video Section at Bottom */}
        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Introduction Video</h3>
          <video 
            className="w-full rounded-lg shadow-md"
            controls
            preload="metadata"
            src="/api/video?file=intro-video.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Interface Lockdown Banner */}
      {interfaceLocked && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-red-200 bg-red-50 backdrop-blur-sm z-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-800 font-medium text-sm">Interface Locked</p>
                  <p className="text-red-600 text-xs">Your message violated safety guidelines. Refresh to restore functionality.</p>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
