"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/app/_components/landing/Navbar";
import { HeroSection } from "@/app/_components/landing/HeroSection";

// Lazy load components below the fold
const AboutSection = dynamic(() => import("@/app/_components/landing/AboutSection").then(mod => mod.AboutSection));
const FeaturesSection = dynamic(() => import("@/app/_components/landing/FeaturesSection").then(mod => mod.FeaturesSection));
const CtaSection = dynamic(() => import("@/app/_components/landing/CtaSection").then(mod => mod.CtaSection));
const FooterSection = dynamic(() => import("@/app/_components/landing/FooterSection").then(mod => mod.FooterSection));

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
