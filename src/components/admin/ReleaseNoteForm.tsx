import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormFields } from "./release-notes/FormFields";
import { EmailNotificationToggle } from "./release-notes/EmailNotificationToggle";
import { FormActions } from "./release-notes/FormActions";
import { useReleaseNoteForm } from "./release-notes/useReleaseNoteForm";

interface ReleaseNoteFormProps {
  note?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReleaseNoteForm = ({ note, onClose, onSuccess }: ReleaseNoteFormProps) => {
  const { form, isLoading, sendEmail, setSendEmail, onSubmit } = useReleaseNoteForm({
    note,
    onSuccess,
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {note ? "Edit Release Note" : "Create Release Note"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormFields form={form} />
            <EmailNotificationToggle
              checked={sendEmail}
              onCheckedChange={setSendEmail}
            />
            <FormActions isLoading={isLoading} onClose={onClose} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};