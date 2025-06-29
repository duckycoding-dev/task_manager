import { cn } from '@task-manager/utils';

export function PageTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className={cn('text-2xl font-bold mb-4', className)} {...props}>
      {children}
    </h1>
  );
}
