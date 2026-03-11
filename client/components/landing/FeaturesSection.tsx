import { 
  HandCard, 
  HandCardContent, 
  HandCardHeader, 
  HandCardTitle, 
  HandCardDescription 
} from "@/components/hand-drawn/card";
import { landingData } from "@/data/landing";

export function FeaturesSection() {
  const { title, features } = landingData.gamification;

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto relative z-10">
      <div className="text-center mb-16 space-y-4">
        <h2 className="font-kalam text-4xl md:text-5xl font-bold">{title}</h2>
        <div className="w-32 h-2 bg-hand-red mx-auto rounded-wobbly"></div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, idx) => {
          const IconComponent = feature.icon;
          return (
            <HandCard 
              key={idx} 
              variant={feature.cardVariant as "default" | "yellow" | undefined} 
              decoration={feature.cardDecoration as "tape" | "tack" | "none"} 
              className={feature.cardStyle}
            >
              <HandCardHeader>
                <div className={`w-12 h-12 rounded-wobbly ${feature.iconBg} ${feature.iconColor} flex items-center justify-center mb-4 border-2 border-hand-pencil shadow-hard-sm`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <HandCardTitle>{feature.title}</HandCardTitle>
                <HandCardDescription>{feature.description}</HandCardDescription>
              </HandCardHeader>
              <HandCardContent>
                <p className="font-patrick text-lg text-hand-pencil/80">{feature.content}</p>
              </HandCardContent>
            </HandCard>
          );
        })}
      </div>
    </section>
  );
}
