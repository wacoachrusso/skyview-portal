import { Card, CardContent } from "@/components/ui/card";

export const RecentActivity = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center text-foreground/90">Recent Activity</h2>
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
        <CardContent className="p-6">
          <div className="bg-muted/20 rounded-lg p-4 text-center text-muted-foreground">
            <p>Your recent chat history and activities will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};