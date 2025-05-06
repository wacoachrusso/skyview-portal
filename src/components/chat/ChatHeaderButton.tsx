import React, { ReactNode } from 'react';
import { Button } from '../ui/button';
import { forceNavigate } from '@/utils/navigation';
import { useTheme } from '../theme-provider';

interface NavButtonProps {
    to: string;
    text: string;
    icon?: ReactNode;
  }
  
const ChatHeaderButton : React.FC<NavButtonProps> = ({to, text, icon }) => {
    const {theme} = useTheme();
    return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => forceNavigate(to)}
          className={`hover:bg-secondary flex items-center transition-colors ${
            theme === "dark" 
              ? "text-slate-300 hover:text-white" 
              : "text-slate-600 hover:text-white"
          }`}
        >
          {icon}
          <span className="ml-2 hidden md:inline">{text}</span>
        </Button>
    );
};

export default ChatHeaderButton;