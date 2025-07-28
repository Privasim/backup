'use client';

import { debugLogger } from '@/lib/debug/logger';

export default function DebugTestButton() {
  const handleTestLogs = () => {
    debugLogger.info('system', 'Test info message', { test: 'data' });
    debugLogger.warn('validation', 'Test warning message');
    debugLogger.error('api', 'Test error message', { error: 'Sample error' });
    debugLogger.success('analysis', 'Test success message');
    
    // Test timer
    debugLogger.startTimer('test-timer');
    setTimeout(() => {
      debugLogger.endTimer('test-timer', 'system', 'Test timer completed');
    }, 1000);
  };

  return (
    <button
      onClick={handleTestLogs}
      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
    >
      Test Debug Logs
    </button>
  );
}