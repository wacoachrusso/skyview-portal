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

  console.log("Initializing form with note data:", note);

  const form = useForm({
    defaultValues: {
      version: note?.version || "",
      title: note?.title || "",
      description: note?.description || "",
      is_major: note?.is_major || false,
      // Ensure release_date is always included with fallback to current date
      release_date: note?.release_date || new Date().toISOString(),
    },
  });

  const sendReleaseEmail = async (noteId: string) => {
    console.log("Starting email send for note ID:", noteId);
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

  const onSubmit = async (values: any) => {
    console.log("Form submission started with values:", values);
    setIsLoading(true);
    
    try {
      // Add release_date if not present in form values
      if (!values.release_date) {
        values.release_date = new Date().toISOString();
        console.log("Added missing release_date field:", values.release_date);
      }
      
      if (note) {
        console.log("Updating existing note with ID:", note.id);
        const { data, error } = await supabase
          .from("release_notes")
          .update(values)
          .eq("id", note.id)
          .select()
          .single();
          
        console.log("Update response:", { data, error });
        
        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
        
        console.log("Note updated successfully:", data);
        toast({
          title: "Success",
          description: "Release note updated successfully",
        });
  
        if (sendEmail) {
          console.log("Sending email for updated note...");
          await sendReleaseEmail(note.id);
        }
      } else {
        console.log("Creating new release note with values:", JSON.stringify(values));
        
        try {
          const { data, error } = await supabase
            .from("release_notes")
            .insert([values])
            .select()
            .single();
            
          if (error) {
            console.error("Insert error details:", error);
            throw error;
          }
          
          console.log("Note created successfully:", data);
          toast({
            title: "Success",
            description: "Release note created successfully",
          });
  
          if (sendEmail && data) {
            console.log("Sending email for new note...");
            await sendReleaseEmail(data.id);
          }
        } catch (insertError) {
          console.error("Insert operation error:", insertError);
          throw insertError;
        }
      }
      
      console.log("Calling onSuccess callback");
      onSuccess();
    } catch (error) {
      console.error("Error saving release note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save release note: " + (error instanceof Error ? error.message : String(error)),
      });
    } finally {
      console.log("Setting isLoading to false");
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