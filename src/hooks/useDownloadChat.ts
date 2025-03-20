import { useState } from 'react';
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from '@tanstack/react-query';

// Define interface for non-standard navigator methods
interface NavigatorWithSave extends Navigator {
  msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
  msSaveBlob?: (blob: Blob, defaultName?: string) => boolean;
}

export function useDownloadChat() {
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const downloadChat = async (conversationId: string, title: string) => {
    console.log('Starting chat download for conversation:', conversationId);
    setDownloadInProgress(true);
  
    try {
      // Fetch messages for the conversation
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
  
      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }
  
      console.log('Messages fetched successfully, count:', messages?.length);
  
      // Format the chat content
      let textContent = `Chat: ${title}\n`;
      textContent += `Date: ${format(new Date(), 'MMMM d, yyyy')}\n\n`;
      textContent += `${'-'.repeat(50)}\n\n`;
  
      messages?.forEach((message) => {
        const timestamp = format(new Date(message.created_at), 'h:mm a');
        const role = message.role === 'assistant' ? 'SkyGuide' : 'You';
        textContent += `[${timestamp}] ${role}:\n${message.content}\n\n`;
      });
  
      console.log('Text content prepared, attempting download now');
  
      // Create filename
      const filename = `chat-${title.replace(/[^a-z0-9]/gi, '_')}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      
      // Create blob
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      
      // Try multiple download methods for maximum browser compatibility
      let downloadSuccessful = false;
      
      // Method 1: Using msSaveBlob for IE/Edge (with proper type casting)
      const navigatorWithSave = window.navigator as NavigatorWithSave;
      if (navigatorWithSave.msSaveOrOpenBlob || navigatorWithSave.msSaveBlob) {
        const saveBlob = navigatorWithSave.msSaveOrOpenBlob || navigatorWithSave.msSaveBlob;
        if (saveBlob) {
          saveBlob.call(navigatorWithSave, blob, filename);
          console.log('Used msSaveBlob download method');
          downloadSuccessful = true;
        }
      } 
      // Method 2: Standard download approach
      else {
        try {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          
          // Set link properties
          link.style.display = 'none';
          link.href = url;
          link.download = filename;
          
          // Add to DOM, trigger click, then remove
          document.body.appendChild(link);
          console.log('Download link created');
          
          link.click();
          console.log('Download link clicked');
          
          // Force browser to start the download
          // The small timeout helps ensure the download starts before cleanup
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Cleanup
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          downloadSuccessful = true;
        } catch (downloadError) {
          console.error('Standard download method failed:', downloadError);
          // Continue to next method if this fails
        }
      }
      
      // Method 3: Fallback using data URI
      if (!downloadSuccessful) {
        try {
          console.log('Attempting fallback download method');
          
          // Create a temporary download UI element
          const downloadDiv = document.createElement('div');
          downloadDiv.style.position = 'fixed';
          downloadDiv.style.top = '20px';
          downloadDiv.style.right = '20px';
          downloadDiv.style.padding = '15px';
          downloadDiv.style.backgroundColor = '#f0f0f0';
          downloadDiv.style.border = '1px solid #ccc';
          downloadDiv.style.borderRadius = '5px';
          downloadDiv.style.zIndex = '9999';
          downloadDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
          
          downloadDiv.innerHTML = `
            <p style="margin: 0 0 10px 0; font-weight: bold;">Download Ready</p>
            <p style="margin: 0 0 10px 0;">Your file "${filename}" is ready.</p>
            <button id="manual-download-btn" style="padding: 5px 10px; cursor: pointer;">
              Download Now
            </button>
            <button id="cancel-download-btn" style="padding: 5px 10px; margin-left: 5px; cursor: pointer;">
              Cancel
            </button>
          `;
          
          document.body.appendChild(downloadDiv);
          
          const reader = new FileReader();
          
          reader.onload = function() {
            const downloadBtn = document.getElementById('manual-download-btn');
            if (downloadBtn) {
              downloadBtn.onclick = function() {
                const link = document.createElement('a');
                link.href = reader.result as string;
                link.download = filename;
                link.click();
                document.body.removeChild(downloadDiv);
                console.log('Manual download initiated');
              };
            }
            
            const cancelBtn = document.getElementById('cancel-download-btn');
            if (cancelBtn) {
              cancelBtn.onclick = function() {
                document.body.removeChild(downloadDiv);
                console.log('Download canceled by user');
              };
            }
          };
          
          reader.readAsDataURL(blob);
          downloadSuccessful = true;
        } catch (fallbackError) {
          console.error('Fallback download method failed:', fallbackError);
        }
      }
      
      if (!downloadSuccessful) {
        throw new Error('All download methods failed');
      }
  
      // Update database to mark conversation as downloaded
      console.log('Updating database with downloaded_at timestamp');
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ downloaded_at: new Date().toISOString() })
        .eq('id', conversationId);
  
      if (updateError) {
        console.error('Error updating downloaded_at:', updateError);
        throw updateError;
      }
  
      // Refresh the conversations query
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      toast({
        title: "Chat downloaded successfully",
        description: "Your chat has been saved to your device.",
        duration: 2000
      });
  
      console.log('Chat download completed successfully');
      setDownloadInProgress(false);
      return true;
  
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