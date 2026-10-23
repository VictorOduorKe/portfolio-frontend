import React from 'react';

const Input = React.forwardRef(({ label, className = '', error, ...props }, ref) => {
  return (
    <div className="mb-5 w-full">
      {label && (
        <label className="block text-sm font-semibold text-text-light mb-1.5 font-sans">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 border border-primary/15 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-text-light/50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-200 ${
          error ? 'border-danger focus:ring-danger/5 focus:border-danger' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
