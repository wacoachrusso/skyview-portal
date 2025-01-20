import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import { ChatContent } from "@/components/chat/ChatContent";
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { 
    currentConversationId, 
    loadConversation, 
    setCurrentConversationId,
    messages,
    isLoading,
    sendMessage,
    currentUserId,
    startNewChat,
    userProfile 
  } = useChat();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // Check if user is on free plan and has used their query
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan, query_count')
        .eq('id', session.user.id)
        .single();

      if (profile?.subscription_plan === 'free' && profile?.query_count >= 1) {
        console.log('Free trial ended, redirecting to pricing');
        toast({
          title: "Free Trial Ended",
          description: "Please select a subscription plan to continue using SkyGuide.",
          duration: 5000
        });
        navigate('/?scrollTo=pricing-section');
      }
    };

    checkAccess();
  }, [navigate, toast]);

  // Also check after each message is sent
  useEffect(() => {
    if (userProfile?.subscription_plan === 'free' && userProfile?.query_count >= 1) {
      console.log('Query limit reached, redirecting to pricing');
      toast({
        title: "Free Trial Ended",
        description: "Please select a subscription plan to continue using SkyGuide.",
        duration: 5000
      });
      navigate('/?scrollTo=pricing-section');
    }
  }, [userProfile?.query_count, userProfile?.subscription_plan, navigate, toast]);

  const handleSelectConversation = async (conversationId: string) => {
    console.log('Loading conversation:', conversationId);
    await loadConversation(conversationId);
    setCurrentConversationId(conversationId);
    setIsSidebarOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C] overflow-hidden">
      <ChatLayout 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onSelectConversation={handleSelectConversation}
        currentConversationId={currentConversationId}
      >
        <ChatContent
          messages={messages}
          currentUserId={currentUserId}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onNewChat={startNewChat}
        />
      </ChatLayout>
    </div>
  );
};

export default Chat;