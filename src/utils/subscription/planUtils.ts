export const formatPlanName = (plan: string): string => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };
  
  export const getButtonLabel = (plan: string): string => {
    if (plan === "monthly") {
      return "Upgrade to Annual";
    } else if (plan === "annual") {
      return "Switch to Monthly";
    } else {
      return "Upgrade Plan";
    }
  };
  
  export const getTargetPlan = (plan: string): string => {
    if (plan === "monthly") {
      return "annual";
    } else if (plan === "annual") {
      return "monthly";
    } else {
      return "monthly"; // Default for free users
    }
  };
  
  export const isButtonDisabled = (plan: string, isUpdating: boolean): boolean => {
    // Disable button if currently on annual plan
    if (plan === "annual") return true;
    return isUpdating;
  };
  