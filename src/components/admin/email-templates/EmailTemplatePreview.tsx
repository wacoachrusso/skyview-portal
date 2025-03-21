
import { useTemplatePreview } from "./hooks/useTemplatePreview";
import { TemplateSelector } from "./components/TemplateSelector";
import { PreviewPanel } from "./components/PreviewPanel";
import { TemplateActions } from "./components/TemplateActions";

export function EmailTemplatePreview() {
  const {
    selectedTemplate,
    previewMode,
    refreshKey,
    templates,
    handleTemplateChange,
    handlePreviewModeChange,
    handleCopyHtml,
    refreshPreview,
  } = useTemplatePreview();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Email Templates</h2>
          <p className="text-muted-foreground">
            Preview all email templates used in the application.
          </p>
        </div>
        <TemplateActions 
          onCopyHtml={handleCopyHtml} 
          onRefreshPreview={refreshPreview} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateChange={handleTemplateChange}
            previewMode={previewMode}
            onPreviewModeChange={handlePreviewModeChange}
            templates={templates}
          />
        </div>

        <div className="md:col-span-2">
          <PreviewPanel
            selectedTemplate={selectedTemplate}
            previewMode={previewMode}
            refreshKey={refreshKey}
          />
        </div>
      </div>
    </div>
  );
}
