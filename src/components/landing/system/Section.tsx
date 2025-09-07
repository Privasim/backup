import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

interface SectionProps extends PropsWithChildren {
  id?: string;
  ariaLabel?: string;
  className?: string;
  containerClassName?: string;
}

export default function Section({
  id,
  ariaLabel,
  className,
  containerClassName,
  children,
}: SectionProps) {
  return (
    <section id={id} aria-label={ariaLabel} className={clsx('py-16 md:py-24', className)}>
      <div className={clsx('max-w-7xl mx-auto px-6', containerClassName)}>{children}</div>
    </section>
  );
}
