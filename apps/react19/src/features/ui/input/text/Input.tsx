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
      className={cn(
        'input',
        'p-2 w-full invalid:border-error valid:border-success',
        className,
      )}
      {...props}
    />
  );
}
