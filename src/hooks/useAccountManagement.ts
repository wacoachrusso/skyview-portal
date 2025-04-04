
import { useProfileLoader } from "./account-management/useProfileLoader";
import { useAccountReactivation } from "./account-management/useAccountReactivation";
import { useAccountActions } from "./account-management/useAccountActions";
import { UseAccountManagementReturn } from "./account-management/types";

export const useAccountManagement = (): UseAccountManagementReturn => {
  const { isLoading, loadError, userEmail, profile, authUser, retryLoading } = useProfileLoader();
  const { reactivateAccount } = useAccountReactivation();
  const { handleCancelSubscription, handleDeleteAccount } = useAccountActions(authUser?.id);

  return {
    isLoading,
    loadError,
    userEmail,
    profile,
    handleCancelSubscription,
    handleDeleteAccount,
    retryLoading
  };
};
