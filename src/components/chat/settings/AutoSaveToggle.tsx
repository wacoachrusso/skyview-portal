import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type AutoSaveToggleProps = {
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
};

export function AutoSaveToggle({ autoSave, setAutoSave }: AutoSaveToggleProps) {
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("chat-auto-save", autoSave.toString());
  }, [autoSave]);

  const handleToggle = (checked: boolean) => {
    setAutoSave(checked);
    toast({
      title: checked ? "Auto-save enabled" : "Auto-save disabled",
      description: checked 
        ? "Your conversations will be automatically saved" 
        : "Auto-save has been turned off",
      duration: 2000,
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <label className="text-sm font-medium text-white">Auto Save</label>
        <p className="text-sm text-gray-400">Automatically save conversations offline</p>
      </div>
      <Switch
        checked={autoSave}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-blue-600"
      />
    </div>
  );
}