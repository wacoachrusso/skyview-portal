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
          <DialogDescription>
            This will download a copy of the chat to your device and make it available offline. The chat will be saved as a text file in your downloads folder.
            
            {isIOS && (
              <div className="mt-2 space-y-2">
                <p>On iOS devices:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>The chat will be downloaded to the Files app under Downloads or Documents folder.</li>
                  <li>You can open the file in the Notes app to keep it easily accessible:</li>
                  <ol className="list-decimal pl-4 mt-1 space-y-1">
                    <li>Tap the downloaded file in Files</li>
                    <li>Tap the Share button (square with arrow)</li>
                    <li>Select "Notes" from the share options</li>
                    <li>The chat will be saved as a new note for offline viewing</li>
                  </ol>
                </ul>
              </div>
            )}
            
            {isAndroid && (
              <p className="mt-2">
                On Android devices, you can find downloaded files in your Downloads folder through the Files app.
              </p>
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