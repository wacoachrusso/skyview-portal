import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function Hero() {
  return (
    <div className="relative min-h-[600px] flex items-center justify-center bg-hero-gradient overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/0a42e28b-5643-4de2-8069-9830e779a8f2.png')] bg-center bg-no-repeat bg-contain opacity-20" />
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="inline-block rounded-full bg-brand-navy/20 px-4 py-1.5 mb-4">
            <span className="text-sm font-medium text-brand-gold">
              Tailored for flight attendants and pilots across all airlines
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-4">
            End Contract Confusion—<br />
            Get Instant Answers Now
          </h1>

          <p className="max-w-[700px] text-lg md:text-xl text-slate-300 mb-8">
            Get instant, accurate answers to your contract questions with SkyGuide. 
            Our advanced system helps you navigate complex contract details, ensuring 
            you understand your rights and make informed decisions with ease.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button
              asChild
              size="lg"
              className="bg-brand-gold hover:bg-brand-gold/90 text-black font-semibold px-8"
            >
              <Link to="/signup">Start Free Trial Today</Link>
            </Button>

            <Button
              asChild
              size="lg"
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white font-semibold px-8"
            >
              <Link to="/chat">Get Instant Contract Answers</Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <Link to="#demo" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Watch Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}