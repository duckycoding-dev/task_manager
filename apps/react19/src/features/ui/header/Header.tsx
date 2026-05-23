import type React from 'react';

import { cn } from '@task-manager/utils';

export function Header({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <header
      className={cn('border-b-secondary border-b py-4', className)}
      {...props}
    >
      {children}
    </header>
  );
}
