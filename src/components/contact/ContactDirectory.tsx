import { Card, CardContent } from "@/components/ui/card";

export const ContactDirectory = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center text-foreground/90">Contact Directory</h2>
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
        <CardContent className="p-6">
          <div className="bg-muted/20 rounded-lg p-4 text-center text-muted-foreground">
            <p>Contact information and directory will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};