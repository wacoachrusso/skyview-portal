import { Conversation } from "@/types/chat";
import { format } from "date-fns";
import { MessageSquare, Trash2, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  isOffline: boolean;
  onSelect: (conversationId: string) => void;
  onDelete: (e: React.MouseEvent, conversationId: string) => void;
  onToggleOffline: (e: React.MouseEvent, conversationId: string) => void;
  showCheckbox?: boolean;
  isChecked?: boolean;
  onCheckChange?: (checked: boolean) => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  isOffline,
  onSelect,
  onDelete,
  onToggleOffline,
  showCheckbox,
  isChecked,
  onCheckChange
}: ConversationItemProps) {
  const { toast } = useToast();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [downloadInProgress, setDownloadInProgress] = useState(false);

  const handleToggleOffline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If already offline, proceed with existing logic
    if (isOffline) {
      onToggleOffline(e, conversation.id);
      return;
    }

    // Show permission dialog for download
    setShowPermissionDialog(true);
  };

  const handleDownloadConfirmed = async () => {
    setShowPermissionDialog(false);
    setDownloadInProgress(true);

    try {
      // Fetch messages for the conversation
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Format the chat content in a readable text format
      let textContent = `Chat: ${conversation.title}\n`;
      textContent += `Date: ${format(new Date(conversation.created_at), 'MMMM d, yyyy')}\n\n`;
      textContent += `${'-'.repeat(50)}\n\n`;

      messages?.forEach((message) => {
        const timestamp = format(new Date(message.created_at), 'h:mm a');
        const role = message.role === 'assistant' ? 'SkyGuide' : 'You';
        textContent += `[${timestamp}] ${role}:\n${message.content}\n\n`;
      });
      
      // Create blob and download link
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-${conversation.title}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Also save for offline access
      const mockEvent = new MouseEvent('click');
      onToggleOffline(mockEvent, conversation.id);
      
      // Show device-specific toast message
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      let toastMessage = "Chat saved for offline access";
      if (isIOS) {
        toastMessage = "Chat downloaded to Files app. You can find it in Downloads or Documents folder.";
      } else if (isAndroid) {
        toastMessage = "Chat downloaded to Downloads folder. Access it through your device's Files app.";
      }
      
      toast({
        title: "Chat downloaded successfully",
        description: toastMessage,
        duration: 5000
      });
    } catch (error) {
      console.error('Error downloading chat:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the chat. Please try again.",
        variant: "destructive",
        duration: 2000
      });
    } finally {
      setDownloadInProgress(false);
    }
  };

  return (
    <>
      <div
        onClick={() => onSelect(conversation.id)}
        className={`group flex items-center px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-white/5 border-l-2 ${
          isSelected 
            ? "bg-white/10 border-l-brand-gold" 
            : "border-l-transparent hover:border-l-white/20"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showCheckbox && (
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked) => 
                onCheckChange?.(checked as boolean)
              }
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
            />
          )}
          <div className={`p-2 rounded-lg ${
            isSelected 
              ? "bg-brand-gold/20" 
              : "bg-white/5"
          }`}>
            <MessageSquare className={`h-4 w-4 ${
              isSelected 
                ? "text-brand-gold" 
                : "text-gray-400"
            }`} />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-white truncate max-w-[180px]">
              {conversation.title}
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{format(new Date(conversation.last_message_at), "MMM d, h:mm a")}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0.5"
                  onClick={(e) => onDelete(e, conversation.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0.5"
                  onClick={handleToggleOffline}
                  disabled={downloadInProgress}
                >
                  <ArrowDown className={`h-4 w-4 ${
                    isOffline 
                      ? "text-brand-gold" 
                      : "text-gray-400 hover:text-white"
                  }`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Chat for Offline Use</DialogTitle>
            <DialogDescription>
              This will download a copy of the chat to your device and make it available offline. The chat will be saved as a text file in your downloads folder.
              
              {/iPad|iPhone|iPod/.test(navigator.userAgent) && (
                <p className="mt-2">
                  On iOS devices, you can find downloaded files in the Files app under Downloads or Documents folder.
                </p>
              )}
              
              {/Android/.test(navigator.userAgent) && (
                <p className="mt-2">
                  On Android devices, you can find downloaded files in your Downloads folder through the Files app.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDownloadConfirmed}>
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}