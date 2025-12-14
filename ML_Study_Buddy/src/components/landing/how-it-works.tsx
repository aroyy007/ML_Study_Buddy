"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { MessageSquare, Brain, FileText, Headphones } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: MessageSquare,
        title: "Ask Your Question",
        description: "Type or speak your ML question naturally",
    },
    {
        number: "02",
        icon: Brain,
        title: "AI Processes with RAG",
        description: "Searches knowledge base for accurate answers",
    },
    {
        number: "03",
        icon: FileText,
        title: "Get Detailed Response",
        description: "Receive explanation with sources and code examples",
    },
    {
        number: "04",
        icon: Headphones,
        title: "Listen & Learn",
        description: "Optional audio playback with voice synthesis",
    },
];

export default function HowItWorks() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <section id="how-it-works" className="relative py-24 px-4 bg-background overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        How It Works
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Four simple steps to accelerate your learning
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="relative">
                    {/* Connection Line - Desktop */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className="relative flex flex-col items-center text-center"
                            >
                                {/* Step Number Background */}
                                <div className="absolute -top-4 text-[120px] font-bold text-foreground/5 leading-none pointer-events-none select-none">
                                    {step.number}
                                </div>

                                {/* Icon Circle */}
                                <div className="relative z-10 w-20 h-20 rounded-full bg-background border-2 border-border flex items-center justify-center mb-6 shadow-lg">
                                    <step.icon className="w-8 h-8 text-foreground" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                <p className="text-muted-foreground max-w-xs">
                                    {step.description}
                                </p>

                                {/* Mobile connector dots */}
                                {index < steps.length - 1 && (
                                    <div className="flex flex-col items-center gap-1 my-6 lg:hidden">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-border" />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
