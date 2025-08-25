// File: src/modules/job-loss-viz/utils/validate.ts

import { z } from 'zod';
import type { RoleAggregate, YtdPoint, SourceRef } from '../types';

export const SourceRefSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  publisher: z.string().optional(),
  date: z.string().optional(), // ISO date
});

export const YtdPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-01$/, 'date must be month start YYYY-MM-01'),
  ytd_global_ai_job_losses: z.number().int().nonnegative(),
  sources: z.array(z.string().url()).min(1),
});

export const RoleAggregateSchema = z.object({
  role: z.string().min(1),
  count: z.number().int().nonnegative(),
  sources: z.array(z.string().url()).min(1),
});

export const YtdPointsSchema = z.array(YtdPointSchema);
export const RoleAggregatesSchema = z.array(RoleAggregateSchema);

export function parseYtdPoints(input: unknown): YtdPoint[] {
  return YtdPointsSchema.parse(input);
}

export function parseRoleAggregates(input: unknown): RoleAggregate[] {
  return RoleAggregatesSchema.parse(input);
}

export function toSourceRefs(urls: string[]): SourceRef[] {
  return urls.map((u) => ({ url: u }));
}
