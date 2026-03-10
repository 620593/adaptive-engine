import React from "react";

const Badge = ({ children, variant = "gray", className = "", ...props }) => {
  const variants = {
    indigo: "bg-primary-500/10 text-primary-500 border-primary-500/20",
    green: "bg-success/10 text-success border-success/20",
    red: "bg-error/10 text-error border-error/20",
    yellow: "bg-warning/10 text-warning border-warning/20",
    gray: "bg-textMuted/10 text-textSecondary border-textMuted/20",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
