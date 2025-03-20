
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export function Testimonials() {
  return (
    <div className="relative py-20 bg-testimonial-gradient overflow-hidden">
      <div className="absolute inset-0 bg-glow-gradient opacity-30" />
      <div className="container mx-auto px-4 relative">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          What Aviation Professionals Say
        </h2>
        <p className="text-lg text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Trusted by pilots and flight attendants across major airlines
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              quote: "SkyGuide has transformed how I manage my schedule and interpret contract rules. It's like having a personal contract expert available 24/7.",
              author: "Capt. Emily Rodriguez",
              role: "Senior Captain, United Airlines",
              years: "15 years of experience"
            },
            {
              quote: "As a flight attendant, having instant access to contract interpretations and duty rules has been invaluable. This tool has helped me understand my rights better.",
              author: "Sarah Chen",
              role: "Senior Flight Attendant, Delta Airlines",
              years: "8 years of service"
            },
            {
              quote: "The accuracy and quick responses have helped me make informed decisions about my schedule and work-life balance. It's an essential tool for any pilot.",
              author: "First Officer James Mitchell",
              role: "First Officer, American Airlines",
              years: "12 years in aviation"
            }
          ].map((testimonial, index) => (
            <Card key={index} className="card-hover relative bg-card-gradient border-gray-700 group">
              <div className="absolute inset-0 bg-glow-gradient opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              <CardContent className="relative pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <div className="mb-6">
                  <p className="font-semibold text-white text-lg">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
                <p className="text-gray-300 mb-6 italic text-lg leading-relaxed">"{testimonial.quote}"</p>
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-sm text-brand-gold font-medium">{testimonial.years}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
