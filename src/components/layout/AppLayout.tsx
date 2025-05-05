import { ReactNode } from "react";
import DashboardNavbar from "../navbar/DashboardNavbar";
import { ChatSettings } from "../chat/ChatSettings";

interface AppLayoutProps {
  children: ReactNode;
  maxWidth?: string;
}

export const AppLayout = ({ 
  children, 
  maxWidth = "max-w-7xl" 
}: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <DashboardNavbar />
      <main className={`container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pt-24 sm:pt-28 ${maxWidth}`}>
        {children}
      </main>
    </div>
  );
};