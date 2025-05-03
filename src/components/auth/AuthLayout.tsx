import React, { ReactNode } from 'react';
import { ArrowLeft} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';

interface AuthLayoutProps{
    children: ReactNode;
    title: string;
    subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({children, title, subtitle}) => {
    const isMobile = useIsMobile();
    return (
        <div className="flex flex-col gap-2 min-h-screen w-full items-center justify-center bg-luxury-dark px-4 py-8 sm:px-6">
        <div className="w-full max-w-lg space-y-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6"
            aria-label="Back to home page"
          >
            <ArrowLeft size={isMobile ? 16 : 18} />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
  
          <Card className="bg-card-gradient border border-white/10 shadow-2xl backdrop-blur-md rounded-2xl">
            <CardContent className="pt-6 px-6">
              <div className="flex flex-col items-center space-y-2 text-center mb-8">
                <img
                  src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
                  alt="SkyGuide Logo"
                  className="h-16 w-auto mb-2"
                />
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {title}
                </h1>
                <p className="text-sm text-gray-400">
                  {subtitle}
                </p>
              </div>
  
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    );
};

export default AuthLayout;