"use client";

import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { FooterSection } from "@/components/landing/FooterSection";

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
