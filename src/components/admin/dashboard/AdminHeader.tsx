import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdminHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <Button
        variant="outline"
        onClick={() => navigate('/dashboard')}
        className="gap-2"
      >
        <LayoutDashboard className="h-4 w-4" />
        Go to Dashboard
      </Button>
    </div>
  );
};