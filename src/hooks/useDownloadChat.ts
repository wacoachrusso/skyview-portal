import { useState } from 'react';
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useDownloadChat() {
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const { toast } = useToast();

  const downloadChat = async (conversationId: string, title: string) => {
    console.log('Starting chat download for conversation:', conversationId);
    setDownloadInProgress(true);

    try {
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      let textContent = `Chat: ${title}\n`;
      textContent += `Date: ${format(new Date(), 'MMMM d, yyyy')}\n\n`;
      textContent += `${'-'.repeat(50)}\n\n`;

      messages?.forEach((message) => {
        const timestamp = format(new Date(message.created_at), 'h:mm a');
        const role = message.role === 'assistant' ? 'SkyGuide' : 'You';
        textContent += `[${timestamp}] ${role}:\n${message.content}\n\n`;
      });

      // Create blob and URL
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const filename = `chat-${title}-${format(new Date(), 'yyyy-MM-dd')}.txt`;

      // Use the native browser download API if available
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // For IE & Edge
        window.navigator.msSaveOrOpenBlob(blob, filename);
      } else {
        // For modern browsers
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Set link properties
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Append link, trigger click, and clean up
        document.body.appendChild(link);
        
        // Use a proper click event that works across platforms
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          composed: true
        });
        
        link.dispatchEvent(clickEvent);
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      }

      // Update downloaded_at timestamp in the database
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ downloaded_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating downloaded_at:', updateError);
      }

      setDownloadInProgress(false);

      toast({
        title: "Chat downloaded successfully",
        description: "Your chat has been saved to your device.",
        duration: 3000
      });

      console.log('Chat download completed successfully');
      return true;

    } catch (error) {
      console.error('Error downloading chat:', error);
      setDownloadInProgress(false);
      
      toast({
        title: "Download failed",
        description: "There was an error downloading the chat. Please try again.",
        variant: "destructive",
        duration: 3000
      });
      return false;
    }
  };

  return {
    downloadChat,
    downloadInProgress
  };
}