import { z } from 'zod';
import { toolSchema } from './tool.schema';

export const categorySchema = z.object({
  tools: z.array(toolSchema)
});

export type Category = z.infer<typeof categorySchema>;
