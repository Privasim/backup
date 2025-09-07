import Section from './system/Section';
import SectionHeading from './system/SectionHeading';
import type { HowSteps } from './types';

interface Props { steps: HowSteps; }

export default function HowItWorks({ steps }: Props) {
  return (
    <Section id="how-it-works" ariaLabel="How it works">
      <SectionHeading eyebrow="Get started fast">How It Works</SectionHeading>
      <ol className="grid md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <li key={s.step} className="card-base p-8">
            <div className="text-brand text-2xl font-bold mb-3">{s.step}</div>
            <h3 className="text-xl font-semibold text-primary mb-2">{s.title}</h3>
            <p className="text-secondary">{s.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
