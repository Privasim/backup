export interface BusinessPromptTemplate {
  id: string;
  name: string;
  category: 'technology' | 'consulting' | 'creative' | 'retail' | 'general';
  prompt: string;
  description: string;
}

export const BUSINESS_PROMPT_TEMPLATES: BusinessPromptTemplate[] = [
  {
    id: 'tech-saas',
    name: 'Tech & SaaS Focus',
    category: 'technology',
    description: 'Emphasizes software solutions, SaaS products, and tech consulting',
    prompt: `Focus on technology-driven business opportunities, particularly software-as-a-service (SaaS), mobile applications, and tech consulting. Prioritize scalable digital solutions with recurring revenue models. Consider current technology trends, API integrations, cloud-based solutions, and automation opportunities. Emphasize businesses that can leverage modern tech stacks and have high scalability potential.`
  },
  {
    id: 'consulting-expertise',
    name: 'Consulting & Expertise',
    category: 'consulting',
    description: 'Focuses on knowledge-based services and professional consulting',
    prompt: `Generate consulting and professional service opportunities that leverage deep expertise and knowledge. Focus on high-value, knowledge-based services with premium pricing potential. Consider thought leadership opportunities, speaking engagements, coaching, and scalable consulting models. Emphasize businesses that can monetize expertise through training, advisory services, and specialized consulting.`
  },
  {
    id: 'creative-content',
    name: 'Creative & Content',
    category: 'creative',
    description: 'Targets creative services, content creation, and artistic ventures',
    prompt: `Focus on creative services, content creation, and artistic business ventures. Consider digital content creation, creative agencies, design services, and artistic product businesses. Emphasize creative differentiation, brand building, audience development, and content monetization strategies. Include opportunities in media production, graphic design, writing, and creative consulting.`
  },
  {
    id: 'retail-ecommerce',
    name: 'Retail & E-commerce',
    category: 'retail',
    description: 'Emphasizes retail, e-commerce, and product-based businesses',
    prompt: `Generate retail and e-commerce business opportunities focusing on product sales, online marketplaces, and physical retail concepts. Consider dropshipping, private labeling, subscription boxes, and omnichannel retail strategies. Emphasize inventory management, customer acquisition, and scalable product distribution models. Include both digital and physical product opportunities.`
  },
  {
    id: 'general-balanced',
    name: 'General Business',
    category: 'general',
    description: 'Balanced approach covering various business types and industries',
    prompt: `Provide a balanced mix of business opportunities across different industries and business models. Consider both service-based and product-based businesses, traditional and digital approaches, and various risk levels. Focus on practical, achievable business ideas that can be started with moderate investment and have clear paths to profitability. Include opportunities for both B2B and B2C markets.`
  }
];

export const getBusinessPromptTemplates = (): BusinessPromptTemplate[] => {
  return BUSINESS_PROMPT_TEMPLATES;
};

export const getTemplateById = (id: string): BusinessPromptTemplate | undefined => {
  return BUSINESS_PROMPT_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: BusinessPromptTemplate['category']): BusinessPromptTemplate[] => {
  return BUSINESS_PROMPT_TEMPLATES.filter(template => template.category === category);
};