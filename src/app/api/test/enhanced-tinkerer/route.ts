/**
 * Test Enhanced Tinkerer Integration API
 * Verifies that the enhanced Tinkerer can access tool knowledge
 */

import { NextRequest, NextResponse } from 'next/server';
import { ToolKnowledgeService } from '@/lib/agents/tool-knowledge-service';
import { toolReferenceService } from '@/lib/knowledge/tool-reference-service';
import { createLogger } from '@/lib/logger';

const logger = createLogger('enhanced-tinkerer-test');

export async function GET() {
  try {
    logger.info('🧪 Testing Enhanced Tinkerer Integration');

    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
      summary: {
        passed: 0,
        failed: 0,
        total: 0
      }
    };

    // Test 1: Tool Knowledge Service Initialization
    try {
      const toolKnowledgeService = new ToolKnowledgeService();
      results.tests.push({
        name: 'Tool Knowledge Service Initialization',
        status: 'PASSED',
        message: 'ToolKnowledgeService initialized successfully'
      });
      results.summary.passed++;
    } catch (error) {
      results.tests.push({
        name: 'Tool Knowledge Service Initialization',
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error)
      });
      results.summary.failed++;
    }

    // Test 2: Pattern Retrieval
    try {
      const toolKnowledgeService = new ToolKnowledgeService();
      const testRequests = [
        'Create a calculator app',
        'Build a budget tracker',
        'Make a timer tool'
      ];

      for (const request of testRequests) {
        try {
          const context = await toolKnowledgeService.getRelevantPatterns(request, 3);
          
          results.tests.push({
            name: `Pattern Retrieval: "${request}"`,
            status: 'PASSED',
            patternsFound: context.patterns.length,
            topPattern: context.patterns[0]?.title || 'None',
            relevanceScore: context.patterns[0]?.relevanceScore || 0
          });
          results.summary.passed++;
        } catch (error) {
          results.tests.push({
            name: `Pattern Retrieval: "${request}"`,
            status: 'FAILED',
            error: error instanceof Error ? error.message : String(error)
          });
          results.summary.failed++;
        }
      }
    } catch (error) {
      results.tests.push({
        name: 'Pattern Retrieval Setup',
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error)
      });
      results.summary.failed++;
    }

    // Test 3: Tool Database Connectivity
    try {
      const stats = await toolReferenceService.getToolStats();
      results.tests.push({
        name: 'Tool Database Connectivity',
        status: 'PASSED',
        totalTools: stats.totalTools,
        totalCategories: stats.categoryCounts.length
      });
      results.summary.passed++;
    } catch (error) {
      results.tests.push({
        name: 'Tool Database Connectivity',
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error)
      });
      results.summary.failed++;
    }

    // Test 4: Specific Tool Retrieval
    try {
      const toolKnowledgeService = new ToolKnowledgeService();
      const calculatorTool = await toolKnowledgeService.getToolImplementation('simple-calculator');
      
      results.tests.push({
        name: 'Specific Tool Retrieval',
        status: calculatorTool ? 'PASSED' : 'FAILED',
        toolFound: !!calculatorTool,
        toolName: calculatorTool?.title || 'None',
        category: calculatorTool?.category || 'None'
      });
      
      if (calculatorTool) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
      }
    } catch (error) {
      results.tests.push({
        name: 'Specific Tool Retrieval',
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error)
      });
      results.summary.failed++;
    }

    // Test 5: Complex Request Processing
    try {
      const toolKnowledgeService = new ToolKnowledgeService();
      const complexRequest = 'Build an interactive expense tracker with charts and categories';
      const context = await toolKnowledgeService.getRelevantPatterns(complexRequest, 5);
      
      // Analyze code snippets availability
      let hasStructure = 0, hasStyling = 0, hasFunctionality = 0;
      context.patterns.forEach(pattern => {
        if (pattern.codeSnippets.structure) hasStructure++;
        if (pattern.codeSnippets.styling) hasStyling++;
        if (pattern.codeSnippets.functionality) hasFunctionality++;
      });

      results.tests.push({
        name: 'Complex Request Processing',
        status: 'PASSED',
        request: complexRequest,
        patternsFound: context.patterns.length,
        recommendations: context.recommendations.length,
        codeSnippets: {
          structure: hasStructure,
          styling: hasStyling,
          functionality: hasFunctionality
        },
        topPattern: context.patterns[0]?.title || 'None'
      });
      results.summary.passed++;
    } catch (error) {
      results.tests.push({
        name: 'Complex Request Processing',
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error)
      });
      results.summary.failed++;
    }

    // Calculate totals
    results.summary.total = results.summary.passed + results.summary.failed;

    logger.info('🎉 Enhanced Tinkerer Integration Test Complete', {
      passed: results.summary.passed,
      failed: results.summary.failed,
      total: results.summary.total
    });

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    logger.error('💥 Enhanced Tinkerer integration test failed', { error });
    
    return NextResponse.json({
      error: 'Enhanced Tinkerer integration test failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userRequest } = await request.json();
    
    if (!userRequest) {
      return NextResponse.json({ error: 'userRequest is required' }, { status: 400 });
    }

    logger.info('🔍 Testing specific user request', { userRequest });

    const toolKnowledgeService = new ToolKnowledgeService();
    const context = await toolKnowledgeService.getRelevantPatterns(userRequest, 5);

    return NextResponse.json({
      userRequest,
      patternsFound: context.patterns.length,
      patterns: context.patterns.map(p => ({
        title: p.title,
        category: p.category,
        relevanceScore: p.relevanceScore,
        features: p.features.slice(0, 3)
      })),
      recommendations: context.recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('💥 Specific request test failed', { error });
    
    return NextResponse.json({
      error: 'Specific request test failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}