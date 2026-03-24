"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";

// Lazy load components below the fold
const AboutSection = dynamic(() => import("@/components/landing/AboutSection").then(mod => mod.AboutSection));
const FeaturesSection = dynamic(() => import("@/components/landing/FeaturesSection").then(mod => mod.FeaturesSection));
const CtaSection = dynamic(() => import("@/components/landing/CtaSection").then(mod => mod.CtaSection));
const FooterSection = dynamic(() => import("@/components/landing/FooterSection").then(mod => mod.FooterSection));

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-hand-paper bg-paper-texture bg-[length:24px_24px] text-hand-pencil overflow-x-hidden selection:bg-hand-yellow selection:text-hand-pencil ">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
}
