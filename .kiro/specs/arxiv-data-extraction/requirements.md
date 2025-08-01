# Requirements Document

## Introduction

This feature enables extraction of structured research data from arXiv papers, specifically "The Impact of Generative AI on Employment", and integrates it as a static JSON knowledge base for visualization and risk assessment. The system will provide automated table extraction, data normalization, and seamless integration with the existing quiz/assessment functionality to compare user occupation risks with research findings.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to extract all tables and structured data from the arXiv paper, so that I can create a comprehensive knowledge base for occupation risk analysis.

#### Acceptance Criteria

1. WHEN the extraction process is initiated THEN the system SHALL download the PDF from https://arxiv.org/pdf/2507.07935 to `/research/raw/`
2. WHEN processing the PDF THEN the system SHALL extract ALL tables using automated tools and save them as structured JSON
3. WHEN extracting tables THEN the system SHALL capture table metadata including id, title, page number, data rows, and footnotes
4. WHEN validating extracted data THEN the system SHALL ensure all numerical and categorical data maintains accuracy from the source
5. IF table extraction fails THEN the system SHALL provide detailed error logging and fallback to manual extraction guidance

### Requirement 2

**User Story:** As a developer, I want to extract contextual information from key paper sections, so that I can provide comprehensive metadata and methodology information alongside the data.

#### Acceptance Criteria

1. WHEN processing the paper THEN the system SHALL extract abstract, introduction, methodology, and discussion sections
2. WHEN extracting text content THEN the system SHALL map relevant paragraphs to structured JSON fields
3. WHEN capturing methodology THEN the system SHALL include data sources, analysis approach, and confidence indicators
4. WHEN processing content THEN the system SHALL maintain traceability with page references and citations
5. IF text extraction encounters formatting issues THEN the system SHALL document ambiguities for manual review

### Requirement 3

**User Story:** As a developer, I want normalized and cross-referenced occupation data, so that I can ensure consistent lookup and comparison functionality.

#### Acceptance Criteria

1. WHEN normalizing data THEN the system SHALL standardize occupation names and codes across all tables
2. WHEN processing occupation data THEN the system SHALL create cross-references between related tables and data points
3. WHEN structuring data THEN the system SHALL ensure all occupation entries include risk scores and key task information
4. WHEN validating relationships THEN the system SHALL verify all table cross-references are accurate and complete
5. IF normalization conflicts arise THEN the system SHALL prioritize source accuracy and document resolution decisions

### Requirement 4

**User Story:** As a developer, I want a data loading service and visualization component, so that I can integrate the research data with the existing assessment system.

#### Acceptance Criteria

1. WHEN the knowledge base is complete THEN the system SHALL store the final JSON at `/src/lib/research/data/ai_employment_risks.json`
2. WHEN implementing data access THEN the system SHALL provide a service for occupation lookup, table access, and visualization configuration
3. WHEN creating visualizations THEN the system SHALL implement a bar chart component comparing user risk with paper findings
4. WHEN integrating with assessments THEN the system SHALL connect seamlessly with existing quiz/assessment functionality
5. IF data loading fails THEN the system SHALL provide graceful error handling and fallback messaging

### Requirement 5

**User Story:** As a developer, I want comprehensive testing and validation, so that I can ensure data accuracy and system reliability.

#### Acceptance Criteria

1. WHEN implementing the system THEN the system SHALL include unit tests for data loading and occupation lookup functionality
2. WHEN testing integration THEN the system SHALL verify visualization components work with real extracted data
3. WHEN validating accuracy THEN the system SHALL cross-check all extracted data against the original PDF
4. WHEN documenting the system THEN the system SHALL provide clear extraction procedures and update processes
5. IF validation reveals discrepancies THEN the system SHALL require manual review and correction before deployment