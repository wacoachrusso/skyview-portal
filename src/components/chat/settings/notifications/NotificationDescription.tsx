import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function NotificationDescription() {
  return (
    <Alert className="bg-white/5 border-white/10">
      <Info className="h-4 w-4 text-white" />
      <AlertDescription className="text-sm text-gray-300">
        You'll receive notifications for:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Contract revisions and amendments</li>
          <li>Grievance status changes</li>
          <li>Important policy updates</li>
          <li>System maintenance notices</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}