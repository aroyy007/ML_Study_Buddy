"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";

const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "About", href: "#about" },
];

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
                <nav className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <motion.div
                            className="relative"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="absolute inset-0 bg-foreground/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Brain className="h-8 w-8 text-foreground relative z-10" />
                        </motion.div>
                        <span className="text-lg font-semibold tracking-tight">ML Study Buddy</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-foreground transition-all group-hover:w-full" />
                            </a>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
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

                        {/* Get Started Button - Desktop */}
                        <Link href="/chat" className="hidden md:block">
                            <Button className="rounded-lg px-6">
                                Get Started →
                            </Button>
                        </Link>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 md:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[280px] bg-background border-l border-border z-50 md:hidden"
                        >
                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-border">
                                    <span className="font-semibold">Menu</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* Links */}
                                <div className="flex-1 py-6 px-4">
                                    <div className="flex flex-col gap-4">
                                        {navLinks.map((link, index) => (
                                            <motion.a
                                                key={link.name}
                                                href={link.href}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="text-lg py-2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {link.name}
                                            </motion.a>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom CTA */}
                                <div className="p-4 border-t border-border">
                                    <Link href="/chat" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full rounded-lg">
                                            Get Started →
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
