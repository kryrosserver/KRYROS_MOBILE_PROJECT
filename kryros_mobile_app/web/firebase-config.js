// Firebase configuration for web PWA
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBO13zY5tyNH-_aoDTo7-AVQqgYkzkDe3Y",
  authDomain: "notification-237bf.firebaseapp.com",
  projectId: "notification-237bf",
  storageBucket: "notification-237bf.firebasestorage.app",
  messagingSenderId: "788124682568",
  appId: "1:788124682568:web:3e350b1c7cc8ed56e50b7d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

// Request permission and get token
export const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY_HERE' // You'll need to generate this from Firebase Console
      });
      return token;
    }
  } catch (error) {
    console.error('Error getting permission or token:', error);
  }
  return null;
};

// Handle incoming messages when app is in foreground
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };