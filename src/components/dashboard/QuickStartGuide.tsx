import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Search, FileText } from "lucide-react";

export const QuickStartGuide = () => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-foreground/90">How to Use SkyGuide</h2>
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start space-x-3">
              <MessageSquare className="h-5 w-5 text-brand-gold mt-1" />
              <div>
                <h3 className="font-medium text-foreground/90 mb-1">Ask Questions</h3>
                <p className="text-sm text-muted-foreground">
                  Use the chat interface to ask questions about your contract. Our AI will provide accurate answers based on your agreement.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Search className="h-5 w-5 text-brand-gold mt-1" />
              <div>
                <h3 className="font-medium text-foreground/90 mb-1">Search Features</h3>
                <p className="text-sm text-muted-foreground">
                  Quickly search through contract sections, recent queries, and union updates to find the information you need.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-brand-gold mt-1" />
              <div>
                <h3 className="font-medium text-foreground/90 mb-1">Stay Updated</h3>
                <p className="text-sm text-muted-foreground">
                  Access the latest union news and contract updates directly from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};