import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeSelector } from "./settings/ThemeSelector";
import { FontSizeSelector } from "./settings/FontSizeSelector";
import { NotificationToggle } from "./settings/NotificationToggle";
import { AutoSaveToggle } from "./settings/AutoSaveToggle";
import { AccountInfo } from "./settings/AccountInfo";
import { LogoutButton } from "./settings/LogoutButton";
import { SessionCheck } from "./settings/SessionCheck";

export function ChatSettings() {
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("chat-font-size") || "medium");
  const [notifications, setNotifications] = useState(() => localStorage.getItem("chat-notifications") === "true");
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem("chat-auto-save") !== "false");
  const [isOpen, setIsOpen] = useState(false);
  
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "icon"}
          className="text-white hover:bg-white/10"
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:w-[400px] bg-[#1E1E2E] border-l border-white/10">
        <SheetHeader>
          <SheetTitle className="text-xl sm:text-2xl font-bold text-white">Settings</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <SessionCheck />
          <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
          <FontSizeSelector fontSize={fontSize} setFontSize={setFontSize} />
          <NotificationToggle notifications={notifications} setNotifications={setNotifications} />
          <AutoSaveToggle autoSave={autoSave} setAutoSave={setAutoSave} />
          <AccountInfo />
          <LogoutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}