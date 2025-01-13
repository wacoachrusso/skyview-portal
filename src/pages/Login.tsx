import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      checkSession();
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session check result:', session ? 'User logged in' : 'No session');
      
      if (session) {
        console.log('User logged in:', session.user.id);
        
        // Check if user is an alpha tester with temporary password
        const { data: alphaTester } = await supabase
          .from('alpha_testers')
          .select('temporary_password, profile_id')
          .eq('profile_id', session.user.id)
          .single();

        if (alphaTester?.temporary_password) {
          console.log('Alpha tester with temporary password, redirecting to complete profile');
          navigate('/complete-profile');
          return;
        }

        // Check if profile is complete for regular users
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, airline')
          .eq('id', session.user.id)
          .single();

        if (profile?.user_type && profile?.airline) {
          console.log('Profile complete, redirecting to dashboard');
          navigate('/dashboard');
        } else {
          console.log('Profile incomplete, redirecting to complete profile');
          navigate('/complete-profile');
        }
      } else {
        console.log('No active session, showing login form');
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
};

export default Login;
