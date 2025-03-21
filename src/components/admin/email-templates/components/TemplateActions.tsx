
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw } from "lucide-react";

interface TemplateActionsProps {
  onCopyHtml: () => void;
  onRefreshPreview: () => void;
}

export function TemplateActions({ onCopyHtml, onRefreshPreview }: TemplateActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onCopyHtml}
        className="gap-2"
      >
        <Copy className="h-4 w-4" /> Copy HTML
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefreshPreview}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" /> Refresh
      </Button>
    </div>
  );
}
