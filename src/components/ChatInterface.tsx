"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble, { Message } from "./MessageBubble";
import ChatInput from "./ChatInput";
import WelcomeScreen from "./WelcomeScreen";
import TypingIndicator from "./TypingIndicator";
import VoiceResponseOrb from "./VoiceResponseOrb";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface ChatInterfaceProps {
  sessionId: string | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onSendImageMessage?: (image: File, question: string) => void;
  isGenerating: boolean;
  onVoiceActiveChange?: (isActive: boolean) => void;
}

export default function ChatInterface({
  sessionId,
  messages,
  onSendMessage,
  onSendImageMessage,
  isGenerating,
  onVoiceActiveChange,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech();

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating, scrollToBottom]);

  // Track when speech ends to clear the speaking message ID
  useEffect(() => {
    if (!isSpeaking && speakingMessageId) {
      setSpeakingMessageId(null);
    }
  }, [isSpeaking, speakingMessageId]);

  // Notify parent when voice is active (only speaking, not generating)
  useEffect(() => {
    onVoiceActiveChange?.(isSpeaking);
  }, [isSpeaking, onVoiceActiveChange]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  const handleSpeak = useCallback((messageId: string, text: string) => {
    setSpeakingMessageId(messageId);
    speak(text);
  }, [speak]);

  const handleStopSpeaking = useCallback(() => {
    stop();
    setSpeakingMessageId(null);
  }, [stop]);

  const hasMessages = messages.length > 0;
  // Only show orb when speaking (voice response), not during text generation
  const showOrb = isSpeaking;

  return (
    <div className="flex flex-col h-full">
      {/* Voice Response Orb - Only shows during voice response */}
      <AnimatePresence>
        {showOrb && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <VoiceResponseOrb isActive={showOrb} isSpeaking={isSpeaking} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea
          ref={scrollRef}
          className="h-full"
          onScrollCapture={handleScroll}
        >
          <div className={`max-w-4xl mx-auto px-4 py-6 ${showOrb ? 'pt-56' : ''} transition-all duration-300`}>
            <AnimatePresence mode="wait">
              {!hasMessages ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
                </motion.div>
              ) : (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {messages.map((message, index) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      showEncryptedReveal={false}
                      onRegenerate={
                        message.role === "assistant"
                          ? () => {
                            const lastUserMsg = [...messages]
                              .reverse()
                              .find((m) => m.role === "user");
                            if (lastUserMsg) {
                              onSendMessage(lastUserMsg.content);
                            }
                          }
                          : undefined
                      }
                      onSpeak={isSupported && message.role === "assistant"
                        ? (text) => handleSpeak(message.id, text)
                        : undefined
                      }
                      onStopSpeaking={handleStopSpeaking}
                      isSpeaking={speakingMessageId === message.id && isSpeaking}
                    />
                  ))}

                  {/* Generating indicator */}
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted border border-border">
                        <motion.div
                          className="w-3 h-3 rounded-full bg-foreground/40"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                      <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-bl-md">
                        <TypingIndicator />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollButton && hasMessages && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 p-2 rounded-full bg-foreground text-background shadow-lg hover:bg-foreground/90 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ChatInput
            onSendMessage={onSendMessage}
            onSendImageMessage={onSendImageMessage}
            isLoading={isGenerating}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
}
