import classes from './page-title.module.css';

export function PageTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className={`${classes['page-title']} ${className ?? ''}`} {...props}>
      {children}
    </h1>
  );
}
