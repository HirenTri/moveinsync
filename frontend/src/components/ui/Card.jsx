const cardStyles = {
  variant: {
    default: "bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
    glass: "bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
    dark: "bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
    gradient: "bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
  }
};

export const Card = ({ 
  children, 
  className = "", 
  variant = "default", 
  ...props 
}) => {
  const cardClassName = `${cardStyles.variant[variant]} ${className}`;
  
  return (
    <div className={cardClassName} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...props }) => (
  <h3 className={`text-xl font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "", ...props }) => (
  <p className={`text-gray-600 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = "", ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = "", ...props }) => (
  <div className={`mt-4 ${className}`} {...props}>
    {children}
  </div>
);