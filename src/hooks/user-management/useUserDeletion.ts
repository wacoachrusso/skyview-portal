import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";
import { handleUserDeletion } from "@/utils/userDeletion";

export const useUserDeletion = (refetch: () => Promise<any>) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteUser = async (user: ProfilesRow) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      console.log("Starting user deletion process for:", user);
      await handleUserDeletion(user, async () => {
        await refetch();
      });

      toast({
        title: "Success",
        description: "User account deleted successfully",
      });
    } catch (error) {
      console.error("Error in handleDeleteUser:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user account",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDeleteUser,
  };
};