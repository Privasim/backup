'use client';

import ErrorBoundary from '@/components/common/ErrorBoundary';
import UnifiedDebugInterface from '@/components/unified/UnifiedDebugInterface';

export default function QuizPage() {
  return (
    <ErrorBoundary>
      <UnifiedDebugInterface 
        initialMode="development"
        enableDebugConsole={true}
        persistState={true}
      />
    </ErrorBoundary>
  );
}