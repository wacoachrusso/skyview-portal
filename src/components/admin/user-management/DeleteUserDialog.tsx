
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
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface DeleteUserDialogProps {
  user: ProfilesRow | null;
  onConfirm: (user: ProfilesRow) => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
  isOpen: boolean;
}

export const DeleteUserDialog = ({
  user,
  onConfirm,
  onCancel,
  isDeleting,
  isOpen,
}: DeleteUserDialogProps) => {
  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              This action cannot be undone. This will permanently delete the user's
              account and remove their data from our servers.
            </p>
            <p className="font-medium">
              The following data will be permanently deleted:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>User profile and authentication data</li>
              <li>All conversations and messages</li>
              <li>Uploaded contracts and files</li>
              <li>Notification history</li>
              <li>Cookie and disclaimer consents</li>
              <li>Session data</li>
              <li>All other related records</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(user)}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner /> Deleting...
              </div>
            ) : (
              "Delete Account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
