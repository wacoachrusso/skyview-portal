import React from "react";
import ReactMarkdown from "react-markdown";
import sanitizeHtml from 'sanitize-html';
import { useTheme } from "../theme-provider";

const ChatMessage = ({ message, currentUserId, onCopyMessage }) => {
  const {theme} = useTheme();
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;
  
  return (
    <div 
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 transition-all duration-300 group`}
      data-testid={`chat-message-${message.id}`}
    >
      {/* Avatar for assistant */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"></path>
              <path d="M12 8v8"></path>
              <path d="M8 12h8"></path>
            </svg>
          </div> 
        </div>
      )}
      
      <div
        className={`max-w-xs sm:max-w-md md:max-w-3xl lg:max-w-4xl p-4 rounded-2xl shadow-lg transform transition-all duration-200 ${
          isUser 
            ? "bg-blue-600 text-white rounded-br-sm hover:bg-blue-700" 
            : theme === "dark" 
              ? "bg-slate-800 text-white rounded-bl-sm border border-slate-700 hover:border-slate-600"
              : "bg-slate-200 text-slate-900 rounded-bl-sm border border-slate-300 hover:border-slate-400"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`font-medium text-sm ${isUser ? "text-blue-100" : theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
            {isUser ? "You" : "SkyGuide Assistant"}
          </span>
          {!isStreaming && (
            <button
              onClick={() => onCopyMessage(message.content)}
              className={`ml-2 ${isUser ? "text-blue-100" : theme === "dark" ? "text-slate-300" : "text-slate-500"} hover:text-white opacity-0 group-hover:opacity-100 transition-opacity`}
              aria-label="Copy message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform hover:scale-110"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Message content with Markdown support */}
        <div className={`text-sm leading-relaxed prose prose-sm ${isUser ? "prose-invert" : theme === "dark" ? "prose-invert" : "prose-slate"} max-w-none`}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          ) : (
            <MessageContent content={message.content} theme={theme} />
          )}
        </div>
        
        {/* Status area */}
        <div className="text-xs mt-2 flex items-center justify-end">
          {isStreaming ? (
            <div className="flex items-center text-emerald-400">
              <LoadingDots />
              <span className="ml-2">Generating response</span>
            </div>
          ) : (
            <span className={`opacity-70 ${isUser ? "text-blue-100" : theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
              {new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          )}
        </div>
      </div>
      
      {/* Avatar for user */}
      {isUser && (
        <div className="flex-shrink-0 ml-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white font-semibold">
            {currentUserId ? currentUserId.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      )}
    </div>
  );
};

const MessageContent = ({ content, theme }) => {
  // Determine text color based on theme
  const textColorClass = theme === "dark" ? "text-white" : "text-slate-900";
  
  if (content.includes("<table>")) {
    return (
      <div 
        className={`table-wrapper overflow-x-auto p-2 rounded-lg border ${
          theme === "dark" 
            ? "border-slate-700 bg-slate-900 text-white" 
            : "bg-slate-200 text-slate-900 border-slate-300"
        }`}
        dangerouslySetInnerHTML={{ 
          __html: sanitizeHtml(content, {
            allowedTags: ['table', 'tr', 'td', 'th', 'thead', 'tbody', 'h3', 'h4', 'p', 'ul', 'li', 'ol', 'code', 'pre', 'strong', 'em']
          }) 
        }}
      />
    );
  }

  // Apply theme-appropriate text color
  return (
    <div className={`${textColorClass} text-xs leading-relaxed`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="text-sm mb-2">{children}</p>,
          ul: ({ children }) => <ul className="list-disc ml-5 text-xs mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-5 text-xs mb-2">{children}</ol>,
          li: ({ children }) => <li className="text-xs mb-1">{children}</li>,
          code: ({ children }) => <code className={`${theme === "dark" ? "bg-slate-700" : "bg-slate-300"} text-xs px-1 rounded`}>{children}</code>,
          pre: ({ children }) => <pre className={`${theme === "dark" ? "bg-slate-800" : "bg-slate-300"} text-xs p-2 rounded overflow-x-auto`}>{children}</pre>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-semibold mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-semibold mb-1">{children}</h3>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};


const LoadingDots = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
    </div>
  );
};

export default ChatMessage;