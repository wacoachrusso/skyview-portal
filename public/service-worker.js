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
      data: {
        ...data.data,
        url: data.url || '/release-notes',
        notificationId: data.id
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
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
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