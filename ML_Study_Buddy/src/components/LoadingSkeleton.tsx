"use client";

import React from "react";
import { motion } from "framer-motion";

export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header skeleton */}
      <div className="h-16 border-b border-border/50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 rounded-full bg-muted"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="space-y-1">
            <motion.div
              className="w-32 h-4 rounded bg-muted"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            />
            <motion.div
              className="w-20 h-2 rounded bg-muted"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
          </div>
        </div>
        <motion.div
          className="w-10 h-10 rounded-lg bg-muted"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="hidden md:flex w-72 border-r border-border/50 flex-col p-4 space-y-4">
          <motion.div
            className="w-full h-10 rounded-lg bg-muted"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="w-full h-10 rounded-lg bg-muted"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          />
          <div className="space-y-2 mt-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-full h-16 rounded-lg bg-muted"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="space-y-4 text-center">
              <motion.div
                className="w-16 h-16 rounded-full bg-muted mx-auto"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="w-48 h-6 rounded bg-muted mx-auto"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
              />
              <motion.div
                className="w-64 h-4 rounded bg-muted mx-auto"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
            </div>
          </div>
          <div className="p-4 border-t border-border/50">
            <motion.div
              className="w-full h-14 rounded-2xl bg-muted"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
