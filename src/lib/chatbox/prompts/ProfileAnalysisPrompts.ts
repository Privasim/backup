/**
 * Profile analysis prompt templates
 */

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
}

/**
 * Default profile analysis prompt
 */
export const DEFAULT_PROFILE_PROMPT: PromptTemplate = {
  id: 'default-profile',
  name: 'Default Profile Analysis',
  description: 'Comprehensive career profile analysis with strengths, risks, and opportunities',
  systemPrompt: 'You are a professional career analyst providing actionable insights based on career profiles. Focus on practical, specific recommendations.',
  userPromptTemplate: `Analyze this career profile and provide a comprehensive assessment:

**Profile Type:** {{profileType}}
**Current Role:** {{currentRole}}
**Industry:** {{industry}}
**Experience:** {{yearsOfExperience}} years
**Profile Completion:** {{completionPercentage}}%

**Key Skills ({{skillsCount}}):**
{{keySkills}}

**Recent Experience ({{experienceCount}}):**
{{recentExperience}}

**Certifications ({{certificationsCount}}):**
{{certifications}}

**Languages ({{languagesCount}}):**
{{languages}}

Provide analysis covering:
1. **Key Strengths** - Most valuable skills and experiences
2. **Market Position** - How competitive this profile is
3. **Risk Areas** - Potential weaknesses or gaps
4. **Growth Opportunities** - Specific advancement recommendations
5. **Industry Alignment** - How well this matches current trends

Keep it concise, actionable, and professional.`,
  variables: [
    'profileType', 'currentRole', 'industry', 'yearsOfExperience', 
    'completionPercentage', 'skillsCount', 'keySkills', 'experienceCount', 
    'recentExperience', 'certificationsCount', 'certifications', 
    'languagesCount', 'languages'
  ]
};

/**
 * Career transition focused prompt
 */
export const CAREER_TRANSITION_PROMPT: PromptTemplate = {
  id: 'career-transition',
  name: 'Career Transition Analysis',
  description: 'Focused on career change opportunities and transition strategies',
  systemPrompt: 'You are a career transition specialist helping professionals navigate career changes. Focus on transferable skills and transition strategies.',
  userPromptTemplate: `Analyze this profile for career transition opportunities:

**Current Situation:**
- Profile Type: {{profileType}}
- Current Role: {{currentRole}}
- Industry: {{industry}}
- Experience: {{yearsOfExperience}} years

**Skills Portfolio:**
{{keySkills}}

**Experience Background:**
{{recentExperience}}

Focus your analysis on:
1. **Transferable Skills** - Skills that apply across industries
2. **Transition Opportunities** - Realistic career change options
3. **Skill Gaps** - What needs development for target roles
4. **Transition Strategy** - Step-by-step approach for career change
5. **Timeline & Milestones** - Realistic transition planning

Prioritize actionable transition advice.`,
  variables: [
    'profileType', 'currentRole', 'industry', 'yearsOfExperience',
    'keySkills', 'recentExperience'
  ]
};

/**
 * Skills assessment focused prompt
 */
export const SKILLS_ASSESSMENT_PROMPT: PromptTemplate = {
  id: 'skills-assessment',
  name: 'Skills Assessment',
  description: 'Deep dive into skill strengths and development areas',
  systemPrompt: 'You are a skills assessment expert evaluating professional competencies and development needs.',
  userPromptTemplate: `Conduct a detailed skills assessment:

**Professional Context:**
- Role: {{currentRole}}
- Industry: {{industry}}
- Experience Level: {{yearsOfExperience}} years

**Current Skills Portfolio:**
{{keySkills}}

**Certifications:**
{{certifications}}

**Languages:**
{{languages}}

Provide assessment covering:
1. **Skill Strengths** - Top competencies and their market value
2. **Skill Gaps** - Missing skills for career advancement
3. **Development Priority** - Which skills to focus on first
4. **Learning Path** - Specific resources and approaches
5. **Certification Recommendations** - Valuable certifications to pursue

Focus on specific, actionable skill development advice.`,
  variables: [
    'currentRole', 'industry', 'yearsOfExperience', 'keySkills', 
    'certifications', 'languages'
  ]
};

/**
 * Get all available prompt templates
 */
export const getAllPromptTemplates = (): PromptTemplate[] => [
  DEFAULT_PROFILE_PROMPT,
  CAREER_TRANSITION_PROMPT,
  SKILLS_ASSESSMENT_PROMPT
];

/**
 * Get prompt template by ID
 */
export const getPromptTemplate = (id: string): PromptTemplate | undefined => {
  return getAllPromptTemplates().find(template => template.id === id);
};

/**
 * Render a prompt template with data
 */
export const renderPromptTemplate = (
  template: PromptTemplate, 
  data: Record<string, any>
): { systemPrompt: string; userPrompt: string } => {
  let userPrompt = template.userPromptTemplate;
  
  // Replace all variables in the template
  template.variables.forEach(variable => {
    const value = data[variable] || 'Not specified';
    const placeholder = `{{${variable}}}`;
    userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), String(value));
  });
  
  return {
    systemPrompt: template.systemPrompt,
    userPrompt
  };
};