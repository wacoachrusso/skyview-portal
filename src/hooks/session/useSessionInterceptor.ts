import { createSessionInterceptor } from "@/utils/sessionInterceptor";
import { useSessionInvalidation } from "./useSessionInvalidation";

export const useSessionInterceptor = () => {
  const { handleSessionInvalidation } = useSessionInvalidation();

  const sessionInterceptor = createSessionInterceptor(() => {
    handleSessionInvalidation("Your session has expired. Please log in again.");
  });

  return {
    sessionInterceptor
  };
};