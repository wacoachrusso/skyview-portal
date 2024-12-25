import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function NotificationDescription() {
  return (
    <Alert className="bg-white/5 border-white/10">
      <Info className="h-4 w-4 text-white" />
      <AlertDescription className="text-sm text-gray-300">
        Get notified about important updates and changes to keep you informed.
      </AlertDescription>
    </Alert>
  );
}