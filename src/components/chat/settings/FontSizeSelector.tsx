import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FontSizeSelectorProps {
  fontSize: string;
  setFontSize: (size: string) => void;
}

export function FontSizeSelector({ fontSize, setFontSize }: FontSizeSelectorProps) {
  useEffect(() => {
    // Apply font size to the entire app
    document.documentElement.style.fontSize = fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px';
    localStorage.setItem("chat-font-size", fontSize);
  }, [fontSize]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Font Size</label>
      <Select value={fontSize} onValueChange={setFontSize}>
        <SelectTrigger className="w-full bg-background border-input">
          <SelectValue placeholder="Select font size" />
        </SelectTrigger>
        <SelectContent className="bg-[#020817] border-white/10">
          <SelectItem value="small">Small</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="large">Large</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}