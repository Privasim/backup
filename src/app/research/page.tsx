'use client';

import React from 'react';
import Link from 'next/link';
import ResearchDashboard from '@/components/research/ResearchDashboard';
import { useServiceHealth } from '@/hooks/useResearchData';

export default function ResearchPage() {
  const serviceHealth = useServiceHealth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CareerGuard</span>
            </Link>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Research Dashboard</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {serviceHealth && (
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  serviceHealth.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-gray-600">
                  {serviceHealth.status === 'healthy' ? 'Data Service Online' : 'Service Offline'}
                </span>
              </div>
            )}
            
            <Link
              href="/quiz"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Take Assessment
            </Link>
          </div>
        </div>
      </header>

      <div className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Employment Risk Research
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore comprehensive research data on how artificial intelligence is impacting 
              employment across different occupations and industries. Based on peer-reviewed 
              research and real-world data analysis.
            </p>
          </div>

          {/* Data Source Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Research Data Source
                </h3>
                <p className="text-blue-800 mb-3">
                  This dashboard presents data from the research paper "The Impact of Generative AI on Employment" 
                  by Edward W. Felten, Manav Raj, and Robert Seamans (arXiv:2507.07935).
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-blue-700">
                  <div>
                    <span className="font-medium">Data Sources:</span> O*NET, Bureau of Labor Statistics
                  </div>
                  <div>
                    <span className="font-medium">Coverage:</span> 800+ occupations, 20 industries
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> January 2025
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">19%</div>
              <div className="text-gray-600">High Exposure Jobs</div>
              <div className="text-xs text-gray-500 mt-1">≥70% exposure score</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">23%</div>
              <div className="text-gray-600">Medium Exposure Jobs</div>
              <div className="text-xs text-gray-500 mt-1">50-69% exposure score</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">58%</div>
              <div className="text-gray-600">Low Exposure Jobs</div>
              <div className="text-xs text-gray-500 mt-1">&lt;50% exposure score</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">800+</div>
              <div className="text-gray-600">Occupations Analyzed</div>
              <div className="text-xs text-gray-500 mt-1">Comprehensive coverage</div>
            </div>
          </div>

          {/* Main Dashboard */}
          <ResearchDashboard />

          {/* Methodology Note */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Methodology & Interpretation
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Exposure Measurement</h4>
                <p>
                  AI exposure scores are calculated based on the overlap between occupation tasks 
                  and current AI capabilities across four domains: text generation, code generation, 
                  data analysis, and creative content creation.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Important Considerations</h4>
                <p>
                  High exposure does not necessarily mean job displacement. Many roles may see 
                  task transformation and human-AI collaboration rather than complete automation. 
                  The timeline and actual impact depend on adoption rates and organizational factors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}