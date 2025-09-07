'use client';

import Section from './system/Section';
import SectionHeading from './system/SectionHeading';
import { AccordionItem } from './system/Accordion';
import type { FaqItems } from './types';

interface Props { items: FaqItems; }

export default function FAQ({ items }: Props) {
  return (
    <Section id="faq" ariaLabel="Frequently Asked Questions">
      <SectionHeading eyebrow="Answers">FAQ</SectionHeading>
      <div className="divide-y divide-[var(--border-muted)]">
        {items.map((f) => (
          <AccordionItem key={f.id} id={f.id} question={f.question} answer={f.answer} />
        ))}
      </div>
    </Section>
  );
}
