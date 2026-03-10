import React from "react";
import { motion } from "framer-motion";

const CircularProgress = ({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-border"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          strokeLinecap="round"
          className="text-primary-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
        />
      </svg>
      {label && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-textSecondary">
            {value}
            <span className="text-sm font-normal text-textMuted">/{max}</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default CircularProgress;
