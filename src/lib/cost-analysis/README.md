# Human vs AI Cost Analysis Module

A comprehensive cost analysis system that compares the annual costs of human workers versus AI automation for specific job roles and tasks.

## Features

- **Real API Integration**: Uses BLS.gov and PayScale APIs for accurate salary data
- **AI Cost Calculation**: Calculates AI implementation costs using OpenRouter pricing
- **LLM-Powered Insights**: Generates contextual analysis using existing OpenRouter client
- **Professional Visualization**: D3.js chart with interactive tooltips and SVG export
- **Multi-level Caching**: Memory and localStorage caching for performance
- **Fallback Strategies**: Graceful degradation when APIs are unavailable
- **TypeScript**: Full type safety throughout the module

## Architecture

```
src/lib/cost-analysis/
├── types/              # Type definitions
├── utils/              # Utilities (cache, validation, calculations)
├── providers/          # API providers (BLS, PayScale, OpenRouter)
├── service/            # Service layer (orchestration and business logic)
└── __tests__/          # Test files
```

## Usage

### Basic Cost Analysis

```typescript
import { CostAnalysisService, UserProfile } from '@/lib/cost-analysis';

const costService = new CostAnalysisService({
  openRouter: 'your-openrouter-api-key',
  payScale: 'your-payscale-api-key', // optional
});

const userProfile: UserProfile = {
  occupation: 'software-developer',
  experience: 'mid-level',
  location: 'san francisco',
  industry: 'technology',
  salaryRange: '$80k–$100k',
  skills: ['JavaScript', 'React', 'Node.js'],
};

const analysis = await costService.analyze(userProfile);
console.log(`Human cost: $${analysis.comparison.human.total}`);
console.log(`AI cost: $${analysis.comparison.ai.total}`);
console.log(`Savings: $${analysis.comparison.savings.absolute}`);
```

### Quick Comparison

```typescript
const quickResult = await costService.quickComparison(userProfile);
console.log(`Potential savings: $${quickResult.savings}`);
```

### React Component Integration

```tsx
import { CostAnalysisSection } from '@/components/cost-analysis';

function MyComponent() {
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <CostAnalysisSection
      costData={costData}
      isLoading={loading}
      className="w-full"
    />
  );
}
```

## API Providers

### BLS Provider
- **Source**: U.S. Bureau of Labor Statistics
- **Data**: Occupation wages and employment statistics
- **Rate Limit**: Public API, no key required
- **Reliability**: High (government data)

### PayScale Provider
- **Source**: PayScale API
- **Data**: Location and experience-adjusted salaries
- **Rate Limit**: Varies by plan
- **Reliability**: Medium (requires API key)

### OpenRouter Provider
- **Source**: OpenRouter LLM API
- **Data**: Cost analysis insights and task frequency estimates
- **Rate Limit**: Based on user's API key
- **Reliability**: Medium (depends on model availability)

## Cost Calculation Methodology

### Human Costs
```
Base Salary (from BLS/PayScale)
× Location Adjustment (if available)
× Experience Adjustment (if available)
+ Benefits (30% of salary)
+ Overhead (20% of salary + benefits)
= Total Human Cost
```

### AI Costs
```
Token Usage (tasks/day × tokens/task × working days)
× Model Pricing (prompt + completion tokens)
+ Infrastructure Costs ($50/month base)
+ Maintenance Costs ($1200/year)
= Total AI Cost
```

### Confidence Scoring
- **Salary Data Confidence**: Based on data source and sample size
- **AI Cost Confidence**: Based on task predictability and automation potential
- **Overall Confidence**: Weighted average of component confidences

## Caching Strategy

### Memory Cache
- **Duration**: Session-based
- **Size Limit**: 100 items
- **Eviction**: LRU (Least Recently Used)

### Persistent Cache
- **Storage**: localStorage
- **Duration**: 24 hours for salary data, 1 hour for AI costs
- **Size Limit**: 200 items

### Cache Keys
- **Salary**: `salary:{occupation}:{location}:{experience}`
- **AI Cost**: `ai_cost:{model}:{occupation}`
- **Analysis**: `analysis:{profile_hash}`

## Error Handling

### Graceful Degradation
1. **Primary**: Real API data with high confidence
2. **Fallback 1**: Cached data from previous requests
3. **Fallback 2**: Estimated data based on industry standards

### Error Types
- **API Errors**: Network failures, rate limits, invalid responses
- **Validation Errors**: Invalid input data or malformed responses
- **Calculation Errors**: Mathematical errors or invalid assumptions

## Testing

```bash
# Run all tests
npm test src/lib/cost-analysis

# Run integration tests
npm test src/lib/cost-analysis/__tests__/integration.test.ts

# Run with coverage
npm test -- --coverage src/lib/cost-analysis
```

## Performance Considerations

### Optimization Strategies
- **Parallel API Calls**: Salary and AI cost data fetched simultaneously
- **Aggressive Caching**: Multiple cache levels with appropriate TTLs
- **Request Batching**: Multiple analyses can reuse cached components
- **Lazy Loading**: Components only load when needed

### Benchmarks
- **Cold Start**: ~3 seconds (with API calls)
- **Warm Cache**: ~100ms (cached data)
- **Memory Usage**: ~2MB for full analysis with caching

## Security

### API Key Management
- **User Keys**: OpenRouter API key provided by user, not stored
- **Server Keys**: PayScale API key stored in environment variables
- **Validation**: All API keys validated before use

### Data Privacy
- **No PII Storage**: Personal salary information not cached
- **Anonymized Requests**: API requests don't include personal identifiers
- **Local Storage**: Only aggregated, non-personal data cached

## Configuration

### Environment Variables
```bash
# Optional: PayScale API key for enhanced salary data
NEXT_PUBLIC_PAYSCALE_API_KEY=your_payscale_key

# Optional: BLS API key for higher rate limits
NEXT_PUBLIC_BLS_API_KEY=your_bls_key
```

### Service Options
```typescript
const options: CostAnalysisOptions = {
  useCache: true,              // Enable caching
  cacheTTL: 3600000,          // Cache TTL in milliseconds
  fallbackToEstimates: true,   // Use estimates when APIs fail
  includeInsights: true,       // Generate LLM insights
  confidenceThreshold: 0.5,    // Minimum confidence for results
};
```

## Troubleshooting

### Common Issues

**"No salary data found"**
- Check occupation spelling and format
- Verify BLS/PayScale API availability
- Enable fallback to estimates

**"AI cost calculation failed"**
- Verify OpenRouter API key is valid
- Check model availability and pricing
- Review task estimation parameters

**"Low confidence results"**
- Increase confidence threshold
- Use more specific occupation titles
- Verify location and experience data

### Debug Logging
```typescript
import { debugLog } from '@/components/debug/DebugConsole';

// Enable debug logging
debugLog.info('CostAnalysis', 'Starting analysis', { occupation });
```

## Contributing

### Adding New API Providers
1. Implement the `APIProvider<T>` interface
2. Add provider to the service constructor
3. Update fallback strategies
4. Add comprehensive tests

### Extending Cost Models
1. Update calculation utilities in `utils/cost-calculations.ts`
2. Add new cost factors to type definitions
3. Update visualization components
4. Document methodology changes

## License

This module is part of the AI Career Risk Assessment application and follows the same license terms.