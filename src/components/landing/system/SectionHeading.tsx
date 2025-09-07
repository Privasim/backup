import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

interface SectionHeadingProps extends PropsWithChildren {
  eyebrow?: string;
  titleClassName?: string;
  subtitle?: string;
}

export default function SectionHeading({
  eyebrow,
  children,
  subtitle,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <header className="text-center mb-12">
      {eyebrow ? (
        <div className="badge-base badge-primary mb-6">
          <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
          {eyebrow}
        </div>
      ) : null}
      <h2 className={clsx('text-3xl md:text-4xl font-bold text-primary', titleClassName)}>{children}</h2>
      {subtitle ? <p className="text-secondary mt-4 max-w-2xl mx-auto">{subtitle}</p> : null}
    </header>
  );
}
