import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DownloadDialog({ open, onOpenChange, onConfirm }: DownloadDialogProps) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Chat for Offline Use</DialogTitle>
          <DialogDescription className="space-y-4">
            {isIOS ? (
              <>
                <p className="font-medium text-lg">iOS Instructions:</p>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg space-y-2">
                  <p>1. After tapping Download, the chat will be saved to your Files app</p>
                  <p>2. To keep it easily accessible:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Open the Files app</li>
                    <li>Go to Downloads or Documents folder</li>
                    <li>Find and tap the downloaded chat file</li>
                    <li>Tap the Share button (square with arrow)</li>
                    <li>Select "Notes" from the share options</li>
                  </ul>
                  <p className="text-sm italic mt-2">
                    Tip: Save to Notes app for quick offline access
                  </p>
                </div>
              </>
            ) : isAndroid ? (
              <>
                <p className="font-medium text-lg">Android Instructions:</p>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <p>The chat will be saved to your Downloads folder.</p>
                  <p>Access it through:</p>
                  <ul className="list-disc pl-6 mt-2">
                    <li>Your device's Files app</li>
                    <li>The Downloads folder</li>
                    <li>Or your preferred file manager app</li>
                  </ul>
                </div>
              </>
            ) : (
              <p>The chat will be downloaded to your device's default download location.</p>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}