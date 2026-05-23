import { cn } from '@task-manager/utils';

export function FormError({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-error text-primary border-4 p-4 text-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}
