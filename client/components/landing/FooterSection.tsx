import Link from "next/link";
import { Brain } from "lucide-react";
import { landingData } from "@/data/landing";

export function FooterSection() {
  const { brand, sections, legal } = landingData.footer;

  return (
    <footer className="border-t-[3px] border-hand-pencil border-solid bg-hand-paper mt-12">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand Column */}
          <div className="space-y-4 col-span-1">
            <div className="flex items-center gap-2 group">
              <Brain className="w-6 h-6 text-hand-red group-hover:-rotate-12 transition-transform" strokeWidth={2.5} />
              <span className="font-kalam text-2xl font-bold tracking-tight text-hand-pencil">{brand.name}</span>
            </div>
            <p className="font-patrick text-lg text-hand-pencil/80 max-w-xs">
              {brand.description}
            </p>
          </div>
          
          {/* Dynamic Sections */}
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <h4 className="font-kalam text-lg font-bold text-hand-red uppercase tracking-wider underline decoration-wavy decoration-hand-red decoration-2 underline-offset-4">
                {section.title}
              </h4>
              <ul className="space-y-4 font-patrick text-lg text-hand-pencil/80">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href={link.url} className="hover:text-hand-blue hover:underline decoration-1 underline-offset-2">
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-16 pt-8 border-t-[2px] border-hand-pencil/20 border-dashed flex flex-col md:flex-row items-center justify-between gap-4">
          <h4 className="font-kalam text-lg font-bold text-hand-red uppercase tracking-wider underline decoration-wavy decoration-hand-red decoration-2 underline-offset-4">Legal</h4>
          <div className="flex items-center gap-2 text-hand-pencil/60 font-patrick text-lg">
            <span>{legal.builtWith}</span>
            <span>{legal.copyright}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
