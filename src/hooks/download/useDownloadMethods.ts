
import { useState } from 'react';
import { 
  tryMSDownload,
  tryStandardDownload,
  createManualDownloadUI,
  createDownloadBlob,
  generateFilename,
  formatChatContent,
  showSuccessToast,
  showErrorToast
} from '@/utils/download/downloadUtils';

export function useDownloadMethods() {
  const [downloadInProgress, setDownloadInProgress] = useState(false);

  const performDownload = async (messages: any[], title: string): Promise<boolean> => {
    setDownloadInProgress(true);
    
    try {
      // Format the text content for download
      const textContent = formatChatContent(title, messages);
      
      // Create a blob and filename
      const blob = createDownloadBlob(textContent);
      const filename = generateFilename(title);
      
      console.log('Text content prepared, attempting download now');
      
      // Try multiple download methods for maximum browser compatibility
      let downloadSuccessful = false;
      
      // Method 1: Using msSaveBlob for IE/Edge
      downloadSuccessful = tryMSDownload(blob, filename);
      
      // Method 2: Standard download approach
      if (!downloadSuccessful) {
        downloadSuccessful = await tryStandardDownload(blob, filename);
      }
      
      // Method 3: Fallback using data URI
      if (!downloadSuccessful) {
        downloadSuccessful = createManualDownloadUI(blob, filename);
      }
      
      if (!downloadSuccessful) {
        throw new Error('All download methods failed');
      }
      
      showSuccessToast();
      return true;
    } catch (error) {
      console.error('Error in download process:', error);
      showErrorToast();
      return false;
    } finally {
      setDownloadInProgress(false);
    }
  };

  return {
    downloadInProgress,
    performDownload
  };
}
