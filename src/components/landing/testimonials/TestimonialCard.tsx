
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  years: string;
}

export function TestimonialCard({ quote, author, role, years }: TestimonialCardProps) {
  return (
    <Card className="card-hover relative bg-card-gradient border-gray-700 group">
      <div className="absolute inset-0 bg-glow-gradient opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
      <CardContent className="relative pt-6">
        <div className="flex mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
          ))}
        </div>
        <div className="mb-6">
          <p className="font-semibold text-white text-lg">{author}</p>
          <p className="text-sm text-gray-400">{role}</p>
        </div>
        <p className="text-gray-300 mb-6 italic text-lg leading-relaxed">"{quote}"</p>
        <div className="border-t border-gray-700 pt-4">
          <p className="text-sm text-brand-gold font-medium">{years}</p>
        </div>
      </CardContent>
    </Card>
  );
}
