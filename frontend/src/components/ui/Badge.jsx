const badgeStyles = {
  variant: {
    success: "bg-green-100 text-green-800 border border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    danger: "bg-red-100 text-red-800 border border-red-200",
    info: "bg-blue-100 text-blue-800 border border-blue-200",
    secondary: "bg-gray-100 text-gray-800 border border-gray-200",
  }
};

export const Badge = ({ 
  children, 
  variant = "secondary", 
  className = "", 
  ...props 
}) => {
  const badgeClassName = `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeStyles.variant[variant]} ${className}`;
  
  return (
    <span className={badgeClassName} {...props}>
      {children}
    </span>
  );
};