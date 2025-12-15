"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean the text - remove markdown formatting
    const cleanText = text
      .replace(/```[\s\S]*?```/g, " code block ") // Replace code blocks
      .replace(/`([^`]+)`/g, "$1") // Remove inline code backticks
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
      .replace(/\*([^*]+)\*/g, "$1") // Remove italic
      .replace(/#{1,6}\s/g, "") // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to text
      .replace(/[-*+]\s/g, "") // Remove list markers
      .replace(/\|[^|]*\|/g, "") // Remove table formatting
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Configure voice settings
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes("Google") ||
        voice.name.includes("Samantha") ||
        voice.name.includes("Alex") ||
        voice.lang.startsWith("en")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported };
}
