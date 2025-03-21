import React from 'react';
import { WebView } from '@/components/shared/WebView';

export default function WebViewDemo() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Web View Demo</h1>
      
      {/* Example with title */}
      <WebView 
        url="https://skyguide.ch" 
        title="SkyGuide Website"
        height={600}
        className="mb-8"
      />
      
      {/* Example without title */}
      <WebView 
        url="https://www.google.com/maps" 
        title="Google Maps"
        height={600}
        className="mb-8"
      />
    </div>
  );
}