import Section from './system/Section';
import SectionHeading from './system/SectionHeading';
import Card from './system/Card';
import type { BenefitItems } from './types';

interface Props {
  items: BenefitItems;
}

export default function Benefits({ items }: Props) {
  return (
    <Section id="benefits" ariaLabel="Key benefits">
      <SectionHeading eyebrow="Why CareerGuard?">Benefits</SectionHeading>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((b, i) => (
          <Card key={i} className="p-8">
            {b.icon ? (
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6">
                {b.icon}
              </div>
            ) : null}
            <h3 className="text-xl font-semibold text-primary mb-3">{b.title}</h3>
            <p className="text-secondary">{b.description}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
