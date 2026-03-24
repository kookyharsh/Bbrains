import { landingData } from "@/data/landing";

export function AboutSection() {
  const { titleTag, heading, paragraphs } = landingData.about;

  return (
    <section id="about" className="py-24 px-6 max-w-4xl mx-auto relative z-20">
      <div className="relative rounded-[20px_20px_30px_10px_/_15px_15px_20px_25px] border-[2.5px] border-hand-pencil bg-white p-8 md:p-14 my-8">
        {/* Title Tag */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 border-[2.5px] border-hand-pencil bg-hand-yellow px-6 py-1.5 font-kalam text-xl font-bold text-hand-pencil z-10 whitespace-nowrap">
          {titleTag}
        </div>
        
        <h2 className="font-kalam text-3xl md:text-4xl lg:text-[42px] font-bold text-center text-hand-pencil mb-12 leading-[1.3] mt-4">
          {heading}
        </h2>

        <div className="space-y-8 font-patrick text-xl leading-relaxed text-hand-pencil/90 max-w-3xl mx-auto">
          {paragraphs.map((p, index) => (
            <p key={index}>
              {p.dropcap && (
                <span className="float-left text-5xl font-kalam font-bold text-hand-red mr-2 mt-1.5 leading-none">
                  {p.dropcap}
                </span>
              )}
              {p.text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
