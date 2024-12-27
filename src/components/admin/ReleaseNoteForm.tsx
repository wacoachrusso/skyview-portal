import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface ReleaseNoteFormProps {
  note?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReleaseNoteForm = ({ note, onClose, onSuccess }: ReleaseNoteFormProps) => {
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

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      if (note) {
        const { data, error } = await supabase
          .from("release_notes")
          .update(values)
          .eq("id", note.id)
          .select()
          .single();
        if (error) throw error;
        
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {note ? "Edit Release Note" : "Create Release Note"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 1.0.0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Release note title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the changes in this release"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_major"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Major Update</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              />
              <label
                htmlFor="sendEmail"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send email notification to subscribed users
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};