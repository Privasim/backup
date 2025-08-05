# Chatbox Component Architecture

## Overview

The Chatbox component provides an extensible AI-powered analysis interface with plugin support for future enhancements. It's designed to handle multiple analysis types and AI providers through a modular architecture.

## Core Components

### ChatboxProvider
- **Purpose**: Context provider for chatbox state management
- **Features**: Plugin system, provider registry, session persistence
- **Usage**: Wrap your app with `<ChatboxProvider>` to enable chatbox functionality

### ChatboxPanel
- **Purpose**: Main UI component for the chatbox interface
- **Features**: Message display, plugin control slots, responsive design
- **Usage**: Renders automatically when chatbox is visible

## Plugin System

### Creating a Plugin
```typescript
import { createChatboxPlugin } from '@/components/chatbox';

const myPlugin = createChatboxPlugin({
  id: 'my-plugin',
  name: 'My Analysis Plugin',
  version: '1.0.0',
  analysisTypes: ['profile'],
  
  initialize: async (context) => {
    // Plugin initialization logic
  },
  
  getControls: () => MyControlsComponent,
  processData: async (data) => {
    // Data processing logic
    return processedData;
  }
});
```

### Plugin Lifecycle
1. **Registration**: `registerPlugin(plugin)`
2. **Initialization**: Called when plugin is registered
3. **Active**: Plugin controls and processing are available
4. **Cleanup**: Called when plugin is unregistered

## Provider System

### Creating a Provider
```typescript
import { createAnalysisProvider } from '@/components/chatbox';

const myProvider = createAnalysisProvider({
  id: 'openrouter-provider',
  name: 'OpenRouter Provider',
  supportedModels: ['qwen/qwen3-coder:free', 'z-ai/glm-4.5-air:free'],
  
  analyze: async (config, data) => {
    // Analysis implementation
    return analysisResult;
  },
  
  validateConfig: (config) => {
    // Configuration validation
    return isValid;
  }
});
```

## Usage Example

```typescript
import { ChatboxProvider, useChatbox } from '@/components/chatbox';

function App() {
  return (
    <ChatboxProvider>
      <YourAppContent />
      <ChatboxPanel />
    </ChatboxProvider>
  );
}

function YourComponent() {
  const { openChatbox, setProfileData } = useChatbox();
  
  const handleAnalyze = () => {
    setProfileData(profileFormData);
    openChatbox('profile');
  };
  
  return (
    <button onClick={handleAnalyze}>
      Analyze Profile
    </button>
  );
}
```

## Extension Points

### 1. Analysis Types
Add new analysis types by extending the `AnalysisType` union:
```typescript
type AnalysisType = 'profile' | 'resume' | 'interview' | 'career-planning';
```

### 2. Message Types
Extend message system with custom message types and renderers.

### 3. Storage Adapters
Implement custom storage backends for different deployment scenarios.

### 4. AI Providers
Add support for new AI services by implementing the `AnalysisProvider` interface.

## Future Enhancements

- **Multi-modal Analysis**: Support for images, documents, audio
- **Collaborative Features**: Sharing and commenting on analyses
- **Custom Themes**: Pluggable theming system
- **Analytics**: Usage tracking and performance metrics
- **Offline Support**: Local analysis capabilities
- **Enterprise Features**: SSO, audit logs, custom deployments