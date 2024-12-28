import { supabase } from "@/integrations/supabase/client";

export async function requestNotificationPermission(): Promise<boolean> {
  console.log("Requesting notification permission...");
  
  if (!("Notification" in window)) {
    console.log("Browser doesn't support notifications");
    return false;
  }

  try {
    // Check if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isIOS) {
      // Show custom prompt for iOS users
      const permission = await new Promise<NotificationPermission>((resolve) => {
        // We need to show a custom alert for iOS users since the native prompt might not work
        if (confirm(
          "Enable notifications to stay updated with important releases and updates. \n\n" +
          "This helps you: \n" +
          "• Get instant updates about new features \n" +
          "• Stay informed about critical changes \n" +
          "• Never miss important announcements \n\n" +
          "Would you like to enable notifications?"
        )) {
          Notification.requestPermission().then(resolve);
        } else {
          resolve('denied');
        }
      });
      
      console.log("iOS notification permission result:", permission);
      return permission === "granted";
    } else {
      // For other platforms, use standard request
      const permission = await Notification.requestPermission();
      console.log("Notification permission result:", permission);
      return permission === "granted";
    }
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
    const notification = new Notification(title, {
      icon: "/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png",
      ...options
    });

    notification.onclick = function() {
      console.log("Notification clicked");
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
            }
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}