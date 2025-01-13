import { useState } from 'react';
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';

export function useDownloadChat() {
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const filename = `chat-${title}-${format(new Date(), 'yyyy-MM-dd')}.txt`;

      try {
        // Update database first to ensure offline status is set
        const { error: updateError } = await supabase
          .from('conversations')
          .update({ downloaded_at: new Date().toISOString() })
          .eq('id', conversationId);

        if (updateError) {
          console.error('Error updating downloaded_at:', updateError);
          throw updateError;
        }

        // Create download URL and handle download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          setDownloadInProgress(false);
        }, 100);

        // Quietly refresh the data in the background
        await queryClient.invalidateQueries({ queryKey: ['conversations'] });
        
        toast({
          title: "Chat downloaded successfully",
          description: "Your chat has been saved to your device.",
          duration: 2000
        });

        console.log('Chat download completed successfully');
        return true;

      } catch (downloadError) {
        console.error('Error during file download:', downloadError);
        setDownloadInProgress(false);
        
        toast({
          title: "Download failed",
          description: "There was an error downloading the chat. Please try again.",
          variant: "destructive",
          duration: 2000
        });
        
        throw downloadError;
      }

    } catch (error) {
      console.error('Error downloading chat:', error);
      setDownloadInProgress(false);
      
      toast({
        title: "Download failed",
        description: "There was an error downloading the chat. Please try again.",
        variant: "destructive",
        duration: 2000
      });
      return false;
    }
  };

  return {
    downloadChat,
    downloadInProgress
  };
}