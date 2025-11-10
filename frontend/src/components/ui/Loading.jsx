export const Spinner = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${sizeClasses[size]} ${className}`}></div>
  );
};

export const LoadingOverlay = ({ isLoading, children, message = "Loading..." }) => {
  if (!isLoading) return children;

  return (
    <div className="relative">
      <div className="opacity-50">{children}</div>
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
        <div className="flex flex-col items-center space-y-3">
          <Spinner size="lg" />
          <p className="text-gray-600 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};