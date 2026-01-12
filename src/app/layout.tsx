import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "ML Study Buddy - AI-Powered Machine Learning Assistant",
  description: "Master machine learning, deep learning, and AI concepts with your AI-powered study companion. Voice & text input, RAG-powered answers, and interactive code examples.",
  keywords: ["machine learning", "AI", "deep learning", "study", "education", "RAG", "neural networks"],
  openGraph: {
    title: "ML Study Buddy - AI-Powered Machine Learning Assistant",
    description: "Master machine learning at warp speed with your AI-powered study companion.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        {children}
        <Analytics />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
