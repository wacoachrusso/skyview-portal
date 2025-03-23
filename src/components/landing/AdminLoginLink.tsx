
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const AdminLoginLink = () => {
  return (
    <div className="absolute bottom-4 right-4">
      <Link to="/login?admin=true">
        <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-400">
          Admin Login
        </Button>
      </Link>
    </div>
  );
};
