# Requirements Document

## Introduction

This feature adds system prompt customization functionality to the ChatboxControls component, allowing users to define custom behavior, tone, and focus areas for the AI chatbot analysis. The system prompt feature will integrate seamlessly with the existing chatbox architecture while providing users with granular control over AI behavior.

## Requirements

### Requirement 1

**User Story:** As a user, I want to set a custom system prompt for the chatbot, so that I can control the AI's behavior, tone, and analysis focus according to my specific needs.

#### Acceptance Criteria

1. WHEN I access the chatbox settings THEN I SHALL see a system prompt configuration section
2. WHEN I enter a custom system prompt THEN the system SHALL validate and save it locally
3. WHEN I start an analysis with a custom system prompt THEN the system SHALL use my prompt instead of the default template system prompt
4. WHEN I clear the custom system prompt THEN the system SHALL revert to using the default template system prompts

### Requirement 2

**User Story:** As a user, I want to choose from predefined system prompt templates, so that I can quickly apply common analysis styles without writing prompts from scratch.

#### Acceptance Criteria

1. WHEN I open the system prompt selector THEN I SHALL see a list of predefined templates with descriptions
2. WHEN I select a template THEN the system SHALL populate the prompt field with the template content
3. WHEN I modify a template THEN the system SHALL treat it as a custom prompt
4. WHEN I switch between templates THEN the system SHALL warn me about unsaved changes if applicable

### Requirement 3

**User Story:** As a user, I want to preview how my system prompt will affect the analysis, so that I can understand the impact before running a full analysis.

#### Acceptance Criteria

1. WHEN I enter or modify a system prompt THEN I SHALL see a character count and validation status
2. WHEN I have a valid system prompt THEN the system SHALL show a preview of how it will be combined with user data
3. WHEN my system prompt is too long or invalid THEN the system SHALL display appropriate warnings
4. WHEN I hover over the system prompt field THEN I SHALL see helpful tips about effective prompt writing

### Requirement 4

**User Story:** As a user, I want my system prompt preferences to persist across sessions, so that I don't have to reconfigure them every time I use the chatbox.

#### Acceptance Criteria

1. WHEN I set a custom system prompt THEN the system SHALL save it to local storage
2. WHEN I return to the chatbox THEN the system SHALL restore my last used system prompt
3. WHEN I have multiple models configured THEN the system SHALL remember system prompts per model if desired
4. WHEN I clear my browser data THEN the system SHALL gracefully handle missing prompt data

### Requirement 5

**User Story:** As a user, I want the system prompt UI to be compact and non-intrusive, so that it doesn't clutter the existing chatbox interface.

#### Acceptance Criteria

1. WHEN the system prompt section is collapsed THEN it SHALL take minimal vertical space
2. WHEN I expand the system prompt section THEN it SHALL reveal the full configuration options
3. WHEN I'm not using custom prompts THEN the section SHALL indicate default behavior clearly
4. WHEN the system prompt is active THEN I SHALL see a subtle indicator in the main controls area