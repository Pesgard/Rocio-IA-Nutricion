import { useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import type { SensorData } from '../types';

export function useSensors() {
  const { 
    userId, 
    sensorData, 
    sensorHistory, 
    setSensorData 
  } = useStore();

  const intervalRef = useRef<number | null>(null);

  // Send sensor data to backend
  const sendSensorData = useCallback(async (data: Omit<SensorData, 'user_id'>): Promise<boolean> => {
    try {
      const sensorPayload: SensorData = {
        user_id: userId,
        ...data,
      };

      await axios.post(API_ENDPOINTS.sensors, sensorPayload, API_CONFIG);
      setSensorData(sensorPayload);
      
      return true;
    } catch (error) {
      console.error('Error sending sensor data:', error);
      return false;
    }
  }, [userId, setSensorData]);

  // Simulate sensor readings (for demo purposes)
  const simulateSensorReading = useCallback(() => {
    // Generate realistic sensor values with some variation
    const baseOxygen = 96;
    const baseHeartRate = 72;
    const baseTemperature = 22;

    const data: Omit<SensorData, 'user_id'> = {
      oxygen_level: Math.round(baseOxygen + (Math.random() - 0.5) * 4), // 94-98
      heart_rate: Math.round(baseHeartRate + (Math.random() - 0.5) * 20), // 62-82
      temperature: Math.round((baseTemperature + (Math.random() - 0.5) * 10) * 10) / 10, // 17-27
    };

    return data;
  }, []);

  // Start automatic sensor simulation
  const startSimulation = useCallback((intervalMs: number = 5000) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Send initial reading
    const initialData = simulateSensorReading();
    sendSensorData(initialData);

    // Set up interval for continuous readings
    intervalRef.current = window.setInterval(() => {
      const data = simulateSensorReading();
      sendSensorData(data);
    }, intervalMs);
  }, [simulateSensorReading, sendSensorData]);

  // Stop sensor simulation
  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Manually update sensors with custom values
  const updateSensors = useCallback(async (
    oxygen: number,
    heartRate: number,
    temperature: number
  ) => {
    return sendSensorData({
      oxygen_level: oxygen,
      heart_rate: heartRate,
      temperature: temperature,
    });
  }, [sendSensorData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Calculate health status based on sensor data
  const getHealthStatus = useCallback(() => {
    if (!sensorData) return { state: 'unknown', weather: 'unknown' };

    const state = sensorData.oxygen_level < 94 ? 'low_oxygen' : 'normal';
    const weather = sensorData.temperature < 20 ? 'cold' : 'hot';

    return { state, weather };
  }, [sensorData]);

  // Get chart-ready data
  const getChartData = useCallback(() => {
    return sensorHistory.map((reading, index) => ({
      time: new Date(reading.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      oxygen: reading.oxygen_level,
      heartRate: reading.heart_rate,
      temperature: reading.temperature,
      index,
    }));
  }, [sensorHistory]);

  return {
    sensorData,
    sensorHistory,
    sendSensorData,
    updateSensors,
    startSimulation,
    stopSimulation,
    getHealthStatus,
    getChartData,
    simulateSensorReading,
  };
}
