
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFields } from "./release-notes/FormFields";
import { FormActions } from "./release-notes/FormActions";
import { useReleaseNoteForm } from "./release-notes/useReleaseNoteForm";
import { EmailNotificationToggle } from "./release-notes/EmailNotificationToggle";
import { useState } from "react";
import { ChangelogDialog } from "./release-notes/ChangelogDialog";

// Define the form schema
const formSchema = z.object({
  version: z.string().min(1, "Version is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  is_major: z.boolean().default(false),
  release_date: z.date().nullable().default(null),
});

// Derive the form values type from the schema
export type ReleaseNoteFormValues = z.infer<typeof formSchema>;

export function ReleaseNoteForm() {
  const {
    form,
    onSubmit,
    isSubmitting,
    releaseNoteId,
    setReleaseNoteId,
    resetForm,
    isEditing,
    isSendingEmail,
    sendEmailNotification,
  } = useReleaseNoteForm();

  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <FormFields form={form} />
            
            {isEditing && (
              <div className="mt-6">
                <EmailNotificationToggle
                  isSending={isSendingEmail}
                  onSend={sendEmailNotification}
                />
              </div>
            )}
          </div>
          
          <FormActions
            isSubmitting={isSubmitting}
            isEditing={isEditing}
            onReset={resetForm}
            onViewChangelog={() => setIsChangelogOpen(true)}
          />
        </form>
      </Form>

      {releaseNoteId && (
        <ChangelogDialog
          releaseNoteId={releaseNoteId}
          isOpen={isChangelogOpen}
          onClose={() => setIsChangelogOpen(false)}
        />
      )}
    </div>
  );
}
