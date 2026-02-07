import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id: providedId, name, ...props }, ref) => {
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const inputName = name || props.type || 'input';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block mb-2 text-hierarchy-4 uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={inputName}
          className={`input-terminal ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-hierarchy-5 status-error">
            [ ERROR: {error} ]
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
