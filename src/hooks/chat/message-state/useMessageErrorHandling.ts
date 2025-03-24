
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for managing chat-related error notifications
 */
export function useMessageErrorHandling() {
  const { toast } = useToast();

  // Show an error toast notification
  const showError = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
      duration: 3000,
    });
  };

  return {
    showError
  };
}
