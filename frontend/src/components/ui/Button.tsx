import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'destructive';
  fullWidth?: boolean;
}

function Button({ 
  children, 
  variant = 'default', 
  fullWidth = false,
  className = '',
  ...props 
}: ButtonProps) {
  const baseClass = fullWidth ? 'w-full' : '';
  
  const variantClass = {
    default: 'btn-bracket',
    primary: 'btn-primary',
    destructive: 'btn-destructive',
  }[variant];

  return (
    <button
      className={`${variantClass} ${baseClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
