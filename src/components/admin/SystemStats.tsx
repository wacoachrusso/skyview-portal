import { useState } from "react";
import { Users, UserCheck, Bell, FileText, UserPlus, CreditCard } from "lucide-react";
import { MetricCard } from "./stats/MetricCard";
import { StatsDialog } from "./stats/StatsDialog";
import { useAdminStats } from "@/hooks/useAdminStats";
import { getDialogContent } from "./stats/getDialogContent";

export const SystemStats = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: stats } = useAdminStats();

  const dialogContent = getDialogContent(stats?.details, selectedMetric);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={stats?.userCount || 0}
          icon={Users}
          onClick={() => {
            setSelectedMetric("users");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="Active Users (30d)"
          value={stats?.activeUserCount || 0}
          icon={UserCheck}
          onClick={() => {
            setSelectedMetric("activeUsers");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="Notifications Sent"
          value={stats?.notificationCount || 0}
          icon={Bell}
          onClick={() => {
            setSelectedMetric("notifications");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="Release Notes"
          value={stats?.releaseNoteCount || 0}
          icon={FileText}
          onClick={() => {
            setSelectedMetric("releaseNotes");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="New Users (30d)"
          value={stats?.newUserCount || 0}
          icon={UserPlus}
          onClick={() => {
            setSelectedMetric("newUsers");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="Monthly Subscribers"
          value={stats?.monthlySubCount || 0}
          icon={CreditCard}
          onClick={() => {
            setSelectedMetric("monthlySubUsers");
            setIsDialogOpen(true);
          }}
        />
        <MetricCard
          title="Yearly Subscribers"
          value={stats?.yearlySubCount || 0}
          icon={CreditCard}
          onClick={() => {
            setSelectedMetric("yearlySubUsers");
            setIsDialogOpen(true);
          }}
        />
      </div>

      <StatsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        content={dialogContent}
      />
    </>
  );
};