
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Theme = "light" | "dark" | "system";

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-2">
      <label id="theme-selector-label" className="text-sm font-medium text-white">Theme</label>
      <Select 
        value={currentTheme} 
        onValueChange={(value: Theme) => onThemeChange(value)}
        aria-labelledby="theme-selector-label"
      >
        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-brand-gold/70 focus:border-brand-gold">
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent className="bg-[#2A2F3C] border-white/10">
          <SelectItem value="light" className="text-white hover:bg-white/5 focus:bg-white/10">Light</SelectItem>
          <SelectItem value="dark" className="text-white hover:bg-white/5 focus:bg-white/10">Dark</SelectItem>
          <SelectItem value="system" className="text-white hover:bg-white/5 focus:bg-white/10">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
