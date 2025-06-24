import type React from 'react';
import classes from './header.module.css';

export function Header({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <header
      className={`navigation ${classes['header']} ${className ?? ''}`}
      {...props}
    >
      {children}
    </header>
  );
}
