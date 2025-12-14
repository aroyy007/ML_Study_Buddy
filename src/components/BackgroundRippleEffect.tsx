"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface BackgroundRippleEffectProps {
  voiceActive?: boolean;
}

export default function BackgroundRippleEffect({ voiceActive = false }: BackgroundRippleEffectProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);
  const autoRippleRef = useRef<NodeJS.Timeout | null>(null);

  const createRipple = useCallback((x: number, y: number) => {
    const newRipple: Ripple = {
      id: rippleIdRef.current++,
      x,
      y,
      size: Math.random() * 100 + 50,
    };
    setRipples((prev) => [...prev.slice(-8), newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 2000);
  }, []);

  // Auto-generate ripples when voice is active
  useEffect(() => {
    if (voiceActive) {
      const generateAutoRipple = () => {
        if (typeof window !== "undefined") {
          const x = Math.random() * window.innerWidth;
          const y = Math.random() * window.innerHeight;
          createRipple(x, y);
        }
      };

      // Initial ripples
      for (let i = 0; i < 3; i++) {
        setTimeout(() => generateAutoRipple(), i * 200);
      }

      // Continuous ripples while voice is active
      autoRippleRef.current = setInterval(generateAutoRipple, 400);

      return () => {
        if (autoRippleRef.current) {
          clearInterval(autoRippleRef.current);
        }
      };
    } else {
      if (autoRippleRef.current) {
        clearInterval(autoRippleRef.current);
      }
    }
  }, [voiceActive, createRipple]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        createRipple(e.clientX - rect.left, e.clientY - rect.top);
      }
    },
    [createRipple]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("click", handleClick);
      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("click", handleClick);
      };
    }
  }, [handleMouseMove, handleClick]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-auto overflow-hidden -z-10"
    >
      {/* Black background overlay when voice is active */}
      <AnimatePresence>
        {voiceActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 bg-black z-0"
          />
        )}
      </AnimatePresence>

      {/* Gradient follow cursor - only when not voice active */}
      {!voiceActive && (
        <div
          className="absolute w-96 h-96 rounded-full opacity-35 blur-3xl transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background:
              "radial-gradient(circle, var(--foreground) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Grid pattern - only when voice not active */}
      {!voiceActive && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: 0.05,
            backgroundImage: `
              linear-gradient(var(--foreground) 1px, transparent 1px),
              linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      )}

      {/* Voice active glow effect */}
      <AnimatePresence>
        {voiceActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10"
          >
            {/* Center glow */}
            <motion.div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(120, 80, 220, 0.25) 0%, rgba(80, 120, 255, 0.15) 30%, rgba(60, 100, 200, 0.05) 50%, transparent 70%)",
                filter: "blur(60px)",
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Secondary outer glow */}
            <motion.div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(100, 60, 180, 0.1) 0%, transparent 60%)",
                filter: "blur(80px)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated ripples - enhanced during voice with brighter colors on black */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: voiceActive ? 0.9 : 0.7 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute rounded-full z-20"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              border: voiceActive
                ? "2px solid rgba(150, 120, 255, 0.6)"
                : "1px solid var(--foreground)",
              boxShadow: voiceActive
                ? "0 0 20px rgba(150, 120, 255, 0.3), inset 0 0 20px rgba(150, 120, 255, 0.1)"
                : "none",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Floating particles - only when voice not active */}
      {!voiceActive && [...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-foreground/20"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
          }}
          animate={{
            x: [null, Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000)],
            y: [null, Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000)],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
        />
      ))}

      {/* Voice-active floating orbs - brighter on black background */}
      <AnimatePresence>
        {voiceActive && [...Array(15)].map((_, i) => (
          <motion.div
            key={`voice-particle-${i}`}
            className="absolute rounded-full z-20"
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              background: `radial-gradient(circle, rgba(${140 + Math.random() * 80}, ${100 + Math.random() * 80}, 255, 0.9) 0%, rgba(${120 + Math.random() * 60}, ${80 + Math.random() * 60}, 220, 0.4) 50%, transparent 70%)`,
              boxShadow: `0 0 ${10 + Math.random() * 10}px rgba(150, 120, 255, 0.5)`,
            }}
            initial={{
              x: typeof window !== "undefined" ? window.innerWidth / 2 : 500,
              y: typeof window !== "undefined" ? window.innerHeight / 3 : 250,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
              scale: [0, 1.2, 0.6],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeOut",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}