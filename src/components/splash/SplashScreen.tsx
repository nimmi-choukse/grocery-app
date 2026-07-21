"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Mascot, { MascotPose } from "./Mascot";
import FloatingIcons from "./FloatingIcons";
import LoadingBar from "./LoadingBar";

const SPLASH_SESSION_KEY = "shivam-traders-splash-played";

interface SplashScreenProps {
  onComplete?: () => void;
  logoSrc?: string;
}

interface Step {
  time: number;
  pose: MascotPose;
  walkIn?: boolean;
}

const STEPS: Step[] = [
  { time: 800, pose: "standing" },
  { time: 1500, pose: "walking", walkIn: true },
  { time: 2500, pose: "pointing" },
  { time: 3500, pose: "grocery-bag" },
  { time: 4500, pose: "waving" },
  { time: 5500, pose: "thumbs-up" },
  { time: 6800, pose: "celebrating" },
];

export default function SplashScreen({ onComplete, logoSrc }: SplashScreenProps) {
  const [shouldPlay, setShouldPlay] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pose, setPose] = useState<MascotPose>("standing");
  const [walkIn, setWalkIn] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [logoBright, setLogoBright] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showBag, setShowBag] = useState(false);
  const [showLoadingBar, setShowLoadingBar] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let alreadyPlayed = false;
    try {
      alreadyPlayed = sessionStorage.getItem(SPLASH_SESSION_KEY) === "true";
    } catch {
      alreadyPlayed = false;
    }
    setShouldPlay(!alreadyPlayed);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (shouldPlay !== true) return;

    setMounted(true);

    STEPS.forEach((step) => {
      const t = setTimeout(() => {
        setPose(step.pose);
        setWalkIn(!!step.walkIn);

        if (step.pose === "pointing") setShowLogo(true);
        if (step.pose === "grocery-bag") setShowBag(true);
        if (step.pose === "waving") {
          setLogoBright(true);
          setShowTagline(true);
        }
        if (step.pose === "thumbs-up") setShowLoadingBar(true);
        if (step.pose === "celebrating") setShowConfetti(true);
      }, step.time);
      timers.current.push(t);
    });

    const fadeTimer = setTimeout(() => setFadeOut(true), 7500);
    timers.current.push(fadeTimer);

    const finishTimer = setTimeout(() => {
      try {
        sessionStorage.setItem(SPLASH_SESSION_KEY, "true");
      } catch {
        // ignore storage errors
      }
      onComplete?.();
    }, 8200);
    timers.current.push(finishTimer);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPlay]);

  if (shouldPlay === null) return null;

  if (shouldPlay === false) {
    if (mounted) onComplete?.();
    return null;
  }

  return (
    <AnimatePresence>
      {!fadeOut ? (
        <motion.div
          key="splash"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 50% 20%, #1E56B3 0%, #0D3B8E 55%, #071F4D 100%)",
          }}
        >
          <FloatingIcons active={!fadeOut} />

          <div className="relative flex flex-col items-center px-6 text-center">
            {/* Logo */}
            <AnimatePresence>
              {showLogo && (
                <motion.div
                  initial={{ opacity: 0, y: -14, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: logoBright
                      ? "brightness(1.25) drop-shadow(0 0 18px rgba(212,175,55,0.55))"
                      : "brightness(1)",
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mb-4"
                >
                  {logoSrc ? (
                    <Image
                      src={logoSrc}
                      alt="Shivam Traders"
                      width={160}
                      height={56}
                      className="h-auto w-40 object-contain"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold tracking-wide text-white sm:text-3xl">
                      Shivam <span className="text-[#D4AF37]">Traders</span>
                    </h2>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mascot + floating grocery bag */}
            <div className="relative">
              <Mascot pose={pose} walkIn={walkIn} />

              <AnimatePresence>
                {showBag && pose === "grocery-bag" && (
                  <motion.div
                    initial={{ opacity: 0, x: 40, y: -20, scale: 0.6 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 12,
                    }}
                    className="pointer-events-none absolute bottom-8 right-6 text-3xl"
                  >
                    🛍️
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tagline */}
            <AnimatePresence>
              {showTagline && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mt-2 text-sm font-medium tracking-wide text-white/85 sm:text-base"
                >
                  Fresh Groceries Delivered
                </motion.p>
              )}
            </AnimatePresence>

            <LoadingBar visible={showLoadingBar} />
          </div>

          {/* Confetti */}
          <AnimatePresence>
            {showConfetti && (
              <div className="pointer-events-none absolute inset-0">
                {Array.from({ length: 24 }).map((_, i) => {
                  const left = 10 + ((i * 37) % 80);
                  const colors = ["#D4AF37", "#ffffff", "#1E56B3", "#f3d788"];
                  const color = colors[i % colors.length];
                  return (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 0, rotate: 0 }}
                      animate={{
                        opacity: [0, 0.9, 0],
                        y: [0, 140 + (i % 5) * 20],
                        rotate: 180 + i * 12,
                      }}
                      transition={{
                        duration: 1.4 + (i % 4) * 0.2,
                        ease: "easeOut",
                        delay: (i % 6) * 0.05,
                      }}
                      style={{
                        position: "absolute",
                        left: `${left}%`,
                        top: "38%",
                        width: 6,
                        height: 6,
                        borderRadius: i % 2 === 0 ? "9999px" : "2px",
                        background: color,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}