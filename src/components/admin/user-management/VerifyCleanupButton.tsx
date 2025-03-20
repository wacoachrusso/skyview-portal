
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Verified } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const VerifyCleanupButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleVerifyCleanup = async () => {
    try {
      setIsVerifying(true);
      
      // Call the edge function to verify cleanup
      const { data, error } = await supabase.functions.invoke("verify-user-cleanup", {
        body: { adminEmail: "mikescordcutters@gmail.com" }
      });

      if (error) {
        console.error("Error verifying cleanup:", error);
        throw error;
      }

      console.log("Verification results:", data);
      setResults(data);
      
      // Check if there are remaining users
      const hasRemainingUsers = 
        data.remainingAuthUsers?.length > 0 || 
        data.remainingProfiles?.length > 0;
      
      if (hasRemainingUsers) {
        toast({
          variant: "destructive",
          title: "Cleanup Incomplete",
          description: `Found ${data.remainingAuthUsers?.length || 0} auth users and ${data.remainingProfiles?.length || 0} profile records still in the system.`,
        });
      } else {
        toast({
          title: "Verification Complete",
          description: "No remaining users found in the system except admin.",
        });
      }
    } catch (error) {
      console.error("Error in handleVerifyCleanup:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify user cleanup. See console for details.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;
    
    return (
      <div className="mt-4 max-h-96 overflow-auto">
        <h3 className="font-medium mb-2">Verification Results:</h3>
        
        {results.remainingAuthUsers?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-red-500 font-medium">Remaining Auth Users:</h4>
            <ul className="list-disc pl-5">
              {results.remainingAuthUsers.map(user => (
                <li key={user.id}>{user.email} (ID: {user.id})</li>
              ))}
            </ul>
          </div>
        )}
        
        {results.remainingProfiles?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-red-500 font-medium">Remaining Profiles:</h4>
            <ul className="list-disc pl-5">
              {results.remainingProfiles.map(profile => (
                <li key={profile.id}>{profile.email} (ID: {profile.id})</li>
              ))}
            </ul>
          </div>
        )}
        
        {results.cleanupResults?.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium">Cleanup Attempts:</h4>
            <ul className="list-disc pl-5">
              {results.cleanupResults.map((result, idx) => (
                <li key={idx} className={result.success ? "text-green-500" : "text-red-500"}>
                  {result.email}: {result.success ? 'Cleaned up' : `Failed - ${result.error}`}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {!results.remainingAuthUsers?.length && !results.remainingProfiles?.length && (
          <div className="text-green-500 font-medium">
            All users have been successfully deleted except admin ({results.adminEmail}).
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Verified className="h-4 w-4" />
        Verify User Cleanup
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Verify User Cleanup</AlertDialogTitle>
            <AlertDialogDescription>
              This will check if all non-admin users have been completely deleted from the system,
              including auth records and associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {renderResults()}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVerifying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerifyCleanup}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner /> Verifying...
                </div>
              ) : (
                "Run Verification"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
