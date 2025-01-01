import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ReleaseNote {
  id: string;
  version: string;
  title: string;
  description: string;
  release_date: string;
}

export function ReleaseNotePopup() {
  const [open, setOpen] = useState(false);
  const [latestNote, setLatestNote] = useState<ReleaseNote | null>(null);

  useEffect(() => {
    const checkReleaseNotes = async () => {
      try {
        // Get the current user's session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get the last viewed release note timestamp from localStorage
        const lastViewed = localStorage.getItem('lastViewedReleaseNote');

        // Fetch the latest release note
        const { data: notes, error } = await supabase
          .from('release_notes')
          .select('*')
          .order('release_date', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching release notes:', error);
          return;
        }

        if (notes) {
          // Show popup if there's no last viewed timestamp or if there's a newer release note
          if (!lastViewed || new Date(notes.release_date) > new Date(lastViewed)) {
            setLatestNote(notes);
            setOpen(true);
          }
        }
      } catch (error) {
        console.error('Error in checkReleaseNotes:', error);
      }
    };

    checkReleaseNotes();
  }, []);

  const handleClose = () => {
    if (latestNote) {
      // Store the timestamp of the viewed release note
      localStorage.setItem('lastViewedReleaseNote', latestNote.release_date);
    }
    setOpen(false);
  };

  if (!latestNote) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {latestNote.title}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Version {latestNote.version} • Released {format(new Date(latestNote.release_date), 'MMMM d, yyyy')}
          </div>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="prose prose-sm dark:prose-invert">
            {latestNote.description}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Got it</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}