import * as Notifications from 'expo-notifications';
import { SpeechService } from './SpeechService';
import { Platform } from 'react-native';

// Set handler for local notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

export const NotificationService = {
  requestPermissions: async () => {
    try {
      // In Expo Go on Android SDK 53+, remote push is disabled.
      // However, local notifications still work.
      // requestPermissionsAsync() defaults to asking for everything, including remote.
      // We try to request generically, but catch errors to prevent crashes in Expo Go.
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (error) {
      console.warn("Notification permission request failed (likely Expo Go restriction):", error);
      // Fallback: assume we can't notify, but don't crash the app.
      // On Android 13+, this means notifications won't appear, but the app keeps running.
      return false;
    }
  },

  scheduleTask: async (title: string, body: string, hour: number, minute: number) => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If time is in the past, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    try {
      // Fix: Use the correct trigger object format required by newer Expo SDKs
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { speakBody: body },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledTime,
        },
      });
    } catch (error) {
      console.warn("Failed to schedule notification:", error);
    }

    return scheduledTime;
  },

  setupListeners: () => {
    // Listener for when user interacts with notification
    try {
      const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const body = response.notification.request.content.data.speakBody;
        if (typeof body === 'string') {
          // Delay slightly to allow app to come to foreground
          setTimeout(() => {
            SpeechService.speak(body);
          }, 500);
        }
      });

      return () => {
        subscription.remove();
      };
    } catch (error) {
      console.warn("Failed to setup notification listeners:", error);
      return () => {};
    }
  }
};
