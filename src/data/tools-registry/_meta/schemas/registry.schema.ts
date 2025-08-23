import { z } from 'zod';
import { toolSchema } from './tool.schema';

export const registrySchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  schemaVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  generatedAt: z.string().datetime(),
  categories: z.record(z.string(), z.object({
    name: z.string(),
    status: z.enum(['live', 'draft']),
    minTools: z.number().min(0)
  })),
  tools: z.array(toolSchema),
  indexes: z.object({
    byCategory: z.record(z.string(), z.array(z.string())),
    byCapability: z.record(z.string(), z.array(z.string()))
  }),
  integrity: z.object({
    hash: z.string(),
    counts: z.object({
      tools: z.number(),
      categories: z.number(),
      capabilities: z.number()
    })
  })
});

export type RegistrySnapshot = z.infer<typeof registrySchema>;
