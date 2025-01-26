import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isTestEnvironment = window.location.pathname.startsWith('/test-app');

  useEffect(() => {
    console.log('Login page mounted');
    const checkUser = async () => {
      try {
        console.log('Checking user session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session check result:', session ? 'User logged in' : 'No session');
        
        if (session && !isTestEnvironment) {
          console.log('User logged in:', session.user.id);
          
          // Check if user is an alpha tester or promoter
          const { data: alphaTester } = await supabase
            .from('alpha_testers')
            .select('temporary_password, profile_id')
            .eq('profile_id', session.user.id)
            .single();

          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, user_type, airline, employee_id')
            .eq('id', session.user.id)
            .single();

          if (alphaTester?.temporary_password) {
            console.log('Alpha tester with temporary password, redirecting to account page');
            navigate('/account');
            toast({
              title: "Profile Update Required",
              description: "Please complete your profile and change your temporary password to continue.",
              duration: 10000,
            });
            return;
          }

          // Check if profile is incomplete for alpha testers/promoters
          if (alphaTester && (!profile?.full_name || !profile?.user_type || !profile?.airline || !profile?.employee_id)) {
            console.log('Alpha tester with incomplete profile, redirecting to account page');
            navigate('/account');
            toast({
              title: "Profile Update Required",
              description: "Please complete your profile information to continue.",
              duration: 10000,
            });
            return;
          }

          // Regular user flow
          if (profile?.user_type && profile?.airline) {
            console.log('Profile complete, redirecting to dashboard');
            navigate(isTestEnvironment ? '/test-app/dashboard' : '/dashboard');
          } else {
            console.log('Profile incomplete, redirecting to account page');
            navigate(isTestEnvironment ? '/test-app/account' : '/account');
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      }
    };
    
    checkUser();
  }, [navigate, toast, isTestEnvironment]);

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-[#1A1F2C]/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-8 flex flex-col items-center">
            <img 
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
              alt="SkyGuide Logo" 
              className="h-12 w-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-gray-400">
              Enter your credentials to continue
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;