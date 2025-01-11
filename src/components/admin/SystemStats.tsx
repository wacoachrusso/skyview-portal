import { useState } from "react";
import { MetricsGrid } from "./stats/metrics/MetricsGrid";
import { StatsDialog } from "./stats/StatsDialog";
import { getDialogContent } from "./stats/getDialogContent";
import { useMetricsData } from "./stats/metrics/useMetricsData";
import { useRealtimeUpdates } from "./stats/metrics/useRealtimeUpdates";
import type { MetricType } from "./stats/metrics/useMetricsData";

export const SystemStats = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { stats, refetch } = useMetricsData();
  const [isDeleting, setIsDeleting] = useState(false);

  // Set up real-time updates
  useRealtimeUpdates(refetch);

  const handleMetricClick = (metric: MetricType) => {
    setSelectedMetric(metric);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('message_feedback')
        .delete()
        .eq('id', id);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error deleting feedback:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const dialogContent = getDialogContent(stats?.details, selectedMetric, handleDelete, isDeleting);

  return (
    <>
      <MetricsGrid onMetricClick={handleMetricClick} />
      <StatsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedMetric={selectedMetric}
        onRefresh={refetch}
      />
    </>
  );
};