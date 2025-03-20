
import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function MobileDrawer({
  isOpen,
  onOpenChange,
  children,
  className,
}: MobileDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background border-border px-4 py-6",
          className
        )}
      >
        <div className="mx-auto -mt-2 mb-3 h-1.5 w-16 rounded-full bg-muted" />
        {children}
      </div>
    </Drawer>
  );
}
