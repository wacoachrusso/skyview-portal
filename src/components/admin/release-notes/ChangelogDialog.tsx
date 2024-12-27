import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChangelogDialogProps {
  releaseNoteId: string;
  open: boolean;
  onClose: () => void;
}

interface ChangelogEntry {
  id: string;
  release_note_id: string;
  user_id: string;
  change_type: 'create' | 'update' | 'delete';
  changes?: Record<string, any>;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

export const ChangelogDialog = ({
  releaseNoteId,
  open,
  onClose,
}: ChangelogDialogProps) => {
  const { data: changes } = useQuery({
    queryKey: ["releaseNoteChanges", releaseNoteId],
    queryFn: async () => {
      console.log("Fetching changes for release note:", releaseNoteId);
      const { data, error } = await supabase
        .from("release_note_changes")
        .select(`
          id,
          release_note_id,
          user_id,
          change_type,
          changes,
          created_at,
          profiles:user_id (
            full_name
          )
        `)
        .eq("release_note_id", releaseNoteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ChangelogEntry[];
    },
    enabled: open,
  });

  const getChangeDescription = (change: ChangelogEntry) => {
    if (change.change_type === "create") {
      return "Created release note";
    }
    
    if (change.change_type === "update") {
      const changedFields = Object.keys(change.changes || {});
      return `Updated ${changedFields.join(", ")}`;
    }

    return "Deleted release note";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Change History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changes?.map((change) => (
                <TableRow key={change.id}>
                  <TableCell>
                    {format(new Date(change.created_at), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{change.profiles?.full_name || "Unknown"}</TableCell>
                  <TableCell>{getChangeDescription(change)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};