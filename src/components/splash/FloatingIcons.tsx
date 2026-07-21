"use client";

import { motion } from "framer-motion";

const GROCERY_EMOJIS = ["🥕", "🍅", "🥦", "🍎", "🥑", "🍇", "🍞", "🥬"];

interface FloatingIconsProps {
  active: boolean;
}

export default function FloatingIcons({ active }: FloatingIconsProps) {
  const icons = GROCERY_EMOJIS.map((emoji, i) => {
    const left = (i * 12.5 + (i % 3) * 4) % 100;
    const delay = i * 0.15;
    const duration = 6 + (i % 4);
    const size = 20 + (i % 3) * 8;

    return (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 40 }}
        animate={
          active
            ? {
                opacity: [0, 0.35, 0.35, 0],
                y: [40, -20, -60, -120],
              }
            : { opacity: 0 }
        }
        transition={{
          duration,
          delay: 0.2 + delay,
          repeat: Infinity,
          repeatDelay: 1.2,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          left: `${left}%`,
          bottom: "10%",
          fontSize: size,
          filter: "blur(0.3px)",
        }}
      >
        {emoji}
      </motion.div>
    );
  });

  const particles = Array.from({ length: 18 }).map((_, i) => {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 3;
    const dur = 3 + Math.random() * 3;

    return (
      <motion.span
        key={`p-${i}`}
        initial={{ opacity: 0 }}
        animate={
          active
            ? { opacity: [0, 0.25, 0], y: [0, -30] }
            : { opacity: 0 }
        }
        transition={{
          duration: dur,
          delay,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          left: `${left}%`,
          top: `${top}%`,
          width: 3,
          height: 3,
          borderRadius: "9999px",
          background: "rgba(255,255,255,0.6)",
        }}
      />
    );
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {icons}
      {particles}
    </div>
  );
}