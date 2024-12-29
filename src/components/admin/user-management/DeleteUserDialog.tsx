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
  user: ProfilesRow;
  onConfirm: (user: ProfilesRow) => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
}

export const DeleteUserDialog = ({
  user,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteUserDialogProps) => {
  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user's
            account and remove their data from our servers.
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