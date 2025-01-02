import { ChatList } from "./ChatList";
import { ChatInput } from "./ChatInput";
import { Message } from "@/types/chat";
import { WelcomeMessage } from "./WelcomeMessage";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { DisclaimerDialog } from "../consent/DisclaimerDialog";
import { supabase } from "@/integrations/supabase/client";

interface ChatContentProps {
  messages: Message[];
  currentUserId: string | null;
  isLoading: boolean;
  onSendMessage: (content: string) => Promise<void>;
}

export function ChatContent({
  messages,
  currentUserId,
  isLoading,
  onSendMessage,
}: ChatContentProps) {
  const { toast } = useToast();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const checkDisclaimerStatus = async () => {
      if (!currentUserId) return;

      // Check if user has already seen the disclaimer
      const { data: disclaimer, error } = await supabase
        .from('disclaimer_consents')
        .select('status')
        .eq('user_id', currentUserId)
        .single();

      if (error) {
        console.error('Error checking disclaimer status:', error);
        return;
      }

      // If no record exists or hasn't accepted, show it
      if (!disclaimer || disclaimer.status !== 'accepted') {
        setShowDisclaimer(true);
      }
    };

    checkDisclaimerStatus();
  }, [currentUserId]);

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied to your clipboard.",
      duration: 2000,
    });
  };

  const handleAcceptDisclaimer = async () => {
    if (!currentUserId) return;

    try {
      const { error: upsertError } = await supabase
        .from('disclaimer_consents')
        .upsert({
          user_id: currentUserId,
          status: 'accepted'
        });

      if (upsertError) throw upsertError;

      setShowDisclaimer(false);
      toast({
        title: "Welcome to SkyGuide",
        description: "You can now start chatting with our AI assistant.",
      });
    } catch (error) {
      console.error('Error updating disclaimer consent:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your consent. Please try again.",
      });
    }
  };

  const handleRejectDisclaimer = () => {
    // Redirect to dashboard if they reject the disclaimer
    window.location.href = '/dashboard';
  };

  return (
    <div className="flex flex-col h-full">
      <DisclaimerDialog
        open={showDisclaimer}
        onAccept={handleAcceptDisclaimer}
        onReject={handleRejectDisclaimer}
      />
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading && <WelcomeMessage />}
        <ChatList 
          messages={messages} 
          currentUserId={currentUserId || ''} 
          isLoading={isLoading}
          onCopyMessage={handleCopyMessage}
        />
      </div>
      <div className="mt-auto border-t border-white/10">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
        <p className="text-xs text-gray-400 text-center py-2 px-4">
          SkyGuide can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}