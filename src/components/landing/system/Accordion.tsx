'use client';

import { useState } from 'react';
import clsx from 'clsx';

interface AccordionItemProps {
  id: string;
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export function AccordionItem({ id, question, answer, defaultOpen }: AccordionItemProps) {
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div className="border-b border-[var(--border-muted)]">
      <h3>
        <button
          id={buttonId}
          aria-controls={panelId}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={clsx(
            'w-full text-left py-4 flex items-center justify-between focus-ring',
            'text-primary font-medium'
          )}
        >
          <span>{question}</span>
          <span className="text-secondary" aria-hidden>{open ? '−' : '+'}</span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="pb-4 text-secondary"
      >
        {answer}
      </div>
    </div>
  );
}
