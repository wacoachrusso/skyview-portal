import { useEffect } from 'react';
import * as Sentry from "@sentry/react";
import { AppRoutes } from '@/components/routing/AppRoutes';
import { useAuthState } from '@/hooks/useAuthState';
import './App.css';

function App() {
  const { user } = useAuthState();

  useEffect(() => {
    // Set user information in Sentry when available
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
      });
    } else {
      // Clear user data when logged out
      Sentry.setUser(null);
    }
  }, [user]);

  // Add performance monitoring
  useEffect(() => {
    const transaction = Sentry.startTransaction({
      name: "App Load",
    });

    return () => {
      transaction.finish();
    };
  }, []);

  console.log('App component mounted');
  console.log('Current route: ', window.location.pathname);
  console.log('Environment: ', process.env.NODE_ENV);

  return (
    <div className="min-h-screen bg-background">
      <AppRoutes />
    </div>
  );
}

// Wrap the app with Sentry's performance monitoring
export default Sentry.withProfiler(App);