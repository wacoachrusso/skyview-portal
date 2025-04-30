import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";

type Theme = "light" | "dark" | "system";

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const { theme } = useTheme();
  
  // Define theme-specific classes
  const getBackgroundClass = () => {
    if (theme === 'light') {
      return 'bg-gray-100 border-gray-300'; 
    } else {
      return 'bg-gray-800 border-gray-700';
    }
  };
  
  const getContentBackgroundClass = () => {
    if (theme === 'light') {
      return 'bg-white border-gray-200 shadow-lg';
    } else {
      return 'bg-gray-900 border-gray-700 shadow-md';
    }
  };
  
  const getTextClass = () => {
    return theme === 'light' ? 'text-gray-800' : 'text-gray-200';
  };
  
  const getHighlightClass = () => {
    return theme === 'light' 
      ? 'data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700' 
      : 'data-[highlighted]:bg-blue-900/40 data-[highlighted]:text-blue-200';
  };
  
  return (
    <div className="space-y-2">
      <label id="theme-selector-label" className={`text-sm font-medium ${getTextClass()}`}>
        Theme
      </label>
      <Select 
        value={currentTheme} 
        onValueChange={(value: Theme) => onThemeChange(value)}
        aria-labelledby="theme-selector-label"
      >
        <SelectTrigger className={`w-full ${getBackgroundClass()} ${getTextClass()} focus:ring-2 focus:ring-blue-400 focus:border-blue-400`}>
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent className={`${getContentBackgroundClass()}`}>
          <SelectItem 
            value="light" 
            className={`${getTextClass()} ${getHighlightClass()}`}
          >
            Light
          </SelectItem>
          <SelectItem 
            value="dark" 
            className={`${getTextClass()} ${getHighlightClass()}`}
          >
            Dark
          </SelectItem>
          <SelectItem 
            value="system" 
            className={`${getTextClass()} ${getHighlightClass()}`}
          >
            System
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}