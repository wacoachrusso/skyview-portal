import { Message } from "@/types/chat";
import ReactMarkdown from 'react-markdown';
import { TypeAnimation } from 'react-type-animation';

interface MessageContentProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageContent({ message, isCurrentUser }: MessageContentProps) {
  const formatContent = (content: string) => {
    // Remove [REF] tags from the content
    const cleanContent = content.replace(/\[REF\].*?\[\/REF\]/s, '').trim();

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
          {cleanContent}
        </ReactMarkdown>
      </div>
    );
  };

  return isCurrentUser ? (
    <div className="text-sm sm:text-base">
      <ReactMarkdown
        components={{
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
        {message.content}
      </ReactMarkdown>
    </div>
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
  );
}