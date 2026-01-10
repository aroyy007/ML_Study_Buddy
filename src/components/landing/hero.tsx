"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cover } from "@/components/ui/cover";
import BackgroundRippleEffect from "@/components/BackgroundRippleEffect";

const avatars = [
    { id: 1, rotation: -6 },
    { id: 2, rotation: -3 },
    { id: 3, rotation: 0 },
    { id: 4, rotation: 3 },
    { id: 5, rotation: 6 },
];

export default function Hero() {
    return (
        <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 pt-24 pb-12 overflow-hidden">
            <BackgroundRippleEffect />
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20 pointer-events-none" />

            {/* Subtle animated background dots */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-foreground/10 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            opacity: [0.1, 0.3, 0.1],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 max-w-5xl mx-auto text-center"
            >
                {/* Main Headline */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold max-w-4xl mx-auto relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white leading-tight">
                    Master Machine Learning <br /> at <Cover>warp speed</Cover>
                </h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6"
                >
                    Your AI-powered companion for learning machine learning, deep learning,
                    and AI concepts through natural conversation.
                </motion.p>

                {/* Social Proof */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
                >
                    {/* Avatars Stack */}
                    {/* <div className="flex items-center">
                        <div className="flex -space-x-3">
                            {avatars.map((avatar) => (
                                <div
                                    key={avatar.id}
                                    className="relative w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-neutral-300 to-neutral-500 dark:from-neutral-600 dark:to-neutral-800 overflow-hidden"
                                    style={{
                                        transform: `rotate(${avatar.rotation}deg)`,
                                        zIndex: avatars.length - avatar.id
                                    }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                                        {String.fromCharCode(65 + avatar.id - 1)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div> */}

                    {/* Rating */}
                    {/* <div className="flex items-center gap-2">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Trusted by <span className="font-semibold text-foreground">27,000+</span> learners
                        </span>
                    </div> */}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
                >
                    <Link href="/chat">
                        <Button size="lg" className="rounded-xl px-8 py-6 text-lg font-medium shadow-lg hover:scale-105 transition-transform">
                            Start Learning →
                        </Button>
                    </Link>

                    <Button
                        variant="outline"
                        size="lg"
                        className="rounded-xl px-8 py-6 text-lg font-medium hover:scale-105 transition-transform"
                    >
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Watch Demo
                    </Button>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-2 text-muted-foreground"
                >
                    <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
                    <ChevronDown className="w-5 h-5" />
                </motion.div>
            </motion.div>
        </section>
    );
}
