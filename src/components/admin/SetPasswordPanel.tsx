
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { setAdminPassword } from "@/components/admin/alpha-testers/utils/adminPasswordUtils";
import { Eye, EyeOff, KeyRound } from "lucide-react";

export const SetPasswordPanel = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [error, setError] = useState("");
  
  // Fetch the current user's email on mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setEmailAddress(user.email);
        }
      } catch (err) {
        console.error("Error fetching user email:", err);
      }
    };
    
    fetchUserEmail();
  }, []);
  
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    setLoading(true);
    try {
      const success = await setAdminPassword(emailAddress, password);
      if (success) {
        setPassword("");
        setConfirmPassword("");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Set Password
        </CardTitle>
        <CardDescription>
          Add or update password for your Google-authenticated account
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              Email Address
            </label>
            <Input 
              id="email" 
              type="email" 
              value={emailAddress} 
              disabled
              className="mt-1"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
              New Password
            </label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
              Confirm Password
            </label>
            <Input 
              id="confirmPassword" 
              type={showPassword ? "text" : "password"} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
              required
              minLength={8}
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Setting Password..." : "Set Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
