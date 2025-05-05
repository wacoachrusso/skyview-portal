import { ReactNode } from "react";
import GlobalNavbar from "../shared/navbar/GlobalNavbar";
import { useTheme } from "../theme-provider";

interface AppLayoutProps {
  children: ReactNode;
  maxWidth?: string;
}

export const AppLayout = ({
  children,
  maxWidth = "max-w-7xl",
}: AppLayoutProps) => {
  const { theme } = useTheme();

  const bgStyles =
    theme === "dark"
      ? "bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white"
      : "bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100 text-gray-800";

  return (
    <div className={`min-h-screen ${bgStyles}`}>
      <GlobalNavbar />
      <main
        className={`container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pt-24 sm:pt-28 ${maxWidth}`}
      >
        {children}
      </main>
    </div>
  );
};
