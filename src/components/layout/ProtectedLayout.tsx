import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLoadingSpinner } from "@/components/ui/app-loading-spinner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireDisclaimer?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireDisclaimer = true 
}) => {
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const checkAuthAndDisclaimer = async () => {
      try {
        // Check if there's an active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error checking auth:", sessionError);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (!session) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // User is authenticated
        setIsAuthenticated(true);

        // If disclaimer is required, check its status
        if (requireDisclaimer) {
          const { data, error } = await supabase
            .from('disclaimer_consents')
            .select('status')
            .eq('user_id', session.user.id)
            .single();

          if (error) {
            // No record exists or error occurred
            if (error.code === 'PGSQL_NO_ROWS_RETURNED') {
              setShowDisclaimer(true);
            } else {
              console.error('Error checking disclaimer:', error);
            }
          } else {
            // Check if disclaimer has been accepted
            setShowDisclaimer(data.status !== 'accepted');
          }
        }
      } catch (err) {
        console.error("Failed to check authentication:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndDisclaimer();
  }, [requireAuth, requireDisclaimer]);

  const handleAcceptDisclaimer = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('disclaimer_consents')
        .upsert({
          user_id: session.user.id,
          status: 'accepted',
          has_seen_chat_disclaimer: true,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving disclaimer:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to save disclaimer acceptance'
        });
        return;
      }

      setShowDisclaimer(false);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleRejectDisclaimer = async () => {
    try {
      // Sign out the user
      await supabase.auth.signOut();
      
      // Clear any authentication-related local storage
      localStorage.removeItem('auth_status');
      localStorage.removeItem('user_profile');
      
      // Show toast notification
      toast({
        variant: 'destructive',
        title: 'Disclaimer Declined',
        description: 'You must accept the disclaimer to use the service.'
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return <AppLoadingSpinner />;
  }

  // Disclaimer Dialog
  if (showDisclaimer) {
    return (
      <Dialog open={true} onOpenChange={() => handleRejectDisclaimer()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Important Disclaimer</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                The information provided by SkyGuide is intended for general informational purposes only 
                and is based on the interpretation of union contracts. While we strive to ensure accuracy, 
                SkyGuide can sometimes make mistakes.
              </p>
              <p>
                We do not guarantee the completeness, reliability, or timeliness of the information. 
                Users are encouraged to consult their union representatives or official union documents 
                for definitive answers to contractual questions.
              </p>
              <p>
                By clicking "I Accept" below, you acknowledge that you understand and agree to these terms.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleRejectDisclaimer}
            >
              Decline
            </Button>
            <Button
              onClick={handleAcceptDisclaimer}
              className="bg-brand-gold hover:bg-brand-gold/90 text-black"
            >
              I Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Check authentication if required
  if (requireAuth && !isAuthenticated) {
    // Redirect to login but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};
