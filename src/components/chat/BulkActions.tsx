import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface BulkActionsProps {
  selectedCount: number;
  onDeleteSelected: () => void;
}

export function BulkActions({ selectedCount, onDeleteSelected }: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-2 bg-destructive/10 border-b border-border">
      <span className="text-sm text-destructive">
        {selectedCount} selected
      </span>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDeleteSelected}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Delete Selected
      </Button>
    </div>
  );
}