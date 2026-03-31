import { HandButton } from "@/components/hand-drawn/button";
import { landingData } from "@/data/landing";

export function CtaSection() {
  const { titleLine1, titleLine2, subtitle, placeholder, buttonText } = landingData.ctaSection;

  return (
    <section id="contact" className="py-24 px-6 max-w-5xl mx-auto relative z-20">
      <div className="relative max-w-4xl mx-auto">
        {/* Background red shadow */}
        <div className="absolute inset-0 bg-hand-red rounded-[20px_20px_30px_10px_/_15px_15px_20px_25px] translate-x-2 translate-y-2 lg:translate-x-3 lg:translate-y-3 -rotate-1"></div>
        
        {/* Main Dark Card */}
        <div className="relative rounded-[20px_20px_30px_10px_/_15px_15px_20px_25px] border-[3px] border-hand-pencil bg-hand-pencil text-white p-10 md:p-16 text-center shadow-lg -rotate-1 hover:rotate-0 transition-transform duration-300">
          {/* Top-left decorative dashed arc */}
          <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-dashed border-white/30 rounded-tl-full"></div>
          
          <h2 className="font-kalam text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-[1.1]">
            {titleLine1}<br className="hidden sm:block" /> {titleLine2}
          </h2>
          
          <p className="font-patrick text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            <input 
              type="email" 
              placeholder={placeholder} 
              className="w-full sm:flex-1 h-14 px-6 bg-transparent border-2 border-white/60 text-white rounded-wobbly font-patrick text-lg placeholder:text-white/40 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all"
            />
            <HandButton size="lg" variant="default" className="w-full sm:w-auto h-14 bg-white text-hand-pencil hover:bg-white/90 font-kalam text-xl rotate-1">
              {buttonText}
            </HandButton>
          </div>
        </div>
      </div>
    </section>
  );
}
