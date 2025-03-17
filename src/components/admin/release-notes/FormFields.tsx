
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { ReleaseNoteFormValues } from "./useReleaseNoteForm";

interface FormFieldsProps {
  form: UseFormReturn<ReleaseNoteFormValues>;
}

export const FormFields = ({ form }: FormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            placeholder="e.g. 1.0.0"
            {...form.register("version")}
          />
        </div>
        <div>
          <Label htmlFor="release_date">Release Date</Label>
          <Input
            id="release_date"
            type="date"
            {...form.register("release_date")}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Release title"
          {...form.register("title")}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe what's included in this release..."
          className="h-32"
          {...form.register("description")}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="is_major"
          checked={form.watch("is_major")}
          onCheckedChange={(checked) => {
            form.setValue("is_major", checked);
          }}
        />
        <Label htmlFor="is_major">Mark as major release</Label>
      </div>
    </div>
  );
};
