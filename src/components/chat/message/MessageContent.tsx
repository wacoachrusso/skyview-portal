import { Message } from "@/types/chat";
import ReactMarkdown from 'react-markdown';
import { TypeAnimation } from 'react-type-animation';

interface MessageContentProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageContent({ message, isCurrentUser }: MessageContentProps) {
  const formatContent = (content: string) => {
    const referenceMatch = content.match(/\[REF\](.*?)\[\/REF\]/s);
    const reference = referenceMatch ? referenceMatch[1].trim() : null;
    const mainContent = content.replace(/\[REF\].*?\[\/REF\]/s, '').trim();

    return (
      <div className="space-y-4">
        {isCurrentUser ? (
          <p className="text-sm sm:text-base">{mainContent}</p>
        ) : (
          <TypeAnimation
            sequence={[mainContent]}
            wrapper="div"
            speed={70}
            cursor={false}
            className="text-sm sm:text-base"
          />
        )}
        {reference && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-blue-400 font-medium">Reference:</p>
            <p className="text-sm text-gray-400 whitespace-pre-wrap">{reference}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="text-sm sm:text-base min-h-[20px]">
      {formatContent(message.content)}
    </div>
  );
}