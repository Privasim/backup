import { buildMessages } from '../promptBuilder';

describe('promptBuilder', () => {
  const mockSuggestion = {
    title: 'Test Business Idea',
    category: 'Tech',
    description: 'A test business idea'
  };

  describe('buildMessages', () => {
    it('should include compact mode directive when enabled', () => {
      const result = buildMessages({
        suggestion: mockSuggestion,
        compactMode: true,
        compactMaxPhaseCards: 3
      });

      expect(result.systemMessage.content).toContain('Produce at most 3 clearly separated phases');
      expect(result.systemMessage.content).toContain('Keep content concise and focused');
    });

    it('should not include compact mode directive when disabled', () => {
      const result = buildMessages({
        suggestion: mockSuggestion,
        compactMode: false
      });

      expect(result.systemMessage.content).not.toContain('Produce at most');
      expect(result.systemMessage.content).not.toContain('Keep content concise and focused');
    });

    it('should use default max phase cards when not specified', () => {
      const result = buildMessages({
        suggestion: mockSuggestion,
        compactMode: true
      });

      expect(result.systemMessage.content).toContain('Produce at most 4 clearly separated phases');
    });
  });
});
