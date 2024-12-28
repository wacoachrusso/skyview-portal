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

interface DeleteUserDialogProps {
  user: ProfilesRow | null;
  onConfirm: (user: ProfilesRow) => void;
  onCancel: () => void;
}

export const DeleteUserDialog = ({
  user,
  onConfirm,
  onCancel,
}: DeleteUserDialogProps) => {
  return (
    <AlertDialog open={!!user} onOpenChange={() => onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user's
            account and remove their data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => user && onConfirm(user)}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};