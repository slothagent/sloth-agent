"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  percentage: number;
  mcap: string;
}

export default function ProgressBar({ percentage, mcap }: ProgressBarProps) {
  return (
    <div className="mt-4 mb-2">
      <motion.div 
        className="flex justify-between text-xs mb-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span className="font-medium bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#04D9B2] bg-clip-text text-transparent">
          {percentage.toFixed(2)}%
        </span>
        <span className="text-gray-500 font-medium">MCap: {mcap}</span>
      </motion.div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#04D9B2] rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 0.8,
            ease: "easeOut",
            delay: 0.5
          }}
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ 
              x: ["0%", "100%"],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 1.5,
              ease: "linear"
            }}
          />
        </motion.div>
      </div>
    </div>
  );
} 