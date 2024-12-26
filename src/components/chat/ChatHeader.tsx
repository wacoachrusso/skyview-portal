import React from "react";

interface ChatHeaderProps {
  onBack: () => void;
  onNewChat: () => Promise<void>;
}

export function ChatHeader({ onBack, onNewChat }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800">
      <button onClick={onBack} className="text-white">
        Back
      </button>
      <h1 className="text-lg font-bold text-white">Chat</h1>
      <button onClick={onNewChat} className="text-white">
        New Chat
      </button>
    </div>
  );
}
