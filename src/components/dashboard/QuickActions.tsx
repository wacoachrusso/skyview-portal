import { Card } from "@/components/ui/card";
import { ActionCard } from "./ActionCard";
import { MessageSquare, FileText, Users, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 bg-card-gradient shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionCard
          icon={MessageSquare}
          title="Start Chat"
          description="Ask questions about your contract"
          onClick={() => navigate('/chat')}
        />
        <ActionCard
          icon={FileText}
          title="View Contract"
          description="Access your union contract"
          onClick={() => navigate('/contract')}
        />
        <ActionCard
          icon={Users}
          title="Union Reps"
          description="Contact your representatives"
          onClick={() => navigate('/representatives')}
        />
        <ActionCard
          icon={Settings}
          title="Settings"
          description="Manage your preferences"
          onClick={() => navigate('/settings')}
        />
      </div>
    </Card>
  );
};