import React from "react";
import { motion } from "framer-motion";

const ProgressBar = ({
  value,
  max = 100,
  colorClass = "bg-primary-500",
  className = "",
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={`w-full bg-border rounded-full h-2 overflow-hidden ${className}`}
    >
      <motion.div
        className={`h-full ${colorClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
};

export default ProgressBar;
