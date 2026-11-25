import {createRoot} from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App.tsx';
import './index.css';
import {registerPwa} from './pwa';
import {registerNativePushNotifications} from './lib/pushNotifications';

createRoot(document.getElementById('root')!).render(<App />);

// Keep browser PWA behavior separate from the installed Android application.
if (Capacitor.isNativePlatform()) {
  void registerNativePushNotifications();
} else {
  registerPwa();
}
