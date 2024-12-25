import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Conversation } from "@/types/chat";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
}: ConversationListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`flex items-center gap-2 mb-1 rounded-lg ${
            currentConversationId === conversation.id
              ? 'bg-white/10'
              : 'hover:bg-white/5'
          }`}
        >
          <Button
            variant="ghost"
            className="flex-1 justify-start text-left p-3 max-w-[calc(100%-40px)]"
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="w-full">
              <div className="font-medium text-white truncate">
                {conversation.title.replace(/【.*?】/g, '').trim()}
              </div>
              <div className="text-xs text-gray-400">
                {format(new Date(conversation.last_message_at), 'MMM d, yyyy')}
              </div>
            </div>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-white/10 min-w-[40px]"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1E1E2E] border border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Delete Conversation</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This action cannot be undone. This will permanently delete this conversation.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => onDeleteConversation(conversation.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}