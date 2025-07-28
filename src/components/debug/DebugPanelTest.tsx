'use client';

import { useState } from 'react';
import DebugPanel from './DebugPanel';
import { debugLogger } from '@/lib/debug/logger';

export default function DebugPanelTest() {
  const [isVisible, setIsVisible] = useState(false);

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
    <div className="p-4">
      <div className="space-y-4">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          {isVisible ? 'Hide' : 'Show'} Debug Panel
        </button>
        
        <button
          onClick={handleTestLogs}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
        >
          Generate Test Logs
        </button>
      </div>

      <DebugPanel 
        isVisible={isVisible}
        onToggle={() => setIsVisible(!isVisible)}
      />
    </div>
  );
}