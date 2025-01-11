import { useState, Suspense } from "react";
import { MetricsGrid } from "./stats/metrics/MetricsGrid";
import { StatsDialog } from "./stats/StatsDialog";
import { getDialogContent } from "./stats/getDialogContent";
import { useMetricsData } from "./stats/metrics/useMetricsData";
import type { MetricType } from "./stats/metrics/useMetricsData";
import { Card } from "@/components/ui/card";

export const SystemStats = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { stats, refetch, isLoading } = useMetricsData();

  const handleMetricClick = (metric: MetricType) => {
    setSelectedMetric(metric);
    setIsDialogOpen(true);
  };

  const dialogContent = getDialogContent(stats?.details, selectedMetric);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="h-[120px] animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading stats...</div>}>
      <MetricsGrid onMetricClick={handleMetricClick} />
      <StatsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        content={dialogContent}
      />
    </Suspense>
  );
};