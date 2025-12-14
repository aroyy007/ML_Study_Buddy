"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Mic, Volume2, BookOpen, Code2, Moon, Zap } from "lucide-react";

const features = [
    {
        icon: Mic,
        title: "Voice & Text Input",
        description: "Ask questions by voice or text. Upload audio files or type directly for natural interaction.",
    },
    {
        icon: Volume2,
        title: "Audio Responses",
        description: "Listen to AI explanations with text-to-speech and interactive audio player for on-the-go learning.",
    },
    {
        icon: BookOpen,
        title: "RAG-Powered Answers",
        description: "Get accurate answers backed by authoritative ML sources with citations and references.",
    },
    {
        icon: Code2,
        title: "Code Examples",
        description: "Syntax-highlighted code blocks with copy functionality for immediate implementation.",
    },
    {
        icon: Moon,
        title: "Dark Mode",
        description: "Beautiful monochrome theme that adapts to your preference for comfortable learning.",
    },
    {
        icon: Zap,
        title: "Real-time Learning",
        description: "Instant responses with typing indicators and smooth animations for engaging experience.",
    },
];

export default function Features() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <section id="features" className="relative py-24 px-4 bg-muted/30">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Everything You Need to Learn
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Powerful features designed to accelerate your machine learning journey
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="group relative bg-background border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-foreground/10 transition-colors">
                                <feature.icon className="w-6 h-6 text-foreground" />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Hover gradient effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-foreground/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
