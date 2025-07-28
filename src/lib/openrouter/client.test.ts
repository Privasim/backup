import { OpenRouterClient } from './client';

// Mock the fetch function
global.fetch = jest.fn();

describe('OpenRouterClient', () => {
  const apiKey = 'test-api-key';
  let client: OpenRouterClient;

  beforeEach(() => {
    client = new OpenRouterClient(apiKey);
    (fetch as jest.Mock).mockClear();
  });

  describe('chatWithWebSearch', () => {
    it('should create a search tracker and attach metadata to response', async () => {
      // Mock response from OpenRouter API
      const mockResponse = {
        id: 'test-response-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'test-model',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Test response',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const messages = [
        { role: 'user', content: 'Test message' },
      ];

      const response = await client.chatWithWebSearch(messages);
      
      // Verify the response structure
      expect(response).toEqual({
        ...mockResponse,
        searchMetadata: expect.objectContaining({
          status: 'completed',
          visitedSources: expect.any(Array),
          stats: expect.objectContaining({
            totalVisited: expect.any(Number),
            uniqueDomains: expect.any(Number),
            startedAt: expect.any(Date),
            completedAt: expect.any(Date),
          }),
        }),
      });

      // Verify that search metadata was attached
      expect(response.searchMetadata).toBeDefined();
      expect(response.searchMetadata!.status).toBe('completed');
      expect(response.searchMetadata!.visitedSources).toEqual([]);
      expect(response.searchMetadata!.stats.totalVisited).toBe(0);
      expect(response.searchMetadata!.stats.uniqueDomains).toBe(0);
      expect(response.searchMetadata!.stats.startedAt).toBeInstanceOf(Date);
      expect(response.searchMetadata!.stats.completedAt).toBeInstanceOf(Date);
    });

    it('should make a request with web_search enabled', async () => {
      const mockResponse = {
        id: 'test-response-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'test-model',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Test response',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const messages = [
        { role: 'user', content: 'Test message' },
      ];

      await client.chatWithWebSearch(messages);

      // Verify that fetch was called with the correct parameters
      expect(fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('"web_search":true'),
        })
      );
    });
  });
});
