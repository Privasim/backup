// placeholderContent.ts - Placeholder implementation plan data and utilities

import type { ImplementationPlan } from '../types';

// 4-6 sentence placeholder text that mimics a real implementation plan
export const PLACEHOLDER_RAW_CONTENT = `# Digital Marketing Agency Implementation Plan

## Overview
This plan outlines the steps to launch a digital marketing agency specializing in social media management and content creation for small businesses. The agency will focus on providing affordable, high-quality marketing services to help local businesses establish their online presence.

## Phase 1: Business Setup (Weeks 1-4)
- Register business and obtain necessary licenses
- Set up office space and essential equipment
- Create brand identity including logo, website, and marketing materials
- Develop service packages and pricing structure

## Phase 2: Team Building (Weeks 3-6)
- Hire key positions: Marketing Specialist, Content Creator, and Account Manager
- Establish onboarding and training procedures
- Set up collaboration tools and workflows
- Create employee handbook and policies

## Phase 3: Market Entry (Weeks 5-8)
- Launch website and social media profiles
- Develop initial client outreach strategy
- Create portfolio with sample work
- Attend local business networking events

## Key Tasks
- Market research and competitor analysis
- Legal structure and financial setup
- Brand development and online presence
- Team recruitment and training
- Client acquisition strategy
- Service delivery framework

## Resources
- Marketing Specialist (1)
- Content Creator (1)
- Account Manager (1)
- Freelance Designer (as needed)

## Budget
- Initial setup costs: $15,000
- Monthly operating expenses: $8,000
- Marketing budget: $2,000/month

## Timeline
- Business launch: 8 weeks
- First client acquisition: 10 weeks
- Break-even target: 6 months`;

// Suggestion-like object for the placeholder
export const PLACEHOLDER_SUGGESTION = {
  id: '__placeholder__',
  title: 'Digital Marketing Agency',
  category: 'Business Services',
  description: 'Launch a digital marketing agency specializing in social media management for small businesses'
};

// Utility to split text into streaming chunks
export const splitIntoChunks = (text: string, chunkSize: number = 150): string[] => {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

// Create a structured plan from the placeholder content
export const createPlaceholderPlan = (): ImplementationPlan => ({
  meta: {
    ideaId: '__placeholder__',
    title: 'Digital Marketing Agency Implementation Plan',
    category: 'Business Services',
    version: 'v1',
    createdAt: new Date().toISOString()
  },
  overview: {
    goals: [
      'Launch a digital marketing agency within 8 weeks',
      'Acquire first 5 clients within 3 months',
      'Establish brand presence in local market'
    ]
  },
  phases: [
    {
      id: 'setup',
      name: 'Business Setup',
      duration: 'Weeks 1-4',
      objectives: [
        'Register business and obtain licenses',
        'Set up office space and equipment',
        'Create brand identity',
        'Develop service packages'
      ],
      milestones: [
        { id: 'm1', title: 'Business registered' },
        { id: 'm2', title: 'Brand identity completed' }
      ]
    },
    {
      id: 'team',
      name: 'Team Building',
      duration: 'Weeks 3-6',
      objectives: [
        'Hire key positions',
        'Establish onboarding procedures',
        'Set up collaboration tools',
        'Create employee handbook'
      ],
      milestones: [
        { id: 'm3', title: 'Key positions filled' },
        { id: 'm4', title: 'Training completed' }
      ]
    }
  ],
  tasks: [
    { id: 't1', title: 'Market research and competitor analysis' },
    { id: 't2', title: 'Legal structure and financial setup' },
    { id: 't3', title: 'Brand development and online presence' },
    { id: 't4', title: 'Team recruitment and training' },
    { id: 't5', title: 'Client acquisition strategy' },
    { id: 't6', title: 'Service delivery framework' }
  ],
  resources: {
    team: [
      { role: 'Marketing Specialist', count: 1 },
      { role: 'Content Creator', count: 1 },
      { role: 'Account Manager', count: 1 }
    ]
  },
  budget: {
    items: [
      { label: 'Initial setup costs', cost: '$15,000' },
      { label: 'Monthly operating expenses', cost: '$8,000' },
      { label: 'Marketing budget', cost: '$2,000/month' }
    ],
    total: '$25,000 (initial) + $10,000/month'
  },
  kpis: [
    { metric: 'Client acquisition', target: '5 clients in 3 months' },
    { metric: 'Revenue', target: '$15,000/month by month 6' },
    { metric: 'Client retention', target: '80% by month 12' }
  ],
  formattedContent: PLACEHOLDER_RAW_CONTENT,
  rawContent: PLACEHOLDER_RAW_CONTENT
});
