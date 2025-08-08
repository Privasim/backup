import { z } from 'zod';

export const CodeFileSchema = z.object({
  path: z.string().min(1),
  language: z.string().min(1),
  content: z.string().default(''),
});

export const SuggestedDependencySchema = z.object({
  name: z.string().min(1),
  version: z.string().optional(),
  reason: z.string().min(1),
});

// Note: previewDsl is validated separately via existing runtime guard; schema remains open.
export const CodeBundleSchema = z.object({
  files: z.array(CodeFileSchema).default([]),
  suggestedDependencies: z.array(SuggestedDependencySchema).default([]),
  readme: z.string().optional(),
  previewDsl: z.any().optional(),
});

export type CodeBundle = z.infer<typeof CodeBundleSchema>;
