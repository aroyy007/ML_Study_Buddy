"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AIParticleSystemProps {
  isActive: boolean;
}

export default function AIParticleSystem({ isActive }: AIParticleSystemProps) {
  const particles = Array.from({ length: 12 }, (_, i) => i);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="relative w-16 h-16">
          {/* Central orb */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className="w-8 h-8 rounded-full bg-foreground/20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute w-4 h-4 rounded-full bg-foreground/40"
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Orbiting particles */}
          {particles.map((i) => {
            const angle = (i / particles.length) * Math.PI * 2;
            const radius = 24;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.5, 1, 0.5],
                  x: [
                    Math.cos(angle) * radius,
                    Math.cos(angle + Math.PI) * radius,
                    Math.cos(angle) * radius,
                  ],
                  y: [
                    Math.sin(angle) * radius,
                    Math.sin(angle + Math.PI) * radius,
                    Math.sin(angle) * radius,
                  ],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "linear",
                }}
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-foreground/60 -translate-x-1/2 -translate-y-1/2"
              />
            );
          })}

          {/* Pulse rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`ring-${i}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: [0.5, 1.5],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut",
              }}
              className="absolute inset-0 rounded-full border border-foreground/30"
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
