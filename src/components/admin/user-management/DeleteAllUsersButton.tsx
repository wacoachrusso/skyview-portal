
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const DeleteAllUsersButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteAllUsers = async () => {
    try {
      setIsDeleting(true);
      
      // Call the edge function to delete all users except admin
      const { data, error } = await supabase.functions.invoke("delete-users-except-admin", {
        body: { adminEmail: "mikescordcutters@gmail.com" }
      });

      if (error) {
        console.error("Error deleting users:", error);
        throw error;
      }

      console.log("Delete users response:", data);
      
      const successCount = data.results.filter((r: any) => r.success).length;
      const failCount = data.results.filter((r: any) => !r.success).length;

      toast({
        title: "Users Deleted",
        description: `Successfully deleted ${successCount} users including auth records. ${failCount > 0 ? `Failed to delete ${failCount} users.` : ''}`,
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error in handleDeleteAllUsers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete users. See console for details.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Delete All Users Except Admin
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This action cannot be undone. This will permanently delete ALL user accounts
                and their data from the system, except for the admin account (mikescordcutters@gmail.com).
              </p>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-amber-800 font-medium">Warning:</p>
                <p className="text-amber-700">
                  This is a destructive operation that will delete all data associated with these accounts including:
                </p>
                <ul className="list-disc list-inside text-amber-700 mt-1">
                  <li>User profiles</li>
                  <li>Authentication data (complete removal from auth system)</li>
                  <li>All conversations and messages</li>
                  <li>Session data</li>
                  <li>Consent records</li>
                  <li>Contract uploads</li>
                  <li>Alpha tester information</li>
                </ul>
                <p className="text-amber-700 mt-2 font-medium">
                  Users will be completely removed from the system and their emails will be available for new signups.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllUsers}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner /> Deleting All Users...
                </div>
              ) : (
                "Yes, Delete All Users"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
