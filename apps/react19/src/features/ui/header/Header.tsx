import type React from 'react';
import { cn } from '@task-manager/utils';

export function Header({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <header
      className={cn('px-4 py-8 border-b border-b-secondary md:px-8', className)}
      {...props}
    >
      {children}
    </header>
  );
}
