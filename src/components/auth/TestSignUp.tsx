import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const TestSignUp = () => {
  const testSignUp = async () => {
    console.log("Starting minimal test signup with:", { 
      email: "testuser@example.com", 
      password: "MyTestPassword123!" 
    });
    
    const { data, user, session, error } = await supabase.auth.signUp({
      email: "testuser@example.com",
      password: "MyTestPassword123!"
    });

    console.log("User:", user);
    console.log("Error:", error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-lg p-8">
        <Button 
          onClick={testSignUp}
          className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold"
        >
          Test Minimal Signup
        </Button>
      </div>
    </div>
  );
};