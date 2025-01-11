import { Card, CardContent } from "@/components/ui/card";

export const WelcomeCard = () => {
  return (
    <Card className="bg-welcome-card border-brand-purple/10 backdrop-blur-sm">
      <CardContent className="p-8 sm:p-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Welcome to SkyGuide
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Your assistant for understanding your union contract. Ask questions, get instant answers, and stay informed about your rights and benefits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};