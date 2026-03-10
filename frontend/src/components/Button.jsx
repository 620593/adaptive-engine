import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 focus:ring-primary-500",
    outline:
      "bg-transparent border border-border hover:border-textSecondary text-textPrimary hover:bg-surface focus:ring-textSecondary",
    ghost:
      "bg-transparent hover:bg-surface text-textSecondary hover:text-textPrimary focus:ring-surface",
    danger:
      "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-4 text-lg",
  };

  const sizeClass = className.includes("py-") ? "" : sizes.md;

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
