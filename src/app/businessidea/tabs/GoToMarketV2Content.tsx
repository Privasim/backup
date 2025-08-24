'use client';

import React from 'react';

export default function GoToMarketV2Content() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Go-to-Market Strategy (V2)</h1>
        <p className="text-gray-600">This is a placeholder for the new Go-to-Market strategy page.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-gray-600 mb-4">This section will contain your go-to-market strategy including:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Target audience and customer segments</li>
            <li>Value proposition and messaging</li>
            <li>Marketing and sales channels</li>
            <li>Pricing strategy</li>
            <li>Launch timeline</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Placeholder Features</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Interactive Plan Builder</h3>
              <p className="text-gray-600 text-sm">Build your go-to-market strategy step by step with AI assistance</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Performance Tracking</h3>
              <p className="text-gray-600 text-sm">Monitor KPIs and adjust your strategy in real-time</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Competitor Analysis</h3>
              <p className="text-gray-600 text-sm">Compare your strategy against market competitors</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-100 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-blue-800">Note</h3>
            <div className="mt-2 text-blue-700">
              <p>This is a placeholder page. The actual go-to-market strategy features will be implemented in future updates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
