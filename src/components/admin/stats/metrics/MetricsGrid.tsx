import { MetricCard } from "../MetricCard";
import { MetricType, useMetricsData } from "./useMetricsData";

interface MetricsGridProps {
  onMetricClick: (metric: MetricType) => void;
}

export const MetricsGrid = ({ onMetricClick }: MetricsGridProps) => {
  const { metrics, isLoading } = useMetricsData();

  if (isLoading) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          onClick={() => onMetricClick(metric.id)}
        />
      ))}
    </div>
  );
};