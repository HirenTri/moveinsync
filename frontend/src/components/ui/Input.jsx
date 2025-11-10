import { forwardRef } from 'react';

const inputStyles = {
  variant: {
    default: "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400",
    error: "w-full px-4 py-3 rounded-xl border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400",
    success: "w-full px-4 py-3 rounded-xl border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder:text-gray-400",
  }
};

const Input = forwardRef(({ 
  className = "", 
  variant = "default", 
  error, 
  ...props 
}, ref) => {
  const finalVariant = error ? "error" : variant;
  const inputClassName = `${inputStyles.variant[finalVariant]} ${className}`;

  return (
    <input
      className={inputClassName}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };