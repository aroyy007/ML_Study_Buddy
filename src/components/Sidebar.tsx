"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  isCollapsed?: boolean;
}

export default function Sidebar({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  isCollapsed = false,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onNewChat}
            className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            <Plus className="h-4 w-4" />
            New Chat
            <Sparkles className="h-3 w-3 ml-auto opacity-50" />
          </Button>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          <AnimatePresence mode="popLayout">
            {filteredSessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground text-sm"
              >
                {searchQuery ? "No matching conversations" : "No conversations yet"}
              </motion.div>
            ) : (
              filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all group relative ${
                      currentSessionId === session.id
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {session.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {session.preview}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">
                          {formatDate(session.timestamp)} · {session.messageCount} messages
                        </p>
                      </div>
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </motion.button>
                    </div>
                    {currentSessionId === session.id && (
                      <motion.div
                        layoutId="activeSession"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-foreground rounded-r"
                      />
                    )}
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground text-center">
          ML Study Buddy v1.0 · Powered by AI
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar with collapse animation */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 0 : 288,
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex border-r border-border/50 bg-background/50 backdrop-blur-xl flex-col h-full overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-background border-r border-border/50 z-50 md:hidden flex flex-col"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="pt-10">{sidebarContent}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}