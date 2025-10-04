import { cn } from '@task-manager/utils';

export function PageSubtitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-xl font-semibold', className)} {...props}>
      {children}
    </h2>
  );
}
