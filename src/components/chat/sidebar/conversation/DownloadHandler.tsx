
import { useState } from "react";
import { DownloadDialog } from "../DownloadDialog";
import { useDownloadChat } from "@/hooks/useDownloadChat";

interface DownloadHandlerProps {
  conversationId: string;
  title: string;
  onDownloadComplete: (success: boolean) => void;
}

export function DownloadHandler({ 
  conversationId, 
  title, 
  onDownloadComplete 
}: DownloadHandlerProps) {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const { downloadChat, downloadInProgress } = useDownloadChat();

  const handleDownloadConfirmed = async () => {
    setShowPermissionDialog(false);

    try {
      const success = await downloadChat(conversationId, title);
      onDownloadComplete(success);
    } catch (error) {
      console.error("Error during download:", error);
      onDownloadComplete(false);
    }
  };

  return (
    <>
      <DownloadDialog
        open={showPermissionDialog}
        onOpenChange={setShowPermissionDialog}
        onConfirm={handleDownloadConfirmed}
      />
      
      {/* Return the state and functions to be used by parent */}
      <span style={{ display: 'none' }} 
        data-testid={`download-handler-${conversationId}`} 
        data-download-in-progress={downloadInProgress}
        onClick={() => setShowPermissionDialog(true)}
      />
    </>
  );
}
