import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Disclaimer = () => {
  return (
    <Alert className="bg-brand-navy/20 border-brand-gold/20 text-xs py-2">
      <AlertTriangle className="h-3 w-3 text-brand-gold" />
      <AlertDescription className="text-gray-300 text-xs">
        SkyGuide can make mistakes. Check important info.
      </AlertDescription>
    </Alert>
  );
};