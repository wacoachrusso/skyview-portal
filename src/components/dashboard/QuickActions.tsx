import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, RefreshCcw, Settings, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useNavigation } from "@/hooks/useNavigation";
import { useTheme } from "@/components/theme-provider";
import { useProfile } from "@/components/utils/ProfileProvider";

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
  const { theme } = useTheme();
  const  userProfile  = sessionStorage.getItem('cached_user_profile');
  const profile = JSON.parse(userProfile);
  // URL mapper for different airline/user type combinations
  const contractUrlMapper: Record<string, string> = {
    "united airlines|pilot": "uap",
    "united airlines|flight attendant": "uaf",
    "delta airlines|pilot": "dp",
    "alaska airlines|flight attendant": "aaf",
    "american airlines|flight attendant": "amaf",
    "american airlines|pilot": "amap",
  };

  const handleContractUpload = () => {
    if (!profile?.airline || !profile?.user_type) {
      toast({
        title: "Profile Information Missing",
        description: "Please complete your profile to view your contract.",
        variant: "destructive",
      });
      return;
    }

    const key = `${profile.airline.toLowerCase()}|${profile.user_type.toLowerCase()}`;
    const contractCode = contractUrlMapper[key];

    if (!contractCode) {
      toast({
        title: "Contract Not Available",
        description: "No contract found for your airline and position combination.",
        variant: "destructive",
      });
      return;
    }

    const contractUrl = `https://xnlzqsoujwsffoxhhybk.supabase.co/storage/v1/object/public/contracts/${contractCode}.pdf`;
    
    // Open PDF in new tab
    window.open(contractUrl, '_blank', 'noopener,noreferrer');
    
    toast({
      title: "Opening Contract",
      description: "Your contract document is opening in a new tab.",
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

  const cardBg =
    theme === "dark"
      ? "bg-background/80 border-brand-purple/10"
      : "bg-white/70 border-brand-purple/10";

  return (
    <div className={`border rounded-lg p-4 sm:p-6 ${theme === "dark" ? "bg-card " : "bg-white/70"}`}>
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
              className={`hover-lift-premium h-full cursor-pointer group overflow-hidden relative backdrop-blur-sm border ${cardBg}`}
              onClick={action.onClick}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 via-brand-purple/5 to-transparent animate-slide opacity-80 z-0" />
              <div className="absolute inset-0 bg-pattern opacity-5 z-0" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 rounded-full -translate-x-1/3 -translate-y-1/2 blur-2xl z-0" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-brand-gold/10 rounded-full translate-x-1/4 translate-y-1/2 blur-2xl z-0" />

              <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center space-y-3 sm:space-y-4 relative z-10">
                <IconWrapper>{action.icon}</IconWrapper>
                <div>
                  <h3 className={`text-base sm:text-lg font-semibold mb-1 group-hover:text-brand-purple transition-colors ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
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