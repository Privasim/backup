# System Prompt Implementation for Business Plan Integration

## 1. Core Architecture Overview
- **ChatboxPanel** serves as the controller for business plan interactions
- **BusinessPlanContent** in `/tabs` is the primary content area
- System prompts will enable context-aware AI assistance
- Architecture supports future tool calling and tab content manipulation

## 2. Type Definitions Update
- Extend `AnalysisConfig` to include:
  - `systemPrompt`: Base AI instruction set
  - `contextAwareness`: Enable/disable tab content awareness
  - `allowedActions`: Permissions for tab interactions
- Add types for tab context:
  - `TabContext`: Current tab state and content
  - `ContentReference`: Pointer to specific tab elements
  - `ActionScope`: Permissions for content modification

## 3. Context Integration Layer
- **Tab State Observer**
  - Monitors active tab and content changes
  - Provides real-time context to the prompt system
  - Handles content versioning and diff tracking

- **Content Binding System**
  - Maps chat messages to tab content
  - Supports element referencing (e.g., "Option A" in business plan)
  - Maintains content selection state

## 4. System Prompt Structure
```
[Role Definition]
You are an AI assistant specialized in business planning and analysis.

[Context Awareness]
- Current Tab: {activeTab}
- Selected Elements: {selectedElements}
- Recent Changes: {recentChanges}

[Available Actions]
- View and analyze business plan options
- Compare plan alternatives
- Suggest improvements
- Generate content based on patterns

[Response Guidelines]
- Reference specific elements when possible
- Acknowledge tab context in responses
- Suggest relevant actions based on content
```

## 5. UI Components
### 5.1 Context-Aware Prompt Editor
- Visual builder for system prompts
- Tab context variable insertion
- Action permission toggles
- Preview mode with context simulation

### 5.2 Content Reference Selector
- Visual element picker for tab content
- Context variable binding
- Selection history and favorites

## 6. Integration Points
### 6.1 ChatboxPanel Enhancements
- Context awareness toggle
- Content reference tools
- Action suggestion panel
- Tab state indicators

### 6.2 BusinessPlanContent Integration
- Content change listeners
- Element reference system
- Action handlers for AI suggestions
- State synchronization layer

## 7. Security & Permissions
- Granular action permissions
- Content access controls
- Change confirmation flows
- Audit logging

## 8. Implementation Phases
### Phase 1: Read-Only Context
- Basic tab awareness
- Content reference in prompts
- View-only actions

### Phase 2: Interactive Features
- Content highlighting
- Basic content suggestions
- Action previews

### Phase 3: Full Integration
- Direct content manipulation
- Multi-tab coordination
- Advanced tool calling

## 9. Testing Strategy
- Unit tests for prompt processing
- Integration tests with tab components
- User interaction scenarios
- Performance benchmarking

## 10. Documentation
### For Users
- Context-aware prompting guide
- Content reference syntax
- Action reference manual
- Best practices

### For Developers
- Integration patterns
- Extension points
- Custom action development
- Performance considerations

## 1. Type Definitions Update
- Extend `AnalysisConfig` interface to include:
  - `systemPrompt`: string - Custom system prompt text
  - `promptTemplateId`: string - Reference to a template
  - `promptVariables`: Record<string, any> - Dynamic variables for templates
- Create new types for prompt templates:
  - `PromptTemplate`: Interface for template structure
  - `SystemPromptPreset`: Predefined prompt configurations

## 2. State Management Updates
- Add system prompt state to ChatboxProvider
- Implement context methods:
  - `updateSystemPrompt(prompt: string)`
  - `savePromptTemplate(template: PromptTemplate)`
  - `loadPromptTemplate(id: string)`
  - `resetSystemPrompt()`
- Add persistence layer for prompt templates

## 3. UI Components
### 3.1 SystemPromptEditor
- Textarea for editing system prompt
- Syntax highlighting for template variables
- Character counter and validation
- Preview mode toggle

### 3.2 PromptTemplateSelector
- Dropdown for selecting saved templates
- Template preview on hover
- Quick actions (save, duplicate, delete)
- Search and filter functionality

### 3.3 VariableEditor
- Dynamic form for template variables
- Type validation
- Default value management
- Required/optional indicators

## 4. Integration Points
### 4.1 ChatboxControls Integration
- Add "System Prompt" tab
- Toggle between simple and advanced modes
- Template management section
- Variable binding interface

### 4.2 Analysis Flow
1. User initiates analysis
2. System resolves prompt template
3. Variables are interpolated
4. Final prompt is passed to provider
5. Response is processed and displayed

## 5. Prompt Processing Pipeline
1. Template Selection
   - Load selected template
   - Fallback to default if not specified

2. Variable Resolution
   - Merge system variables with user input
   - Validate required variables
   - Apply type conversions

3. Prompt Assembly
   - Apply template with variables
   - Handle conditional sections
   - Clean and validate final prompt

## 6. Persistence Layer
- Local storage for user templates
- IndexedDB for larger templates
- Export/import functionality
- Versioning support

## 7. Error Handling
- Template syntax validation
- Variable resolution errors
- API compatibility checks
- Fallback mechanisms

## 8. Performance Considerations
- Memoize resolved prompts
- Debounce prompt updates
- Lazy load template editor
- Optimize re-renders

## 9. Testing Strategy
- Unit tests for prompt processing
- Integration tests with AI providers
- UI component tests
- End-to-end test scenarios

## 10. Documentation
- Template syntax guide
- Best practices
- Example templates
- Troubleshooting guide

## 11. Future Extensions
- AI-assisted prompt generation
- Template sharing
- Version history
- Collaborative editing
- Prompt performance analytics
