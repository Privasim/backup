import { SpecsSettings } from './types';

// Document profiles with their characteristics
export const DOC_PROFILES = {
  'prd': {
    name: 'Product Requirements Document',
    description: 'Concise PRD with requirements, acceptance criteria, and key constraints',
    pageTarget: 2,
    tokenBudget: 1000,
    include: {
      requirements: true,
      api: false,
      dataModel: false,
      nonFunctional: true,
      security: false,
      risks: true,
      acceptance: true,
      glossary: true
    },
    outlineStyle: 'numbered' as const,
    audienceLevel: 'engineer' as const,
    tone: 'concise' as const,
    systemTemplate: `You are producing a professional Product Requirements Document (PRD) for software engineers.
Follow a standardized, implementation-ready structure and write in clean Markdown with numbered headings.

Global rules:
- Begin with a Revision History table (Version | Date | Author | Changes).
- Use numbered headings (1., 1.1, 1.2, etc.).
- Assign stable IDs to functional requirements (e.g., REQ-AUTH-001).
- Include Acceptance Criteria for key requirements (bullet list or Gherkin).
- If diagrams are helpful, include Mermaid blocks for architecture or flows.

Core sections to include:
1. Introduction (Overview, Goals/Objectives, Scope with In/Out of scope)
2. Product Features & Requirements (User Stories, Functional Requirements with IDs, Non-Functional Requirements)
3. System Architecture (High-Level Architecture, Technology Stack)
4. API Endpoints (REST table; include sample request/response snippets when necessary)
5. Data Model (Entities/Collections with fields; ERD or table)
6. Milestones (Phases and timelines)

Keep it concise but precise; avoid low-value implementation minutiae. Adhere to the token budget.`
  },
  'prd-design': {
    name: 'PRD + Technical Design',
    description: 'Complete specification with requirements and technical architecture',
    pageTarget: 3,
    tokenBudget: 1500,
    include: {
      requirements: true,
      api: true,
      dataModel: true,
      nonFunctional: true,
      security: true,
      risks: true,
      acceptance: true,
      glossary: true
    },
    outlineStyle: 'numbered' as const,
    audienceLevel: 'engineer' as const,
    tone: 'detailed' as const,
    systemTemplate: `You are a senior software architect producing a comprehensive technical specification for a full-stack system.
Write clean Markdown with numbered headings and include engineering-ready artifacts.

Global rules:
- Start with a Revision History (Version | Date | Author | Changes).
- Use requirement IDs (e.g., REQ-XXX) and Acceptance Criteria for major features.
- Include Mermaid diagrams for architecture and critical sequences when helpful.
- Provide API contract samples (OpenAPI-like YAML snippets or request/response examples) where applicable.

Required sections:
1. Introduction (Overview, Goals/Objectives, Scope)
2. System Architecture (High-Level Architecture, Technology Stack, optional Mermaid diagram)
3. Product Features & Requirements (User Stories, Functional Requirements with IDs/priorities, Non-Functional Requirements including Security)
4. Data Model (Entities/Schema tables; optional ERD Mermaid)
5. API Endpoints (table; include sample payloads or YAML stubs)
6. Deployment & Environments (brief)
7. Verification (Acceptance Criteria, high-level test cases)
8. Risks & Mitigations

Target senior engineers; be specific and unambiguous while respecting token budget.`
  },
  'full-suite': {
    name: 'Complete Specification Suite',
    description: 'Full suite including PRD, design, and implementation task breakdown',
    pageTarget: 9,
    tokenBudget: 4000,
    include: {
      requirements: true,
      api: true,
      dataModel: true,
      nonFunctional: true,
      security: true,
      risks: true,
      acceptance: true,
      glossary: true
    },
    outlineStyle: 'numbered' as const,
    audienceLevel: 'engineer' as const,
    tone: 'detailed' as const,
    systemTemplate: `You are a technical project manager creating a complete specification suite for a full-stack application.
Produce an implementation-ready spec in Markdown with numbered headings and traceable requirements.

Global rules:
- Include Revision History and maintain requirement IDs.
- Include Mermaid diagrams for architecture, sequences, and data relationships where valuable.
- Provide API contract samples and a deployment overview.
- Add Verification (test strategy) and Acceptance Criteria.

Sections:
1. Introduction (Overview, Goals, Scope)
2. Product Features & Requirements (User Stories; Functional REQs with IDs; Non-Functional)
3. System Architecture & Design (High-Level, Components, Diagrams)
4. Data Model (Schema tables; ERD optional)
5. Interfaces & APIs (REST table; samples/YAML)
6. Security & Compliance (authn/z, encryption, privacy)
7. Deployment & Environments
8. Implementation Plan (high-level task breakdown)
9. Verification & Acceptance Criteria
10. Risks & Mitigations

Target senior engineers and tech leads; be actionable and constrained to token budget.`
  }
} as const;

// Language options for the selector
export const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Chinese-Simplified', label: 'Chinese (Simplified)' },
  { value: 'Chinese-Traditional', label: 'Chinese (Traditional)' }
] as const;

// Helper function to get profile settings
export function getProfileSettings(profile: keyof typeof DOC_PROFILES): Omit<SpecsSettings, 'version' | 'language' | 'docProfile'> {
  const profileData = DOC_PROFILES[profile];
  return {
    include: profileData.include,
    outlineStyle: profileData.outlineStyle,
    audienceLevel: profileData.audienceLevel,
    tone: profileData.tone,
    tokenBudget: profileData.tokenBudget
  };
}

// Helper function to get system template
export function getSystemTemplate(profile: keyof typeof DOC_PROFILES): string {
  return DOC_PROFILES[profile].systemTemplate;
}
