import Section from './system/Section';
import SectionHeading from './system/SectionHeading';
import Card from './system/Card';
import type { FeatureItems } from './types';

interface Props {
  items: FeatureItems;
}

export default function Features({ items }: Props) {
  return (
    <Section id="features" ariaLabel="Platform features">
      <SectionHeading eyebrow="Capabilities">Features</SectionHeading>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((f, i) => (
          <Card key={i} className="p-8">
            {f.icon ? (
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6">
                {f.icon}
              </div>
            ) : null}
            <h3 className="text-xl font-semibold text-primary mb-3">{f.title}</h3>
            <p className="text-secondary">{f.description}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
