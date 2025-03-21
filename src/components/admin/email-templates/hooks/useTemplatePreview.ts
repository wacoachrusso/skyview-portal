
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { EmailTemplate } from "../types";
import { EMAIL_TEMPLATES } from "../data/emailTemplates";

export function useTemplatePreview() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(EMAIL_TEMPLATES[0]);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTemplateChange = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  const handlePreviewModeChange = (mode: "desktop" | "mobile") => {
    setPreviewMode(mode);
  };

  const handleCopyHtml = () => {
    const html = selectedTemplate.getContent(selectedTemplate.defaultParams);
    navigator.clipboard.writeText(html);
    toast({
      title: "HTML Copied",
      description: "The email template HTML has been copied to your clipboard.",
    });
  };

  const refreshPreview = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return {
    selectedTemplate,
    previewMode,
    refreshKey,
    templates: EMAIL_TEMPLATES,
    handleTemplateChange,
    handlePreviewModeChange,
    handleCopyHtml,
    refreshPreview,
  };
}
