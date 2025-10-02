'use client';

import React, { useState } from 'react';

export default function NoahFinalDesignDemo() {
  const [showReasoning, setShowReasoning] = useState(false);
  const [showFeedbackTooltip, setShowFeedbackTooltip] = useState(false);
  const [showSkepticsTooltip, setShowSkepticsTooltip] = useState(false);
  const [skepticMode, setSkepticMode] = useState(false);

  const personas = [
    { id: 'collaborative', name: 'Collaborative Partner', icon: '✨', active: true },
    { id: 'teacher', name: 'Patient Teacher', icon: '📚', active: false },
    { id: 'analyst', name: 'Data Analyst', icon: '📊', active: false },
    { id: 'engineer', name: 'Tech Expert', icon: '⚙️', active: false }
  ];

  const artifacts = [
    { 
      title: 'User Dashboard',
      type: 'Interactive Component',
      timestamp: '2 min ago',
      code: '<div class="dashboard">...</div>',
      color: 'from-blue-400 to-blue-600'
    },
    { 
      title: 'Data Visualizer',
      type: 'Code Module',
      timestamp: '5 min ago',
      code: 'function visualize(data) {...}',
      color: 'from-purple-400 to-purple-600'
    },
    { 
      title: 'API Integration',
      type: 'Backend Service',
      timestamp: '8 min ago',
      code: 'const api = {...}',
      color: 'from-green-400 to-green-600'
    }
  ];

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


          {/* Persona Selector */}
          <div className="mt-8 flex items-center gap-3">
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Main Conversation Canvas - 2/3 width */}
          <div className="col-span-2 space-y-8">
            {/* Story Timeline - Scrollable */}
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
                        className="w-full bg-white/50 rounded-lg p-3 text-left hover:bg-white/70 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold text-purple-700">💭 Reasoning</div>
                          <svg 
                            className={`w-4 h-4 text-purple-700 transition-transform duration-200 ${showReasoning ? 'rotate-180' : ''}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </button>
                      
                      {showReasoning && (
                        <div className="mt-2 bg-white/70 rounded-lg p-3 text-xs text-slate-600 animate-in slide-in-from-top duration-200">
                          <p className="mb-2">🔍 <strong>Analysis:</strong> Portfolio sites need to balance visual appeal with fast load times and accessibility.</p>
                          <p>💡 <strong>Approach:</strong> Modern frameworks like Next.js provide excellent performance while supporting rich animations through Framer Motion or CSS.</p>
                        </div>
                      )}

                      {/* Challenge Button */}
                      <button className="mt-3 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Does this answer seem off? Challenge this response
                      </button>
                    </div>
                  </div>
                </div>

                {/* More chapters would appear here as conversation continues */}
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
                  <span className="text-2xl font-bold text-indigo-600">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Artifacts Created</span>
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
              </div>
            </div>

            {/* Created Artifacts */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Created Artifacts</h3>
              </div>
              <div className="space-y-3">
                {artifacts.map((artifact, idx) => (
                  <div key={idx} className={`bg-gradient-to-br ${artifact.color} rounded-xl p-4 text-white`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{artifact.title}</h4>
                        <p className="text-xs opacity-90">{artifact.type}</p>
                      </div>
                      <button className="text-white/80 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs opacity-75">{artifact.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Visualizer - Shows Most Recent Artifact */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Data Visualizer</h3>
              <div className="bg-slate-900 rounded-lg p-4">
                <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                  {artifacts[0].code}
                </pre>
              </div>
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
            src="/api/video?file=intro-video.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}
