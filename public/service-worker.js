self.addEventListener('push', function(event) {
  console.log('Push message received:', event);
  
  if (event.data) {
    const data = event.data.json();
    console.log('Push data:', data);
    
    const options = {
      body: data.body || data.message,
      icon: data.icon || '/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png',
      badge: data.badge || '/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png',
      vibrate: [200, 100, 200],
      silent: false, // Ensure sound is not muted
      data: {
        ...data.data,
        url: data.url || '/release-notes',
        notificationId: data.id,
        sound: data.sound || customNotificationSound // Pass sound URL in data
      },
      actions: [
        {
          action: 'open',
          title: 'View Details'
        }
      ],
      tag: data.tag || 'default',
      renotify: true,
      requireInteraction: true
    };
    
    // Play the sound when showing notification
    const soundUrl = data.sound || customNotificationSound;
    const audio = new Audio(soundUrl);
    event.waitUntil(
      Promise.all([
        self.registration.showNotification(data.title, options),
        audio.play().catch(error => console.log('Error playing sound:', error))
      ])
    );
  }
});

let customNotificationSound = 'https://xnlzqsoujwsffoxhhybk.supabase.co/storage/v1/object/public/audio/notification-sound.mp3';

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'UPDATE_NOTIFICATION_SOUND') {
    console.log('Updating notification sound URL:', event.data.soundUrl);
    customNotificationSound = event.data.soundUrl;
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/release-notes';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});