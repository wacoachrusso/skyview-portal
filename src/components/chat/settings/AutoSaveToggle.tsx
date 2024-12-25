import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";

type AutoSaveToggleProps = {
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
};

export function AutoSaveToggle({ autoSave, setAutoSave }: AutoSaveToggleProps) {
  useEffect(() => {
    localStorage.setItem("chat-auto-save", autoSave.toString());
  }, [autoSave]);

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <label className="text-sm font-medium text-white">Auto Save</label>
        <p className="text-sm text-gray-400">Automatically save conversations offline</p>
      </div>
      <Switch
        checked={autoSave}
        onCheckedChange={setAutoSave}
        className="data-[state=checked]:bg-blue-600"
      />
    </div>
  );
}