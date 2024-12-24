import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signup');
      }
    };

    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate p-8">
      <h1 className="text-3xl font-bold text-white">Welcome to SkyGuide</h1>
      <p className="text-gray-200 mt-4">Your dashboard is being set up...</p>
    </div>
  );
};

export default Dashboard;