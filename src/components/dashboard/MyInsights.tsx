
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartBarIcon, LightBulbIcon, ListChecksIcon } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface MyInsightsProps {
  userId: string | null;
  queryCount: number;
}

export const MyInsights = ({ userId, queryCount }: MyInsightsProps) => {
  const [topCategories, setTopCategories] = useState<{name: string, count: number}[]>([
    { name: "Contract Terms", count: 0 },
    { name: "Benefits", count: 0 },
    { name: "Work Rules", count: 0 }
  ]);
  const [loading, setLoading] = useState(true);
  const [monthlyLimit, setMonthlyLimit] = useState(10); // Default limit

  useEffect(() => {
    if (userId) {
      // In a real implementation, this would fetch data from the backend
      // Simulating data retrieval with timeout
      const timer = setTimeout(() => {
        // This would be replaced with actual data from the database
        setTopCategories([
          { name: "Contract Terms", count: Math.floor(Math.random() * 5) + 1 },
          { name: "Benefits", count: Math.floor(Math.random() * 4) + 1 },
          { name: "Work Rules", count: Math.floor(Math.random() * 3) + 1 }
        ]);
        setLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [userId]);

  // Calculate usage percentage
  const usagePercentage = Math.min(100, (queryCount / monthlyLimit) * 100);
  
  // Determine progress color based on usage
  const getProgressColor = () => {
    if (usagePercentage < 50) return "bg-green-500";
    if (usagePercentage < 80) return "bg-amber-500";
    return "bg-red-500";
  };

  const getNextStepSuggestion = () => {
    if (queryCount === 0) {
      return "Start by asking your first question about your contract";
    } else if (topCategories[0].count === 0) {
      return "Explore benefits and work rules in your contract";
    } else if (usagePercentage > 70) {
      return "Consider upgrading your plan for unlimited queries";
    } else {
      return "Try asking about specific sections of your contract";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border border-brand-purple/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 rounded-full -translate-x-1/3 -translate-y-1/2 blur-3xl z-0" />
        
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-5 w-5 text-brand-purple mr-2" />
            <h2 className="text-xl font-semibold">My Insights</h2>
          </div>
          
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Monthly Contract Queries</span>
                  <span className="text-sm font-medium">{queryCount} / {monthlyLimit}</span>
                </div>
                <Progress value={usagePercentage} className="h-2" indicatorClassName={getProgressColor()} />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center">
                  <ListChecksIcon className="h-4 w-4 mr-1 text-brand-purple" />
                  Top Question Categories
                </h3>
                <ul className="space-y-2">
                  {topCategories.map((category, index) => (
                    <li key={index} className="flex justify-between items-center text-sm">
                      <span>{category.name}</span>
                      <span className="text-muted-foreground">{category.count} queries</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-brand-purple/5 p-3 rounded-lg border border-brand-purple/10">
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <LightBulbIcon className="h-4 w-4 mr-1 text-brand-purple" />
                  Suggested Next Step
                </h3>
                <p className="text-sm text-muted-foreground">{getNextStepSuggestion()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
