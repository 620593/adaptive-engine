import React from "react";

const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizes[size]} rounded-full border-primary-500/20 border-t-primary-500 animate-spin`}
      />
    </div>
  );
};

export default LoadingSpinner;
