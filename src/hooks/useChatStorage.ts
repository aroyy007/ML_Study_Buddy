"use client";

import { useState, useEffect, useCallback } from "react";
import { Message, Source } from "@/components/MessageBubble";
import { ChatSession } from "@/components/Sidebar";

const STORAGE_KEY = "ml-study-buddy-chats";

interface StoredSession {
  id: string;
  title: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    sources?: Source[];
  }>;
  createdAt: string;
  updatedAt: string;
}

export function useChatStorage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load sessions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedSessions: StoredSession[] = JSON.parse(stored);
        const chatSessions: ChatSession[] = parsedSessions.map((s) => ({
          id: s.id,
          title: s.title,
          preview: s.messages[s.messages.length - 1]?.content.slice(0, 100) || "",
          timestamp: new Date(s.updatedAt),
          messageCount: s.messages.length,
        }));
        setSessions(chatSessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      } catch (e) {
        console.error("Failed to parse stored sessions:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Load messages for current session
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedSessions: StoredSession[] = JSON.parse(stored);
        const session = parsedSessions.find((s) => s.id === currentSessionId);
        if (session) {
          setMessages(
            session.messages.map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
          );
        }
      } catch (e) {
        console.error("Failed to load session messages:", e);
      }
    }
  }, [currentSessionId]);

  const saveToStorage = useCallback((sessionsToSave: StoredSession[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToSave));
  }, []);

  const createNewChat = useCallback(() => {
    const newId = `chat-${Date.now()}`;
    setCurrentSessionId(newId);
    setMessages([]);
    return newId;
  }, []);

  const addMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => {
        const newMessages = [...prev, message];

        // Update storage
        const stored = localStorage.getItem(STORAGE_KEY);
        let parsedSessions: StoredSession[] = stored ? JSON.parse(stored) : [];

        let sessionId = currentSessionId;
        if (!sessionId) {
          sessionId = `chat-${Date.now()}`;
          setCurrentSessionId(sessionId);
        }

        const existingIndex = parsedSessions.findIndex((s) => s.id === sessionId);
        const title =
          message.role === "user" && (existingIndex === -1 || parsedSessions[existingIndex]?.messages.length === 0)
            ? message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "")
            : existingIndex !== -1
            ? parsedSessions[existingIndex].title
            : "New Chat";

        const sessionData: StoredSession = {
          id: sessionId,
          title,
          messages: newMessages.map((m) => ({
            ...m,
            timestamp: m.timestamp.toISOString(),
          })),
          createdAt:
            existingIndex !== -1
              ? parsedSessions[existingIndex].createdAt
              : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (existingIndex !== -1) {
          parsedSessions[existingIndex] = sessionData;
        } else {
          parsedSessions.unshift(sessionData);
        }

        saveToStorage(parsedSessions);

        // Update sessions list
        const chatSessions: ChatSession[] = parsedSessions.map((s) => ({
          id: s.id,
          title: s.title,
          preview: s.messages[s.messages.length - 1]?.content.slice(0, 100) || "",
          timestamp: new Date(s.updatedAt),
          messageCount: s.messages.length,
        }));
        setSessions(chatSessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));

        return newMessages;
      });
    },
    [currentSessionId, saveToStorage]
  );

  const updateLastMessage = useCallback(
    (updates: Partial<Message>) => {
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            ...updates,
          };

          // Update storage
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored && currentSessionId) {
            const parsedSessions: StoredSession[] = JSON.parse(stored);
            const sessionIndex = parsedSessions.findIndex(
              (s) => s.id === currentSessionId
            );
            if (sessionIndex !== -1) {
              parsedSessions[sessionIndex].messages = newMessages.map((m) => ({
                ...m,
                timestamp: m.timestamp.toISOString(),
              }));
              parsedSessions[sessionIndex].updatedAt = new Date().toISOString();
              saveToStorage(parsedSessions);
            }
          }
        }
        return newMessages;
      });
    },
    [currentSessionId, saveToStorage]
  );

  const deleteSession = useCallback(
    (id: string) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSessions: StoredSession[] = JSON.parse(stored);
        const filtered = parsedSessions.filter((s) => s.id !== id);
        saveToStorage(filtered);

        const chatSessions: ChatSession[] = filtered.map((s) => ({
          id: s.id,
          title: s.title,
          preview: s.messages[s.messages.length - 1]?.content.slice(0, 100) || "",
          timestamp: new Date(s.updatedAt),
          messageCount: s.messages.length,
        }));
        setSessions(chatSessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));

        if (currentSessionId === id) {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    },
    [currentSessionId, saveToStorage]
  );

  const selectSession = useCallback((id: string) => {
    setCurrentSessionId(id);
  }, []);

  return {
    sessions,
    currentSessionId,
    messages,
    isLoaded,
    createNewChat,
    addMessage,
    updateLastMessage,
    deleteSession,
    selectSession,
  };
}
