import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlphaTester } from "../types";
import { togglePromoterStatus } from "./utils/promoterUtils";
import { updateTesterStatus } from "./utils/testerStatusUtils";
import { deleteTester } from "./utils/deletionUtils";

export const useTesterActions = (testers: AlphaTester[] | undefined, refetch: () => void) => {
  const { toast } = useToast();
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTogglePromoterStatus = async (testerId: string, currentStatus: boolean) => {
    setUpdatingUser(testerId);
    const tester = testers?.find(t => t.id === testerId);
    if (!tester) return;
    
    await togglePromoterStatus(testerId, currentStatus, toast, tester);
    refetch();
    setUpdatingUser(null);
  };

  const handleUpdateStatus = async (
    testerId: string, 
    newStatus: "active" | "inactive" | "removed"
  ) => {
    setUpdatingUser(testerId);
    const tester = testers?.find(t => t.id === testerId);
    if (!tester) return;
    
    await updateTesterStatus(testerId, newStatus, toast, tester);
    refetch();
    setUpdatingUser(null);
  };

  const handleDeleteTester = async (testerId: string) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    const tester = testers?.find(t => t.id === testerId);
    if (!tester) return;
    
    await deleteTester(testerId, toast, tester);
    refetch();
    setIsDeleting(false);
  };

  return {
    updatingUser,
    isDeleting,
    togglePromoterStatus: handleTogglePromoterStatus,
    updateStatus: handleUpdateStatus,
    deleteTester: handleDeleteTester,
  };
};