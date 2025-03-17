
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChangelogDialogProps {
  note: any;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangelogDialog = ({
  note,
  open,
  onClose,
  onSuccess,
}: ChangelogDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!note) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-release-email", {
        body: {
          noteId: note.id,
          version: note.version,
          title: note.title,
          description: note.description,
          is_major: note.is_major,
        },
      });

      if (error) throw error;

      // Update last_email_sent timestamp
      const { error: updateError } = await supabase
        .from("release_notes")
        .update({ last_email_sent: new Date().toISOString() })
        .eq("id", note.id);

      if (updateError) throw updateError;

      toast({
        title: "Email notification sent",
        description: "Users have been notified about the release.",
      });
      onSuccess();
    } catch (error) {
      console.error("Error sending email notification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send email notification. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Release Preview</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 my-4">
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{note.title}</h3>
                {note.is_major && (
                  <Badge className="bg-brand-gold text-brand-navy">Major</Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>Version {note.version}</span>
                <span>•</span>
                <span>
                  {note.release_date
                    ? format(parseISO(note.release_date), "PP")
                    : "No release date"}
                </span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none dark:prose-invert">
              {note.description.split("\n").map((paragraph: string, i: number) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 pt-2">
          <div className="w-full flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              {note.last_email_sent ? (
                <span>
                  Email notification sent on{" "}
                  {format(parseISO(note.last_email_sent), "PPp")}
                </span>
              ) : (
                <span>No email notification sent yet</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={loading || !!note.last_email_sent}
              >
                {loading
                  ? "Sending..."
                  : note.last_email_sent
                  ? "Already Sent"
                  : "Send Email Notification"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
