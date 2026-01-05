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
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  }
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 40.7128, longitude: -74.0060 }
  })),
  getLastKnownPositionAsync: jest.fn(() => Promise.resolve(null)), // Mock failure first
}));

import { GeminiService } from '../services/GeminiService';
import { WeatherService } from '../services/WeatherService';
import { NotificationService } from '../services/NotificationService';

describe('DayBreak Logic Flow', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GeminiService Mock Mode returns valid structure', async () => {
    const result = await GeminiService.parseTaskRequest("Remind me to call Mom");
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('hour');
    expect(result).toHaveProperty('minute');
    expect(result).toHaveProperty('body');
  });

  test('WeatherService fetches (or mocks) data correctly', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      json: () => Promise.resolve({
        current_weather: { temperature: 25, weathercode: 0 }
      })
    })) as jest.Mock;

    const weather = await WeatherService.getWeather(10, 10);
    expect(weather.temperature).toBe(25);
    expect(weather.condition).toBe("Clear sky");
  });

  test('Notification scheduling logic uses correct trigger format', async () => {
    const title = "Test Task";
    const body = "Test Body";
    const now = new Date();
    const targetHour = (now.getHours() + 1) % 24;

    await NotificationService.scheduleTask(title, body, targetHour, 30);

    const expoNotifications = require('expo-notifications');
    expect(expoNotifications.scheduleNotificationAsync).toHaveBeenCalled();
    const callArgs = expoNotifications.scheduleNotificationAsync.mock.calls[0][0];

    expect(callArgs.content.title).toBe(title);
    expect(callArgs.content.body).toBe(body);

    // STRICT CHECK: Ensure trigger is NOT a Date, but an object with { type: 'date', date: ... }
    expect(callArgs.trigger).not.toBeInstanceOf(Date);
    expect(callArgs.trigger).toHaveProperty('type', 'date');
    expect(callArgs.trigger).toHaveProperty('date');
    expect(callArgs.trigger.date).toBeInstanceOf(Date);
  });
});
