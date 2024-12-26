import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
      <Alert className="bg-white/5 border-white/10">
        <Info className="h-4 w-4 text-white" />
        <AlertDescription className="text-sm text-gray-300">
          Get notified about important updates and changes to keep you informed.
        </AlertDescription>
      </Alert>

      <AlertDialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <AlertDialogContent className="bg-[#1E1E2E] border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Enable Notifications</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              To receive important updates, you'll need to allow browser notifications. 
              Would you like to enable notifications?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-700 text-white hover:bg-gray-600"
              onClick={() => setShowPermissionDialog(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700"
              onClick={onConfirmPermission}
            >
              Enable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}