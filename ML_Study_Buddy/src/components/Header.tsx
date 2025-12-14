"use client";

import React from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Brain, Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({ onMenuClick, sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={onToggleSidebar}
              title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            >
              <motion.div
                initial={false}
                animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </motion.div>
            </Button>
          )}
          
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-foreground/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <Brain className="h-8 w-8 text-foreground relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">ML Study Buddy</span>
              <span className="text-[10px] text-muted-foreground -mt-1 tracking-widest uppercase">
                AI Learning Assistant
              </span>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative overflow-hidden"
            >
              <motion.div
                initial={false}
                animate={{
                  rotate: theme === "dark" ? 0 : 180,
                  scale: theme === "dark" ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="absolute"
              >
                <Moon className="h-5 w-5" />
              </motion.div>
              <motion.div
                initial={false}
                animate={{
                  rotate: theme === "light" ? 0 : -180,
                  scale: theme === "light" ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="absolute"
              >
                <Sun className="h-5 w-5" />
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
}