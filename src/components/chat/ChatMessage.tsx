import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { format } from "date-fns";
import { TypeAnimation } from 'react-type-animation';
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onCopy: () => void;
}

export function ChatMessage({ message, isCurrentUser, onCopy }: ChatMessageProps) {
  const formatContent = (content: string) => {
    // Extract reference if it exists (text between [REF] tags)
    const referenceMatch = content.match(/\[REF\](.*?)\[\/REF\]/s);
    const reference = referenceMatch ? referenceMatch[1].trim() : null;
    const mainContent = content.replace(/\[REF\].*?\[\/REF\]/s, '').trim();

    return (
      <div className="space-y-4">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2">{children}</p>,
            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            ul: ({ children }) => <ul className="list-disc list-inside space-y-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-2">{children}</ol>,
            li: ({ children }) => <li className="pl-2">{children}</li>,
          }}
        >
          {mainContent}
        </ReactMarkdown>
        {reference ? (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-blue-400 font-medium">Reference:</p>
            <p className="text-sm text-gray-400 whitespace-pre-wrap">{reference}</p>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-yellow-400 font-medium">Note:</p>
            <p className="text-sm text-gray-400">No specific contract reference available for this query.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex w-full gap-2 p-1 sm:p-2 group",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] sm:max-w-[80%] flex-col gap-1 rounded-lg px-3 py-2 sm:px-4 sm:py-2 relative",
          isCurrentUser
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
            : "bg-gradient-to-r from-[#2A2F3C] to-[#1E1E2E] text-white shadow-md"
        )}
      >
        {isCurrentUser ? (
          <p className="text-sm sm:text-base">{message.content}</p>
        ) : (
          <div className="text-sm sm:text-base min-h-[20px]">
            <TypeAnimation
              sequence={[message.content]}
              wrapper="div"
              cursor={false}
              repeat={0}
              speed={90}
              className="whitespace-pre-wrap"
            />
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-xs opacity-50">
            {format(new Date(message.created_at), "h:mm a")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 text-white/70 hover:text-white hover:bg-white/10"
            onClick={onCopy}
          >
            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}