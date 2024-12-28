import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface NotificationDescriptionProps {
  showPermissionDialog: boolean;
  setShowPermissionDialog: (show: boolean) => void;
  onConfirmPermission: () => void;
}

export function NotificationDescription({
  showPermissionDialog,
  setShowPermissionDialog,
  onConfirmPermission,
}: NotificationDescriptionProps) {
  return (
    <>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          To receive notifications, you need to allow them in your browser settings.
          If notifications are blocked, you'll need to unblock them in your browser preferences.
        </AlertDescription>
      </Alert>

      <AlertDialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Notifications</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                To stay updated with important announcements and release notes, we need your permission to send notifications.
              </p>
              <p>
                When prompted by your browser:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Click "Allow" to enable notifications</li>
                <li>You can change this setting anytime in your browser preferences</li>
                <li>You'll receive notifications for important updates and release notes</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmPermission}>
              Enable Notifications
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}