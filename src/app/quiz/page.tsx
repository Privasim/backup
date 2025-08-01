'use client';

import QuizForm from '@/components/quiz/QuizForm';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import DebugConsole, { useDebugConsole } from '@/components/debug/DebugConsole';

export default function QuizPage() {
  const debugConsole = useDebugConsole();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Debug Console */}
      <DebugConsole 
        isVisible={debugConsole.isVisible}
        onToggle={debugConsole.toggle}
      />

      {/* Compact Header */}
      <header className="px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <span className="text-lg font-bold text-gray-900">CareerGuard</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={debugConsole.toggle}
              className="text-xs text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
              title="Toggle Debug Console"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Debug
            </button>
            <div className="text-xs text-gray-600">
              Assessment
            </div>
          </div>
        </div>
      </header>

      <ErrorBoundary>
        <QuizForm />
      </ErrorBoundary>
    </div>
  );
}