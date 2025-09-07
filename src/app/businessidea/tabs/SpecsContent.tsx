import React, { useState } from 'react';
import { useSpecsGenerator } from '../../../features/specs-generator/useSpecsGenerator';
import { useImplementationPlan } from '../../../features/implementation-plan/useImplementationPlan';
import { useChatbox } from '../../../components/chatbox/ChatboxProvider';
import { useSpecsDerivations } from '../../../features/specs-generator/hooks/useSpecsDerivations';
import { SpecsContentView } from '../../../features/specs-generator/components/SpecsContentView';
import { SpecsSettingsDialog } from '../../../features/specs-generator/components/SpecsSettingsDialog';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useBusinessSuggestion } from '../../../contexts/BusinessSuggestionContext';
import { useEffect } from 'react';

export function SpecsContent() {
  const { state, settings, actions } = useSpecsGenerator();
  const { plan } = useImplementationPlan();
  const { config, createConversation, addMessageToConversation, openConversation } = useChatbox();
  const { outlinePreview, warnings, profileInfo } = useSpecsDerivations(settings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [source, setSource] = useState<'plan' | 'suggestion'>('suggestion');
  const { activeSuggestion, suggestions, setActiveSuggestion } = useBusinessSuggestion();

  // Auto-select first available suggestion when source is 'suggestion' and none is active
  useEffect(() => {
    if (source === 'suggestion' && !activeSuggestion && suggestions && suggestions.length > 0) {
      setActiveSuggestion(suggestions[0]);
    }
  }, [source, activeSuggestion, suggestions, setActiveSuggestion]);
  
  // Check for prerequisites
  const errors: string[] = [];
  
  // Check if required source inputs are available
  const planText = plan?.formattedContent || plan?.textContent || '';
  if (source === 'plan') {
    if (!planText.trim()) {
      errors.push('No implementation plan found. Please generate an implementation plan first in the List tab.');
    }
  } else if (source === 'suggestion') {
    const effectiveSuggestion = activeSuggestion ?? (suggestions && suggestions[0]);
    const hasDesc = !!effectiveSuggestion?.description && effectiveSuggestion.description.trim().length > 0;
    const hasFeatures = Array.isArray(effectiveSuggestion?.keyFeatures) && effectiveSuggestion!.keyFeatures.length > 0;
    if (!hasDesc || !hasFeatures) {
      errors.push('No business suggestion selected. Please pick a suggestion (with description and key features).');
    }
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
    const effectiveSuggestion = source === 'suggestion'
      ? (activeSuggestion ?? (suggestions && suggestions[0]))
      : undefined;
    actions.generate({
      streaming: true,
      source,
      suggestion: source === 'suggestion' && effectiveSuggestion
        ? { description: effectiveSuggestion.description, keyFeatures: effectiveSuggestion.keyFeatures?.slice(0, 3) || [] }
        : undefined
    });
  };
  
  const handleCancel = () => {
    actions.cancel();
  };
  
  const handleRegenerate = () => {
    const effectiveSuggestion = source === 'suggestion'
      ? (activeSuggestion ?? (suggestions && suggestions[0]))
      : undefined;
    actions.generate({
      streaming: true,
      source,
      suggestion: source === 'suggestion' && effectiveSuggestion
        ? { description: effectiveSuggestion.description, keyFeatures: effectiveSuggestion.keyFeatures?.slice(0, 3) || [] }
        : undefined
    });
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
