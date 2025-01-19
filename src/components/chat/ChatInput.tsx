import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendButton } from "./SendButton";
import { MicButton } from "./MicButton";
import { ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !uploadedImageUrl) || isLoading || disabled) return;

    try {
      const finalMessage = uploadedImageUrl 
        ? `${message}\n\n![Uploaded Image](${uploadedImageUrl})`
        : message.trim();

      await onSendMessage(finalMessage);
      setMessage("");
      setUploadedImageUrl(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageUpload = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = false;

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Error",
            description: "Image must be less than 5MB",
            variant: "destructive",
          });
          return;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `lovable-uploads/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('contracts')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Error",
            description: "Failed to upload image",
            variant: "destructive",
          });
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('contracts')
          .getPublicUrl(filePath);

        setUploadedImageUrl(publicUrl);
        
        toast({
          title: "Success",
          description: "Image uploaded successfully. You can now type your message.",
        });
      };

      input.click();
    } catch (error) {
      console.error('Error handling image upload:', error);
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const removeUploadedImage = () => {
    setUploadedImageUrl(null);
  };

  return (
    <div className="flex flex-col">
      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
        {uploadedImageUrl && (
          <div className="mb-2 relative inline-block">
            <img 
              src={uploadedImageUrl} 
              alt="Upload preview" 
              className="h-20 rounded-md"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background/80 hover:bg-background"
              onClick={removeUploadedImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="relative flex items-center">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Chat unavailable while offline" : "Ask about your contract..."}
            className="min-h-[60px] w-full pr-[120px] resize-none bg-background/50 focus-visible:ring-1 focus-visible:ring-offset-0"
            disabled={isLoading || disabled}
          />
          <div className="absolute right-2 flex items-center space-x-1 h-full pr-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10 transition-colors"
              onClick={handleImageUpload}
              disabled={isLoading || disabled || uploadedImageUrl !== null}
              aria-label="Upload image"
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
            <MicButton 
              onRecognized={setMessage} 
              disabled={isLoading || disabled}
            />
            <SendButton 
              isLoading={isLoading} 
              disabled={(!message.trim() && !uploadedImageUrl) || disabled}
            />
          </div>
        </div>
      </form>
      <p className="text-xs text-muted-foreground/70 text-center mb-2 px-2">
        SkyGuide can make mistakes. Check important info.
      </p>
    </div>
  );
}