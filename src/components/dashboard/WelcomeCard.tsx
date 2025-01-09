import { Card, CardContent } from "@/components/ui/card";

export const WelcomeCard = () => {
  return (
    <Card className="bg-welcome-card border-brand-purple/10 backdrop-blur-sm">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome to SkyGuide
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            Your AI-powered assistant for understanding your union contract. Ask questions, get instant answers, and stay informed about your rights and benefits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};