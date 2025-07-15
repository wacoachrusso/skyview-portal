
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useContractHandler } from "@/hooks/useContractHandler";

export function ContractUpload() {
  const { handleContractClick } = useContractHandler();

  return (
    <div className="w-full bg-gradient-to-r from-brand-navy to-brand-slate border-b border-white/10 p-2 sm:p-3">
      <div className="max-w-screen-xl mx-auto flex justify-center items-center">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-brand-gold/30 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          onClick={handleContractClick}
        >
          <FileText className="h-4 w-4 mr-2 text-brand-gold" />
          <span className="hidden sm:inline">Your Contract</span>
          <span className="sm:hidden">Contract</span>
        </Button>
      </div>
    </div>
  );
}
