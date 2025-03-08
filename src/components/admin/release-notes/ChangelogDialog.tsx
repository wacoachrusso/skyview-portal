
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type ReleaseNoteChangeType = Database["public"]["Tables"]["release_note_changes"]["Row"];

interface ChangelogDialogProps {
  releaseNoteId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogDialog({ 
  releaseNoteId, 
  isOpen, 
  onClose 
}: ChangelogDialogProps) {
  const [changes, setChanges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChanges = async () => {
      if (!releaseNoteId || !isOpen) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('release_note_changes')
          .select(`
            id,
            release_note_id,
            user_id,
            created_at,
            has_seen_release_note,
            profiles(full_name, email)
          `)
          .eq('release_note_id', releaseNoteId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching changelog:", error);
          return;
        }

        if (data) {
          console.log("Changelog data:", data);
          setChanges(data);
        }
      } catch (err) {
        console.error("Unexpected error in fetchChanges:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChanges();
  }, [releaseNoteId, isOpen]);

  // Type guard to check if an item has the profiles property
  const hasProfiles = (item: any): item is (ReleaseNoteChangeType & { profiles: any }) => {
    return item && typeof item === 'object' && 'profiles' in item;
  };

  // Type guard to check if item is valid
  const isValidChange = (item: any): item is ReleaseNoteChangeType => {
    return item && typeof item === 'object' && 'id' in item && 'user_id' in item;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Release Note Changelog</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-4 text-center">Loading changelog...</div>
        ) : changes.length === 0 ? (
          <div className="py-4 text-center">No changes have been recorded for this release note.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change) => {
                if (!isValidChange(change)) return null;
                
                return (
                  <tr key={change.id} className="border-b">
                    <td className="p-2">
                      {format(new Date(change.created_at), "MMM d, yyyy h:mm a")}
                    </td>
                    <td className="p-2">
                      {hasProfiles(change) && change.profiles
                        ? (change.profiles.full_name || change.profiles.email || 'Unknown user')
                        : 'Unknown user'}
                    </td>
                    <td className="p-2">
                      {change.has_seen_release_note !== undefined
                        ? (change.has_seen_release_note ? "Viewed note" : "Note displayed")
                        : "Unknown action"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </DialogContent>
    </Dialog>
  );
}
