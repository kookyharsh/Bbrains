"use client";

import Link from "next/link";
import { HandButton } from "@/components/hand-drawn/button";
import { 
  HandCard, 
  HandCardContent, 
  HandCardHeader, 
  HandCardTitle, 
  HandCardDescription 
} from "@/components/hand-drawn/card";
import { Brain, Star, Wallet, Store, LineChart, ArrowRight, CheckCircle } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-hand-paper bg-paper-texture bg-[length:24px_24px] text-hand-pencil overflow-x-hidden selection:bg-hand-yellow selection:text-hand-pencil">
      {/* Navigation */}
      <nav className="border-b-[3px] border-hand-pencil border-dashed bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Brain className="w-8 h-8 text-hand-red group-hover:-rotate-12 transition-transform" strokeWidth={2.5} />
            <span className="font-kalam text-3xl font-bold tracking-tight">bBrains</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="font-patrick text-xl font-medium hidden md:block hover:text-hand-blue hover:underline decoration-wavy decoration-2 underline-offset-4 transition-all">
              Home
            </Link>
            <Link href="/#contact" className="font-patrick text-xl font-medium hidden md:block hover:text-hand-blue hover:underline decoration-wavy decoration-2 underline-offset-4 transition-all">
              Contact Us
            </Link>
            <HandButton asChild size="sm" className="-rotate-1">
              <Link href="/auth/login">Log In</Link>
            </HandButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 max-w-5xl mx-auto text-center relative">
        <h1 className="font-kalam text-5xl md:text-7xl font-bold leading-[1.1] text-hand-pencil mb-6">
          Platform <span className="relative inline-block px-2 group cursor-default">
            <span className="relative z-10 text-hand-blue">Features</span>
            <span className="absolute inset-0 bg-hand-yellow -rotate-1 -z-0"></span>
          </span>
        </h1>
        <p className="font-patrick text-xl md:text-2xl text-hand-pencil/80 max-w-2xl mx-auto leading-relaxed">
          Discover how our gamified Learning Management System turns routine academic tasks into engaging, rewarding experiences for every student on campus.
        </p>
      </section>

      {/* Detailed Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-24">
        
        {/* Feature 1: XP System */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative">
            <HandCard decoration="tack" variant="yellow" className="rotate-2 z-10 w-full max-w-md mx-auto">
              <HandCardHeader>
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-hand-yellow" fill="currentColor" />
                  <HandCardTitle className="text-3xl">Level Up Learning</HandCardTitle>
                </div>
              </HandCardHeader>
              <HandCardContent className="space-y-4 font-patrick text-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-hand-blue shrink-0 mt-0.5" />
                  <p>Earn XP for attending classes, completing assignments, and participating in forums.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-hand-blue shrink-0 mt-0.5" />
                  <p>Unlock achievements and badges to show off academic prowess.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-hand-blue shrink-0 mt-0.5" />
                  <p>Compete on campus-wide or class-specific leaderboards.</p>
                </div>
              </HandCardContent>
            </HandCard>
            <div className="absolute inset-0 bg-hand-muted border-4 border-hand-pencil rounded-wobbly -rotate-2 -z-10 max-w-md mx-auto translate-y-4"></div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="font-kalam text-4xl font-bold">XP & Gamification</h2>
            <div className="w-24 h-2 bg-hand-yellow rounded-wobbly"></div>
            <p className="font-patrick text-xl text-hand-pencil/80">
              Transform the grind of studying into an exciting journey. Our XP system integrates seamlessly with course syllabi, providing instant gratification and long-term motivation for your students.
            </p>
          </div>
        </div>

        {/* Feature 2: Digital Wallet */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-kalam text-4xl font-bold">Digital Wallet</h2>
            <div className="w-24 h-2 bg-hand-blue rounded-wobbly"></div>
            <p className="font-patrick text-xl text-hand-pencil/80">
              Students earn virtual currency through academic excellence and community participation. The built-in digital wallet keeps track of their balance, transaction history, and pending rewards.
            </p>
          </div>
          <div className="relative">
            <HandCard decoration="tape" className="bg-white -rotate-2 z-10 w-full max-w-md mx-auto">
              <HandCardHeader>
                <div className="flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-hand-blue" />
                  <HandCardTitle className="text-3xl">Campus Credits</HandCardTitle>
                </div>
              </HandCardHeader>
              <HandCardContent className="space-y-4 font-patrick text-lg">
                <div className="flex items-center justify-between p-3 border-2 border-hand-pencil border-dashed rounded-wobbly">
                  <span>Current Balance</span>
                  <span className="font-kalam text-2xl font-bold text-hand-red">1,250 🪙</span>
                </div>
                <p className="text-center text-hand-pencil/60 mt-2 rounded bg-hand-muted/50 p-2 border border-hand-pencil/20">
                  Recent: +50 🪙 (Aced Quiz 3)
                </p>
              </HandCardContent>
            </HandCard>
          </div>
        </div>

        {/* Feature 3: Campus Market */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative">
            <HandCard decoration="tack" variant="blue" className="rotate-1 z-10 w-full max-w-md mx-auto">
              <HandCardHeader>
                <div className="flex items-center gap-3">
                  <Store className="w-8 h-8 text-white" />
                  <HandCardTitle className="text-3xl">
                    <span className="bg-hand-yellow text-hand-pencil px-2 -rotate-1 inline-block">Rewards Store</span>
                  </HandCardTitle>
                </div>
              </HandCardHeader>
              <HandCardContent className="space-y-4 font-patrick text-lg text-white">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-hand-yellow shrink-0 mt-0.5" />
                  <p>Premium parking passes for top achievers.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-hand-yellow shrink-0 mt-0.5" />
                  <p>Dining hall credits and campus cafe vouchers.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-hand-yellow shrink-0 mt-0.5" />
                  <p>Exclusive university merchandise and apparel.</p>
                </div>
              </HandCardContent>
            </HandCard>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="font-kalam text-4xl font-bold">Campus Market</h2>
            <div className="w-24 h-2 bg-hand-red rounded-wobbly"></div>
            <p className="font-patrick text-xl text-hand-pencil/80">
              Bridge the gap between digital achievements and real-world value. Configure a custom marketplace where students can spend their hard-earned wallet balance on tangible campus rewards.
            </p>
          </div>
        </div>

        {/* Feature 4: Analytics */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-kalam text-4xl font-bold">Teacher Analytics</h2>
            <div className="w-24 h-2 bg-hand-pencil rounded-wobbly"></div>
            <p className="font-patrick text-xl text-hand-pencil/80">
              Provide faculty with powerful tools to monitor student engagement. Track which gamification strategies work best and identify students who might need an extra push.
            </p>
          </div>
          <div className="relative">
            <HandCard decoration="tape" variant="red" className="-rotate-1 z-10 w-full max-w-md mx-auto">
              <HandCardHeader>
                <div className="flex items-center gap-3">
                  <LineChart className="w-8 h-8 text-white" />
                  <HandCardTitle className="text-3xl">Engagement Trends</HandCardTitle>
                </div>
              </HandCardHeader>
              <HandCardContent className="space-y-4 font-patrick text-lg text-white">
                <div className="h-32 border-l-4 border-b-4 border-white p-2 flex items-end gap-2 text-white/30">
                  <div className="w-1/4 bg-white/20 h-1/2 rounded-t-sm border-2 border-white border-b-0"></div>
                  <div className="w-1/4 bg-hand-yellow/50 h-3/4 rounded-t-sm border-2 border-white border-b-0"></div>
                  <div className="w-1/4 bg-white/50 h-full rounded-t-sm border-2 border-white border-b-0"></div>
                  <div className="w-1/4 bg-white/10 h-2/3 rounded-t-sm border-2 border-white border-b-0"></div>
                </div>
                <p className="text-center font-kalam font-bold mt-2">Class Average: +15%</p>
              </HandCardContent>
            </HandCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center max-w-3xl mx-auto">
        <h2 className="font-kalam text-4xl font-bold mb-8">Ready to transform your campus?</h2>
        <HandButton size="lg" className="text-xl rotate-1 group" asChild>
          <Link href="/auth/sign-up">
            Get Started <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </HandButton>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 max-w-5xl mx-auto text-center border-t-[3px] border-hand-pencil border-dashed mt-12 bg-white/50">
        <div className="flex items-center justify-center gap-2 text-hand-pencil/60 font-patrick text-lg">
          <span>Built with <span className="text-hand-red">♥</span> to learn better.</span>
          <span>© 2026 bBrains.</span>
        </div>
      </footer>
    </div>
  );
}
