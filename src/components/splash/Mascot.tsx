"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export type MascotPose =
  | "standing"
  | "walking"
  | "pointing"
  | "waving"
  | "grocery-bag"
  | "thumbs-up"
  | "celebrating";

interface MascotProps {
  pose: MascotPose;
  walkIn?: boolean;
}

const POSE_SRC: Record<MascotPose, string> = {
  standing: "/mascot/standing.png",
  walking: "/mascot/walking.png",
  pointing: "/mascot/pointing.png",
  waving: "/mascot/waving.png",
  "grocery-bag": "/mascot/grocery-bag.png",
  "thumbs-up": "/mascot/thumbs-up.png",
  celebrating: "/mascot/celebrating.png",
};

export default function Mascot({ pose, walkIn = false }: MascotProps) {
  return (
    <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
      <AnimatePresence mode="wait">
        <motion.div
          key={pose}
          initial={
            walkIn
              ? { opacity: 0, x: -90, scale: 0.9 }
              : { opacity: 0, scale: 0.85 }
          }
          animate={
            walkIn
              ? { opacity: 1, x: 0, scale: 1 }
              : { opacity: 1, scale: 1 }
          }
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 140,
            damping: 16,
            mass: 0.9,
          }}
          className="relative h-full w-full"
        >
          <Image
            src={POSE_SRC[pose]}
            alt="Shivam Traders mascot"
            fill
            priority
            sizes="256px"
            className="object-contain drop-shadow-[0_18px_25px_rgba(0,0,0,0.35)]"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}