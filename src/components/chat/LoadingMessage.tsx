
import { Loader2 } from "lucide-react";

export function LoadingMessage() {
  return (
    <div className="flex items-center justify-start p-4 mb-2 rounded-lg bg-slate-800/10 dark:bg-slate-900/40 animate-pulse">
      <div className="flex items-center gap-2 text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p>Checking contract references...</p>
      </div>
    </div>
  );
}
