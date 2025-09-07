import React, { useState } from 'react';
import { useSpecsGenerator } from '../../../features/specs-generator/useSpecsGenerator';
import { useImplementationPlan } from '../../../features/implementation-plan/useImplementationPlan';
import { useChatbox } from '../../../components/chatbox/ChatboxProvider';
import { useSpecsDerivations } from '../../../features/specs-generator/hooks/useSpecsDerivations';
import { SpecsContentView } from '../../../features/specs-generator/components/SpecsContentView';
import { SpecsSettingsDialog } from '../../../features/specs-generator/components/SpecsSettingsDialog';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export function SpecsContent() {
  const { state, settings, actions } = useSpecsGenerator();
  const { plan } = useImplementationPlan();
  const { config, createConversation, addMessageToConversation, openConversation } = useChatbox();
  const { outlinePreview, warnings, profileInfo } = useSpecsDerivations(settings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [source, setSource] = useState<'plan' | 'suggestion'>('plan');
  
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
    actions.generate({ streaming: true, source });
  };
  
  const handleCancel = () => {
    actions.cancel();
  };
  
  const handleRegenerate = () => {
    actions.generate({ streaming: true, source });
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
    <section className="rounded-2xl bg-white/90 p-3 shadow-sm backdrop-blur max-w-4xl mx-auto">
      <div className="mb-3 flex justify-between items-start">
        <div>
          <h1 className="text-sm font-semibold text-primary">Technical Specification Generator</h1>
          <p className="mt-1 text-sm text-secondary">
            Generate technical specifications from your selected source
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setSource('plan')}
                className={[
                  'px-3 py-1.5 text-xs font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  source === 'plan' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 text-gray-700'
                ].join(' ')}
                aria-pressed={source === 'plan'}
                aria-label="Use Implementation Plan as source"
              >
                Plan
              </button>
              <button
                type="button"
                onClick={() => setSource('suggestion')}
                className={[
                  'px-3 py-1.5 text-xs font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  source === 'suggestion' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 text-gray-700'
                ].join(' ')}
                aria-pressed={source === 'suggestion'}
                aria-label="Use Business Suggestion as source"
              >
                Suggestion
              </button>
            </div>
            <span className="text-xs text-secondary">Generating from: {source === 'plan' ? 'Implementation Plan' : 'Business Suggestion'}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 text-primary focus-ring transition"
          aria-label="Specification settings"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </div>
      
      {/* Settings Dialog */}
      <SpecsSettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Content View */}
      <SpecsContentView
        status={state.status}
        preview={state.preview}
        result={state.result}
        errors={errors}
        outlinePreview={outlinePreview}
        warnings={warnings}
        profileInfo={profileInfo}
        onGenerate={handleGenerate}
        onCancel={handleCancel}
        onRegenerate={handleRegenerate}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onOpenInChat={handleOpenInChat}
      />
    </section>
  );
}
