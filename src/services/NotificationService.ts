import * as Notifications from 'expo-notifications';
import { SpeechService } from './SpeechService';
import { Platform } from 'react-native';

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
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  },

  scheduleTask: async (title: string, body: string, hour: number, minute: number) => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If time is in the past, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Expo Notification trigger is strict about Date types in some versions
    const trigger = scheduledTime;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { speakBody: body },
      },
      trigger: trigger as unknown as Notifications.NotificationTriggerInput,
    });

    return scheduledTime;
  },

  setupListeners: () => {
    // Listener for when user interacts with notification
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
  }
};
