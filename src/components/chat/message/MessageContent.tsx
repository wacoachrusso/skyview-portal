import { Message } from "@/types/chat";
import ReactMarkdown from 'react-markdown';
import { TypeAnimation } from 'react-type-animation';

interface MessageContentProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageContent({ message, isCurrentUser }: MessageContentProps) {
  const formatContent = (content: string): string => {
    // Remove all REF tags and their content, including the closing tag
    return content.replace(/\[REF\].*?\[\/REF\]/gs, '').trim();
  };

  const MarkdownContent = ({ content }: { content: string }) => (
    <div className="space-y-4">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2">{children}</p>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-2">{children}</ol>,
          li: ({ children }) => <li className="pl-2">{children}</li>,
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt || 'Uploaded image'} 
              className="max-w-full h-auto rounded-lg shadow-lg my-2"
              loading="lazy"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  return isCurrentUser ? (
    <div className="text-sm sm:text-base">
      <MarkdownContent content={message.content} />
    </div>
  ) : (
    <div className="text-sm sm:text-base min-h-[20px]">
      <TypeAnimation
        sequence={[formatContent(message.content)]}
        wrapper="div"
        cursor={false}
        repeat={0}
        speed={90}
        className="whitespace-pre-wrap"
      />
      <MarkdownContent content={formatContent(message.content)} />
    </div>
  );
}