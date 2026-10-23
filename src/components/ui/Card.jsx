
export const Card = ({ children, className = '', ...props }) => {
  const hasCustomPadding = /\bp-\d+|\bpx-\d+|\bpy-\d+/.test(className);
  const defaultPadding = hasCustomPadding ? '' : 'p-6';
  return (
    <div
      className={`bg-surface rounded-2xl ${defaultPadding} shadow-[0_4px_20px_rgba(27,28,28,0.05)] border border-surface-variant ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`font-headline-sm text-[20px] text-primary ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`text-on-surface-variant ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-4 border-t border-surface-variant flex items-center gap-4 ${className}`}>
    {children}
  </div>
);
