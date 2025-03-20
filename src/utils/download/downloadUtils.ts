
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Define interface for non-standard navigator methods
interface NavigatorWithSave extends Navigator {
  msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
  msSaveBlob?: (blob: Blob, defaultName?: string) => boolean;
}

/**
 * Creates the text content for a chat download
 */
export function formatChatContent(title: string, messages: any[]) {
  let textContent = `Chat: ${title}\n`;
  textContent += `Date: ${format(new Date(), 'MMMM d, yyyy')}\n\n`;
  textContent += `${'-'.repeat(50)}\n\n`;

  messages?.forEach((message) => {
    const timestamp = format(new Date(message.created_at), 'h:mm a');
    const role = message.role === 'assistant' ? 'SkyGuide' : 'You';
    textContent += `[${timestamp}] ${role}:\n${message.content}\n\n`;
  });

  return textContent;
}

/**
 * Create a downloadable blob from text content
 */
export function createDownloadBlob(textContent: string) {
  return new Blob([textContent], { type: 'text/plain;charset=utf-8' });
}

/**
 * Generate a filename for the download based on chat title
 */
export function generateFilename(title: string) {
  return `chat-${title.replace(/[^a-z0-9]/gi, '_')}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
}

/**
 * Try to download using MS-specific methods (for IE/Edge)
 */
export function tryMSDownload(blob: Blob, filename: string): boolean {
  const navigatorWithSave = window.navigator as NavigatorWithSave;
  if (navigatorWithSave.msSaveOrOpenBlob || navigatorWithSave.msSaveBlob) {
    const saveBlob = navigatorWithSave.msSaveOrOpenBlob || navigatorWithSave.msSaveBlob;
    if (saveBlob) {
      saveBlob.call(navigatorWithSave, blob, filename);
      console.log('Used msSaveBlob download method');
      return true;
    }
  }
  return false;
}

/**
 * Try to download using standard browser download approach
 */
export async function tryStandardDownload(blob: Blob, filename: string): Promise<boolean> {
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
    
    return true;
  } catch (downloadError) {
    console.error('Standard download method failed:', downloadError);
    return false;
  }
}

/**
 * Create and show a manual download UI element for fallback
 */
export function createManualDownloadUI(blob: Blob, filename: string): boolean {
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
    return true;
  } catch (fallbackError) {
    console.error('Fallback download method failed:', fallbackError);
    return false;
  }
}

/**
 * Display a success toast notification
 */
export function showSuccessToast() {
  toast({
    title: "Chat downloaded successfully",
    description: "Your chat has been saved to your device.",
    duration: 2000
  });
}

/**
 * Display an error toast notification
 */
export function showErrorToast() {
  toast({
    title: "Download failed",
    description: "There was an error downloading the chat. Please try again.",
    variant: "destructive",
    duration: 2000
  });
}
