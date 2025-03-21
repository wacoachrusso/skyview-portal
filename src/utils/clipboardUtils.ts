
import { useToast } from "@/hooks/use-toast";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export const useChatClipboard = () => {
  const { copyToClipboard } = useCopyToClipboard();
  const { toast } = useToast();

  const handleCopyMessage = async (content: string): Promise<void> => {
    copyToClipboard(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied to clipboard",
      duration: 2000,
    });
    
    // This function now returns a promise
    return Promise.resolve();
  };

  return { handleCopyMessage };
};
