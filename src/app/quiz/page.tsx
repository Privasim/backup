import QuizForm from '@/components/quiz/QuizForm';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Compact Header */}
      <header className="px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <span className="text-lg font-bold text-gray-900">CareerGuard</span>
          </div>
          <div className="text-xs text-gray-600">
            Assessment
          </div>
        </div>
      </header>

      <ErrorBoundary>
        <QuizForm />
      </ErrorBoundary>
    </div>
  );
}