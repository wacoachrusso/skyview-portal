import React from 'react';
import { Card } from '@/components/ui/card';

interface WebViewProps {
  url: string;
  title?: string;
  className?: string;
  height?: string | number;
  width?: string | number;
}

export function WebView({ 
  url, 
  title, 
  className = '', 
  height = '100%', 
  width = '100%' 
}: WebViewProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      {title && (
        <div className="p-4 border-b border-border/40 bg-background/95">
          <h3 className="text-lg font-semibold text-foreground/90">{title}</h3>
        </div>
      )}
      <iframe
        src={url}
        style={{ height, width }}
        className="border-none w-full"
        title={title || 'Web View'}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    </Card>
  );
}