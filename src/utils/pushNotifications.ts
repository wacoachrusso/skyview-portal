import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types/base.types";

export async function requestNotificationPermission(): Promise<boolean> {
  console.log("Requesting notification permission...");
  
  if (!("Notification" in window)) {
    console.log("Browser doesn't support notifications");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log("Notification permission result:", permission);
    
    if (permission === "granted") {
      await registerServiceWorker();
    }
    
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('ServiceWorker registration successful:', registration);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BLBz6TyNVtami0kD6Qf2giuHcmWjFyaVGEGVUWLhHtMJWGGZ7ZFbzXHC_qYGgwqOzDZKxf0fWw3zvuONuFdqXJs'
      });
      
      // Convert PushSubscription to Json type
      const subscriptionJson: Json = JSON.parse(JSON.stringify(subscription));

      console.log('Push notification subscription:', subscriptionJson);
      
      // Store the subscription in your backend
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            push_subscription: subscriptionJson
          })
          .eq('id', user.id);
          
        if (error) {
          console.error('Error storing push subscription:', error);
        }
      }
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  }
}

export async function sendPushNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
  console.log("Attempting to send push notification:", { title, options });
  
  if (Notification.permission !== "granted") {
    console.log("Push notifications not permitted");
    return false;
  }

  try {
    // Enhanced options for better mobile support
    const enhancedOptions: NotificationOptions = {
      ...options,
      badge: "/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png",
      icon: "/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png",
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
      actions: [
        {
          action: 'open',
          title: 'View Details'
        }
      ],
      data: {
        ...options.data,
        url: window.location.origin + '/release-notes'
      }
    };

    if ('setAppBadge' in navigator) {
      await navigator.setAppBadge(1);
    }

    const notification = new Notification(title, enhancedOptions);

    notification.onclick = function(event) {
      console.log("Notification clicked:", event);
      event.preventDefault();
      window.focus();
      if (notification.data?.url) {
        window.location.href = notification.data.url;
      }
      notification.close();
    };

    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

export async function setupPushNotifications() {
  console.log("Setting up push notifications...");
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log("No user found, skipping push notification setup");
    return;
  }

  // Subscribe to notification changes
  const channel = supabase
    .channel('notifications_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      },
      async (payload) => {
        console.log("New notification received:", payload);
        const notification = payload.new;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('push_notifications')
          .eq('id', user.id)
          .single();

        if (profile?.push_notifications) {
          const notificationOptions: NotificationOptions = {
            body: notification.message,
            tag: notification.id,
            data: {
              notificationId: notification.id,
              type: notification.type,
              url: '/release-notes'
            },
            badge: "/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png",
            icon: "/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png",
            vibrate: [200, 100, 200],
            requireInteraction: true,
          };
          
          await sendPushNotification(notification.title, notificationOptions);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function clearNotificationBadge() {
  if ('clearAppBadge' in navigator) {
    await navigator.clearAppBadge();
  }
}
