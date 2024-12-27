import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseReleaseNoteFormProps {
  note?: any;
  onSuccess: () => void;
}

export const useReleaseNoteForm = ({ note, onSuccess }: UseReleaseNoteFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      version: note?.version || "",
      title: note?.title || "",
      description: note?.description || "",
      is_major: note?.is_major || false,
    },
  });

  const sendReleaseEmail = async (noteId: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-release-email', {
        body: { releaseNoteId: noteId }
      });

      if (error) throw error;

      toast({
        title: "Email Notifications Sent",
        description: "Release note email has been sent to subscribed users.",
      });
    } catch (error) {
      console.error("Error sending release note email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send email notifications",
      });
    }
  };

  const logChange = async (noteId: string, changeType: string, changes?: any) => {
    const { error } = await supabase
      .from("release_note_changes")
      .insert({
        release_note_id: noteId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        change_type: changeType,
        changes,
      });

    if (error) {
      console.error("Error logging change:", error);
    }
  };

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      if (note) {
        // Find what fields changed
        const changes = Object.entries(values).reduce((acc: any, [key, value]) => {
          if (note[key] !== value) {
            acc[key] = value;
          }
          return acc;
        }, {});

        const { data, error } = await supabase
          .from("release_notes")
          .update(values)
          .eq("id", note.id)
          .select()
          .single();

        if (error) throw error;
        
        // Log the update if there were changes
        if (Object.keys(changes).length > 0) {
          await logChange(note.id, "update", changes);
        }
        
        toast({
          title: "Success",
          description: "Release note updated successfully",
        });

        if (sendEmail) {
          await sendReleaseEmail(note.id);
        }
      } else {
        const { data, error } = await supabase
          .from("release_notes")
          .insert([values])
          .select()
          .single();

        if (error) throw error;
        
        // Log the creation
        if (data) {
          await logChange(data.id, "create");
        }
        
        toast({
          title: "Success",
          description: "Release note created successfully",
        });

        if (sendEmail && data) {
          await sendReleaseEmail(data.id);
        }
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving release note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save release note",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    sendEmail,
    setSendEmail,
    onSubmit: form.handleSubmit(onSubmit),
  };
};