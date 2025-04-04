
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, RefreshCcw, Settings, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, onClick }) => {
  return (
    <Card className="bg-card-foreground border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <CardContent className="p-4 flex flex-col items-start justify-start h-full" onClick={onClick}>
        <div className="rounded-full bg-muted p-2 mb-2">{icon}</div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export function QuickActions() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleContractUpload = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Contract viewing functionality will be available in a future update.",
    });
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <ActionCard
          icon={<RefreshCcw className="h-5 w-5" />}
          title="Chat with SkyGuide"
          description="Ask questions about your contract"
          onClick={() => navigate('/chat')}
        />
        
        <ActionCard
          icon={<Users className="h-5 w-5" />}
          title="My Referrals"
          description="View and manage your referrals"
          onClick={() => navigate('/referrals')}
        />
        
        <ActionCard
          icon={<FileText className="h-5 w-5" />}
          title="Your Contract"
          description="View your union contract document"
          onClick={handleContractUpload}
        />
        
        <ActionCard
          icon={<Settings className="h-5 w-5" />}
          title="Account Settings"
          description="Update your profile information"
          onClick={() => navigate('/account')}
        />
      </div>
    </div>
  );
}
