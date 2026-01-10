"use client";

import React from "react";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { Brain } from "lucide-react";
import BackgroundRippleEffect from "@/components/BackgroundRippleEffect";

// ML Buddy Badge Component
const MLBuddyBadge = ({ className }: { className?: string }) => {
    return (
        <div
            className={`flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-2 text-white shadow-lg ${className}`}
        >
            <Brain className="h-5 w-5" />
            <span className="text-sm font-medium">ML Study Buddy</span>
        </div>
    );
};

export default function MacbookDemo() {
    return (
        <section id="demo" className="w-full overflow-hidden bg-white dark:bg-[#0B0B0F]">
            <BackgroundRippleEffect />
            <MacbookScroll
                title={
                    <span>
                        Your AI-powered learning companion. <br /> Experience it now.
                    </span>
                }
                badge={<MLBuddyBadge className="-rotate-12 transform" />}
                src="/chat-interface-screenshot.png"
                showGradient={true}
            />
        </section>
    );
}
