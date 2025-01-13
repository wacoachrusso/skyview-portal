import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useContractHandler } from "@/hooks/useContractHandler";

export function ContractUpload() {
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const { handleContractClick } = useContractHandler();

  return (
    <div className="w-full bg-gradient-to-r from-[#1A1F2C] to-[#2A2F3C] border-b border-white/10 p-2 sm:p-3">
      <div className="max-w-screen-xl mx-auto flex justify-center items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
          onClick={handleContractClick}
        >
          <FileText className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">View Contract</span>
          <span className="sm:hidden">Contract</span>
        </Button>
        <span className="text-white/60 text-sm hidden sm:inline">
          Access your union contract anytime
        </span>
      </div>
    </div>
  );
}