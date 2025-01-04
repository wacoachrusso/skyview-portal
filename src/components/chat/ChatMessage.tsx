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
    // Check if content contains a list or table-like structure
    if (content.includes("1.") || content.includes("•") || content.includes("|")) {
      const rows = content.split(/\d+\.\s+|\n/).filter(Boolean);
      
      // Check if it's a table structure (contains ":" or "|")
      if (content.includes(":") || content.includes("|")) {
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody>
                {rows.map((row, index) => {
                  const [header, value] = row.split(/[:|]/).map(s => s.trim());
                  if (!header || !value) return null;
                  return (
                    <tr key={index} className="border-t border-white/10">
                      <td className="py-2 px-4 font-medium">{header}</td>
                      <td className="py-2 px-4">{value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      
      // If it's a list, format as bullet points
      return (
        <ul className="list-disc list-inside space-y-2">
          {rows.map((item, index) => (
            <li key={index} className="pl-2">{item.trim()}</li>
          ))}
        </ul>
      );
    }
    
    // Use ReactMarkdown for regular text content
    return (
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
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div
      className={cn(
        "flex w-full gap-2 group",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] sm:max-w-[80%] flex-col gap-1 rounded-lg px-3 py-2 relative",
          isCurrentUser
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            : "bg-gradient-to-r from-[#2A2F3C] to-[#1E1E2E] text-white"
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
              className="whitespace-pre-wrap prose prose-invert"
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