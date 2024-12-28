import { supabase } from "@/integrations/supabase/client";

export async function requestNotificationPermission(): Promise<boolean> {
  console.log("Requesting notification permission...");
  
  if (!("Notification" in window)) {
    console.log("Browser doesn't support notifications");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log("Notification permission result:", permission);
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

export async function sendPushNotification(title: string, options: NotificationOptions = {}) {
  console.log("Attempting to send push notification:", { title, options });
  
  if (Notification.permission !== "granted") {
    console.log("Push notifications not permitted");
    return false;
  }

  try {
    // Enhanced options for better mobile support
    const enhancedOptions: NotificationOptions = {
      ...options,
      silent: false, // Ensure sound plays on mobile
      timestamp: Date.now(), // Add timestamp for mobile notifications
      actions: [
        {
          action: 'open',
          title: 'View Details'
        }
      ],
    };

    const notification = new Notification(title, enhancedOptions);

    notification.onclick = function(event) {
      console.log("Notification clicked:", event);
      event.preventDefault(); // Prevent the browser from focusing the Notification's tab
      window.focus();
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
          await sendPushNotification(notification.title, {
            body: notification.message,
            tag: notification.id,
            data: {
              notificationId: notification.id,
              type: notification.type
            },
            vibrate: [200, 100, 200], // Vibration pattern for mobile
            requireInteraction: true, // Keep notification visible until user interacts
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}