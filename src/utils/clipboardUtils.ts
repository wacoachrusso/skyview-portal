
import { useToast } from "@/hooks/use-toast";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export const useChatClipboard = () => {
  const { copyToClipboard } = useCopyToClipboard();
  const { toast } = useToast();

  const handleCopyMessage = (content: string) => {
    copyToClipboard(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied to clipboard",
      duration: 2000,
    });
  };

  return { handleCopyMessage };
};
