import type React from 'react';
import { cn } from '@task-manager/utils';

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
}

export function Input({ type = 'text', className, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn('p-2 border border-secondary border-r-4 w-full', className)}
      {...props}
    />
  );
}
