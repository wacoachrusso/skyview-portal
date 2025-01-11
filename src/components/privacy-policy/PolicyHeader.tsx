import { ScrollArea } from "@/components/ui/scroll-area";

export const PolicyHeader = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground">
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
};