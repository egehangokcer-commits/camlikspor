import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ContactSectionProps {
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactAddress?: string | null;
  dictionary: {
    title: string;
    subtitle: string;
    phoneLabel: string;
    emailLabel: string;
    addressLabel: string;
    hoursLabel: string;
    hours: string;
  };
}

export function ContactSection({
  contactPhone,
  contactEmail,
  contactAddress,
  dictionary,
}: ContactSectionProps) {
  const contactItems = [
    {
      icon: Phone,
      label: dictionary.phoneLabel,
      value: contactPhone,
      href: contactPhone ? `tel:${contactPhone}` : undefined,
    },
    {
      icon: Mail,
      label: dictionary.emailLabel,
      value: contactEmail,
      href: contactEmail ? `mailto:${contactEmail}` : undefined,
    },
    {
      icon: MapPin,
      label: dictionary.addressLabel,
      value: contactAddress,
      href: contactAddress
        ? `https://maps.google.com/?q=${encodeURIComponent(contactAddress)}`
        : undefined,
    },
    {
      icon: Clock,
      label: dictionary.hoursLabel,
      value: dictionary.hours,
    },
  ].filter((item) => item.value);

  if (contactItems.length === 0) {
    return null;
  }

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {dictionary.title}
          </h2>
          <p className="text-lg text-muted-foreground">{dictionary.subtitle}</p>
        </div>

        {/* Contact Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {contactItems.map((item, index) => (
            <Card
              key={index}
              className="border-0 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6 text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  {item.label}
                </h3>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.icon === MapPin ? "_blank" : undefined}
                    rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-foreground">{item.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map Embed (optional - placeholder) */}
        {contactAddress && (
          <div className="mt-12 rounded-xl overflow-hidden shadow-lg">
            <div className="aspect-video w-full bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Harita icin Google Maps entegrasyonu eklenebilir</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
