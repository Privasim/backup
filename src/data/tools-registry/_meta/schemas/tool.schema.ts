import { z } from 'zod';

// Load taxonomy data
const capabilitiesData = require('../../taxonomy/capabilities.json');
const pricingModelsData = require('../../taxonomy/pricing-models.json');
const complianceData = require('../../taxonomy/compliance.json');

// Extract valid values from taxonomy
const validCapabilities = capabilitiesData.capabilities.map((cap: any) => cap.slug);
const validPricingModels = pricingModelsData.models;
const validComplianceFlags = complianceData.flags.map((flag: any) => flag.key);

export const toolSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), // kebab-case
  name: z.string().min(1),
  vendor: z.string().min(1),
  category: z.string().min(1),
  website: z.string().url().startsWith('https://'),
  description: z.string().min(1),
  pricing: z.object({
    model: z.enum(validPricingModels as [string, ...string[]]),
    minMonthlyUSD: z.number().optional(),
    maxMonthlyUSD: z.number().optional()
  }),
  capabilities: z.array(z.enum(validCapabilities as [string, ...string[]])),
  compliance: z.object({
    gdpr: z.boolean().optional(),
    soc2: z.boolean().optional(),
    hipaa: z.boolean().optional()
  }).optional(),
  metadata: z.object({
    lastVerifiedAt: z.string().datetime().optional(),
    sourceRefs: z.array(z.string().url()).optional()
  }).optional()
});

export type Tool = z.infer<typeof toolSchema>;
