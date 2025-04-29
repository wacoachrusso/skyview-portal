import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeSelector } from "../components/chat/settings/ThemeSelector";
import { FontSizeSelector } from "../components/chat/settings/FontSizeSelector";
import { NotificationPreferences } from "../components/chat/settings/notifications/NotificationPreferences";
import { AccountInfo } from "../components/chat/settings/AccountInfo";
import { LogoutButton } from "../components/chat/settings/LogoutButton";

export function ChatSettings() {
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("chat-font-size") || "medium");
  const [isOpen, setIsOpen] = useState(false);
  
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "icon"}
          className="text-foreground hover:bg-accent"
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:w-[400px] bg-background border-l border-border">
        <SheetHeader>
          <SheetTitle className="text-xl sm:text-2xl font-bold text-foreground">Settings</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
          <FontSizeSelector fontSize={fontSize} setFontSize={setFontSize} />
          <NotificationPreferences />
          <AccountInfo />
          <LogoutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}