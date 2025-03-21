
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailTemplate } from "../types";

interface PreviewPanelProps {
  selectedTemplate: EmailTemplate;
  previewMode: "desktop" | "mobile";
  refreshKey: number;
}

export function PreviewPanel({ selectedTemplate, previewMode, refreshKey }: PreviewPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Email Preview</CardTitle>
        <CardDescription>
          {previewMode === "desktop" ? "Desktop view (600px)" : "Mobile view (320px)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className={`border rounded-md overflow-hidden ${
            previewMode === "desktop" ? "w-full max-w-[600px]" : "w-full max-w-[320px]"
          } mx-auto`}
          style={{ height: "80vh" }}
        >
          <iframe
            key={refreshKey}
            srcDoc={selectedTemplate.getContent(selectedTemplate.defaultParams)}
            title="Email Template Preview"
            className="w-full h-full"
            sandbox="allow-same-origin"
          />
        </div>
      </CardContent>
    </Card>
  );
}
