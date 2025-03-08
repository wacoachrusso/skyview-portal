import { Button } from "@/components/ui/button";
import { RotateCcw, Eye } from "lucide-react"; // Updated import

export interface FormActionsProps {
  isLoading: boolean;
  onReset: () => void;
  onViewChangelog?: () => void;
}

export function FormActions({ isLoading, onReset, onViewChangelog }: FormActionsProps) {
  return (
    <div className="flex justify-between">
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={isLoading}
        >
          <RotateCcw className="mr-2 h-4 w-4" /> {/* Updated icon */}
          Reset
        </Button>
        
        {onViewChangelog && (
          <Button
            type="button"
            variant="outline"
            onClick={onViewChangelog}
            disabled={isLoading}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Changelog
          </Button>
        )}
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}