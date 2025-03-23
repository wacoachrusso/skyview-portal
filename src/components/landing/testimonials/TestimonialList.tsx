
import { TestimonialCard } from "./TestimonialCard";

export function TestimonialList() {
  const testimonials = [
    {
      quote: "SkyGuide has transformed how I manage my schedule and interpret contract rules. It's like having a personal contract expert available 24/7.",
      author: "Capt. Emily Rodriguez",
      role: "Senior Captain, United Airlines",
      years: "15 years of experience"
    },
    {
      quote: "The instant access to contract information has been a game-changer during trips. Having clear interpretations available anywhere has helped me protect my rights as a union member.",
      author: "Michael Torres",
      role: "Flight Attendant, Southwest Airlines",
      years: "6 years of service"
    },
    {
      quote: "The accuracy and quick responses have helped me make informed decisions about my schedule and work-life balance. It's an essential tool for any pilot.",
      author: "First Officer James Mitchell",
      role: "First Officer, American Airlines",
      years: "12 years in aviation"
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <TestimonialCard
          key={index}
          quote={testimonial.quote}
          author={testimonial.author}
          role={testimonial.role}
          years={testimonial.years}
        />
      ))}
    </div>
  );
}
