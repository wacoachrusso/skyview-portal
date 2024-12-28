import { cn } from "@/lib/utils";

interface UserStatusBadgeProps {
  status: string;
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-sm",
        status === "disabled" && "bg-gray-200 text-gray-700",
        status === "suspended" && "bg-yellow-200 text-yellow-700",
        status === "deleted" && "bg-red-200 text-red-700",
        status === "active" && "bg-green-200 text-green-700"
      )}
    >
      {status || "active"}
    </span>
  );
};