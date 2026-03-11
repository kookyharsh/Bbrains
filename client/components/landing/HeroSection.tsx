import Link from "next/link";
import { HandButton } from "@/components/hand-drawn/button";
import { HandCard } from "@/components/hand-drawn/card";
import { ArrowRight, Sparkles } from "lucide-react";
import { landingData } from "@/data/landing";
import { toast } from "sonner";

export function HeroSection() {
  const { title, subtitle, primaryCta, floatingCard } = landingData.hero;

  return (
    <section className="pt-24 pb-32 px-6 max-w-5xl mx-auto relative ">
      <div className="absolute top-20 left-10 md:left-0 hidden md:block pointer-events-none">
        {/* Scribble decoration */}
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-hand-yellow opacity-80 animate-bounce" style={{ animationDuration: '3s' }}>
          <path d="M60 10C87.6142 10 110 32.3858 110 60C110 87.6142 87.6142 110 60 110C32.3858 110 10 87.6142 10 60C10 32.3858 32.3858 10 60 10Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 8" />
        </svg>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 z-10 relative">
          <h1 className="font-kalam text-5xl md:text-7xl font-bold leading-[1.1] text-hand-pencil">
            {title.part1} <br />
            {title.part2} <span className="text-hand-red relative inline-block group cursor-default">{title.highlight}
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-hand-yellow -z-10 -rotate-2 group-hover:rotate-0 transition-transform"></span>
            </span>
            <span className="inline-block hover:rotate-12 transition-transform duration-200">!</span>
          </h1>
          <p className="font-patrick text-xl md:text-2xl text-hand-pencil/80 max-w-lg leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 relative lg:max-w-lg">
            <input 
               type="email" 
               placeholder="Enter your email..." 
               className="w-full sm:flex-1 h-14 px-6 bg-white border-2 border-hand-pencil text-hand-pencil rounded-wobbly font-patrick text-lg placeholder:text-hand-pencil/40 focus:outline-none focus:ring-2 focus:ring-hand-blue/20 transition-all shadow-[3px_3px_0px_0px_rgba(45,45,45,0.1)]"
            />
            <HandButton size="lg" className="rotate-1 h-14 whitespace-nowrap" asChild>
              <Link href={primaryCta.url}>{primaryCta.text} <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </HandButton>
          </div>
        </div>

        <div className="relative">
          <div className="relative z-10 p-4 -rotate-2 hover:rotate-0 transition-all duration-300">
            <HandCard variant="yellow" decoration="tack" className="p-2 sm:p-4 aspect-square max-w-[400px] mx-auto flex items-center justify-center bg-white">
              <div className="w-full h-full rounded-wobblyMd border-2 border-hand-pencil/40 border-dashed flex flex-col items-center justify-center p-8 text-center gap-4 group">
                <Sparkles className="w-16 h-16 text-hand-blue group-hover:scale-110 transition-transform" strokeWidth={2} />
                <h3 className="font-kalam text-3xl font-bold">{floatingCard.title}</h3>
                <p className="font-patrick text-xl">{floatingCard.subtitle}</p>
                <HandButton
                  variant="secondary"
                  className="mt-4"
                  onClick={() =>
                    toast.success(`${floatingCard.subtitle}`, { position: "bottom-right" })
                  }
                >
                  {floatingCard.buttonText}
                </HandButton>
              </div>
            </HandCard>
          </div>
          {/* Background offset card for layering effect */}
          <div className="absolute inset-0 top-8 left-8 max-w-[400px] aspect-square bg-hand-muted border-4 border-hand-pencil rounded-wobbly rotate-3 -z-10 mx-auto"></div>
        </div>
      </div>
    </section>
  );
}
