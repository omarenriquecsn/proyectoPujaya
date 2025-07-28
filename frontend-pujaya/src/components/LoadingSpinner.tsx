import { motion } from "motion/react";

export const LoadingSpinner = () => {
  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-10 h-10 border-t-2 border-b-2 border-blue-900 rounded-full animate-spin"></div>
    </motion.div>
  );
};

