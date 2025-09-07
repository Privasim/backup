import type { PropsWithChildren, HTMLAttributes } from 'react';
import clsx from 'clsx';

export default function Card({
  className,
  children,
  ...rest
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={clsx('card-base', className)} {...rest}>
      {children}
    </div>
  );
}
