
import { useState, useEffect } from "react";
import { useProfileLoader } from "./account-management/useProfileLoader";
import { useAccountReactivation } from "./account-management/useAccountReactivation";
import { useAccountActions } from "./account-management/useAccountActions";
import { Profile } from "./account-management/types";

export const useAccountManagement = () => {
  const { isLoading, userEmail, profile, authUser } = useProfileLoader();
  const { reactivateAccount } = useAccountReactivation();
  const { handleCancelSubscription, handleDeleteAccount } = useAccountActions(authUser?.id);

  // Make reactivateAccount available to useProfileLoader
  useEffect(() => {
    // This is just to make the reactivateAccount function available to the module scope
    // It's actually used directly in the useProfileLoader hook via a direct import
  }, []);

  return {
    isLoading,
    userEmail,
    profile,
    handleCancelSubscription,
    handleDeleteAccount
  };
};
