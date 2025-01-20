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

  // Set up real-time updates
  useRealtimeUpdates(refetch);

  const handleMetricClick = (metric: MetricType) => {
    setSelectedMetric(metric);
    setIsDialogOpen(true);
  };

  const dialogContent = stats ? getDialogContent(stats.details, selectedMetric) : null;

  return (
    <>
      <MetricsGrid onMetricClick={handleMetricClick} />
      <StatsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        content={dialogContent}
      />
    </>
  );
};