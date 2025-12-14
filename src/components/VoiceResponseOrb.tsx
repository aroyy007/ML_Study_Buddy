"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceResponseOrbProps {
  isActive: boolean;
  isSpeaking?: boolean;
}

export default function VoiceResponseOrb({ isActive, isSpeaking = false }: VoiceResponseOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 200;
    canvas.width = size;
    canvas.height = size;

    const animate = () => {
      timeRef.current += 0.02;
      const time = timeRef.current;

      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const baseRadius = 70;

      // Outer glow
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius + 30);
      glowGradient.addColorStop(0, "rgba(200, 150, 255, 0.3)");
      glowGradient.addColorStop(0.5, "rgba(100, 150, 255, 0.15)");
      glowGradient.addColorStop(1, "rgba(255, 100, 200, 0)");
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, size, size);

      // Main sphere with animated gradient
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.clip();

      // Create dynamic gradient based on speaking state
      const intensity = isSpeaking ? 1.2 : 1;
      const pulse = Math.sin(time * 3) * 0.1 + 1;

      // Base gradient - left to right
      const gradient = ctx.createLinearGradient(
        centerX - baseRadius + Math.sin(time) * 10,
        centerY,
        centerX + baseRadius + Math.cos(time) * 10,
        centerY
      );

      // Pink -> Blue -> Light pink gradient
      gradient.addColorStop(0, `rgba(${220 * intensity}, ${80 * intensity}, ${180 * intensity}, 1)`);
      gradient.addColorStop(0.3, `rgba(${180 * intensity}, ${100 * intensity}, ${220 * intensity}, 1)`);
      gradient.addColorStop(0.5, `rgba(${100 * intensity}, ${150 * intensity}, ${255 * intensity}, 1)`);
      gradient.addColorStop(0.7, `rgba(${180 * intensity}, ${150 * intensity}, ${230 * intensity}, 1)`);
      gradient.addColorStop(1, `rgba(${255 * intensity}, ${200 * intensity}, ${230 * intensity}, 1)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Add flowing wave effect
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const waveOffset = time * 2 + i * 0.5;
        const waveAmplitude = 15 + (isSpeaking ? Math.sin(time * 8 + i) * 10 : 0);
        
        ctx.moveTo(centerX - baseRadius, centerY);
        for (let x = -baseRadius; x <= baseRadius; x += 2) {
          const y = Math.sin(x * 0.05 + waveOffset) * waveAmplitude * pulse;
          ctx.lineTo(centerX + x, centerY + y);
        }
        
        const waveGradient = ctx.createLinearGradient(
          centerX - baseRadius,
          centerY,
          centerX + baseRadius,
          centerY
        );
        waveGradient.addColorStop(0, `rgba(255, 255, 255, ${0.03 * (5 - i)})`);
        waveGradient.addColorStop(0.5, `rgba(200, 220, 255, ${0.05 * (5 - i)})`);
        waveGradient.addColorStop(1, `rgba(255, 200, 230, ${0.03 * (5 - i)})`);
        
        ctx.strokeStyle = waveGradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Central light reflection
      const reflectGradient = ctx.createRadialGradient(
        centerX - 10 + Math.sin(time) * 5,
        centerY - 20,
        0,
        centerX,
        centerY,
        baseRadius
      );
      reflectGradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
      reflectGradient.addColorStop(0.3, "rgba(255, 255, 255, 0.1)");
      reflectGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = reflectGradient;
      ctx.fillRect(0, 0, size, size);

      // Edge highlight
      const edgeGradient = ctx.createRadialGradient(centerX, centerY, baseRadius - 10, centerX, centerY, baseRadius);
      edgeGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      edgeGradient.addColorStop(0.8, "rgba(255, 255, 255, 0.1)");
      edgeGradient.addColorStop(1, "rgba(255, 255, 255, 0.3)");
      ctx.fillStyle = edgeGradient;
      ctx.fillRect(0, 0, size, size);

      ctx.restore();

      // Particle sparkles
      if (isSpeaking) {
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + time;
          const distance = baseRadius + 15 + Math.sin(time * 4 + i) * 10;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          const sparkSize = 2 + Math.sin(time * 6 + i * 2) * 1;
          
          ctx.beginPath();
          ctx.arc(x, y, sparkSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(time * 4 + i) * 0.3})`;
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isSpeaking]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative flex items-center justify-center"
        >
          {/* Background glow */}
          <motion.div
            className="absolute w-[250px] h-[250px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(150, 100, 255, 0.2) 0%, rgba(100, 150, 255, 0.1) 40%, transparent 70%)",
              filter: "blur(20px)",
            }}
            animate={{
              scale: isSpeaking ? [1, 1.1, 1] : [1, 1.05, 1],
            }}
            transition={{
              duration: isSpeaking ? 0.5 : 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Canvas orb */}
          <canvas
            ref={canvasRef}
            className="relative z-10"
            style={{ width: 200, height: 200 }}
          />
          
          {/* Speaking indicator pulse */}
          {isSpeaking && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-[160px] h-[160px] rounded-full border"
                  style={{
                    borderColor: "rgba(200, 150, 255, 0.3)",
                  }}
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{
                    scale: [0.8, 1.4],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
