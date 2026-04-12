importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// REAL CONFIGURATION - These values must match your Firebase Project settings
const firebaseConfig = {
  apiKey: "AIzaSy...", // Replace with your real API Key
  authDomain: "kryros-mobile.firebaseapp.com",
  projectId: "kryros-mobile",
  storageBucket: "kryros-mobile.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'KRYROS Update';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message from KRYROS.',
    icon: '/logo-pwa.png',
    badge: '/favicon.svg',
    tag: payload.data?.type || 'general',
    data: {
      url: payload.data?.url || '/',
      ...payload.data
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to open the app or a specific URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with this URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
