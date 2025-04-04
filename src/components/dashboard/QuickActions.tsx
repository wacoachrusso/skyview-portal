
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, RefreshCcw, Settings, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { HelpTooltip } from "@/components/shared/HelpTooltip";

// Custom icon wrapper component with animations
const IconWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div 
      className="rounded-full p-3 bg-gradient-to-br from-brand-purple/10 to-brand-purple/5 transition-all duration-300 group-hover:bg-brand-purple/20"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {children}
    </motion.div>
  );
};

const QuickActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleContractUpload = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Contract viewing functionality will be available in a future update.",
    });
  };

  const actions = [
    {
      icon: <RefreshCcw className="h-5 w-5 text-brand-purple" />,
      title: "Chat with SkyGuide",
      description: "Ask questions about your contract",
      tooltip: "Ask any questions about your union contract terms, benefits, policies, or provisions.",
      onClick: () => navigate('/chat')
    },
    {
      icon: <Users className="h-5 w-5 text-brand-purple" />,
      title: "My Referrals",
      description: "View and manage your referrals",
      tooltip: "Track your referrals and see who you've invited to join SkyGuide.",
      onClick: () => navigate('/referrals')
    },
    {
      icon: <FileText className="h-5 w-5 text-brand-purple" />,
      title: "Your Contract",
      description: "View your union contract document",
      tooltip: "Access and view your full union contract document. Coming soon!",
      onClick: handleContractUpload
    },
    {
      icon: <Settings className="h-5 w-5 text-brand-purple" />,
      title: "Account Settings",
      description: "Update your profile information",
      tooltip: "Manage your account settings, profile information, and preferences.",
      onClick: () => navigate('/account')
    }
  ];

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <HelpTooltip 
          text="These quick actions provide access to key features of SkyGuide. Click any card to navigate to that feature."
          className="ml-2"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div 
            key={index}
            whileHover={{ y: -5 }}
            whileTap={{ y: 0 }}
          >
            <Card 
              className="hover-lift-premium h-full border border-brand-purple/10 bg-gradient-to-br from-background to-background/95 backdrop-blur-sm cursor-pointer group overflow-hidden relative"
              onClick={action.onClick}
            >
              <div className="absolute top-2 right-2 z-10">
                <HelpTooltip text={action.tooltip} />
              </div>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <IconWrapper>
                  {action.icon}
                </IconWrapper>
                <div>
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-brand-purple transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export { QuickActions };
