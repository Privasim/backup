# Human vs AI Cost Analysis - Technical Design

## Architecture Overview

### System Components
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   QuizFormPanel │───▶│ CostAnalysisService │───▶│   ResultsPanel  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   External APIs   │
                    │  ┌─────────────┐  │
                    │  │   BLS API   │  │
                    │  │ PayScale API│  │
                    │  │ OpenRouter  │  │
                    │  └─────────────┘  │
                    └──────────────────┘
```

## Module Structure

### Core Directory: `src/lib/cost-analysis/`
```
src/lib/cost-analysis/
├── index.ts                 # Public API exports
├── service/
│   ├── CostAnalysisService.ts    # Main service orchestrator
│   ├── SalaryDataService.ts      # BLS/PayScale integration
│   ├── AICostService.ts          # AI pricing calculations
│   └── LLMAnalysisService.ts     # OpenRouter analysis
├── providers/
│   ├── BLSProvider.ts            # Bureau of Labor Statistics API
│   ├── PayScaleProvider.ts       # PayScale API integration
│   └── OpenRouterProvider.ts     # OpenRouter cost analysis
├── utils/
│   ├── cost-calculations.ts      # Cost calculation utilities
│   ├── data-validation.ts        # API response validation
│   └── cache-manager.ts          # Caching strategies
├── types/
│   ├── api-types.ts              # External API type definitions
│   ├── cost-types.ts             # Cost analysis types
│   └── index.ts                  # Type exports
└── __tests__/
    ├── service.test.ts           # Service layer tests
    ├── providers.test.ts         # API provider tests
    └── utils.test.ts             # Utility function tests
```

### Component Structure: `src/components/cost-analysis/`
```
src/components/cost-analysis/
├── index.ts                      # Component exports
├── CostComparisonChart.tsx       # D3 visualization component
├── CostAnalysisSection.tsx       # Results panel section
└── __tests__/
    └── components.test.tsx       # Component tests
```

## Data Flow Design

### 1. Analysis Trigger
```typescript
// QuizFormPanel completion triggers analysis
const handleAnalysisComplete = async (results: AssessmentResult) => {
  const costAnalysis = await costAnalysisService.analyze({
    occupation: quizData.jobDescription,
    experience: quizData.experience,
    location: quizData.location,
    industry: quizData.industry,
    salaryRange: quizData.salaryRange,
    skills: quizData.skillSet
  });
  
  setCostData(costAnalysis);
};
```

### 2. Service Orchestration
```typescript
class CostAnalysisService {
  async analyze(profile: UserProfile): Promise<CostAnalysis> {
    // 1. Get salary data from multiple sources
    const salaryData = await this.salaryService.getSalaryData(profile);
    
    // 2. Calculate AI costs for equivalent tasks
    const aiCosts = await this.aiCostService.calculateAICosts(profile);
    
    // 3. Generate LLM analysis and insights
    const analysis = await this.llmService.generateAnalysis(salaryData, aiCosts, profile);
    
    // 4. Return structured cost comparison
    return this.buildCostComparison(salaryData, aiCosts, analysis);
  }
}
```

### 3. API Integration Pattern
```typescript
interface APIProvider<T> {
  fetchData(params: any): Promise<T>;
  validateResponse(response: any): boolean;
  handleError(error: Error): T | null;
}

class BLSProvider implements APIProvider<SalaryData> {
  async fetchData(occupation: string, location: string): Promise<SalaryData> {
    // BLS API implementation
  }
}
```

## Component Integration

### ResultsPanel Enhancement
```typescript
// Add cost analysis section to existing ResultsPanel
const CostAnalysisSection = ({ costData, isLoading }: CostAnalysisSectionProps) => {
  if (isLoading) return <CostAnalysisLoader />;
  if (!costData) return <CostAnalysisPlaceholder />;
  
  return (
    <div className="cost-analysis-section">
      <CostComparisonChart data={costData} />
      <CostInsights insights={costData.insights} />
    </div>
  );
};
```

### D3 Visualization Design
```typescript
interface CostComparisonChartProps {
  data: {
    humanCost: {
      annual: number;
      breakdown: CostBreakdown;
    };
    aiCost: {
      annual: number;
      breakdown: AICostBreakdown;
    };
    savings: number;
    confidence: number;
  };
  className?: string;
}

// Professional bar chart with:
// - Human cost (salary + benefits)
// - AI cost (tokens + infrastructure)
// - Savings visualization
// - Confidence indicators
// - Interactive tooltips
// - Export functionality
```

## API Integration Specifications

### BLS API Integration
```typescript
interface BLSApiResponse {
  status: string;
  responseTime: number;
  message: string[];
  Results: {
    series: Array<{
      seriesID: string;
      data: Array<{
        year: string;
        period: string;
        periodName: string;
        value: string;
        footnotes: any[];
      }>;
    }>;
  };
}

class BLSProvider {
  private readonly baseUrl = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';
  
  async getOccupationWages(socCode: string, area?: string): Promise<SalaryData> {
    // Implementation with proper error handling and caching
  }
}
```

### PayScale API Integration
```typescript
interface PayScaleApiResponse {
  status: string;
  data: {
    salary: {
      median: number;
      percentile10: number;
      percentile25: number;
      percentile75: number;
      percentile90: number;
    };
    location_factor: number;
    experience_factor: number;
  };
}

class PayScaleProvider {
  async getSalaryData(job: string, location: string, experience: string): Promise<SalaryData> {
    // Implementation with location and experience adjustments
  }
}
```

### OpenRouter Cost Analysis
```typescript
class LLMAnalysisService {
  async generateCostAnalysis(
    salaryData: SalaryData,
    aiCosts: AICostData,
    profile: UserProfile
  ): Promise<CostAnalysisInsights> {
    const prompt = this.buildAnalysisPrompt(salaryData, aiCosts, profile);
    
    const response = await this.openRouterClient.chat({
      model: profile.model,
      messages: [
        { role: 'system', content: COST_ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });
    
    return this.parseAnalysisResponse(response);
  }
}
```

## Error Handling Strategy

### Graceful Degradation
```typescript
class CostAnalysisService {
  async analyze(profile: UserProfile): Promise<CostAnalysis> {
    try {
      // Primary path: Full API integration
      return await this.fullAnalysis(profile);
    } catch (error) {
      // Fallback 1: Use cached data
      const cached = await this.getCachedAnalysis(profile);
      if (cached) return cached;
      
      // Fallback 2: Estimated analysis
      return await this.estimatedAnalysis(profile);
    }
  }
  
  private async estimatedAnalysis(profile: UserProfile): Promise<CostAnalysis> {
    // Use quiz salary ranges and hardcoded AI costs
    // Still provide value with limited data
  }
}
```

### API Rate Limiting
```typescript
class RateLimitManager {
  private limits = new Map<string, { count: number; resetTime: number }>();
  
  async checkRateLimit(provider: string): Promise<boolean> {
    // Implement rate limiting logic
  }
  
  async waitForReset(provider: string): Promise<void> {
    // Implement backoff strategy
  }
}
```

## Caching Strategy

### Multi-Level Caching
```typescript
class CacheManager {
  // Level 1: In-memory cache (session)
  private memoryCache = new Map<string, CachedData>();
  
  // Level 2: Local storage (persistent)
  private persistentCache = new LocalStorageCache();
  
  async get<T>(key: string): Promise<T | null> {
    // Check memory first, then persistent storage
  }
  
  async set<T>(key: string, data: T, ttl: number): Promise<void> {
    // Store in both levels with appropriate TTL
  }
}
```

## Testing Strategy

### Unit Tests
- API provider response handling
- Cost calculation accuracy
- Error handling scenarios
- Cache functionality

### Integration Tests
- End-to-end cost analysis flow
- API failure scenarios
- Data validation
- Component rendering

### Performance Tests
- API response times
- Cache hit rates
- Memory usage
- Concurrent request handling

## Security Considerations

### API Key Management
```typescript
class APIKeyManager {
  private keys = {
    bls: process.env.BLS_API_KEY,
    payscale: process.env.PAYSCALE_API_KEY,
    // OpenRouter key comes from user input
  };
  
  getKey(provider: string): string | null {
    // Secure key retrieval with validation
  }
}
```

### Data Privacy
- No storage of personal salary information
- Anonymized API requests where possible
- Clear data retention policies
- GDPR compliance considerations