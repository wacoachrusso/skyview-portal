import { useTheme } from "@/components/theme-provider";
import { MessageSquare } from "lucide-react";

interface ConversationIconProps {
  isSelected: boolean;
}

export function ConversationIcon({ isSelected }: ConversationIconProps) {
  const { theme } = useTheme();

  const backgroundColor = isSelected
    ? theme === "dark"
      ? "bg-brand-gold/20"
      : "bg-secondary/30"
    : theme === "dark"
    ? "bg-white/5"
    : "bg-gray-200";
  const iconColor = isSelected
    ? theme === "dark"
      ? "text-brand-gold"
      : "text-secondary"
    : theme === "dark"
    ? "text-gray-400"
    : "text-gray-500";

  return (
    <div className={`p-2 rounded-lg ${backgroundColor}`} aria-hidden="true">
      <MessageSquare className={`h-4 w-4 ${iconColor}`} />
    </div>
  );
}
