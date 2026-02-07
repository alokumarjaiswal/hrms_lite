import type { ReactNode } from 'react';

interface StatusTextProps {
  children: ReactNode;
  type?: 'loading' | 'success' | 'error' | 'info';
  withCursor?: boolean;
  className?: string;
}

function StatusText({ 
  children, 
  type = 'info', 
  withCursor = false,
  className = '' 
}: StatusTextProps) {
  const typeClass = {
    loading: 'status-loading',
    success: 'status-success',
    error: 'status-error',
    info: 'text-text',
  }[type];

  const cursorClass = withCursor ? 'cursor-blink' : '';

  return (
    <p className={`${typeClass} ${cursorClass} ${className}`}>
      {children}
    </p>
  );
}

export default StatusText;
