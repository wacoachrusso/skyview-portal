
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface ResultsHeaderProps {
  name: string;
  onOpenTipForm: () => void;
}

export const ResultsHeader = ({ name, onOpenTipForm }: ResultsHeaderProps) => {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-brand-navy">{name}</h2>
      <div className="flex justify-center mt-4">
        <Button 
          variant="link" 
          className="text-brand-purple text-sm flex items-center"
          onClick={onOpenTipForm}
        >
          <Share2 className="h-4 w-4 mr-1" />
          Got a great spot here? Share a tip
        </Button>
      </div>
    </div>
  );
};
