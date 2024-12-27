import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChangelogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  releaseNoteId: string;
}

interface ChangelogEntry {
  id: string;
  release_note_id: string;
  user_id: string;
  change_type: string;
  changes: any;
  created_at: string;
  profile: {
    full_name: string | null;
  };
}

export function ChangelogDialog({
  open,
  onOpenChange,
  releaseNoteId,
}: ChangelogDialogProps) {
  const [changes, setChanges] = useState<ChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChanges = async () => {
      if (!open) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('release_note_changes')
          .select(`
            id,
            release_note_id,
            user_id,
            change_type,
            changes,
            created_at,
            profile:profiles(full_name)
          `)
          .eq('release_note_id', releaseNoteId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setChanges(data as ChangelogEntry[]);
      } catch (error) {
        console.error('Error fetching changelog:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChanges();
  }, [open, releaseNoteId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Release Note History</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Change Type</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changes.map((change) => (
                <TableRow key={change.id}>
                  <TableCell>
                    {format(new Date(change.created_at), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{change.profile?.full_name || 'Unknown User'}</TableCell>
                  <TableCell className="capitalize">{change.change_type}</TableCell>
                  <TableCell>
                    {change.changes ? (
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(change.changes, null, 2)}
                      </pre>
                    ) : (
                      'No changes recorded'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}