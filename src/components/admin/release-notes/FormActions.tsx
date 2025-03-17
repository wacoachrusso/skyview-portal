
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

export interface FormActionsProps {
  loading: boolean;
  isEdit: boolean;
  onCancel: () => void;
}

export const FormActions = ({ loading, isEdit, onCancel }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 mt-6">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={loading}
      >
        <X className="mr-2 h-4 w-4" />
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={loading}
      >
        <Save className="mr-2 h-4 w-4" />
        {isEdit ? (loading ? 'Updating...' : 'Update') : (loading ? 'Creating...' : 'Create')}
      </Button>
    </div>
  );
};
