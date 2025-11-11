import { forwardRef } from 'react';

const buttonStyles = {
  variant: {
  primary: "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl focus:ring-teal-500/50",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-lg hover:-translate-y-0.5 hover:shadow-xl focus:ring-blue-500/50",
    success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl focus:ring-green-500/50",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl focus:ring-red-500/50",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl focus:ring-yellow-500/50",
    ghost: "hover:bg-gray-100 text-gray-700 hover:-translate-y-0.5 focus:ring-blue-500/50",
  },
  size: {
    sm: "h-9 px-3 text-sm rounded-lg",
    default: "h-12 px-6 py-3 rounded-xl",
    lg: "h-14 px-8 py-4 text-lg rounded-xl",
    icon: "h-10 w-10 rounded-xl",
  },
};

const Button = forwardRef(({ 
  className = "", 
  variant = "primary", 
  size = "default", 
  children, 
  disabled,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0";
  const variantClasses = buttonStyles.variant[variant] || buttonStyles.variant.primary;
  const sizeClasses = buttonStyles.size[size] || buttonStyles.size.default;
  
  const finalClassName = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;

  return (
    <button
      className={finalClassName}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };