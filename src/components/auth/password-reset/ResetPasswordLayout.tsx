
import { ReactNode } from "react";

interface ResetPasswordLayoutProps {
  children: ReactNode;
}

export const ResetPasswordLayout = ({ children }: ResetPasswordLayoutProps) => {
  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#1A1F2C]/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-8 flex flex-col items-center">
            <img
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
              alt="SkyGuide Logo"
              className="h-12 w-auto mb-6"
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
