import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">Theme</label>
      <Select value={theme} onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}>
        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent className="bg-[#2A2F3C] border-white/10">
          <SelectItem value="light" className="text-white hover:bg-white/5">Light</SelectItem>
          <SelectItem value="dark" className="text-white hover:bg-white/5">Dark</SelectItem>
          <SelectItem value="system" className="text-white hover:bg-white/5">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}