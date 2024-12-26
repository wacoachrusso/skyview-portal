import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FontSizeSelectorProps {
  fontSize: string;
  setFontSize: (size: string) => void;
}

export function FontSizeSelector({ fontSize, setFontSize }: FontSizeSelectorProps) {
  useEffect(() => {
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