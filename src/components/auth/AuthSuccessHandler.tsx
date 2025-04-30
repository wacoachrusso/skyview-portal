// src/components/auth/AuthSuccessHandler.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AuthSuccessHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Create an async function for handling auth success
    const handleAuthSuccessParams = async () => {
      // Get URL parameters
      const searchParams = new URLSearchParams(location.search);
      const isPaymentSuccess = searchParams.get('payment_success') === 'true';
      const isAuthSuccess = searchParams.get('auth_success') === 'true';
      const isCheckoutComplete = searchParams.has('checkout.session_completed');
      
      // Skip if no success parameters
      if (!isPaymentSuccess && !isAuthSuccess && !isCheckoutComplete) {
        return;
      }
      
      console.log('Auth/Payment success detected, stabilizing session');
      
      // Set a flag to prevent redirect loops during session stabilization
      localStorage.setItem('auth_stabilizing', 'true');
      
      try {
        // Handle payment success
        if (isPaymentSuccess || isCheckoutComplete) {
          // Clean up payment flags
          localStorage.removeItem('payment_in_progress');
          localStorage.removeItem('postPaymentConfirmation');
          
          // Restore auth data after payment if available
          const savedAccessToken = localStorage.getItem('auth_access_token');
          const savedRefreshToken = localStorage.getItem('auth_refresh_token');
          
          if (savedAccessToken && savedRefreshToken) {
            console.log('Restoring auth session after payment');
            try {
              // Set the session using saved tokens
              await supabase.auth.setSession({
                access_token: savedAccessToken,
                refresh_token: savedRefreshToken
              });
              
              // Clean up saved tokens
              localStorage.removeItem('auth_access_token');
              localStorage.removeItem('auth_refresh_token');
            } catch (sessionError) {
              console.error('Error restoring session after payment:', sessionError);
            }
          }
          
          // Show success toast
          toast({
            title: "Payment Successful",
            description: "Your subscription has been activated. Thank you!",
            duration: 5000,
          });
        }
        
        // Handle auth success
        if (isAuthSuccess) {
          // Show success toast
          toast({
            title: "Authentication Successful",
            description: "You are now logged in.",
            duration: 3000,
          });
        }
        
        // Remove URL parameters while keeping the current path
        const cleanPath = location.pathname;
        
        // After successful auth/payment, ensure we have a valid session
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (!session) {
            console.log('No session found after auth/payment success, redirecting to login');
            localStorage.removeItem('auth_stabilizing');
            navigate('/login', { replace: true });
            return;
          }
          
          // Double check the session is valid by making a simple profile request
          const { error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Profile validation failed after auth success:', profileError);
            throw profileError;
          }
          
          // Get any saved redirect path
          const redirectPath = localStorage.getItem('auth_redirect_path') || '/chat';
          localStorage.removeItem('auth_redirect_path');
          
          // Navigate to the clean path or saved redirect path
          navigate(redirectPath, { replace: true });
        } catch (error) {
          console.error('Session validation error:', error);
          // If session validation fails, redirect to login
          navigate('/login', { replace: true });
        }
      } finally {
        // Clean up the stabilizing flag after a short delay
        setTimeout(() => {
          localStorage.removeItem('auth_stabilizing');
        }, 5000);
      }
    };
    
    handleAuthSuccessParams();
  }, [location.search]);
  
  // This component doesn't render anything
  return null;
};