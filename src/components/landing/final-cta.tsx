"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";

export default function FinalCTA() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <section className="relative py-24 px-4 bg-foreground text-background overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px',
                }} />
            </div>

            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="relative z-10 max-w-3xl mx-auto text-center"
            >
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    Ready to Master Machine Learning?
                </h2>

                <p className="text-lg text-background/70 mb-10 max-w-xl mx-auto">
                    Join thousands of learners who are accelerating their ML journey with
                    our AI-powered study companion.
                </p>

                <Link href="/chat">
                    <Button
                        size="lg"
                        className="bg-background text-foreground hover:bg-background/90 rounded-xl px-10 py-7 text-lg font-semibold shadow-2xl hover:scale-105 transition-transform"
                    >
                        Start Learning Now →
                    </Button>
                </Link>

                <p className="mt-6 text-sm text-background/50">
                    No credit card required • Free to start
                </p>
            </motion.div>
        </section>
    );
}
