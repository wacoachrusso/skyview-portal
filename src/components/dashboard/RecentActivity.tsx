import { Card, CardContent } from "@/components/ui/card";

export const RecentActivity = () => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6 sm:p-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-muted/50 rounded-lg p-4 text-muted-foreground">
          <p>Your recent chat history and activities will appear here.</p>
        </div>
      </CardContent>
    </Card>
  );
};