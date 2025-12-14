"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import MacbookDemo from "@/components/landing/macbook-demo";
import Features from "@/components/landing/features";
import HowItWorks from "@/components/landing/how-it-works";
import FinalCTA from "@/components/landing/final-cta";
import Footer from "@/components/landing/footer";

function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <MacbookDemo />
        <Features />
        <HowItWorks />
        {/* <FinalCTA /> */}
      </main>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <LandingPage />
    </ThemeProvider>
  );
}