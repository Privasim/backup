# Requirements Document

## Introduction

This feature implements three minimal, modern D3 visualizations for the JobRiskAnalysisTab component that convey the urgency and inevitability of AI-driven job displacement. The visualizations will show the velocity of job cuts, skills at risk, and future projections using a premium minimalist design with an urgent tone. The system must be integration-ready for future data connections to research services and user profile selections.

## Requirements

### Requirement 1

**User Story:** As a user viewing job risk analysis, I want to see the accelerating pace of AI-driven job cuts over time, so that I understand the current momentum and urgency of the situation.

#### Acceptance Criteria

1. WHEN the JobRiskAnalysisTab loads THEN the system SHALL display a velocity cuts line chart showing job cuts/replacements over time
2. WHEN rendering the velocity chart THEN the system SHALL use a smooth monotone line with amber-to-red gradient and subtle filled area
3. WHEN displaying the chart THEN the system SHALL include minimal contextual text: short title, tiny axis labels, micro annotation for recent delta, and one-line caption
4. WHEN animating the chart THEN the system SHALL draw the line with accelerating easing toward recent months
5. WHEN user has reduced motion preferences THEN the system SHALL disable non-essential animations
6. WHEN user hovers over the chart THEN the system SHALL amplify the glow effect without showing tooltips
7. WHEN chart receives focus THEN the system SHALL display visible focus rings on the SVG wrapper

### Requirement 2

**User Story:** As a user analyzing job risks, I want to see which skills are most implicated in replaced roles, so that I can understand my personal exposure based on my skill set.

#### Acceptance Criteria

1. WHEN the skill automation component loads THEN the system SHALL auto-select between radial bloom or chord diagram based on available data
2. WHEN displaying radial mode THEN the system SHALL show skill clusters as radial bars with length encoding risk/impact
3. WHEN displaying chord mode THEN the system SHALL show ribbons connecting role clusters to skill clusters with thickness encoding impact volume
4. WHEN user skills are provided THEN the system SHALL highlight relevant skills with subtle halo effects
5. WHEN rendering the visualization THEN the system SHALL include minimal legend (3-4 swatches max) and one-line insight caption
6. WHEN high-impact segments are displayed THEN the system SHALL emit subtle outward particles (unless reduced motion)
7. WHEN component receives data THEN the system SHALL normalize impact values to [0,1] range

### Requirement 3

**User Story:** As a user concerned about future job security, I want to see projections for the next 12-18 months, so that I can understand the trajectory and inevitability of continued job displacement.

#### Acceptance Criteria

1. WHEN the forecast component loads THEN the system SHALL display both fan forecast line and thermal month strip
2. WHEN rendering forecast line THEN the system SHALL show historical data as solid line and forecast as dashed line with p10-p90 confidence band
3. WHEN displaying confidence band THEN the system SHALL fill with low-opacity amber and diagonal hatching pattern
4. WHEN rendering thermal strip THEN the system SHALL show 12-18 month cells with color intensity encoding projected cut speed
5. WHEN displaying forecast THEN the system SHALL include minimal text: short title, tiny axis labels, and one-line insight caption
6. WHEN forecast data is unavailable THEN the system SHALL generate deterministic placeholder forecasts using simple moving averages

### Requirement 4

**User Story:** As a user with accessibility needs, I want the visualizations to be fully accessible, so that I can understand the job risk information regardless of my abilities.

#### Acceptance Criteria

1. WHEN any visualization renders THEN the system SHALL provide aria-label with short chart description
2. WHEN charts are displayed THEN the system SHALL include screen reader only captions with key insights
3. WHEN user navigates with keyboard THEN the system SHALL provide focusable SVG wrappers with visible focus rings
4. WHEN user has reduced motion preferences THEN the system SHALL disable line draw animations, particle effects, and shimmering
5. WHEN tooltips are added in future THEN the system SHALL ensure keyboard accessibility

### Requirement 5

**User Story:** As a developer integrating this feature, I want the components to accept data via props and be ready for future service integration, so that I can easily connect to research services and user profiles.

#### Acceptance Criteria

1. WHEN components are implemented THEN the system SHALL accept data through well-defined TypeScript interfaces
2. WHEN user profile data is available THEN the system SHALL support filtering and highlighting based on occupation, industry, and skills
3. WHEN research services are integrated THEN the system SHALL support data from ResearchDataService methods (getIndustryData, getTaskAutomationData, getRiskMatrixData, getSkillGapData)
4. WHEN data updates occur THEN the system SHALL efficiently update visualizations without full re-renders
5. WHEN components are used THEN the system SHALL NOT couple to Chart.js or other non-D3 chart libraries

### Requirement 6

**User Story:** As a user viewing the job risk analysis, I want the interface to have a premium minimalist design with urgent visual tone, so that the seriousness of the situation is conveyed effectively.

#### Acceptance Criteria

1. WHEN the tab renders THEN the system SHALL use 8px grid spacing with 24px card padding
2. WHEN displaying cards THEN the system SHALL use dark slate surfaces with 12px rounded corners and hairline borders
3. WHEN applying colors THEN the system SHALL use the specified palette: slate-900/950 backgrounds, amber/red for risk (#f59e0b, #fb923c, #ef4444)
4. WHEN laying out components THEN the system SHALL use responsive grid: 1 column mobile, 2 tablet, 3 desktop
5. WHEN text is displayed THEN the system SHALL enforce minimal contextual text policy with character limits
6. WHEN visual effects are applied THEN the system SHALL use subtle shadows/rings and --viz-glow sparingly

### Requirement 7

**User Story:** As a user on different devices, I want the visualizations to perform smoothly and resize appropriately, so that I have a consistent experience across platforms.

#### Acceptance Criteria

1. WHEN visualizations render THEN the system SHALL maintain 60fps performance using SVG-first approach
2. WHEN window resizes THEN the system SHALL debounce resize events and update chart dimensions
3. WHEN datasets are large THEN the system SHALL consider Canvas fallback for dense data (future enhancement)
4. WHEN components mount THEN the system SHALL use efficient D3 update patterns for data changes
5. WHEN charts are displayed THEN the system SHALL prune data points if necessary to maintain performance

### Requirement 8

**User Story:** As a user interacting with the visualizations, I want minimal but meaningful interactions, so that I can explore the data without overwhelming complexity.

#### Acceptance Criteria

1. WHEN user hovers over velocity chart THEN the system SHALL amplify glow effects without showing tooltips
2. WHEN user focuses on charts THEN the system SHALL provide keyboard navigation with visible focus indicators
3. WHEN mode toggles are available THEN the system SHALL show icon-only controls in top-right, hidden until hover/focus
4. WHEN interactions occur THEN the system SHALL provide immediate visual feedback
5. WHEN user interacts THEN the system SHALL NOT display verbose tooltips by default (keep minimal)