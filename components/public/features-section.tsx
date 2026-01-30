import { Trophy, Users, Calendar, Shield, Target, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeaturesSectionProps {
  features?: string | null; // JSON array
  dictionary: {
    title: string;
    subtitle: string;
  };
}

// Default features if none provided
const defaultFeatures = [
  {
    icon: "trophy",
    title: "Profesyonel Egitim",
    description: "UEFA lisansli antrenorlerimiz ile uluslararasi standartlarda egitim",
  },
  {
    icon: "users",
    title: "Yas Gruplari",
    description: "4-18 yas arasi tum cocuklara uygun sinif ve grup egitimi",
  },
  {
    icon: "calendar",
    title: "Esnek Program",
    description: "Hafta ici ve hafta sonu uygun saatlerde antrenman imkani",
  },
  {
    icon: "shield",
    title: "Guvenli Ortam",
    description: "Sigorta kapsaminda, guvenli tesislerde egitim",
  },
  {
    icon: "target",
    title: "Bireysel Gelisim",
    description: "Her oyuncuya ozel gelisim takibi ve raporlama",
  },
  {
    icon: "star",
    title: "Turnuva Katilimi",
    description: "Yurt ici ve yurt disi turnuvalara katilim imkani",
  },
];

const iconMap: Record<string, React.ElementType> = {
  trophy: Trophy,
  users: Users,
  calendar: Calendar,
  shield: Shield,
  target: Target,
  star: Star,
};

export function FeaturesSection({ features, dictionary }: FeaturesSectionProps) {
  let featureList = defaultFeatures;

  // Parse custom features if provided
  if (features) {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed) && parsed.length > 0) {
        featureList = parsed;
      }
    } catch {
      // Use default features if parsing fails
    }
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {dictionary.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {dictionary.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featureList.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Star;
            return (
              <Card
                key={index}
                className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <IconComponent className="h-6 w-6 text-primary group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
