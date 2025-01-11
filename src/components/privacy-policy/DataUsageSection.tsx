import { Bell } from "lucide-react";

export const DataUsageSection = () => {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-6 w-6 text-brand-gold" />
        <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
      </div>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li>To provide and improve our aviation intelligence services</li>
        <li>To personalize your experience and content</li>
        <li>To process your transactions and maintain your account</li>
        <li>To send important updates and notifications</li>
        <li>To analyze and improve our platform's performance</li>
        <li>To comply with legal obligations and industry regulations</li>
      </ul>
    </section>
  );
};