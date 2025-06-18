interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
import classes from './button.module.css';

export function Button({ className, type, children, ...props }: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={`${classes['button']} ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
