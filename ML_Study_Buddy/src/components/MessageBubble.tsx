"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, RotateCcw, User, Bot, ChevronDown, Volume2, VolumeX } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import EncryptedText from "./EncryptedText";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
  isStreaming?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  showEncryptedReveal?: boolean;
  onSpeak?: (text: string) => void;
  onStopSpeaking?: () => void;
  isSpeaking?: boolean;
}

export default function MessageBubble({
  message,
  onRegenerate,
  showEncryptedReveal = false,
  onSpeak,
  onStopSpeaking,
  isSpeaking = false,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(!showEncryptedReveal);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVoice = () => {
    if (isSpeaking) {
      onStopSpeaking?.();
    } else {
      onSpeak?.(message.content);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
            ? "bg-foreground text-background"
            : "bg-muted border border-border"
          }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </motion.div>

      {/* Message content */}
      <div
        className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? "items-end" : "items-start"
          }`}
      >
        <motion.div
          className={`relative group rounded-2xl px-4 py-3 ${isUser
              ? "bg-foreground text-background rounded-br-md"
              : "bg-muted/50 border border-border/50 rounded-bl-md"
            }`}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          {/* Message text */}
          <div className={`prose prose-sm max-w-none ${isUser ? "prose-invert" : ""}`}>
            {showEncryptedReveal && !isUser && !isRevealed ? (
              <EncryptedText
                text={message.content}
                isRevealing={true}
                onRevealComplete={() => setIsRevealed(true)}
                speed={8}
              />
            ) : isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>

          {/* Streaming indicator */}
          {message.isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-foreground/50 ml-1"
            />
          )}

          {/* Action buttons - only for assistant messages */}
          {!isUser && !message.isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 mt-2 pt-2 border-t border-border/30"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <Copy className="h-3 w-3 mr-1" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              {onSpeak && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoice}
                  className={`h-7 px-2 text-xs ${isSpeaking
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {isSpeaking ? (
                    <VolumeX className="h-3 w-3 mr-1" />
                  ) : (
                    <Volume2 className="h-3 w-3 mr-1" />
                  )}
                  {isSpeaking ? "Stop" : "Listen"}
                </Button>
              )}
              {onRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRegenerate}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Sources accordion */}
        {message.sources && message.sources.length > 0 && (
          <Collapsible open={sourcesOpen} onOpenChange={setSourcesOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronDown
                  className={`h-3 w-3 mr-1 transition-transform ${sourcesOpen ? "rotate-180" : ""
                    }`}
                />
                {message.sources.length} source{message.sources.length > 1 ? "s" : ""}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 space-y-2"
              >
                {message.sources.map((source, index) => (
                  <motion.a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="block p-3 rounded-lg bg-muted/30 border border-border/30 hover:border-border/60 transition-colors"
                  >
                    <p className="text-xs font-medium truncate">{source.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                      {source.snippet}
                    </p>
                  </motion.a>
                ))}
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground/50 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </motion.div>
  );
}