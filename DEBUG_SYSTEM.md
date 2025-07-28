# Debug System Implementation

## Overview

This debug system provides comprehensive logging and monitoring for the AI Career Risk Assessment application. It tracks all API calls, validation steps, analysis progress, and errors in real-time to help diagnose issues during the assessment process.

## Components

### 1. Debug Logger (`src/lib/debug/logger.ts`)
- **Purpose**: Central logging system that captures all application events
- **Features**:
  - Categorized logging (api, validation, analysis, progress, system)
  - Multiple log levels (info, warn, error, success)
  - Timer functionality for performance tracking
  - Data sanitization (hides API keys and sensitive information)
  - Real-time listener system for UI updates

### 2. Debug Panel (`src/components/debug/DebugPanel.tsx`)
- **Purpose**: Interactive UI panel for viewing logs in real-time
- **Features**:
  - Collapsible panel with expand/collapse functionality
  - Filtering by log level and category
  - Real-time log streaming with auto-scroll
  - Export functionality (JSON format)
  - Error count indicators
  - Detailed log entry expansion with data viewing

### 3. Debug Analyzer (`src/lib/assessment/debug-analyzer.ts`)
- **Purpose**: Enhanced version of JobRiskAnalyzer with comprehensive logging
- **Features**:
  - Logs every step of the analysis process
  - Performance timing for each operation
  - Detailed API request/response logging
  - Error tracking with full context

### 4. Debug OpenRouter Client (`src/lib/openrouter/debug-client.ts`)
- **Purpose**: Enhanced OpenRouter client with detailed API logging
- **Features**:
  - Request/response logging with sanitized data
  - HTTP status and error tracking
  - Performance timing for API calls
  - Detailed error context

### 5. Debug Panel Hook (`src/hooks/useDebugPanel.ts`)
- **Purpose**: React hook for managing debug panel state
- **Features**:
  - Panel visibility management
  - Error state tracking
  - Easy integration with components

## Integration

### QuizForm Integration
The debug system is integrated into the main QuizForm component:

```typescript
import { useDebugPanel } from '@/hooks/useDebugPanel';
import DebugPanel from '../debug/DebugPanel';
import { debugLogger } from '@/lib/debug/logger';

// In component
const debugPanel = useDebugPanel();

// Usage
debugLogger.info('system', 'User initiated analysis');

// Render
<DebugPanel 
  isVisible={debugPanel.isVisible}
  onToggle={debugPanel.togglePanel}
/>
```

## Log Categories

### API (`api`)
- OpenRouter API calls and responses
- API key validation
- HTTP status codes and errors
- Request/response timing

### Validation (`validation`)
- Form field validation
- Input data validation
- Step completion checks
- Error messages

### Analysis (`analysis`)
- Analysis workflow steps
- Prompt generation
- Response processing
- Result validation

### Progress (`progress`)
- Analysis stage updates
- Progress percentage tracking
- Stage transitions

### System (`system`)
- Component initialization
- Navigation events
- Data storage operations
- General application flow

## Log Levels

### Info (`info`)
- General information and flow tracking
- Successful operations
- State changes

### Warning (`warn`)
- Non-critical issues
- Validation warnings
- Fallback operations

### Error (`error`)
- API failures
- Validation errors
- Exception handling
- Critical failures

### Success (`success`)
- Successful completions
- Positive outcomes
- Achievement milestones

## Usage Examples

### Basic Logging
```typescript
import { debugLogger } from '@/lib/debug/logger';

// Simple log
debugLogger.info('system', 'Component initialized');

// Log with data
debugLogger.error('api', 'Request failed', { 
  status: 500, 
  error: 'Internal server error' 
});
```

### Performance Timing
```typescript
// Start timer
debugLogger.startTimer('api-call');

// ... perform operation ...

// End timer with log
debugLogger.endTimer('api-call', 'api', 'Request completed');
```

### Error Handling
```typescript
try {
  // ... operation ...
} catch (error) {
  debugLogger.error('analysis', 'Operation failed', { error });
}
```

### Copy Functionality
```typescript
// Copy logs programmatically
const logsText = debugLogger.exportLogsAsText();
await navigator.clipboard.writeText(logsText);

// Format individual log for copying
const formatLogForCopy = (log: DebugLogEntry) => {
  const timestamp = log.timestamp.toLocaleTimeString();
  const duration = log.duration ? ` (${log.duration}ms)` : '';
  const data = log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : '';
  
  return `[${timestamp}] ${log.level.toUpperCase()} [${log.category.toUpperCase()}]${duration}: ${log.message}${data}`;
};
```

## Debug Panel Features

### Filtering
- **Level Filter**: Show only specific log levels (error, warn, info, success)
- **Category Filter**: Show only specific categories (api, validation, etc.)

### Copy Functionality
- **Copy All Logs**: Copy all logs (unfiltered) with header information
- **Copy Filtered Logs**: Copy only logs matching current filters
- **Copy Individual Log**: Hover over log entries to copy single entries
- **Keyboard Shortcuts**: 
  - `Ctrl+Shift+A` (or `Cmd+Shift+A`): Copy all logs
  - `Ctrl+Shift+C` (or `Cmd+Shift+C`): Copy filtered logs
- **Formatted Output**: Logs are formatted as readable text with timestamps and categories
- **Copy Status**: Visual feedback when copy operations succeed or fail

### Export
- Export all logs as JSON file
- Includes timestamps, categories, and full data
- Useful for sharing debug information

### Real-time Updates
- Logs appear immediately as they're generated
- Auto-scroll to latest entries
- Live error count indicators
- Copy status notifications

## Security Features

### Data Sanitization
- API keys are automatically hidden (`***HIDDEN***`)
- Long content is truncated with indicators
- Sensitive headers are masked

### Client-side Only
- All logging happens in the browser
- No server-side data transmission
- Logs are cleared on page refresh

## Temporary Implementation

This debug system is designed as a temporary diagnostic tool:

- **Separate Files**: All debug components are in dedicated files
- **Easy Removal**: Can be removed without affecting core functionality
- **Development Focus**: Optimized for debugging during development
- **No Production Impact**: Designed to be excluded from production builds

## Testing

### Debug Test Button
A test button is included to generate sample logs:

```typescript
import DebugTestButton from '../debug/DebugTestButton';

// Generates sample logs for testing
<DebugTestButton />
```

## Troubleshooting

### Common Issues

1. **Panel Not Showing**: Check if `useDebugPanel` hook is properly imported
2. **No Logs**: Verify `debugLogger` is imported and used correctly
3. **Performance**: Large number of logs may slow down the panel

### Best Practices

1. **Use Appropriate Categories**: Choose the most relevant category for each log
2. **Include Context**: Add relevant data objects to logs
3. **Avoid Sensitive Data**: Logger sanitizes but be cautious with sensitive information
4. **Performance Timing**: Use timers for operations that might be slow

## Future Enhancements

Potential improvements for the debug system:

1. **Log Persistence**: Save logs to localStorage
2. **Advanced Filtering**: Search functionality, date ranges
3. **Performance Metrics**: Detailed timing analysis
4. **Network Monitoring**: Request/response inspection
5. **Error Reporting**: Automatic error collection and reporting

## Removal Instructions

To remove the debug system:

1. Delete debug-related files:
   - `src/lib/debug/`
   - `src/components/debug/`
   - `src/hooks/useDebugPanel.ts`

2. Remove debug imports from:
   - `src/components/quiz/QuizForm.tsx`
   - Any other components using debug features

3. Replace `createDebugJobRiskAnalyzer` with `createJobRiskAnalyzer`

4. Remove debug-related dependencies and imports

The core application will continue to function normally without the debug system.