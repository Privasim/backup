import Section from './system/Section';
import SectionHeading from './system/SectionHeading';
import Card from './system/Card';
import type { PricingTiers } from './types';

interface Props { tiers: PricingTiers; }

export default function Pricing({ tiers }: Props) {
  return (
    <Section id="pricing" ariaLabel="Pricing">
      <SectionHeading eyebrow="Flexible plans">Pricing</SectionHeading>
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((t) => (
          <Card key={t.id} className={`${t.highlighted ? 'ring-2 ring-[var(--brand)]' : ''} p-8`}>
            <div className="text-primary text-xl font-semibold mb-1">{t.name}</div>
            <div className="text-brand text-3xl font-bold mb-2">${t.priceMonthly}<span className="text-secondary text-base font-normal">/mo</span></div>
            <p className="text-secondary mb-4">{t.description}</p>
            <ul className="text-secondary mb-6 space-y-2">
              {t.featuresIncluded.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-brand">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a href={t.cta.href} aria-label={t.cta.ariaLabel ?? t.cta.label} className="btn-primary w-full inline-flex justify-center focus-ring">{t.cta.label}</a>
          </Card>
        ))}
      </div>
    </Section>
  );
}
