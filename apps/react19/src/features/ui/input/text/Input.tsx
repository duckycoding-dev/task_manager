import type React from 'react';
import classes from './input.module.css';

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
}

export function Input({ type = 'text', className, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={`${classes['text-input']} ${className ?? ''}`}
      {...props}
    />
  );
}
