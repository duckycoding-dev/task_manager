import type React from 'react';

import { cn } from '@task-manager/utils';

import { Input } from '../../input/text/Input';

interface InputWithLabelProps extends React.ComponentProps<typeof Input> {
  label: React.ReactNode;
  inputId: string;
  inputName: string;
  inputClassName?: string;
  labelClassName?: string;
}

export function InputWithLabel({
  type = 'text',
  className,
  inputId,
  inputName,
  inputClassName,
  label,
  labelClassName,
  ...props
}: InputWithLabelProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className={labelClassName} htmlFor={inputId}>
        {label}
      </label>
      <Input
        type={type}
        id={inputId}
        name={inputName}
        className={inputClassName}
        {...props}
      />
    </div>
  );
}
