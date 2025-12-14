"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

interface EncryptedTextProps {
  text: string;
  isRevealing: boolean;
  onRevealComplete?: () => void;
  speed?: number;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export default function EncryptedText({
  text,
  isRevealing,
  onRevealComplete,
  speed = 3,
}: EncryptedTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [revealedIndex, setRevealedIndex] = useState(0);

  const scrambledText = useMemo(() => {
    return text
      .split("")
      .map((char) =>
        char === " " || char === "\n"
          ? char
          : CHARS[Math.floor(Math.random() * CHARS.length)]
      )
      .join("");
  }, [text]);

  useEffect(() => {
    if (!isRevealing) {
      setDisplayText(scrambledText);
      setRevealedIndex(0);
      return;
    }

    if (revealedIndex >= text.length) {
      onRevealComplete?.();
      return;
    }

    const timeout = setTimeout(() => {
      setRevealedIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [isRevealing, revealedIndex, text, scrambledText, speed, onRevealComplete]);

  useEffect(() => {
    if (!isRevealing) return;

    const revealed = text.slice(0, revealedIndex);
    const remaining = text.slice(revealedIndex);
    const scrambledRemaining = remaining
      .split("")
      .map((char) =>
        char === " " || char === "\n"
          ? char
          : CHARS[Math.floor(Math.random() * CHARS.length)]
      )
      .join("");

    setDisplayText(revealed + scrambledRemaining);
  }, [revealedIndex, text, isRevealing]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-mono"
    >
      {displayText.split("").map((char, index) => (
        <span
          key={index}
          className={`transition-all duration-100 ${index < revealedIndex
              ? "text-foreground"
              : "text-muted-foreground/50"
            }`}
        >
          {char}
        </span>
      ))}
    </motion.span>
  );
}
