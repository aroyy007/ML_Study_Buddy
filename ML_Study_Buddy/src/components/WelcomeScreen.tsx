"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Code, BookOpen, Lightbulb, Sparkles, Zap } from "lucide-react";
import AIParticleSystem from "./AIParticleSystem";

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: Brain,
    title: "Explain Neural Networks",
    description: "Learn the fundamentals",
    prompt: "Explain how neural networks work with a simple analogy",
  },
  {
    icon: Code,
    title: "PyTorch Tutorial",
    description: "Hands-on coding",
    prompt: "Show me how to build a simple CNN in PyTorch for image classification",
  },
  {
    icon: BookOpen,
    title: "Transformers Deep Dive",
    description: "Advanced concepts",
    prompt: "Explain the transformer architecture and self-attention mechanism",
  },
  {
    icon: Lightbulb,
    title: "ML Project Ideas",
    description: "Get inspired",
    prompt: "Suggest some interesting machine learning project ideas for beginners",
  },
  {
    icon: Zap,
    title: "Optimize Models",
    description: "Performance tips",
    prompt: "What are the best practices for optimizing deep learning model performance?",
  },
  {
    icon: Sparkles,
    title: "Latest in AI",
    description: "Stay updated",
    prompt: "What are the most exciting recent developments in AI and machine learning?",
  },
];

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center mb-6">
          <AIParticleSystem isActive={true} />
        </div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold mb-3"
        >
          Welcome to ML Study Buddy
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-lg max-w-md mx-auto"
        >
          Your AI-powered companion for learning machine learning, deep learning, and AI concepts.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-3xl"
      >
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Try one of these suggestions to get started:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-foreground/20 hover:bg-muted/50 transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-foreground/5 group-hover:bg-foreground/10 transition-colors">
                <suggestion.icon className="h-5 w-5 text-foreground/70" />
              </div>
              <div>
                <p className="font-medium text-sm">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {suggestion.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-center"
      >
        <p className="text-xs text-muted-foreground/50">
          Powered by AI · Responses may not always be accurate · Always verify important information
        </p>
      </motion.div>
    </div>
  );
}
