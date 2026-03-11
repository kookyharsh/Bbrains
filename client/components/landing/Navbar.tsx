import Link from "next/link";
import { Brain } from "lucide-react";
import { HandButton } from "@/components/hand-drawn/button";
import { landingData } from "@/data/landing";

export function Navbar() {
  const { brand, links, cta } = landingData.navbar;

  return (
    <nav className="border-b-[3px] border-hand-pencil border-dashed bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 group">
          <Brain className="w-8 h-8 text-hand-red group-hover:-rotate-12 transition-transform" strokeWidth={2.5} />
          <span className="font-kalam text-3xl font-bold tracking-tight">{brand}</span>
        </div>
        <div className="flex items-center gap-4">
          {links.map((link, idx) => (
            <Link 
              key={idx} 
              href={link.url} 
              className="font-patrick text-xl font-medium hidden md:block hover:text-hand-blue hover:underline decoration-wavy decoration-2 underline-offset-4 transition-all"
            >
              {link.text}
            </Link>
          ))}
          <HandButton asChild size="sm" className="-rotate-1">
            <Link href={cta.url}>{cta.text}</Link>
          </HandButton>
        </div>
      </div>
    </nav>
  );
}
