'use client';

import React from 'react';
import { ProgressSidebar } from './ProgressSidebar';
import { ChatContentArea } from './ChatContentArea';
import { ChatState } from './types';

interface ChatLayoutProps {
  chatState: ChatState;
  onApproval?: (action: string) => void;
  className?: string;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  chatState,
  onApproval,
  className = ''
}) => {
  return (
    <div className={`flex h-full bg-gray-50 ${className}`}>
      {/* Progress Sidebar */}
      <div className="w-64 md:w-80 flex-shrink-0 hidden sm:block">
        <ProgressSidebar 
          currentPhase={chatState.currentPhase}
          className="h-full"
        />
      </div>

      {/* Mobile Progress Header (visible on small screens) */}
      <div className="sm:hidden w-full">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Implementation Plan
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.round((chatState.messages.filter(m => m.type === 'assistant' && m.metadata?.isComplete).length / 4) * 100)}%` 
                  }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {Math.round((chatState.messages.filter(m => m.type === 'assistant' && m.metadata?.isComplete).length / 4) * 100)}%
              </span>
            </div>
          </div>
          
          {/* Mobile Status */}
          <div className="mt-2 text-sm text-gray-600">
            {chatState.currentPhase === 'idle' && 'Ready to start generation'}
            {chatState.currentPhase === 'generating-outline' && 'Generating plan outline...'}
            {chatState.currentPhase === 'awaiting-approval' && 'Waiting for your approval'}
            {chatState.currentPhase === 'generating-plan' && 'Creating detailed plan...'}
            {chatState.currentPhase === 'completed' && 'Plan generation complete!'}
            {chatState.currentPhase === 'error' && 'An error occurred'}
          </div>
        </div>
      </div>

      {/* Chat Content Area */}
      <div className="flex-1 flex flex-col">
        <ChatContentArea
          messages={chatState.messages}
          onApproval={onApproval}
          isStreaming={chatState.isStreaming}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default ChatLayout;