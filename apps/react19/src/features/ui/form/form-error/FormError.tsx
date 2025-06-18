import classes from './form-error.module.css';

export function FormError({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`${classes['error-container']} ${className ?? ''}`}
      {...props}
    >
      {children}
    </div>
  );
}
