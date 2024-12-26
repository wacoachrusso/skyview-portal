import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import ChatLayout from "@/components/chat/layout/ChatLayout";
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.signInWithPassword({
        email: '',
        password: '',
        options: {
          // Set session expiry to 14 days if rememberMe is true
          expiresIn: 60 * 60 * 24 * 14 // 14 days
        }
      });
      
      if (!session) {
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 left-4 z-50">
        <Button 
          variant="ghost" 
          className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
          onClick={() => navigate('/dashboard')}
        >
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>
      <ChatLayout />
    </div>
  );
};

export default Chat;