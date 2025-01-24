import { Quote } from "lucide-react";

interface MessageContentProps {
  message: {
    content: string;
    role: string;
  };
  isCurrentUser: boolean;
}

export function MessageContent({ message, isCurrentUser }: MessageContentProps) {
  const formatContent = (content: string) => {
    const parts = content.split(/(\[REF\].*?\[\/REF\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('[REF]') && part.endsWith('[/REF]')) {
        const quote = part.replace('[REF]', '').replace('[/REF]', '');
        return (
          <div key={index} className="flex items-start gap-2 my-2 text-pink-300">
            <Quote className="h-4 w-4 mt-1 flex-shrink-0" />
            <em className="italic">{quote}</em>
          </div>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="whitespace-pre-wrap break-words">
      {formatContent(message.content)}
    </div>
  );
}