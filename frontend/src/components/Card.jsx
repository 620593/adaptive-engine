import React from "react";

const Card = ({ children, glow = false, className = "", ...props }) => {
  const glowClass = glow
    ? "hover:border-primary-500/40 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
    : "hover:border-border";

  return (
    <div
      className={`bg-surface/80 backdrop-blur-md border border-border rounded-2xl transition-all duration-300 ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
