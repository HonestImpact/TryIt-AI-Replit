// Cognitive Blueprint Lab - Enterprise Transparency Interface
'use client';

import React, { useState } from 'react';

export default function CognitiveBlueprintInterface() {
  const [trustLevel, setTrustLevel] = useState(82);
  const [showAuditTrail, setShowAuditTrail] = useState(true);
  const [selectedDecision, setSelectedDecision] = useState<number | null>(0);
  
  const auditTrail = [
    {
      timestamp: '14:32:18.234',
      action: 'Query Analysis',
      confidence: 98,
      reasoning: 'User intent classified as code generation task',
      evidence: ['Keyword: "create"', 'Context: development'],
      status: 'verified'
    },
    {
      timestamp: '14:32:18.567',
      action: 'Knowledge Retrieval',
      confidence: 94,
      reasoning: 'Retrieved 3 relevant design patterns from knowledge base',
      evidence: ['Pattern: MVC', 'Pattern: Observer', 'Source: trusted'],
      status: 'verified'
    },
    {
      timestamp: '14:32:19.102',
      action: 'Response Generation',
      confidence: 91,
      reasoning: 'Generated code using verified patterns and best practices',
      evidence: ['Template: React component', 'Validation: passed'],
      status: 'verified'
    }
  ];

  const complianceMetrics = [
    { label: 'Data Privacy', status: 'compliant', score: 100 },
    { label: 'Source Attribution', status: 'compliant', score: 100 },
    { label: 'Bias Detection', status: 'reviewed', score: 95 },
    { label: 'Explainability', status: 'compliant', score: 98 }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Enterprise Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Noah Cognitive Blueprint Lab</h1>
                <p className="text-sm text-slate-500">Enterprise AI Transparency Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{trustLevel}%</div>
                <div className="text-xs text-slate-500">Trust Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">4/4</div>
                <div className="text-xs text-slate-500">Compliance</div>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Chat Interface */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 p-4">
                <h2 className="font-semibold text-slate-900">Conversation Thread</h2>
              </div>
              <div className="p-4 space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-lg bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-sm text-slate-900">Create a user authentication system with best security practices</p>
                    <div className="mt-2 text-xs text-slate-500">You • 14:32:15</div>
                  </div>
                </div>

                {/* AI Response with Explainability */}
                <div className="flex justify-start">
                  <div className="max-w-2xl w-full">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold">N</span>
                            </div>
                            <span className="text-sm font-medium">Noah • Tinkerer Agent</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">Confidence: 91%</span>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">Verified</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          I'll help you create a secure authentication system. Based on industry standards and your requirements, 
                          I recommend implementing OAuth 2.0 with JWT tokens, password hashing using bcrypt, and rate limiting 
                          for login attempts.
                        </p>
                        
                        {/* Decision Breakdown */}
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-blue-900">Decision Breakdown</h4>
                            <button className="text-xs text-blue-600 hover:text-blue-700">View Full Analysis</button>
                          </div>
                          <div className="space-y-1 text-xs text-blue-800">
                            <div>✓ Security pattern selection validated against OWASP standards</div>
                            <div>✓ Implementation verified with 3 authoritative sources</div>
                            <div>✓ Code complexity assessed as appropriate for task</div>
                          </div>
                        </div>

                        {/* Source Attribution */}
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="flex items-center space-x-2 text-xs text-slate-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                            </svg>
                            <span>Sources: OWASP Guidelines, Auth0 Best Practices, MDN Web Docs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Trail Timeline */}
            {showAuditTrail && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="border-b border-slate-200 p-4 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Decision Audit Trail</h2>
                  <button 
                    onClick={() => setShowAuditTrail(false)}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Hide
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {auditTrail.map((step, index) => (
                      <div 
                        key={index}
                        onClick={() => setSelectedDecision(index)}
                        className={`relative pl-8 pb-8 cursor-pointer transition-all ${
                          selectedDecision === index ? 'bg-indigo-50 -mx-4 px-4 py-2 rounded-lg' : ''
                        }`}
                      >
                        {/* Timeline line */}
                        {index < auditTrail.length - 1 && (
                          <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-200"></div>
                        )}
                        
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-1.5 w-6 h-6 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-slate-900">{step.action}</h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono text-slate-500">{step.timestamp}</span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                {step.confidence}% confidence
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{step.reasoning}</p>
                          
                          {selectedDecision === index && (
                            <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg">
                              <h4 className="text-xs font-semibold text-slate-700 mb-2">Evidence Chain</h4>
                              <div className="space-y-1">
                                {step.evidence.map((item, i) => (
                                  <div key={i} className="text-xs text-slate-600 flex items-center">
                                    <svg className="w-3 h-3 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Compliance Sidebar */}
          <div className="space-y-6">
            {/* Compliance Dashboard */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 p-4">
                <h2 className="font-semibold text-slate-900">Compliance Status</h2>
              </div>
              <div className="p-4 space-y-3">
                {complianceMetrics.map((metric, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{metric.label}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        metric.status === 'compliant' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {metric.status}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          metric.score >= 95 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${metric.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Metrics */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 p-4">
                <h2 className="font-semibold text-slate-900">Session Analytics</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Decision Steps</span>
                  <span className="text-lg font-semibold text-slate-900">{auditTrail.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Avg Confidence</span>
                  <span className="text-lg font-semibold text-slate-900">94.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Sources Cited</span>
                  <span className="text-lg font-semibold text-slate-900">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Verification Time</span>
                  <span className="text-lg font-semibold text-slate-900">2.1s</span>
                </div>
              </div>
            </div>

            {/* Trust Delta Analysis */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Trust Evolution</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Initial</span>
                  <span className="font-semibold text-slate-900">65%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Current</span>
                  <span className="font-semibold text-indigo-600">{trustLevel}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Delta</span>
                  <span className="font-semibold text-green-600">+{trustLevel - 65}% ↗</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
