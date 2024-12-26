import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if profile is complete
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, airline')
          .eq('id', session.user.id)
          .single();

        if (profile?.user_type && profile?.airline) {
          navigate('/dashboard');
        } else {
          navigate('/complete-profile');
        }
      }
    };
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Incorrect email or password. Please try again."
        });
        return;
      }

      if (formData.rememberMe) {
        await supabase.auth.updateUser({
          data: { 
            session_expires_in: 60 * 60 * 24 * 14
          }
        });
      }

      // Check if profile is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, airline')
        .eq('id', data.user.id)
        .single();

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in."
      });

      if (profile?.user_type && profile?.airline) {
        navigate('/dashboard');
      } else {
        navigate('/complete-profile');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An error occurred. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-lg p-8">
          <div className="mb-6 flex justify-center">
            <img 
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
              alt="SkyGuide Logo" 
              className="h-12 w-auto"
            />
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-center mb-6">
            Enter your credentials to continue
          </p>

          <GoogleSignInButton />

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-400 bg-gray-900/50">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                required
                autoComplete="email"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-white/10 border-white/20 text-white pr-10"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, rememberMe: checked as boolean })
                }
                className="border-white/20"
              />
              <Label htmlFor="rememberMe" className="text-gray-200 cursor-pointer">
                Stay logged in for 2 weeks
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 space-y-2 text-center text-gray-400">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="text-brand-gold hover:text-brand-gold/80">
                Sign up
              </Link>
            </p>
            <p>
              <Link to="/forgot-password" className="text-brand-gold hover:text-brand-gold/80">
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;