import type React from 'react';
import { cn } from '@task-manager/utils';

export function Header({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <header
      className={cn('py-4 md:py-6 border-b border-b-secondary', className)}
      {...props}
    >
      {children}
    </header>
  );
}
