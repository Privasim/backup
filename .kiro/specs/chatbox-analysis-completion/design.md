# Chatbox Analysis Completion - Technical Design

## Architecture Overview

### Current System State (95% Complete)
```
┌─────────────────┐    ✅ ┌──────────────────┐    ✅ ┌─────────────────┐
│   ProfilePanel  │────▶│  ChatboxProvider │────▶│   ChatboxPanel  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                     ✅ ┌──────────────────┐
                        │  AnalysisService │
                        └──────────────────┘
                               │
                               ▼
                     ✅ ┌──────────────────┐
                        │ProfileAnalysisProvider│
                        └──────────────────┘
```

### Missing Components (5% Remaining)
```
❌ useCacheManager ──┐
❌ error-handler ────┼──▶ Complete System
❌ ProfileAnalyzer ──┤
❌ initialization ───┤
❌ auto-integration ─┘
```

## Component Design Specifications

### 1. Cache Manager Hook (`useCacheManager.ts`)

#### Architecture
```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface LRUCache<T> {
  capacity: number;
  size: number;
  cache: Map<string, CacheEntry<T>>;
  accessOrder: string[];
}

class CacheManager {
  private analysisCache: LRUCache<AnalysisResult>;
  private profileHashCache: Map<string, string>;
  
  constructor(capacity = 50, defaultTTL = 3600000) { // 1 hour TTL
    this.analysisCache = {
      capacity,
      size: 0,
      cache: new Map(),
      accessOrder: []
    };
  }
}
```

#### Implementation Strategy
```typescript
export const useCacheManager = () => {
  const cacheManager = useRef(new CacheManager()).current;
  
  const getCachedResult = useCallback(async (
    config: AnalysisConfig, 
    profileHash?: string
  ): Promise<AnalysisResult | null> => {
    const cacheKey = generateCacheKey(config, profileHash);
    return cacheManager.get(cacheKey);
  }, [cacheManager]);
  
  const cacheResult = useCallback(async (
    config: AnalysisConfig,
    profileHash: string | undefined,
    result: AnalysisResult
  ): Promise<void> => {
    const cacheKey = generateCacheKey(config, profileHash);
    cacheManager.set(cacheKey, result);
  }, [cacheManager]);
  
  // LRU eviction, TTL cleanup, memory management
};
```

### 2. Error Handler Utility (`error-handler.ts`)

#### Error Classification System
```typescript
enum ErrorCategory {
  NETWORK = 'network',
  API_KEY = 'api_key',
  RATE_LIMIT = 'rate_limit',
  VALIDATION = 'validation',
  SYSTEM = 'system'
}

interface UserFriendlyError {
  category: ErrorCategory;
  title: string;
  message: string;
  actionable: boolean;
  retryable: boolean;
  suggestedAction?: string;
}

const ERROR_MAPPINGS: Record<string, UserFriendlyError> = {
  'API key': {
    category: ErrorCategory.API_KEY,
    title: 'Invalid API Key',
    message: 'Your OpenRouter API key appears to be invalid or expired.',
    actionable: true,
    retryable: false,
    suggestedAction: 'Please check your API key and try again.'
  },
  // ... more mappings
};
```

#### Retry Logic Implementation
```typescript
interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: ErrorCategory[];
}

class ErrorHandler {
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    options: RetryOptions = DEFAULT_RETRY_OPTIONS
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        const errorCategory = this.categorizeError(error);
        if (!options.retryableErrors.includes(errorCategory)) {
          throw error; // Don't retry non-retryable errors
        }
        
        if (attempt === options.maxAttempts) {
          throw error; // Last attempt failed
        }
        
        const delay = Math.min(
          options.baseDelay * Math.pow(options.backoffFactor, attempt - 1),
          options.maxDelay
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
}
```

### 3. ProfileAnalyzer Wrapper (`ProfileAnalyzer.ts`)

#### Consistent API Design
```typescript
export class ProfileAnalyzer {
  private provider: AnalysisProvider;
  private errorHandler: ErrorHandler;
  
  constructor() {
    this.provider = createProfileAnalysisProvider();
    this.errorHandler = new ErrorHandler();
  }
  
  async analyze(
    config: AnalysisConfig, 
    profileData: ProfileFormData
  ): Promise<AnalysisResult> {
    return this.errorHandler.retryWithBackoff(
      () => this.provider.analyze(config, profileData),
      {
        maxAttempts: 3,
        baseDelay: 1000,
        retryableErrors: [ErrorCategory.NETWORK, ErrorCategory.RATE_LIMIT]
      }
    );
  }
  
  async analyzeStreaming(
    config: AnalysisConfig,
    profileData: ProfileFormData,
    onChunk: (chunk: string) => void
  ): Promise<AnalysisResult> {
    // Streaming with error handling
    const provider = this.provider as any;
    if (provider.analyzeStreaming) {
      return provider.analyzeStreaming(config, profileData, onChunk);
    }
    
    // Fallback to non-streaming
    const result = await this.analyze(config, profileData);
    onChunk(result.content);
    return result;
  }
}

export const createProfileAnalyzer = (): ProfileAnalyzer => {
  return new ProfileAnalyzer();
};
```

### 4. System Initialization (`initialization.ts`)

#### Provider Registration System
```typescript
interface InitializationConfig {
  enableAutoAnalysis: boolean;
  cacheConfig: {
    capacity: number;
    defaultTTL: number;
  };
  errorHandling: {
    maxRetries: number;
    baseDelay: number;
  };
}

class ChatboxInitializer {
  private static initialized = false;
  
  static async initialize(config: Partial<InitializationConfig> = {}): Promise<void> {
    if (this.initialized) return;
    
    const fullConfig: InitializationConfig = {
      enableAutoAnalysis: true,
      cacheConfig: {
        capacity: 50,
        defaultTTL: 3600000 // 1 hour
      },
      errorHandling: {
        maxRetries: 3,
        baseDelay: 1000
      },
      ...config
    };
    
    // Register providers
    const profileProvider = createProfileAnalysisProvider();
    analysisService.registerProvider(profileProvider, true);
    
    // Initialize cache manager
    // Set up error handling
    // Configure auto-analysis
    
    this.initialized = true;
  }
}

export const initializeChatboxSystem = ChatboxInitializer.initialize;
```

### 5. Auto-Analysis Integration

#### ProfileContext Enhancement
```typescript
// In ProfileContext.tsx - saveProfile method enhancement
const saveProfile = useCallback(() => {
  if (!profileFormData) {
    return false;
  }
  
  try {
    const result = validateCompleteProfile(profileFormData);
    if (!result.success) {
      const validationErrors: ValidationError[] = result.error.issues?.map((err: any) => ({
        field: err.path?.join('.') || 'unknown',
        message: err.message || 'Validation error'
      })) || [];
      setErrors(validationErrors);
      return false;
    }
    
    const saveSuccess = ProfileStorage.saveCompleted(profileFormData);
    
    // Enhanced chatbox integration with error handling
    if (saveSuccess) {
      // Use dynamic import to avoid circular dependencies
      import('@/components/chatbox/services/ProfileIntegrationService')
        .then(({ profileIntegrationService }) => {
          return profileIntegrationService.handleProfileSave(profileFormData);
        })
        .catch(error => {
          // Log error but don't break profile save
          console.warn('Auto-analysis trigger failed:', error);
          
          // Optional: Show user notification about analysis failure
          // but don't prevent profile completion
        });
    }
    
    return saveSuccess;
  } catch (error) {
    console.error('Save profile error:', error);
    setErrors([{ field: 'general', message: 'Failed to save profile' }]);
    return false;
  }
}, [profileFormData]);
```

## Integration Architecture

### Data Flow Enhancement
```
Profile Completion
       │
       ▼
ProfileContext.saveProfile()
       │
       ▼
ProfileIntegrationService.handleProfileSave()
       │
       ▼
ChatboxProvider.startAnalysis()
       │
       ▼
useCacheManager.getCachedResult() ──┐
       │                            │
       ▼                            │
AnalysisService.analyze()            │
       │                            │
       ▼                            │
ProfileAnalyzer.analyze() ───────────┤
       │                            │
       ▼                            │
OpenRouter API Call                  │
       │                            │
       ▼                            │
useCacheManager.cacheResult() ◄──────┘
       │
       ▼
ChatboxPanel.displayResults()
```

### Error Handling Flow
```
Error Occurs
     │
     ▼
ErrorHandler.categorizeError()
     │
     ▼
Is Retryable? ──No──▶ UserFriendlyError
     │
    Yes
     │
     ▼
RetryWithBackoff()
     │
     ▼
Success? ──No──▶ UserFriendlyError
     │
    Yes
     │
     ▼
Continue Normal Flow
```

## Performance Considerations

### Cache Optimization
- **LRU Eviction**: Remove least recently used items when capacity reached
- **TTL Cleanup**: Background cleanup of expired entries
- **Memory Monitoring**: Track cache size and implement size-based eviction
- **Hit Rate Tracking**: Monitor cache effectiveness

### Error Handling Optimization
- **Fast Failure**: Quick detection of non-retryable errors
- **Exponential Backoff**: Prevent API hammering during failures
- **Circuit Breaker**: Temporarily disable failing services
- **Error Aggregation**: Batch similar errors to reduce noise

### Integration Performance
- **Lazy Loading**: Dynamic imports to avoid circular dependencies
- **Async Operations**: Non-blocking profile save operations
- **Error Isolation**: Prevent analysis failures from breaking profile workflow
- **Progressive Enhancement**: System works without auto-analysis

## Testing Strategy

### Unit Testing
```typescript
describe('useCacheManager', () => {
  it('should cache and retrieve analysis results', async () => {
    const { result } = renderHook(() => useCacheManager());
    
    const config = { /* test config */ };
    const analysisResult = { /* test result */ };
    
    await act(async () => {
      await result.current.cacheResult(config, 'hash123', analysisResult);
    });
    
    const cached = await result.current.getCachedResult(config, 'hash123');
    expect(cached).toEqual(analysisResult);
  });
  
  it('should implement LRU eviction', async () => {
    // Test LRU behavior
  });
  
  it('should handle TTL expiration', async () => {
    // Test TTL cleanup
  });
});
```

### Integration Testing
```typescript
describe('Auto-Analysis Integration', () => {
  it('should trigger analysis on profile completion', async () => {
    const mockProfileData = createMockProfileData();
    const mockAnalysisService = jest.fn();
    
    // Test profile save triggers analysis
    // Test error handling doesn't break profile save
    // Test cache integration works correctly
  });
});
```

## Security Considerations

### Cache Security
- **Data Sanitization**: Sanitize cached data to prevent XSS
- **Size Limits**: Prevent memory exhaustion attacks
- **TTL Enforcement**: Ensure sensitive data expires appropriately

### Error Handling Security
- **Information Disclosure**: Avoid exposing sensitive error details
- **Rate Limiting**: Prevent error-based DoS attacks
- **Logging Security**: Sanitize logs to prevent injection

### Integration Security
- **Dependency Isolation**: Prevent circular dependency vulnerabilities
- **Error Propagation**: Control error information flow
- **Resource Management**: Prevent resource leaks in error scenarios

## Deployment Considerations

### Initialization
- **App Startup**: Initialize chatbox system during app bootstrap
- **Lazy Initialization**: Initialize on first use if preferred
- **Configuration**: Environment-based configuration support

### Monitoring
- **Cache Metrics**: Monitor cache hit rates and performance
- **Error Rates**: Track error frequencies and categories
- **Performance Metrics**: Monitor analysis times and success rates

### Rollback Strategy
- **Feature Flags**: Ability to disable auto-analysis
- **Graceful Degradation**: System works without new components
- **Backward Compatibility**: No breaking changes to existing functionality