"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceWaveformProps {
  isRecording: boolean;
  audioStream?: MediaStream | null;
}

export default function VoiceWaveform({
  isRecording,
  audioStream,
}: VoiceWaveformProps) {
  const [levels, setLevels] = useState<number[]>(Array(20).fill(0.1));
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording || !audioStream) {
      setLevels(Array(20).fill(0.1));
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioStream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 64;
    source.connect(analyzer);
    analyzerRef.current = analyzer;

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);

    const updateLevels = () => {
      if (!analyzerRef.current) return;
      analyzerRef.current.getByteFrequencyData(dataArray);

      const newLevels = Array.from({ length: 20 }, (_, i) => {
        const index = Math.floor((i / 20) * dataArray.length);
        return Math.max(0.1, dataArray[index] / 255);
      });

      setLevels(newLevels);
      animationRef.current = requestAnimationFrame(updateLevels);
    };

    updateLevels();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [isRecording, audioStream]);

  // Simulated waveform when no audio stream
  useEffect(() => {
    if (!isRecording || audioStream) return;

    const interval = setInterval(() => {
      setLevels((prev) =>
        prev.map(() => Math.max(0.1, Math.random() * 0.8 + 0.2))
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording, audioStream]);

  return (
    <AnimatePresence>
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center justify-center gap-0.5 h-12 px-4"
        >
          {levels.map((level, i) => (
            <motion.div
              key={i}
              className="w-1 bg-foreground rounded-full"
              animate={{
                height: `${level * 40}px`,
                opacity: 0.3 + level * 0.7,
              }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
