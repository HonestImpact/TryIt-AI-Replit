// Adaptive Narrative Studio - Story-Driven Conversational Interface
'use client';

import React, { useState } from 'react';

export default function AdaptiveNarrativeInterface() {
  const [currentPersona, setCurrentPersona] = useState('creative');
  const [showArtifactGallery, setShowArtifactGallery] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [skepticMode, setSkepticMode] = useState(false);
  const [showTrustTooltip, setShowTrustTooltip] = useState(false);
  const [showVerificationTooltip, setShowVerificationTooltip] = useState(false);
  
  const personas = [
    { id: 'creative', name: 'Creative Partner', icon: '🎨', activeClass: 'bg-purple-100 text-purple-700 border-purple-300' },
    { id: 'teacher', name: 'Patient Teacher', icon: '📚', activeClass: 'bg-blue-100 text-blue-700 border-blue-300' },
    { id: 'analyst', name: 'Data Analyst', icon: '📊', activeClass: 'bg-green-100 text-green-700 border-green-300' },
    { id: 'engineer', name: 'Tech Expert', icon: '⚙️', activeClass: 'bg-orange-100 text-orange-700 border-orange-300' }
  ];

  const conversationPaths = [
    { id: 'explain', label: 'Let\'s explore the concept', icon: '💡' },
    { id: 'show', label: 'Show me examples', icon: '🔍' },
    { id: 'build', label: 'Let\'s build it together', icon: '🔨' },
    { id: 'explore', label: 'Explore alternatives', icon: '🌟' }
  ];

  const artifacts = [
    { 
      title: 'User Dashboard',
      type: 'Interactive Component',
      timestamp: '2 min ago',
      preview: 'React dashboard with charts',
      color: 'from-blue-400 to-blue-600'
    },
    { 
      title: 'Data Visualizer',
      type: 'Code Module',
      timestamp: '5 min ago',
      preview: 'D3.js visualization library',
      color: 'from-purple-400 to-purple-600'
    },
    { 
      title: 'API Integration',
      type: 'Backend Service',
      timestamp: '8 min ago',
      preview: 'REST API endpoints',
      color: 'from-green-400 to-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Storytelling Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-6">
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
                  Noah's Adaptive Narrative Studio
                </h1>
                <p className="text-sm text-slate-600">Our collaboration, our way</p>
              </div>
            </div>
            
            {/* Trust & Verification Status */}
            <div className="flex items-center gap-8">
              {/* Trust (Soon) */}
              <div 
                className="relative text-center cursor-help"
                onMouseEnter={() => setShowTrustTooltip(true)}
                onMouseLeave={() => setShowTrustTooltip(false)}
              >
                <div className="relative w-16 h-16">
                  {/* Partnership handshake icon */}
                  <svg className="w-full h-full text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-slate-500 mt-1">Trust (Soon)</div>
                {showTrustTooltip && (
                  <div className="absolute z-10 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl -left-24 top-20">
                    <div className="font-semibold mb-1">Trust Tracking - In Development</div>
                    <div className="text-slate-300">This will track our collaboration quality based on your feedback and challenges</div>
                  </div>
                )}
              </div>

              {/* Verification (Soon) */}
              <div 
                className="relative text-center cursor-help"
                onMouseEnter={() => setShowVerificationTooltip(true)}
                onMouseLeave={() => setShowVerificationTooltip(false)}
              >
                <div className="relative w-16 h-16">
                  {/* Shield/verification icon */}
                  <svg className="w-full h-full text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-slate-500 mt-1">Verification (Soon)</div>
                {showVerificationTooltip && (
                  <div className="absolute z-10 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl -left-24 top-20">
                    <div className="font-semibold mb-1">Source Verification - In Development</div>
                    <div className="text-slate-300">This will show source strength and evidence quality for each response</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Persona Selector */}
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

          {/* Persona Selector */}
          <div className="mt-8 flex items-center gap-3">
            <span className="text-sm text-slate-600 font-medium">Noah's Role:</span>
            <div className="flex space-x-2">
              {personas.map(persona => (
                <button
                  key={persona.id}
                  onClick={() => setCurrentPersona(persona.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 shadow-md ${
                    currentPersona === persona.id
                      ? persona.activeClass
                      : 'bg-white/60 text-slate-600 border-slate-200 hover:bg-white'
                  }`}
                >
                  <span className="mr-2">{persona.icon}</span>
                  {persona.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Conversation Canvas */}
          <div className="col-span-2 space-y-6">
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
              
              <div className="p-6 space-y-6">
                {/* Chapter 1: User's Request */}
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-300 to-purple-300 rounded-full"></div>
                  <div className="pl-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        1
                      </div>
                      <h3 className="font-semibold text-slate-900">Your Goal</h3>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <p className="text-sm text-slate-700">
                        "I want to create a beautiful portfolio website that showcases my work"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chapter 2: Noah's Understanding */}
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-300 to-pink-300 rounded-full"></div>
                  <div className="pl-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        2
                      </div>
                      <h3 className="font-semibold text-slate-900">Working Together</h3>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                      <p className="text-sm text-slate-700 mb-3">
                        Let's explore what would work best for your portfolio. I'm thinking modern, clean designs with smooth animations could showcase your work effectively.
                      </p>
                      
                      {/* Reasoning - Collapsible */}
                      <button 
                        onClick={() => setShowReasoning(!showReasoning)}
                        className="w-full bg-white/50 rounded-lg p-3 text-left hover:bg-white/70 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold text-purple-700">💭 Reasoning</div>
                          <svg 
                            className={`w-4 h-4 text-purple-700 transition-transform ${showReasoning ? 'rotate-180' : ''}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        {!showReasoning && (
                          <p className="text-xs text-slate-500 mt-1">See the reasoning behind this response...</p>
                        )}
                        {showReasoning && (
                          <p className="text-xs text-slate-600 mt-2">
                            You mentioned "beautiful" and "showcases" - this suggests visual appeal is important. 
                            Let's focus on responsive design and elegant interactions that make your work stand out.
                          </p>
                        )}
                      </button>
                      
                      {/* Challenge Response - Prominent */}
                      <button className="w-full mt-3 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Something seem off? Challenge this response</span>
                      </button>
                      <p className="text-xs text-center text-slate-500 mt-2">Your challenges help improve our collaboration</p>
                    </div>
                  </div>
                </div>

                {/* Chapter 3: Branching Paths */}
                <div className="relative">
                  <div className="pl-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        3
                      </div>
                      <h3 className="font-semibold text-slate-900">Choose Our Next Step</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {conversationPaths.map(path => (
                        <button
                          key={path.id}
                          onClick={() => setSelectedPath(path.id)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            selectedPath === path.id
                              ? 'bg-gradient-to-br from-pink-100 to-rose-100 border-pink-300 shadow-md'
                              : 'bg-white border-slate-200 hover:border-pink-200 hover:shadow'
                          }`}
                        >
                          <div className="text-2xl mb-1">{path.icon}</div>
                          <div className="text-sm font-medium text-slate-700">{path.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected Path Response */}
                {selectedPath && (
                  <div className="pl-6 animate-fadeIn">
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
                      <p className="text-sm text-slate-700">
                        {selectedPath === 'explain' && "Let's break down how modern portfolio sites work together..."}
                        {selectedPath === 'show' && "Here are some inspiring examples we can explore..."}
                        {selectedPath === 'build' && "Let's start building together. We'll set up the foundation first..."}
                        {selectedPath === 'explore' && "Let's explore different creative directions together..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Let's continue our collaboration..."
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
                  />
                </div>
                <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl px-6 py-3 font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                  Send
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSkepticMode(!skepticMode)}
                    className={`px-3 py-1 rounded-md transition-all ${
                      skepticMode 
                        ? 'bg-amber-100 text-amber-700 border border-amber-300' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {skepticMode ? '🔍 Skeptic mode ON' : '🔍 Skeptic mode'}
                  </button>
                  <span>Persona: {personas.find(p => p.id === currentPersona)?.name}</span>
                </div>
                <span>✨ Ask follow-up questions to explore deeper</span>
              </div>
            </div>
          </div>

          {/* Artifact Gallery Sidebar */}
          <div className="space-y-6">
            {/* Collaboration Progress */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Collaboration Progress
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Steps Together</span>
                  <span className="text-lg font-semibold text-purple-600">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Artifacts Created</span>
                  <span className="text-lg font-semibold text-indigo-600">{artifacts.length}</span>
                </div>
              </div>
            </div>

            {/* Artifact Gallery */}
            {showArtifactGallery && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Created Artifacts</h3>
                  <button 
                    onClick={() => setShowArtifactGallery(false)}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Hide
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {artifacts.map((artifact, index) => (
                    <div 
                      key={index}
                      className="group relative overflow-hidden rounded-xl border border-slate-200 hover:border-purple-300 transition-all cursor-pointer"
                    >
                      <div className={`h-24 bg-gradient-to-br ${artifact.color} p-4 flex items-center justify-center`}>
                        <svg className="w-12 h-12 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="bg-white p-3">
                        <h4 className="font-medium text-slate-900 text-sm">{artifact.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{artifact.type}</p>
                        <p className="text-xs text-slate-400 mt-1">{artifact.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contextual Help */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                <span className="text-lg mr-2">💡</span>
                Quick Tip
              </h4>
              <p className="text-sm text-purple-800">
                Switch Noah's persona anytime to explore different perspectives together!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
