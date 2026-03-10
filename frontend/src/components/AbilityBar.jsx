import React from "react";
import { motion } from "framer-motion";

const AbilityBar = ({ score = 0 }) => {
  // mapped score logic
  // Score is roughly -3 to +3
  // Convert -3..+3 to 0..100%
  const percentage = Math.min(Math.max(((score + 3) / 6) * 100, 0), 100);

  return (
    <div className="w-full">
      <div className="relative h-2 bg-border rounded-full overflow-hidden flex">
        <motion.div
          className="absolute h-full top-0 left-0 bg-gradient-to-r from-error via-warning to-success"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-xs font-mono text-textMuted mt-1">
        <span>-3.0</span>
        <span>0</span>
        <span>+3.0</span>
      </div>
    </div>
  );
};

export default AbilityBar;
