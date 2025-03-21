
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye } from "lucide-react";
import { EmailTemplate } from "../types";

interface TemplateSelectorProps {
  selectedTemplate: EmailTemplate;
  onTemplateChange: (templateId: string) => void;
  previewMode: "desktop" | "mobile";
  onPreviewModeChange: (mode: "desktop" | "mobile") => void;
  templates: EmailTemplate[];
}

export function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
  previewMode,
  onPreviewModeChange,
  templates
}: TemplateSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Selection</CardTitle>
        <CardDescription>Choose an email template to preview</CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedTemplate.id}
          onValueChange={onTemplateChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-6">
          <h3 className="font-medium mb-2">{selectedTemplate.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {selectedTemplate.description}
          </p>
        </div>

        <Tabs
          value={previewMode}
          onValueChange={(value) => onPreviewModeChange(value as "desktop" | "mobile")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="desktop">
              <Eye className="h-4 w-4 mr-2" /> Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Eye className="h-4 w-4 mr-2" /> Mobile
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
}
