"use client";

import React from "react";
import Link from "next/link";
import { Brain, Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
    product: {
        title: "Product",
        links: [
            { name: "Features", href: "#features" },
            { name: "How It Works", href: "#how-it-works" },
            { name: "API Access", href: "#" },
            { name: "Documentation", href: "#" },
        ],
    },
    resources: {
        title: "Resources",
        links: [
            { name: "Blog", href: "#" },
            { name: "Tutorials", href: "#" },
            { name: "Community", href: "#" },
            { name: "Support", href: "#" },
        ],
    },
    legal: {
        title: "Legal",
        links: [
            { name: "Privacy Policy", href: "#" },
            { name: "Terms of Service", href: "#" },
            { name: "Cookie Policy", href: "#" },
        ],
    },
};

const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "GitHub", icon: Github, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
];

export default function Footer() {
    return (
        <footer className="bg-muted/50 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Brain className="h-7 w-7 text-foreground" />
                            <span className="text-lg font-bold">ML Study Buddy</span>
                        </Link>
                        <p className="text-muted-foreground max-w-xs mb-6">
                            AI-powered learning assistant for mastering machine learning,
                            deep learning, and AI concepts.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    className="w-9 h-9 rounded-lg bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors"
                                    aria-label={social.name}
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([key, section]) => (
                        <div key={key}>
                            <h4 className="font-semibold mb-4">{section.title}</h4>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} ML Study Buddy. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Privacy
                        </a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Terms
                        </a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Cookies
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
