const alertStyles = {
  variant: {
    success: "bg-green-50/80 border-green-500 text-green-800",
    warning: "bg-yellow-50/80 border-yellow-500 text-yellow-800",
    danger: "bg-red-50/80 border-red-500 text-red-800",
    info: "bg-blue-50/80 border-blue-500 text-blue-800",
  }
};

export const Alert = ({ 
  children, 
  variant = "info", 
  className = "", 
  ...props 
}) => {
  const alertClassName = `p-4 rounded-xl border-l-4 shadow-lg backdrop-blur-sm ${alertStyles.variant[variant]} ${className}`;
  
  return (
    <div className={alertClassName} {...props}>
      {children}
    </div>
  );
};

export const AlertTitle = ({ children, className = "", ...props }) => (
  <h4 className={`font-semibold mb-2 ${className}`} {...props}>
    {children}
  </h4>
);

export const AlertDescription = ({ children, className = "", ...props }) => (
  <p className={className} {...props}>
    {children}
  </p>
);