import { cn } from '@task-manager/utils';

export function FormError({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-error border-4 text-primary text-sm p-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}
