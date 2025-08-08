import { z } from 'zod';

export const DesignTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  rationale: z.string().min(1),
  acceptanceCriteria: z.array(z.string().min(1)).default([]),
});

export const DesignTokensSchema = z.object({
  colors: z.object({
    background: z.string().min(1),
    surface: z.string().min(1),
    border: z.string().min(1),
    text: z.string().min(1),
    mutedText: z.string().min(1),
    primary: z.string().min(1),
  }),
  spacing: z.enum(['compact', 'cozy']).default('compact'),
  typography: z.object({
    fontFamily: z.string().min(1),
    baseSize: z.number().int().positive().default(14),
    scale: z.union([z.literal(1.125), z.literal(1.2)]).default(1.125),
  }),
});

export const ComponentSpecSchema = z.object({
  name: z.string().min(1),
  props: z.array(z.object({ name: z.string(), type: z.string(), required: z.boolean().optional() })).optional(),
  states: z.array(z.string()).optional(),
  variants: z.array(z.string()).optional(),
});

export const LayoutSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  components: z.array(z.string().min(1)).default([]),
});

export const InteractionSpecSchema = z.object({
  component: z.string().min(1),
  event: z.string().min(1),
  behavior: z.string().min(1),
  accessibility: z.string().optional(),
});

export const DesignSpecSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  tasks: z.array(DesignTaskSchema).min(8).max(20),
  designTokens: DesignTokensSchema,
  components: z.array(ComponentSpecSchema).default([]),
  layout: z.object({ sections: z.array(LayoutSectionSchema).default([]) }),
  interactions: z.array(InteractionSpecSchema).default([]),
  libraries: z.object({
    primary: z.literal('tailwind'),
    optional: z.array(z.enum(['shadcn', 'headlessui', 'radix'])).optional(),
  }),
  constraints: z.array(z.string()).default([]),
});

export type DesignSpec = z.infer<typeof DesignSpecSchema>;
