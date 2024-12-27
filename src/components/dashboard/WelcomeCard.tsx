import { Card, CardContent } from "@/components/ui/card";

export const WelcomeCard = () => {
  return (
    <Card className="mb-8 bg-gradient-to-br from-brand-navy to-brand-slate border-0">
      <CardContent className="p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome to SkyGuide</h2>
        <p className="text-white/80">Access your contract information and resources</p>
      </CardContent>
    </Card>
  );
};