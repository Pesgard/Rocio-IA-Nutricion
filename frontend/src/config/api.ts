// API Configuration
// En desarrollo usamos el proxy de Vite (string vacío)
// En producción usamos la URL completa del .env

const isDev = import.meta.env.DEV;

// En desarrollo, Vite proxy maneja las peticiones
// En producción, usamos la URL del .env
export const API_BASE_URL = isDev ? '' : (import.meta.env.VITE_API_URL || '');

// Endpoints
export const API_ENDPOINTS = {
  chat: `${API_BASE_URL}/api/chat`,
  sensors: `${API_BASE_URL}/sensors`,
  recommendFood: (userId: string) => `${API_BASE_URL}/recommend_food/${userId}`,
  foodDetails: (fdcId: number) => `${API_BASE_URL}/api/food/${fdcId}`,
  adminReloadFoods: `${API_BASE_URL}/admin/reload-foods`,
  adminFoodStats: `${API_BASE_URL}/admin/food-stats`,
} as const;

// Axios config
export const API_CONFIG = {
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
};

