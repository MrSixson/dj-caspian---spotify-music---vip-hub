import { Capacitor } from '@capacitor/core';
import { PushNotifications, type Token } from '@capacitor/push-notifications';
import { supabase } from './supabase';

const INSTALLATION_ID_KEY = 'dj-caspian-installation-id';

function getInstallationId(): string {
  let id = localStorage.getItem(INSTALLATION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(INSTALLATION_ID_KEY, id);
  }
  return id;
}

async function savePushToken(token: Token): Promise<void> {
  const installationId = getInstallationId();
  const { error } = await supabase.from('device_push_tokens').insert({
    installation_id: installationId,
    fcm_token: token.value,
    platform: Capacitor.getPlatform(),
  });

  // A duplicate token is expected when the app is opened more than once.
  if (error && !/duplicate key|unique constraint/i.test(error.message)) {
    console.warn('[DJ Caspian] Could not save push token:', error.message);
  }
}

export async function registerNativePushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await PushNotifications.addListener('registration', savePushToken);
    await PushNotifications.addListener('registrationError', (error) => {
      console.warn('[DJ Caspian] Push registration failed:', error);
    });
    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.info('[DJ Caspian] Push notification received:', notification.title);
    });
    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const target = action.notification.data?.url;
      if (typeof target === 'string' && target.startsWith('/')) {
        window.location.assign(target);
      }
    });

    let permission = await PushNotifications.checkPermissions();
    if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
      permission = await PushNotifications.requestPermissions();
    }
    if (permission.receive !== 'granted') {
      console.info('[DJ Caspian] Notification permission was not granted.');
      return;
    }

    await PushNotifications.createChannel({
      id: 'caspian_updates',
      name: 'DJ Caspian updates',
      description: 'اعلان آهنگ‌های جدید و به‌روزرسانی‌های DJ Caspian',
      importance: 5,
      visibility: 1,
      sound: 'default',
      vibration: true,
    });
    await PushNotifications.register();
  } catch (error) {
    console.warn('[DJ Caspian] Native push notifications are unavailable:', error);
  }
}
