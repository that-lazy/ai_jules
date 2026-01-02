import React, { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import { format } from 'date-fns';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { MorningCard } from '../components/MorningCard';
import { SmartInput } from '../components/SmartInput';
import { TaskList } from '../components/TaskList';

import { WeatherService } from '../services/WeatherService';
import { GeminiService } from '../services/GeminiService';
import { SpeechService } from '../services/SpeechService';
import { NotificationService } from '../services/NotificationService';
import { useAppStore } from '../store/useAppStore';

export default function App() {
  const [loadingMorning, setLoadingMorning] = useState(false);
  const [processingTask, setProcessingTask] = useState(false);
  const [weather, setWeather] = useState<{ temp: number, condition: string } | undefined>(undefined);

  const { tasks, addTask, removeTask } = useAppStore();

  useEffect(() => {
    // Startup permissions
    (async () => {
      await NotificationService.requestPermissions();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location is needed for weather updates.');
      }
    })();

    // Notification listener setup
    const cleanup = NotificationService.setupListeners();
    return cleanup;
  }, []);

  const handleMorningBriefing = async () => {
    if (loadingMorning) return;
    setLoadingMorning(true);

    try {
      // Step A: Location
      let location = await Location.getCurrentPositionAsync({});
      // Fallback if needed, but getCurrentPositionAsync usually throws or waits

      // Step B: Weather
      const weatherData = await WeatherService.getWeather(
        location.coords.latitude,
        location.coords.longitude
      );
      setWeather({ temp: weatherData.temperature, condition: weatherData.condition });

      // Step C: Gemini Briefing
      const briefing = await GeminiService.getMorningBriefing(
        weatherData.temperature,
        weatherData.condition,
        format(new Date(), 'yyyy-MM-dd')
      );

      // Step D: Speak
      SpeechService.speak(briefing);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not complete morning briefing.");
    } finally {
      setLoadingMorning(false);
    }
  };

  const handleSmartPlan = async (text: string) => {
    setProcessingTask(true);
    try {
      // Analyze with Gemini
      const taskData = await GeminiService.parseTaskRequest(text);

      if (!taskData) {
        Alert.alert("Jarvis", "I couldn't understand that request.");
        return;
      }

      // Schedule Notification
      const scheduledTime = await NotificationService.scheduleTask(
        taskData.title,
        taskData.body,
        taskData.hour,
        taskData.minute
      );

      // Add to Store
      addTask({
        id: Date.now().toString(),
        title: taskData.title,
        body: taskData.body,
        time: format(scheduledTime, 'HH:mm'),
        timestamp: scheduledTime.getTime(),
      });

      Alert.alert("Scheduled", `Task "${taskData.title}" set for ${format(scheduledTime, 'HH:mm')}`);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to schedule task.");
    } finally {
      setProcessingTask(false);
    }
  };

  return (
    <ScreenWrapper>
      <MorningCard
        onPress={handleMorningBriefing}
        isLoading={loadingMorning}
        weatherCondition={weather?.condition}
        temperature={weather?.temp}
      />

      <SmartInput
        onSend={handleSmartPlan}
        isProcessing={processingTask}
      />

      <TaskList
        tasks={tasks}
        onDelete={removeTask}
      />
    </ScreenWrapper>
  );
}
