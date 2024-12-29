import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const TestSignUp = () => {
  const [email, setEmail] = useState("testuser@example.com");
  const [password, setPassword] = useState("MySuperSecret123!");
  const [status, setStatus] = useState<string | null>(null);

  const testSignUp = async () => {
    console.log("Starting minimal test signup with:", { email, password });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Signup error:", error);
        setStatus(`Error: ${error.message}`);
      } else {
        console.log("Signup success, data:", data);
        setStatus("Success! Check console for details");
      }
    } catch (e) {
      console.error("Unexpected error:", e);
      setStatus(`Unexpected error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-lg p-8 space-y-4">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Test Signup</h1>
        
        <div className="space-y-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="bg-white/10 border-white/20 text-white"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-white/10 border-white/20 text-white"
          />
        </div>

        <Button 
          onClick={testSignUp}
          className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold"
        >
          Test Signup
        </Button>

        {status && (
          <Alert className={status.includes("Error") ? "bg-red-900/50 border-red-500/50" : "bg-green-900/50 border-green-500/50"}>
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};