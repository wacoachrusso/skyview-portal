
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from "date-fns";
import { ChangelogDialog } from "./release-notes/ChangelogDialog";
import { ReleaseNoteForm } from "./ReleaseNoteForm";

export const ReleaseNotesAdmin = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  const fetchReleaseNotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("release_notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching release notes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load release notes. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleaseNotes();
  }, []);

  const handleCreate = () => {
    setSelectedNote(null);
    setFormOpen(true);
  };

  const handleEdit = (note: any) => {
    setSelectedNote(note);
    setFormOpen(true);
  };

  const handlePreview = (note: any) => {
    setSelectedNote(note);
    setPreviewOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("release_notes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNotes(notes.filter((note) => note.id !== id));
      toast({
        title: "Release note deleted",
        description: "The release note has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting release note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete release note. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Release Notes</h2>
        <Button onClick={handleCreate} className="flex items-center gap-1">
          <Plus size={16} />
          <span>New Release</span>
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p>Loading release notes...</p>
        ) : notes.length === 0 ? (
          <p>No release notes found. Create your first one!</p>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{note.title}</CardTitle>
                      {note.is_major && (
                        <Badge variant="default" className="bg-brand-gold text-brand-navy">
                          Major
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>Version {note.version}</span>
                      <span>•</span>
                      <span>
                        {note.release_date
                          ? format(parseISO(note.release_date), "PP")
                          : "No release date"}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(note)}
                    >
                      <Eye size={14} className="mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(note)}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <Separator className="mb-3" />
                <div className="text-sm line-clamp-2">{note.description}</div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                {note.last_email_sent ? (
                  <span>
                    Email notification sent on{" "}
                    {format(parseISO(note.last_email_sent), "PPp")}
                  </span>
                ) : (
                  <span>No email notification sent yet</span>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogTitle>
            {selectedNote ? "Edit Release Note" : "Create Release Note"}
          </DialogTitle>
          <ScrollArea className="flex-1 pr-4">
            <div className="py-4">
              <ReleaseNoteForm
                initialData={selectedNote}
                onSuccess={() => {
                  setFormOpen(false);
                  fetchReleaseNotes();
                }}
                onCancel={() => setFormOpen(false)}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Changelog Preview Dialog */}
      <ChangelogDialog
        note={selectedNote}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onSuccess={() => {
          setPreviewOpen(false);
          fetchReleaseNotes();
        }}
      />
    </div>
  );
};
