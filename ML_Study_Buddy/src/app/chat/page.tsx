"use client";

import React, { useState, useCallback } from "react";
import { Toaster, toast } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import BackgroundRippleEffect from "@/components/BackgroundRippleEffect";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useChatStorage } from "@/hooks/useChatStorage";
import { Message, Source } from "@/components/MessageBubble";
import { queryRAG, queryWithImage } from "@/lib/api";

// Generate AI response using the RAG backend
const generateAIResponse = async (userMessage: string, sessionId: string): Promise<{ content: string; sources: Source[] }> => {
    try {
        const response = await queryRAG(userMessage, sessionId);

        // Convert source strings to Source objects
        const sources: Source[] = response.sources.map((source) => ({
            title: source,
            url: source.startsWith('http') ? source : '#',
            snippet: `Retrieved from: ${source}`,
        }));

        return {
            content: response.answer,
            sources,
        };
    } catch (error) {
        console.error('RAG API error:', error);

        // Fallback response if API is not available
        return {
            content: `⚠️ **Unable to connect to the RAG backend**

The ML RAG System backend is not responding. Please ensure:

1. The Python backend is running at \`http://localhost:8000\`
2. Run \`cd backend && python run.py\` to start the backend
3. Check that your GROQ_API_KEY is set in \`backend/.env\`

**Your question was:** "${userMessage}"

Once the backend is running, try your question again!`,
            sources: [],
        };
    }
};


function MLStudyBuddyApp() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);

    const {
        sessions,
        currentSessionId,
        messages,
        isLoaded,
        createNewChat,
        addMessage,
        deleteSession,
        selectSession,
    } = useChatStorage();

    const handleSendMessage = useCallback(
        async (content: string) => {
            // Create user message
            const userMessage: Message = {
                id: `msg-${Date.now()}`,
                role: "user",
                content,
                timestamp: new Date(),
            };

            addMessage(userMessage);
            setIsGenerating(true);

            try {
                // Generate AI response using RAG backend
                const response = await generateAIResponse(content, currentSessionId || "default");

                const assistantMessage: Message = {
                    id: `msg-${Date.now() + 1}`,
                    role: "assistant",
                    content: response.content,
                    timestamp: new Date(),
                    sources: response.sources.length > 0 ? response.sources : undefined,
                };

                addMessage(assistantMessage);
                toast.success("Response generated!", {
                    description: "AI has finished processing your question.",
                    duration: 2000,
                });
            } catch (error) {
                console.error("Error generating response:", error);
                toast.error("Failed to generate response", {
                    description: "Please try again.",
                });
            } finally {
                setIsGenerating(false);
            }
        },
        [addMessage, currentSessionId]
    );

    const handleImageMessage = useCallback(
        async (image: File, question: string) => {
            // Create user message showing they sent an image
            const userContent = question
                ? `📷 [Image: ${image.name}]\n\n${question}`
                : `📷 [Image: ${image.name}] - Analyze this image`;

            const userMessage: Message = {
                id: `msg-${Date.now()}`,
                role: "user",
                content: userContent,
                timestamp: new Date(),
            };

            addMessage(userMessage);
            setIsGenerating(true);

            try {
                // Send image to backend for OCR + RAG query
                const response = await queryWithImage(image, question, currentSessionId || "default");

                // Build response content with extracted text info
                let content = response.answer;
                if (response.extracted_text) {
                    content = `**Extracted text from image:**\n> ${response.extracted_text.substring(0, 200)}${response.extracted_text.length > 200 ? '...' : ''}\n\n---\n\n${response.answer}`;
                }

                const sources: Source[] = response.sources.map((source) => ({
                    title: source,
                    url: source.startsWith('http') ? source : '#',
                    snippet: `Retrieved from: ${source}`,
                }));

                const assistantMessage: Message = {
                    id: `msg-${Date.now() + 1}`,
                    role: "assistant",
                    content,
                    timestamp: new Date(),
                    sources: sources.length > 0 ? sources : undefined,
                };

                addMessage(assistantMessage);
                toast.success("Image analyzed!", {
                    description: "AI has processed your image query.",
                    duration: 2000,
                });
            } catch (error) {
                console.error("Error processing image:", error);
                toast.error("Failed to process image", {
                    description: "Please try again with a different image.",
                });
            } finally {
                setIsGenerating(false);
            }
        },
        [addMessage, currentSessionId]
    );

    const handleNewChat = useCallback(() => {
        createNewChat();
        setSidebarOpen(false);
    }, [createNewChat]);

    const handleSelectSession = useCallback(
        (id: string) => {
            selectSession(id);
            setSidebarOpen(false);
        },
        [selectSession]
    );


    const handleDeleteSession = useCallback(
        (id: string) => {
            deleteSession(id);
            toast.info("Conversation deleted");
        },
        [deleteSession]
    );

    const handleToggleSidebar = useCallback(() => {
        setSidebarCollapsed((prev) => !prev);
    }, []);

    if (!isLoaded) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            <BackgroundRippleEffect voiceActive={isVoiceActive} />

            <div className="relative z-10 flex flex-col h-screen">
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    sidebarCollapsed={sidebarCollapsed}
                    onToggleSidebar={handleToggleSidebar}
                />

                <div className="flex flex-1 overflow-hidden pt-16">
                    <Sidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        sessions={sessions}
                        currentSessionId={currentSessionId}
                        onNewChat={handleNewChat}
                        onSelectSession={handleSelectSession}
                        onDeleteSession={handleDeleteSession}
                        isCollapsed={sidebarCollapsed}
                    />

                    <main className="flex-1 overflow-hidden">
                        <ChatInterface
                            sessionId={currentSessionId}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            onSendImageMessage={handleImageMessage}
                            isGenerating={isGenerating}
                            onVoiceActiveChange={setIsVoiceActive}
                        />
                    </main>
                </div>
            </div>

            <Toaster
                position="top-right"
                toastOptions={{
                    className: "bg-background border-border text-foreground",
                }}
            />
        </div>
    );
}

export default function ChatPage() {
    return (
        <ThemeProvider>
            <MLStudyBuddyApp />
        </ThemeProvider>
    );
}
