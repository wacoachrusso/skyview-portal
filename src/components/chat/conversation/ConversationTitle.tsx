import { useTheme } from "@/components/theme-provider";

interface ConversationTitleProps {
  title: string;
}

export function ConversationTitle({ title }: ConversationTitleProps) {
  const { theme } = useTheme();

  return (
    <span
      className={`text-sm font-medium truncate max-w-[180px] ${
        theme === "dark" ? "text-white" : "text-gray-800"
      }`}
    >
      {title}
    </span>
  );
}
