import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, ChatMessage, SensorData, SensorHistory, FoodRecommendation } from '../types';

// Generate unique user ID
const generateUserId = () => `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // User State
      userId: generateUserId(),
      setUserId: (id: string) => set({ userId: id }),

      // Chat State
      messages: [],
      isLoading: false,
      addMessage: (message: ChatMessage) => 
        set((state) => ({ 
          messages: [...state.messages, message] 
        })),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      clearMessages: () => set({ messages: [] }),

      // Sensor State
      sensorData: null,
      sensorHistory: [],
      setSensorData: (data: SensorData) => {
        const history: SensorHistory = {
          timestamp: new Date(),
          oxygen_level: data.oxygen_level,
          temperature: data.temperature,
          heart_rate: data.heart_rate,
        };
        set((state) => ({
          sensorData: data,
          sensorHistory: [...state.sensorHistory.slice(-29), history], // Keep last 30 readings
        }));
      },
      addSensorHistory: (data: SensorHistory) =>
        set((state) => ({
          sensorHistory: [...state.sensorHistory.slice(-29), data],
        })),

      // Recommendations State
      currentRecommendations: [],
      setRecommendations: (recs: FoodRecommendation[]) => 
        set({ currentRecommendations: recs }),

      // Settings State
      prepTime: 30,
      setPrepTime: (time: number) => set({ prepTime: time }),

      // Voice State
      isListening: false,
      setListening: (listening: boolean) => set({ isListening: listening }),
    }),
    {
      name: 'nutribot-storage',
      partialize: (state) => ({
        userId: state.userId,
        sensorHistory: state.sensorHistory,
        prepTime: state.prepTime,
      }),
    }
  )
);

// Selector hooks for better performance
export const useUserId = () => useStore((state) => state.userId);
export const useMessages = () => useStore((state) => state.messages);
export const useIsLoading = () => useStore((state) => state.isLoading);
export const useSensorData = () => useStore((state) => state.sensorData);
export const useSensorHistory = () => useStore((state) => state.sensorHistory);
export const useRecommendations = () => useStore((state) => state.currentRecommendations);
export const usePrepTime = () => useStore((state) => state.prepTime);
export const useIsListening = () => useStore((state) => state.isListening);

