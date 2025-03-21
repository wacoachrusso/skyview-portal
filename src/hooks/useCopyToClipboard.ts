
import { useToast } from "@/hooks/use-toast";
import { useClipboard } from "./useClipboard";

export function useCopyToClipboard() {
  const { toast } = useToast();
  const { copy } = useClipboard();

  const copyToClipboard = (content: string) => {
    copy(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied to your clipboard.",
    });
  };

  return { copyToClipboard };
}
