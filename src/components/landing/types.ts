import type { ReactNode } from 'react';
import { z } from 'zod';

export interface CtaLink {
  label: string;
  href: string;
  ariaLabel?: string;
}

export interface BenefitItem {
  icon?: ReactNode;
  title: string;
  description: string;
}

export interface FeatureItem {
  icon?: ReactNode;
  title: string;
  description: string;
}

export interface HowStep {
  step: number;
  title: string;
  description: string;
}

export interface PricingTier {
  id: string;
  name: string;
  priceMonthly: number;
  description: string;
  featuresIncluded: string[];
  cta: CtaLink;
  highlighted?: boolean;
}

export type MediaKind = 'image' | 'video' | 'embed';

export interface GalleryItem {
  id: string;
  kind: MediaKind;
  src: string;
  alt?: string;
  title?: string;
  provider?: 'youtube' | 'vimeo' | 'loom' | 'figma' | 'other';
  width?: number;
  height?: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const CtaLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().url(),
  ariaLabel: z.string().optional(),
});

export const BenefitItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const FeatureItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const HowStepSchema = z.object({
  step: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const PricingTierSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  priceMonthly: z.number().nonnegative(),
  description: z.string().min(1),
  featuresIncluded: z.array(z.string().min(1)),
  cta: CtaLinkSchema,
  highlighted: z.boolean().optional(),
});

export const GalleryItemSchema = z.object({
  id: z.string().min(1),
  kind: z.union([z.literal('image'), z.literal('video'), z.literal('embed')]),
  src: z.string().url(),
  alt: z.string().optional(),
  title: z.string().optional(),
  provider: z.enum(['youtube', 'vimeo', 'loom', 'figma', 'other']).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const FaqItemSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
});

export type BenefitItems = BenefitItem[];
export type FeatureItems = FeatureItem[];
export type HowSteps = HowStep[];
export type PricingTiers = PricingTier[];
export type GalleryItems = GalleryItem[];
export type FaqItems = FaqItem[];
