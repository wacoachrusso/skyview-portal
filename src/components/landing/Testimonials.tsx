import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export function Testimonials() {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-brand-navy mb-4">
          What Pilots Say
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Join thousands of satisfied airline professionals who trust SkyGuide
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              quote: "SkyGuide has revolutionized how I interpret my contract. It's like having a contract expert in my pocket.",
              author: "John D.",
              role: "Captain, Major Airline"
            },
            {
              quote: "The accuracy and speed of responses are incredible. This tool has saved me countless hours of contract research.",
              author: "Sarah M.",
              role: "First Officer"
            },
            {
              quote: "Finally, a tool that understands pilot contracts! The interface is intuitive and the answers are spot-on.",
              author: "Michael R.",
              role: "Senior Captain"
            }
          ].map((testimonial, index) => (
            <Card key={index} className="border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-brand-navy">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}