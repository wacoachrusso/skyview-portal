import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isLoading: boolean;
  onClose: () => void;
}

export const FormActions = ({ isLoading, onClose }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </div>
  );
};