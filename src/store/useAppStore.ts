import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  id: string;
  title: string;
  body: string;
  time: string; // Display time
  timestamp: number; // For sorting
}

interface AppState {
  tasks: Task[];
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task].sort((a, b) => a.timestamp - b.timestamp)
      })),
      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
    }),
    {
      name: 'daybreak-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
