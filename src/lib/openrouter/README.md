# OpenRouter Client with Web Search Transparency

This module provides an enhanced OpenRouter client with web search transparency features.

## Features

- **Web Search Tracking**: Real-time tracking of web search operations
- **Source Visibility**: See which websites were visited during a search
- **Progress Monitoring**: Track the status of web search operations
- **Debug Integration**: Enhanced logging for debugging web search operations

## Components

### SearchTracker

The `SearchTracker` class is responsible for tracking web search operations:

```typescript
import { SearchTracker } from './search-tracker';

const searchId = `search-${Date.now()}`;
const searchTracker = new SearchTracker(searchId);

// Start tracking
searchTracker.start();

// Log visited sources
searchTracker.logSource('https://example.com', 'Example Site', 'This is an example site');

// Complete tracking
searchTracker.complete();

// Get search metadata
const metadata = searchTracker.getSearchMetadata();
```

### WebSearchMetadata

The `WebSearchMetadata` interface defines the structure of search metadata:

```typescript
interface WebSearchMetadata {
  status: 'queued' | 'active' | 'processing' | 'completed' | 'failed';
  visitedSources: {
    url: string;
    domain: string;
    title?: string;
    snippet?: string;
  }[];
  stats: {
    totalVisited: number;
    uniqueDomains: number;
    startedAt: Date;
    completedAt?: Date;
  };
}
```

## Usage

### Basic Usage

```typescript
import { OpenRouterClient } from './openrouter';

const client = new OpenRouterClient('your-api-key');

const response = await client.chatWithWebSearch([
  { role: 'user', content: 'What is the weather like today?' }
]);

if (response.searchMetadata) {
  console.log(`Search status: ${response.searchMetadata.status}`);
  console.log(`Visited ${response.searchMetadata.stats.totalVisited} sources`);
  console.log(`Unique domains: ${response.searchMetadata.stats.uniqueDomains}`);
  
  response.searchMetadata.visitedSources.forEach(source => {
    console.log(`Visited: ${source.url} (${source.domain})`);
  });
}
```

### Debug Usage

```typescript
import { DebugOpenRouterClient } from './openrouter';

const client = new DebugOpenRouterClient('your-api-key');

const response = await client.chatWithWebSearch([
  { role: 'user', content: 'What is the weather like today?' }
]);

// Debug logs will automatically show search progress
```

## Future Enhancements

- Integration with OpenRouter API to extract actual search metadata
- Real-time progress updates
- Source credibility scoring
- Caching for repeated queries
