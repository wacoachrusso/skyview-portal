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
  const [open, setOpen] = useState(false); // Controls the visibility of the dialog
  const [latestNote, setLatestNote] = useState<ReleaseNote | null>(null); // Stores the latest release note
  const [userId, setUserId] = useState<string | null>(null); // Stores the current user's ID

  useEffect(() => {
    const checkReleaseNotes = async () => {
      try {
        // Get the current user's session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No active session, skipping release notes check");
          return;
        }

        // Set the user ID from the session
        setUserId(session.user.id);

        // Fetch the latest release note from the database
        const { data: notes, error } = await supabase
          .from("release_notes")
          .select("*")
          .order("release_date", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Error fetching release notes:", error);
          return;
        }

        if (notes && notes.length > 0) {
          const latestReleaseNote = notes[0];
          console.log("Latest release note:", latestReleaseNote.id);

          // Check if the user has already seen this release note
          const { data: seenStatus, error: seenError } = await supabase
            .from("release_note_changes")
            .select("has_seen_release_note")
            .eq("user_id", session.user.id)
            .eq("release_note_id", latestReleaseNote.id)
            .single();

          // Ignore the error if no record is found (user hasn't seen the note yet)
          if (seenError && seenError.code !== "PGRST116") {
            console.error("Error fetching seen status:", seenError);
            return;
          }

          const hasBeenViewed = seenStatus?.has_seen_release_note || false;
          console.log("Has this note been viewed?", hasBeenViewed);

          // Check if the release note is recent (within the last 30 days)
          const releaseDate = new Date(latestReleaseNote.release_date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          // Show the popup only if the note is recent and hasn't been viewed
          if (!hasBeenViewed && releaseDate >= thirtyDaysAgo) {
            console.log("Showing release note popup for:", latestReleaseNote.title);
            setLatestNote(latestReleaseNote);
            setOpen(true);
          } else {
            console.log("Release note already viewed or too old:", latestReleaseNote.id);
          }
        }
      } catch (error) {
        console.error("Error in checkReleaseNotes:", error);
      }
    };

    // Check for release notes when the component mounts
    checkReleaseNotes();
  }, []); // Empty dependency array ensures this runs only once

  const handleClose = async () => {
    if (latestNote && userId) {
      try {
        // Mark the release note as seen by the user in the `release_note_changes` table
        const { error } = await supabase
          .from("release_note_changes")
          .upsert([
            {
              user_id: userId,
              release_note_id: latestNote.id,
              has_seen_release_note: true,
            },
          ]);

        if (error) {
          console.error("Error updating seen status:", error);
        } else {
          console.log("Release note marked as seen by user:", userId);
        }
      } catch (error) {
        console.error("Error in handleClose:", error);
      }
    }

    // Close the dialog
    setOpen(false);
  };

  // Don't render anything if there's no latest note
  if (!latestNote) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {latestNote.title}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Version {latestNote.version} • Released{" "}
            {format(new Date(latestNote.release_date), "MMMM d, yyyy")}
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