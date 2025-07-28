import QuizForm from '@/components/quiz/QuizForm';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CareerGuard</span>
          </div>
          <div className="text-sm text-gray-600">
            Assessment Form
          </div>
        </div>
      </header>

      <ErrorBoundary>
        <QuizForm />
      </ErrorBoundary>
    </div>
  );
}