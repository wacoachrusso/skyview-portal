import { useSessionInitialization } from "./session/useSessionInitialization";
import { useSessionInvalidation } from "./session/useSessionInvalidation";
import { useSessionInterceptor } from "./session/useSessionInterceptor";
import { createNewSession } from "./session/useSessionCreation";

export const useSessionManagement = () => {
  const { isLoading, initializeSession } = useSessionInitialization();
  const { handleSessionInvalidation } = useSessionInvalidation();
  const { sessionInterceptor } = useSessionInterceptor();

  return {
    isLoading,
    initializeSession,
    sessionInterceptor,
    createNewSession,
    handleSessionInvalidation
  };
};