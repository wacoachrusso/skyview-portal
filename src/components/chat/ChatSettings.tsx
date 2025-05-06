import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogoutButton } from "./settings/LogoutButton";
import { AccountInfo } from "./settings/AccountInfo";
import { FontSizeSelector } from "./settings/FontSizeSelector";
import { NotificationPreferences } from "./settings/notifications/NotificationPreferences";
import { ThemeSelector } from "./settings/ThemeSelector";

export function ChatSettings() {
  const isChatPage = location.pathname === "/chat";
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem("chat-font-size") || "medium"
  );
  const [isOpen, setIsOpen] = useState(false);

  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "default"}
          className={`"transition-all duration-300  hover:text-white flex items-center gap-2 ${
            theme === "dark" ? `${isChatPage ? "text-muted-foreground" :"trxt-white"}` : "text-slate-600"
          }`}
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden lg:block">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:w-[400px] bg-background border-l border-border">
        <SheetHeader>
          <SheetTitle className="text-xl sm:text-2xl font-bold text-foreground">
            Settings
          </SheetTitle>
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
