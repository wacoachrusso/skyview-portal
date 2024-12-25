import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FONT_SIZES = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg"
};

type FontSizeSelectorProps = {
  fontSize: string;
  setFontSize: (size: string) => void;
};

export function FontSizeSelector({ fontSize, setFontSize }: FontSizeSelectorProps) {
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      Object.values(FONT_SIZES).forEach(size => {
        chatContainer.classList.remove(size);
      });
      chatContainer.classList.add(FONT_SIZES[fontSize as keyof typeof FONT_SIZES]);
    }
    localStorage.setItem("chat-font-size", fontSize);
  }, [fontSize]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">Font Size</label>
      <Select value={fontSize} onValueChange={setFontSize}>
        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
          <SelectValue placeholder="Select font size" />
        </SelectTrigger>
        <SelectContent className="bg-[#2A2F3C] border-white/10">
          <SelectItem value="small" className="text-white hover:bg-white/5">Small</SelectItem>
          <SelectItem value="medium" className="text-white hover:bg-white/5">Medium</SelectItem>
          <SelectItem value="large" className="text-white hover:bg-white/5">Large</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}