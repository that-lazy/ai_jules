// Mock modules that are not available in Node environment
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 40.7128, longitude: -74.0060 }
  })),
}));

import { GeminiService } from '../services/GeminiService';
import { WeatherService } from '../services/WeatherService';
import { NotificationService } from '../services/NotificationService';

describe('DayBreak Logic Flow', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GeminiService Mock Mode returns valid structure', async () => {
    // Ensure we are in mock mode (default if no key)
    const result = await GeminiService.parseTaskRequest("Remind me to call Mom");
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('hour');
    expect(result).toHaveProperty('minute');
    expect(result).toHaveProperty('body');
  });

  test('WeatherService fetches (or mocks) data correctly', async () => {
    // We can mock fetch global if needed, but the service has a try/catch fallback
    global.fetch = jest.fn(() => Promise.resolve({
      json: () => Promise.resolve({
        current_weather: { temperature: 25, weathercode: 0 }
      })
    })) as jest.Mock;

    const weather = await WeatherService.getWeather(10, 10);
    expect(weather.temperature).toBe(25);
    expect(weather.condition).toBe("Clear sky");
  });

  test('Notification scheduling logic calculates future time', async () => {
    const title = "Test Task";
    const body = "Test Body";
    const now = new Date();
    const targetHour = (now.getHours() + 1) % 24;

    // This is an async call to the wrapped expo-notifications
    await NotificationService.scheduleTask(title, body, targetHour, 30);

    const expoNotifications = require('expo-notifications');
    expect(expoNotifications.scheduleNotificationAsync).toHaveBeenCalled();
    const callArgs = expoNotifications.scheduleNotificationAsync.mock.calls[0][0];

    expect(callArgs.content.title).toBe(title);
    expect(callArgs.content.body).toBe(body);
    expect(callArgs.trigger).toBeInstanceOf(Date);
  });
});
