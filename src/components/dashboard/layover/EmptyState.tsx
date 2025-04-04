
import { Search } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center text-muted-foreground">
      <Search className="h-12 w-12 text-muted-foreground/50" />
      <div>
        <h3 className="text-lg font-medium">Find your layover hotspots</h3>
        <p className="mt-1">Enter city name (like Chicago, Denver) or airport code (like ORD, DEN) to discover nearby restaurants, attractions, and spots to visit.</p>
      </div>
    </div>
  );
};
