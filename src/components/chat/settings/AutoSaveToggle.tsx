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
    if (autoSave) {
      setupAutoSave();
    }
  }, [autoSave]);

  const setupAutoSave = () => {
    // Save current conversations to IndexedDB for offline access
    const saveConversations = async () => {
      try {
        const conversations = localStorage.getItem('chat-conversations');
        if (conversations) {
          const db = await openDatabase();
          const tx = db.transaction('conversations', 'readwrite');
          const store = tx.objectStore('conversations');
          await store.put({
            id: 'cached-conversations',
            data: JSON.parse(conversations),
            timestamp: new Date().toISOString()
          });
          console.log('Conversations saved to IndexedDB');
        }
      } catch (error) {
        console.error('Error saving conversations:', error);
      }
    };

    // Set up periodic saving
    const interval = setInterval(saveConversations, 60000); // Auto-save every minute
    saveConversations(); // Initial save

    return () => clearInterval(interval);
  };

  const openDatabase = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('chatApp', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('conversations')) {
          db.createObjectStore('conversations', { keyPath: 'id' });
        }
      };
    });
  };

  const handleToggle = (checked: boolean) => {
    setAutoSave(checked);
    toast({
      title: checked ? "Auto-save enabled" : "Auto-save disabled",
      description: checked 
        ? "Your conversations will be automatically saved for offline access" 
        : "Auto-save has been turned off",
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <label className="text-sm font-medium text-white">Auto Save</label>
        <p className="text-sm text-gray-400">Automatically save conversations for offline access</p>
      </div>
      <Switch
        checked={autoSave}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-blue-600"
      />
    </div>
  );
}