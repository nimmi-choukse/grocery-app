"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LoadingBarProps {
  visible: boolean;
}

export default function LoadingBar({ visible }: LoadingBarProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          className="mt-6 w-56 sm:w-64"
        >
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#f3d788]"
            />
          </div>
          <p className="mt-2 text-center text-xs font-medium tracking-wide text-white/70">
            Loading your store…
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}