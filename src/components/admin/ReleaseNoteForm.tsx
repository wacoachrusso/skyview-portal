
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormActions } from "./release-notes/FormActions";
import { FormFields } from "./release-notes/FormFields";
import { useReleaseNoteForm, ReleaseNoteFormValues } from "./release-notes/useReleaseNoteForm";
import { Switch } from "@/components/ui/switch";
import { EmailNotificationToggle } from "./release-notes/EmailNotificationToggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReleaseNoteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
}

export const ReleaseNoteForm = ({
  onSuccess,
  onCancel = () => {},
  initialData,
}: ReleaseNoteFormProps) => {
  const [sendEmail, setSendEmail] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { form, loading, handleSubmit } = useReleaseNoteForm({
    onSuccess,
    initialData,
  });

  const onSubmit = async (data: ReleaseNoteFormValues) => {
    if (sendEmail) {
      setIsSending(true);
      try {
        // Send email notification
        const { error } = await supabase.functions.invoke("send-release-email", {
          body: { 
            noteId: initialData?.id,
            version: data.version,
            title: data.title,
            description: data.description,
            is_major: data.is_major,
          },
        });

        if (error) throw error;

        toast({
          title: "Email notification sent",
          description: "Users have been notified about the new release.",
        });
      } catch (error) {
        console.error("Error sending email notification:", error);
        toast({
          variant: "destructive",
          title: "Notification error",
          description:
            "The release note was saved but we couldn't send email notifications.",
        });
      } finally {
        setIsSending(false);
      }
    }

    // Call the regular submit handler
    handleSubmit();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormFields form={form} />

      {initialData?.id && (
        <EmailNotificationToggle
          checked={sendEmail}
          onCheckedChange={setSendEmail}
        />
      )}

      <FormActions
        onCancel={onCancel}
        loading={loading || isSending}
        isEdit={!!initialData}
      />
    </form>
  );
};
