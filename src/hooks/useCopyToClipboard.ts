
import { useToast } from "@/hooks/use-toast";

export function useCopyToClipboard() {
  const { toast } = useToast();

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied to your clipboard.",
    });
  };

  return { copyToClipboard };
}
