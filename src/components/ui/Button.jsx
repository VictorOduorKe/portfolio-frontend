
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'cursor-pointer border-none rounded-md px-6 py-3 font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    secondary: 'bg-secondary text-white hover:opacity-90',
    danger: 'bg-danger text-white hover:opacity-90',
    outline: 'bg-transparent border-[1.5px] border-primary text-primary hover:bg-primary/5',
    ghost: 'bg-transparent text-primary hover:bg-primary/10'
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
