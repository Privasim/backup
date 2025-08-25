import React from 'react';
import { useSpecsGenerator } from '../../../features/specs-generator/useSpecsGenerator';
import { useImplementationPlan } from '../../../features/implementation-plan/useImplementationPlan';
import { useChatbox } from '../../../components/chatbox/ChatboxProvider';
import { SpecsSettingsPanel } from '../../../features/specs-generator/components/SpecsSettingsPanel';
import { SpecsContentView } from '../../../features/specs-generator/components/SpecsContentView';

export function SpecsContent() {
  const { state, settings, actions } = useSpecsGenerator();
  const { plan } = useImplementationPlan();
  const { config, createConversation, addMessageToConversation, openConversation } = useChatbox();
  
  // Check for prerequisites
  const errors: string[] = [];
  
  // Check if implementation plan is available
  const planText = plan?.formattedContent || plan?.textContent || '';
  if (!planText.trim()) {
    errors.push('No implementation plan found. Please generate an implementation plan first in the List tab.');
  }
  
  // Check if chatbox is configured
  if (!config.apiKey) {
    errors.push('API key is missing. Please configure your API key in the Chatbox settings.');
  }
  
  if (!config.model) {
    errors.push('Model is not selected. Please select a model in the Chatbox settings.');
  }
  
  // Handler functions for actions
  const handleGenerate = () => {
    actions.generate({ streaming: true });
  };
  
  const handleCancel = () => {
    actions.cancel();
  };
  
  const handleRegenerate = () => {
    actions.generate({ streaming: true });
  };
  
  const handleCopy = () => {
    if (state.result?.markdown) {
      navigator.clipboard.writeText(state.result.markdown);
      // In a real implementation, we might show a toast notification here
    }
  };
  
  const handleDownload = () => {
    if (state.result?.markdown) {
      const blob = new Blob([state.result.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `technical-specification-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  const handleOpenInChat = () => {
    if (state.result?.markdown) {
      // Create a new conversation with a descriptive title
      const conversationId = createConversation('Technical Specification: ' + (plan?.meta?.title || 'Untitled'));
      
      // Add the generated specs as a message to the conversation
      addMessageToConversation(conversationId, {
        type: 'user',
        content: `Here is the generated technical specification:\n\n${state.result.markdown}`,
        analysisType: 'business-suggestion'
      });
      
      // Open the newly created conversation
      openConversation(conversationId);
    }
  };
  
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Technical Specification Generator</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Generate technical specifications from your implementation plan
        </p>
      </div>
      
      {/* Settings Panel */}
      <SpecsSettingsPanel
        settings={settings}
        onChangeLength={actions.setLength}
        onChangeSystemPrompt={actions.setSystemPrompt}
        disabled={state.status === 'generating' || state.status === 'streaming'}
      />
      
      {/* Content View */}
      <SpecsContentView
        status={state.status}
        preview={state.preview}
        result={state.result}
        errors={errors}
        onGenerate={handleGenerate}
        onCancel={handleCancel}
        onRegenerate={handleRegenerate}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onOpenInChat={handleOpenInChat}
      />
    </div>
  );
}
