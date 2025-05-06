import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { theme } = useTheme();

  const containerBg = theme === "dark" ? "bg-[#1E1E2E]" : "bg-white";
  const inputBg = theme === "dark" ? "bg-[#2A2F3C]" : "bg-gray-100";
  const borderColor = theme === "dark" ? "border-white/10" : "border-gray-200";
  const textColor = theme === "dark" ? "text-white" : "text-black";
  const placeholderColor = theme === "dark" ? "placeholder:text-gray-400" : "placeholder:text-gray-500";

  return (
    <div className={`p-3 sm:p-4 border-b ${borderColor} ${containerBg}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search conversations..."
          className={`pl-8 sm:pl-10 text-sm sm:text-base ${inputBg} ${borderColor} ${textColor} ${placeholderColor} focus:ring-2 focus:ring-blue-500/20`}
        />
      </div>
    </div>
  );
}
