import { Link } from "react-router-dom";

export function ComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-navy/90 to-brand-navy/80 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8 animate-float">
          <img 
            src="/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png"
            alt="SkyGuide Logo"
            className="w-32 h-32 mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Coming Soon
          </h1>
          <p className="text-xl text-gray-300">
            We're working hard to bring you the ultimate union contract assistant. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}