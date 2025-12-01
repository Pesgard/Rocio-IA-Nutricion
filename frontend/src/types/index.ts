// ============================================
// 📝 TypeScript Types for NutriBot
// ============================================

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  intent?: string;
  recommendations?: FoodRecommendation[];
}

export interface ChatRequest {
  user_id: string;
  message: string;
  prep_time_available: number;
}

export interface ChatResponse {
  agent_response: string;
  intent: string;
  recommendations: FoodRecommendation[] | null;
}

// Food Recommendation Types
export interface FoodRecommendation {
  comida: string;
  display_name: string;
  info: FoodInfo | null;
}

export interface FoodInfo {
  nombre: string;
  fdcId?: number;
  nutrientes: NutrientInfo;
}

export interface NutrientInfo {
  Energy?: number;
  Protein?: number;
  Fat?: number;
  Carbohydrate?: number;
  Fiber?: number;
  Sugars?: number;
  Calcium?: number;
  Iron?: number;
  Sodium?: number;
  'Vitamin C'?: number;
  'Vitamin A'?: number;
  Cholesterol?: number;
  [key: string]: number | undefined;
}

// Sensor Types
export interface SensorData {
  user_id: string;
  oxygen_level: number;
  temperature: number;
  heart_rate: number;
  timestamp?: Date;
}

export interface SensorHistory {
  timestamp: Date;
  oxygen_level: number;
  temperature: number;
  heart_rate: number;
}

// User Types
export interface User {
  id: string;
  name?: string;
}

// App State Types
export interface AppState {
  // User
  userId: string;
  setUserId: (id: string) => void;
  
  // Chat
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  
  // Sensors
  sensorData: SensorData | null;
  sensorHistory: SensorHistory[];
  setSensorData: (data: SensorData) => void;
  addSensorHistory: (data: SensorHistory) => void;
  
  // Recommendations
  currentRecommendations: FoodRecommendation[];
  setRecommendations: (recs: FoodRecommendation[]) => void;
  
  // Settings
  prepTime: number;
  setPrepTime: (time: number) => void;
  
  // Voice
  isListening: boolean;
  setListening: (listening: boolean) => void;
}

// API Response Types
export interface ApiError {
  message: string;
  status?: number;
}

// Chart Data Types for Recharts
export interface ChartDataPoint {
  name: string;
  value: number;
  timestamp?: string;
}

export interface SensorChartData {
  time: string;
  oxygen: number;
  heartRate: number;
  temperature: number;
}


