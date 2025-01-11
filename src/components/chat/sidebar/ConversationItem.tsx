import { Conversation } from "@/types/chat";
import { format } from "date-fns";
import { MessageSquare, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

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

  const handleToggleOffline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleOffline(e, conversation.id);
    
    toast({
      title: isOffline ? "Chat removed from offline storage" : "Chat saved for offline access",
      description: isOffline 
        ? "This chat will no longer be available offline" 
        : "This chat will be available when you're offline",
      duration: 3000
    });
  };

  return (
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
              >
                {isOffline ? (
                  <EyeOff className="h-4 w-4 text-brand-gold hover:text-brand-gold/80" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-white" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}