import * as Notifications from 'expo-notifications';
import { SpeechService } from './SpeechService';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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
    // Android Expo Go check:
    // remote notifications are removed in SDK 53+.
    // requesting permissions via requestPermissionsAsync() might fail if it implies remote scope.
    // We will stick to getPermissionsAsync mostly, and catch errors.

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Only request if not granted.
      // Note: On Android Expo Go, this might throw if it tries to ask for remote push.
      // But we need to ask for notification permission on Android 13+.
      if (existingStatus !== 'granted') {
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        } catch (reqError) {
           console.warn("requestPermissionsAsync failed:", reqError);
           // If request failed, we stick with existingStatus (likely undetermined/denied)
        }
      }
      return finalStatus === 'granted';
    } catch (error) {
      console.warn("Notification permission check error:", error);
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
      // FIX: Use explicit string 'date' instead of enum to avoid potential undefined issues
      // if import is weird or version mismatch.
      // Also ensure date is a Date object.
      const trigger: Notifications.DateTriggerInput = {
        type: 'date', // Hardcoded string as per docs for SchedulableTriggerInputTypes.DATE
        date: scheduledTime,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { speakBody: body },
        },
        trigger,
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
