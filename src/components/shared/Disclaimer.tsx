import { AlertTriangle } from "lucide-react";

export const Disclaimer = () => {
  return (
    <div className="flex items-center gap-1">
      <AlertTriangle className="h-3 w-3 text-brand-gold" />
      <p className="text-gray-300 text-[11px]">
        SkyGuide can make mistakes. Check important info.
      </p>
    </div>
  );
};