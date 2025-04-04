
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, RefreshCcw, Settings, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useNavigation } from "@/hooks/useNavigation";

// Custom icon wrapper component with animations
const IconWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div 
      className="rounded-full p-2 sm:p-3 bg-gradient-to-br from-brand-purple/10 to-brand-purple/5 transition-all duration-300 group-hover:bg-brand-purple/20"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {children}
    </motion.div>
  );
};

const QuickActions = () => {
  const { navigateTo } = useNavigation();
  const { toast } = useToast();

  const handleContractUpload = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Contract viewing functionality will be available in a future update.",
    });
  };

  const actions = [
    {
      icon: <RefreshCcw className="h-4 w-4 sm:h-5 sm:w-5 text-brand-purple" />,
      title: "Chat with SkyGuide",
      description: "Ask questions about your contract",
      onClick: () => navigateTo('/chat')
    },
    {
      icon: <Users className="h-4 w-4 sm:h-5 sm:w-5 text-brand-purple" />,
      title: "My Referrals",
      description: "View and manage your referrals",
      onClick: () => navigateTo('/referrals')
    },
    {
      icon: <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-brand-purple" />,
      title: "Your Contract",
      description: "View your union contract document",
      onClick: handleContractUpload
    },
    {
      icon: <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-brand-purple" />,
      title: "Account Settings",
      description: "Update your profile information",
      onClick: () => navigateTo('/account')
    }
  ];

  return (
    <div className="bg-card border rounded-lg p-4 sm:p-6">
      <div className="flex items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
              <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center space-y-3 sm:space-y-4">
                <IconWrapper>
                  {action.icon}
                </IconWrapper>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1 group-hover:text-brand-purple transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
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
