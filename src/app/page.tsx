import NavBar from '@/components/landing/NavBar';
import Hero from '@/components/landing/Hero.server';
import ResearchPreview from '@/components/landing/ResearchPreview';
import Benefits from '@/components/landing/Benefits';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import ContentGallery from '@/components/landing/ContentGallery';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import type {
  BenefitItems,
  FeatureItems,
  HowSteps,
  PricingTiers,
  GalleryItems,
  FaqItems,
} from '@/components/landing/types';

export const metadata = {
  title: 'CareerGuard — AI Job Impact Assessment',
  description:
    "Personalized insights on how AI may impact your job and career. Assess, plan, and adapt.",
};

export default function Home() {
  // Data placeholders (empty) to be populated from CMS/static in future
  const benefits: BenefitItems = [];
  const features: FeatureItems = [];
  const steps: HowSteps = [];
  const tiers: PricingTiers = [];
  const gallery: GalleryItems = [];
  const faqs: FaqItems = [];

  return (
    <main>
      <NavBar />
      <Hero />
      <ResearchPreview />
      <Benefits items={benefits} />
      <Features items={features} />
      <HowItWorks steps={steps} />
      <Pricing tiers={tiers} />
      <ContentGallery items={gallery} />
      <FAQ items={faqs} />
      <Footer />
    </main>
  );
}