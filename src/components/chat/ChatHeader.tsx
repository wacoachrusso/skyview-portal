import { ChatSettings } from "./ChatSettings";
import { NotificationBell } from "../notifications/NotificationBell";

export function ChatHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#1E1E2E]">
      <h1 className="text-xl font-bold text-white">SkyGuide AI</h1>
      <div className="flex items-center space-x-2">
        <NotificationBell />
        <ChatSettings />
      </div>
    </header>
  );
}