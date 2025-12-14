"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Loader2, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoiceWaveform from "./VoiceWaveform";
import { transcribeAudio } from "@/lib/api";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendImageMessage?: (image: File, question: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSendMessage,
  onSendImageMessage,
  isLoading = false,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 4000;
  const charCount = message.length;
  const isOverLimit = charCount > MAX_CHARS;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [message]);

  // Create image preview URL
  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
  }, [selectedImage]);

  const handleSubmit = useCallback(() => {
    if (isLoading || disabled) return;

    // If image is selected, send as image message
    if (selectedImage && onSendImageMessage) {
      onSendImageMessage(selectedImage, message.trim());
      setSelectedImage(null);
      setMessage("");
      return;
    }

    // Regular text message
    if (message.trim() && !isOverLimit) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [message, isOverLimit, isLoading, disabled, onSendMessage, onSendImageMessage, selectedImage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setIsRecording(true);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        setIsTranscribing(true);
        try {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          const transcription = await transcribeAudio(audioBlob);
          setMessage((prev) => prev + transcription);
        } catch (error) {
          console.error("Transcription error:", error);
          setMessage((prev) => prev + "[Transcription failed - please type your question]");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
    } catch {
      console.error("Error accessing microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      audioStream?.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
      setIsRecording(false);
    }
  };

  const canSubmit = selectedImage || (message.trim() && !isOverLimit);

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
      />

      {/* Image preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute -top-24 left-0 z-10"
          >
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Selected"
                className="h-20 w-auto rounded-lg border border-border shadow-lg object-cover"
              />
              <button
                onClick={clearSelectedImage}
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm text-[10px] text-center py-0.5 rounded-b-lg">
                Image attached
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute -top-16 left-0 right-0 flex items-center justify-center"
          >
            <div className="bg-background/95 backdrop-blur-xl rounded-full px-6 py-2 border border-border shadow-lg">
              <VoiceWaveform isRecording={isRecording} audioStream={audioStream} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative flex items-end gap-2 p-3 rounded-2xl bg-muted/50 border border-border/50 focus-within:border-foreground/30 transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Voice input button */}
        <Button
          variant="ghost"
          size="icon"
          className={`shrink-0 h-10 w-10 rounded-xl transition-colors ${isRecording
            ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
            : "hover:bg-muted"
            }`}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={disabled}
        >
          {isRecording ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>

        {/* Image upload button */}
        <Button
          variant="ghost"
          size="icon"
          className={`shrink-0 h-10 w-10 rounded-xl transition-colors ${selectedImage
            ? "bg-primary/10 text-primary"
            : "hover:bg-muted"
            }`}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
          title="Upload image for OCR"
        >
          <ImageIcon className="h-5 w-5" />
        </Button>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? "Ask about this image (optional)..." : "Ask anything about ML, AI, deep learning..."}
            disabled={disabled || isLoading}
            rows={1}
            className="w-full resize-none bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/50 py-2 pr-12 max-h-[200px] scrollbar-thin"
          />

          {/* Character counter */}
          <div
            className={`absolute right-0 bottom-0 text-[10px] px-2 py-1 ${isOverLimit ? "text-destructive" : "text-muted-foreground/50"
              }`}
          >
            {charCount}/{MAX_CHARS}
          </div>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading || disabled}
          size="icon"
          className="shrink-0 h-10 w-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
        >
          {isLoading || isTranscribing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </motion.div>

      {/* Keyboard shortcut hint */}
      <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground/50">
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">Enter</kbd> to send
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">Shift + Enter</kbd> for new line
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">📷</kbd> for image query
        </span>
      </div>
    </div>
  );
}

