import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('User already logged in:', session.user.id);
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

  const handleSecretClick = async () => {
    try {
      // First clear any existing session
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@skyguide.site',
        password: 'Douche#236642'
      });

      if (error) throw error;

      toast({
        title: "Admin access granted",
        description: "Welcome to the admin dashboard"
      });

      navigate('/admin');
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "Invalid admin credentials"
      });
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
              className="h-12 w-auto cursor-pointer"
              onClick={handleSecretClick}
            />
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-center mb-6">
            Enter your credentials to continue
          </p>

          <LoginForm />

          <div className="mt-6 space-y-2 text-center text-gray-400">
            <p>
              Don't have an account?{" "}
              <Link to="/#pricing-section" className="text-brand-gold hover:text-brand-gold/80">
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