import { Award, Rocket, Globe, Clock } from "lucide-react";

export function Features() {
  return (
    <div className="relative py-20 bg-feature-gradient overflow-hidden">
      <div className="absolute inset-0 bg-glow-gradient opacity-30" />
      <div className="container mx-auto px-4 relative">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          Why Choose SkyGuide?
        </h2>
        <p className="text-lg text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Get instant, accurate answers to your contract questions with our advanced AI technology.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Rocket className="w-8 h-8 text-brand-gold" />,
              title: "Instant Answers",
              description: "Get immediate responses to your contract questions, 24/7"
            },
            {
              icon: <Award className="w-8 h-8 text-brand-gold" />,
              title: "High Accuracy",
              description: "Trained on your specific contract for precise interpretations"
            },
            {
              icon: <Globe className="w-8 h-8 text-brand-gold" />,
              title: "Always Available",
              description: "Access from anywhere, on any device, whenever you need it"
            },
            {
              icon: <Clock className="w-8 h-8 text-brand-gold" />,
              title: "Time Saving",
              description: "Save hours searching through contract documents"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="relative bg-card-gradient p-6 rounded-lg shadow-lg border border-white/10 hover:border-brand-gold/30 transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-glow-gradient opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              <div className="relative">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}