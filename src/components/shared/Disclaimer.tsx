import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Disclaimer = () => {
  return (
    <Alert className="bg-brand-navy/20 border-brand-gold/20 text-sm">
      <AlertTriangle className="h-4 w-4 text-brand-gold" />
      <AlertDescription className="text-gray-300">
        SkyGuide can make mistakes. Check important info.
      </AlertDescription>
    </Alert>
  );
};