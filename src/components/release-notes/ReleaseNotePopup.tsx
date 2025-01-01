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
        if (!session) {
          console.log('No active session, skipping release notes check');
          return;
        }

        // Get the last viewed release note ID from localStorage
        const lastViewedId = localStorage.getItem('lastViewedReleaseNoteId');
        console.log('Last viewed release note ID:', lastViewedId);

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
          console.log('Latest release note:', notes.id);
          // Only show popup if this release note hasn't been viewed (different ID)
          if (!lastViewedId || lastViewedId !== notes.id) {
            console.log('Showing release note popup for:', notes.title);
            setLatestNote(notes);
            setOpen(true);
          } else {
            console.log('Release note already viewed:', notes.id);
          }
        }
      } catch (error) {
        console.error('Error in checkReleaseNotes:', error);
      }
    };

    // Only check release notes once when component mounts
    checkReleaseNotes();
  }, []); // Empty dependency array ensures this only runs once

  const handleClose = () => {
    if (latestNote) {
      // Store the ID of the viewed release note
      localStorage.setItem('lastViewedReleaseNoteId', latestNote.id);
      console.log('Stored viewed release note ID:', latestNote.id);
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