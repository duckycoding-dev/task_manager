interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, type, children, ...props }: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={`btn ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
