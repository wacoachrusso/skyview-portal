
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const InstallPrompt = () => {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasShownPrompt = localStorage.getItem('iosInstallPromptShown');
    
    console.log('Device checks:', { isIOS, isStandalone, hasShownPrompt });
    
    if (isIOS && !isStandalone && !hasShownPrompt) {
      setShowIOSPrompt(true);
      localStorage.setItem('iosInstallPromptShown', 'true');
    }
  }, []);

  const handleClosePrompt = () => {
    setShowIOSPrompt(false);
  };

  return (
    <Sheet open={showIOSPrompt} onOpenChange={handleClosePrompt}>
      <SheetContent 
        side="bottom" 
        className="glass-morphism border-t border-white/10 max-h-[80vh] overflow-y-auto pb-safe"
        style={{
          height: "auto",
          minHeight: "280px",
          maxHeight: "min(450px, 80vh)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
        }}
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-white">Install SkyGuide App</SheetTitle>
          <SheetDescription className="text-base text-gray-300">
            <div className="space-y-4 pb-6">
              <p>Install SkyGuide on your iOS device for the best experience:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Tap the Share button <span className="inline-block w-6 h-6 align-middle">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L8 6h3v8h2V6h3L12 2zm0 10H3v10h18V12h-9zm-7 8v-6h14v6H5z"/>
                  </svg>
                </span> in Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to install SkyGuide</li>
              </ol>
              <div className="mt-6 mb-4">
                <button
                  onClick={handleClosePrompt}
                  className="premium-button w-full bg-brand-gold text-brand-navy font-semibold py-3 rounded-lg hover:bg-brand-gold/90 transition-colors shadow-gold hover:shadow-gold-hover"
                >
                  Got it
                </button>
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
