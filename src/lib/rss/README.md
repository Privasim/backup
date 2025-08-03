# RSS Feed Integration

A comprehensive RSS feed processing system for job loss tracking with AI-powered analysis and intelligent filtering.

## Overview

This module provides a complete RSS feed integration solution that:
- Parses RSS feeds in multiple formats (RSS 2.0, Atom 1.0, RSS 1.0)
- Filters content for job loss relevance using keyword matching
- Removes duplicate articles using multiple strategies
- Integrates with OpenRouter for AI-powered content analysis
- Provides a robust error handling and retry system

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RSS Feed Integration                      │
├─────────────────────────────────────────────────────────────┤
│  RSSFeedService  │  RelevanceFilter  │  DeduplicationService │
├─────────────────────────────────────────────────────────────┤
│              AI Content Analysis Layer                       │
├─────────────────────────────────────────────────────────────┤
│                  User-Configured RSS Feed                   │
└─────────────────────────────────────────────────────────────┘
```

## Core Services

### RSSFeedService

Handles RSS feed parsing with robust error handling and retry mechanisms.

```typescript
import { rssFeedService } from '@/lib/rss';

// Validate RSS feed URL
const isValid = await rssFeedService.validateFeedUrl('https://example.com/feed.xml');

// Parse RSS feed with automatic retry
const feedData = await rssFeedService.parseFeed('https://example.com/feed.xml');
```

**Features:**
- Support for RSS 2.0, Atom 1.0, and RSS 1.0 formats
- Exponential backoff retry mechanism (3 attempts)
- URL validation and normalization
- Comprehensive error handling
- Feed health monitoring

### RelevanceFilterService

Filters articles for job loss relevance using keyword matching and scoring.

```typescript
import { relevanceFilterService } from '@/lib/rss';

// Filter articles for job loss relevance
const relevantArticles = relevanceFilterService.filterRelevantArticles(articles);

// Calculate relevance score for individual article
const score = relevanceFilterService.calculateRelevanceScore(article);
```

**Features:**
- Keyword-based relevance scoring
- Configurable title/description weighting
- Customizable relevance thresholds
- Support for multiple keyword categories

**Default Keywords:**
- Job loss: layoff, layoffs, job loss, unemployment, fired, termination, downsizing
- AI/Automation: artificial intelligence, ai, automation, robot, machine learning
- Industry impact: replace workers, job displacement, workforce automation

### DeduplicationService

Removes duplicate articles using multiple detection strategies.

```typescript
import { deduplicationService } from '@/lib/rss';

// Remove duplicates from article array
const uniqueArticles = deduplicationService.deduplicateArticles(articles);

// Check if two articles are duplicates
const isDuplicate = deduplicationService.areArticlesDuplicate(article1, article2);
```

**Features:**
- GUID-based deduplication
- URL normalization and comparison
- Title similarity detection with time windows
- Configurable similarity thresholds

## UI Components

### Core Components

- **FeedConfigurationPanel**: RSS feed URL configuration and settings
- **ContentFilterControls**: Article filtering and sorting controls
- **ArticleCard**: Individual article display with analysis results
- **VirtualizedArticleList**: Performance-optimized article list rendering
- **RSSJobLossFeed**: Main integration component

### Usage Example

```typescript
import { RSSJobLossFeed } from '@/components/jobloss-feed';

export default function MyPage() {
  return (
    <div>
      <RSSJobLossFeed className="my-custom-class" />
    </div>
  );
}
```

## State Management

The RSS feed integration uses Zustand for state management with persistence:

```typescript
import { useRSSFeedTracker } from '@/hooks/useRSSFeedTracker';

function MyComponent() {
  const {
    // State
    feedConfig,
    articles,
    selectedArticles,
    isLoading,
    
    // Actions
    setFeedConfig,
    loadArticles,
    toggleArticleSelection,
    analyzeSelected,
  } = useRSSFeedTracker();
}
```

## Configuration

### Feed Configuration

```typescript
interface FeedConfig {
  url: string;                    // RSS feed URL
  refreshInterval: number;        // Auto-refresh interval in minutes
  maxArticles: number;           // Maximum articles to process
  filterRelevant: boolean;       // Enable relevance filtering
  autoAnalyze: boolean;          // Auto-analyze relevant articles
}
```

### Relevance Filter Configuration

```typescript
interface RelevanceFilter {
  keywords: string[];            // Keywords to match
  titleWeight: number;           // Title importance (0-1)
  descriptionWeight: number;     // Description importance (0-1)
  minimumScore: number;          // Minimum relevance score (0-1)
}
```

### Deduplication Configuration

```typescript
interface DeduplicationConfig {
  titleSimilarityThreshold: number;  // Title similarity threshold (0-1)
  linkNormalization: boolean;        // Enable URL normalization
  timeWindowHours: number;           // Time window for similarity check
  guidComparison: boolean;           // Enable GUID comparison
}
```

## Error Handling

The system includes comprehensive error handling:

- **Network Errors**: Automatic retry with exponential backoff
- **Parse Errors**: Graceful degradation with error reporting
- **Invalid URLs**: Validation and user feedback
- **Rate Limiting**: Respect for RSS feed server limits

## Performance Optimizations

- **Virtualized Scrolling**: Efficient rendering of large article lists
- **Intelligent Caching**: Multi-level caching for feeds and analysis
- **Lazy Loading**: Progressive loading of article content
- **Debounced Operations**: Optimized user interactions

## Testing

Comprehensive test coverage includes:

- Unit tests for all core services
- Integration tests for complete workflows
- Error scenario testing
- Performance benchmarks

Run tests:
```bash
npm test src/lib/rss
```

## API Integration

### OpenRouter Integration

The system integrates with OpenRouter for AI-powered content analysis:

```typescript
// Analysis is performed automatically on selected articles
const analysisResult = await analyzeSelected();

// Results include:
interface AnalysisResult {
  impactLevel: 'low' | 'medium' | 'high';
  companies: string[];
  industries: string[];
  jobsAffected?: number;
  isAIRelated: boolean;
  isAutomationRelated: boolean;
  keyInsights: string[];
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}
```

## Best Practices

### RSS Feed Selection

Choose RSS feeds that:
- Update regularly (at least daily)
- Cover relevant industries and topics
- Have consistent formatting
- Provide full article content or good summaries

### Recommended Feeds

- **Reuters Business**: `https://feeds.reuters.com/reuters/businessNews`
- **TechCrunch**: `https://techcrunch.com/feed/`
- **Industry Week**: `https://www.industryweek.com/rss.xml`
- **Wall Street Journal**: `https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml`

### Configuration Tips

- Set refresh intervals based on feed update frequency
- Use relevance filtering to reduce noise
- Configure appropriate similarity thresholds for deduplication
- Monitor feed health and adjust settings as needed

## Troubleshooting

### Common Issues

1. **Feed Not Loading**
   - Verify RSS feed URL is valid and accessible
   - Check for CORS issues with the feed provider
   - Ensure feed format is supported (RSS 2.0, Atom 1.0, RSS 1.0)

2. **No Relevant Articles**
   - Adjust relevance filter keywords
   - Lower the minimum relevance score threshold
   - Check if the feed contains job-related content

3. **Duplicate Articles**
   - Adjust deduplication similarity thresholds
   - Enable URL normalization
   - Modify time window settings

4. **Analysis Errors**
   - Verify OpenRouter API key is valid
   - Check API rate limits and quotas
   - Ensure selected articles have sufficient content

### Debug Information

The system provides comprehensive debug logging:

```typescript
import { debugLog } from '@/components/debug/DebugConsole';

// All RSS operations are logged with detailed information
// Check the debug console for troubleshooting information
```

## Contributing

When contributing to the RSS feed integration:

1. Follow TypeScript best practices
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure error handling is robust
5. Test with multiple RSS feed formats

## License

This RSS feed integration is part of the CareerGuard AI platform and follows the same licensing terms.