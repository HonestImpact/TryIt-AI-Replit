// Adaptive Narrative Studio - Story-Driven Conversational Interface
'use client';

import React, { useState } from 'react';

export default function AdaptiveNarrativeInterface() {
  const [trustLevel, setTrustLevel] = useState(78);
  const [currentPersona, setCurrentPersona] = useState('creative');
  const [showArtifactGallery, setShowArtifactGallery] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  
  const personas = [
    { id: 'creative', name: 'Creative Partner', icon: '🎨', activeClass: 'bg-purple-100 text-purple-700 border-purple-300' },
    { id: 'teacher', name: 'Patient Teacher', icon: '📚', activeClass: 'bg-blue-100 text-blue-700 border-blue-300' },
    { id: 'analyst', name: 'Data Analyst', icon: '📊', activeClass: 'bg-green-100 text-green-700 border-green-300' },
    { id: 'engineer', name: 'Tech Expert', icon: '⚙️', activeClass: 'bg-orange-100 text-orange-700 border-orange-300' }
  ];

  const conversationPaths = [
    { id: 'explain', label: 'Explain the concept', icon: '💡' },
    { id: 'show', label: 'Show me examples', icon: '🔍' },
    { id: 'build', label: 'Help me build it', icon: '🔨' },
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
                <p className="text-sm text-slate-600">Your journey, your way</p>
              </div>
            </div>
            
            {/* Trust Blossom Visualization */}
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="relative w-24 h-24">
                  {/* Flower petals representing trust */}
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                      <ellipse
                        key={i}
                        cx="50"
                        cy="50"
                        rx="15"
                        ry="25"
                        fill={`hsl(${250 + i * 20}, 70%, ${60 + trustLevel / 5}%)`}
                        transform={`rotate(${angle} 50 50)`}
                        opacity={trustLevel > 50 ? 0.8 : 0.4}
                      />
                    ))}
                    {/* Center */}
                    <circle cx="50" cy="50" r="12" fill="#FCD34D" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-slate-700 mt-1">Trust: {trustLevel}%</div>
              </div>
            </div>
          </div>

          {/* Persona Selector */}
          <div className="mt-6 flex items-center space-x-3">
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
                  Your Story So Far
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
                      <h3 className="font-semibold text-slate-900">Your Vision</h3>
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
                      <h3 className="font-semibold text-slate-900">Noah's Understanding</h3>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                      <p className="text-sm text-slate-700 mb-3">
                        I can help you create something special! Let me understand your style preferences first. 
                        I'm thinking about modern, clean designs with smooth animations.
                      </p>
                      
                      {/* Reasoning in story form */}
                      <div className="bg-white/50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-purple-700 mb-2">💭 My Thought Process</div>
                        <p className="text-xs text-slate-600">
                          You mentioned "beautiful" and "showcases" - I'm sensing you value visual appeal and 
                          want your work to stand out. I'll focus on responsive design and elegant interactions.
                        </p>
                      </div>
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
                      <h3 className="font-semibold text-slate-900">Choose Your Path</h3>
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
                        {selectedPath === 'explain' && "Great choice! Let me break down how modern portfolio sites work..."}
                        {selectedPath === 'show' && "Perfect! Here are some inspiring examples I can adapt for you..."}
                        {selectedPath === 'build' && "Excellent! Let's start building together. First, we'll set up the foundation..."}
                        {selectedPath === 'explore' && "I love your curiosity! Let's explore different creative directions..."}
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
                    placeholder="Continue your story..."
                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  />
                </div>
                <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl px-6 py-3 font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                  Send
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>✨ Tip: Ask follow-up questions to explore deeper</span>
                <span>Current persona: {personas.find(p => p.id === currentPersona)?.name}</span>
              </div>
            </div>
          </div>

          {/* Artifact Gallery Sidebar */}
          <div className="space-y-6">
            {/* Journey Progress */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Journey Progress
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Steps Taken</span>
                  <span className="text-lg font-semibold text-purple-600">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Artifacts Created</span>
                  <span className="text-lg font-semibold text-indigo-600">{artifacts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Trust Growth</span>
                  <span className="text-lg font-semibold text-green-600">+13%</span>
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
                You can switch Noah's persona anytime to get different perspectives on your project!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
