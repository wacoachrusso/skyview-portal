import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, Calendar, Info } from "lucide-react";
import { ReleaseNoteForm } from "./ReleaseNoteForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export const ReleaseNotesAdmin = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const { toast } = useToast();

  const { data: releaseNotes, refetch } = useQuery({
    queryKey: ["releaseNotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("release_notes")
        .select("*")
        .order("release_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("release_notes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Release note deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting release note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete release note",
      });
    }
  };

  const handleEdit = (note: any) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const [showReleaseNotePopup, setShowReleaseNotePopup] = useState(false);
  const [latestReleaseNote, setLatestReleaseNote] = useState<any>(null);

  useEffect(() => {
    if (releaseNotes && releaseNotes.length > 0) {
      const latestNote = releaseNotes[0];
      const lastSeenNoteId = localStorage.getItem("lastSeenNoteId");

      if (lastSeenNoteId !== latestNote.id) {
        setLatestReleaseNote(latestNote);
        setShowReleaseNotePopup(true);
      }
    }
  }, [releaseNotes]);

  const handleClosePopup = () => {
    if (latestReleaseNote) {
      localStorage.setItem("lastSeenNoteId", latestReleaseNote.id);
      }
    setShowReleaseNotePopup(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-brand-navy">Release Notes Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Release Note
        </Button>
      </div>

      <div className="bg-white dark:bg-brand-navy/10 rounded-lg shadow-sm border border-brand-navy/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Major Update</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {releaseNotes?.map((note) => (
              <TableRow key={note.id}>
                <TableCell className="font-medium">{note.version}</TableCell>
                <TableCell>{note.title}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-brand-navy/70" />
                    {format(new Date(note.release_date), "MMM d, yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  {note.is_major && (
                    <div className="flex items-center">
                      <Info className="h-4 w-4 mr-2 text-blue-500" />
                      Major
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(note)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isFormOpen && (
        <ReleaseNoteForm
          note={editingNote}
          onClose={() => {
            setIsFormOpen(false);
            setEditingNote(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingNote(null);
            refetch();
          }}
        />
      )}

      {showReleaseNotePopup && latestReleaseNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-semibold mb-4">New Release: {latestReleaseNote.version}</h2>
            <p className="mb-4">{latestReleaseNote.title}</p>
            <p className="mb-4">{latestReleaseNote.description}</p>
            <div className="flex justify-end">
              <Button onClick={handleClosePopup}>OK</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};