import { lazy } from "react";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

// Wrapper component for lazy-loaded routes with loading state
export const LazyLoadWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense 
    fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all">
        <LoadingSpinner size="lg" className="h-12 w-12" />
      </div>
    }
  >
    {children}
  </Suspense>
);

// Enhanced lazy loading with better error handling and logging
export const enhancedLazy = (
  importFn: () => Promise<any>,
  componentName: string
) => {
  console.log(`Starting lazy load for ${componentName}`);
  
  return lazy(() =>
    importFn()
      .then(module => {
        console.log(`Successfully loaded ${componentName}`);
        return module;
      })
      .catch(error => {
        console.error(`Error loading ${componentName}:`, error);
        throw error;
      })
  );
};

// Retry logic for loading components
export const retryLoadComponent = (fn: () => Promise<any>, retriesLeft = 3): Promise<any> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        console.warn(`Error loading component, retries left: ${retriesLeft}`, error);
        if (retriesLeft === 0) {
          reject(error);
          return;
        }
        setTimeout(() => {
          retryLoadComponent(fn, retriesLeft - 1).then(resolve, reject);
        }, 1500);
      });
  });
};