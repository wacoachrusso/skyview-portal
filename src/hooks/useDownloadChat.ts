
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDownloadMethods } from '@/hooks/download/useDownloadMethods';
import { 
  fetchConversationMessages, 
  markConversationAsDownloaded,
  refreshConversationsCache
} from '@/utils/download/databaseUtils';

export function useDownloadChat() {
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const queryClient = useQueryClient();
  const { performDownload } = useDownloadMethods();
  
  const downloadChat = async (conversationId: string, title: string) => {
    console.log('Starting chat download for conversation:', conversationId);
    setDownloadInProgress(true);
  
    try {
      // Fetch messages for the conversation
      const messages = await fetchConversationMessages(conversationId);
      
      // Perform the download operation
      const downloadSuccess = await performDownload(messages, title);
      
      if (downloadSuccess) {
        // Update database to mark conversation as downloaded
        console.log('Updating database with downloaded_at timestamp');
        await markConversationAsDownloaded(conversationId);
        
        // Refresh the conversations query
        await refreshConversationsCache(queryClient);
      }
      
      console.log('Chat download completed successfully');
      setDownloadInProgress(false);
      return downloadSuccess;
  
    } catch (error) {
      console.error('Error downloading chat:', error);
      setDownloadInProgress(false);
      return false;
    }
  };

  return {
    downloadChat,
    downloadInProgress
  };
}
