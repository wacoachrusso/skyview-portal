import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Search } from "lucide-react";
import { useState } from "react";

export function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-80 border-r border-white/10 flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <img src="/placeholder.svg" alt="SkyGuide" className="h-8 w-8" />
          <span className="text-white font-semibold">SkyGuide</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Conversation history would go here */}
      </div>
    </div>
  );
}