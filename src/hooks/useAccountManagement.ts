
import { useProfileLoader } from "./account-management/useProfileLoader";
import { useAccountReactivation } from "./account-management/useAccountReactivation";
import { useAccountActions } from "./account-management/useAccountActions";

export const useAccountManagement = () => {
  const { isLoading, userEmail, profile, authUser } = useProfileLoader();
  const { reactivateAccount } = useAccountReactivation();
  const { handleCancelSubscription, handleDeleteAccount } = useAccountActions(authUser?.id);

  return {
    isLoading,
    userEmail,
    profile,
    handleCancelSubscription,
    handleDeleteAccount
  };
};
