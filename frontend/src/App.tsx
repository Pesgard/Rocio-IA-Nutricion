import { useEffect } from 'react';
import { FiHeart, FiActivity, FiCpu } from 'react-icons/fi';
import { GiHealthNormal, GiMeal } from 'react-icons/gi';
import { ChatWindow, SensorPanel, SensorChart, Recommendations } from './components';
import { useSensors } from './hooks';
import { useStore } from './store/useStore';

function App() {
  const { stopSimulation, sensorData } = useSensors();
  const userId = useStore((state) => state.userId);

  // Auto-start sensor simulation on mount (optional - you can remove this)
  useEffect(() => {
    // Start with one reading when app loads
    // startSimulation(10000); // Uncomment to auto-simulate
    return () => stopSimulation();
  }, [stopSimulation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/30 to-surface-100">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <GiHealthNormal className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">NutriBot</h1>
                <p className="text-xs text-surface-500 -mt-0.5">Asistente de Nutrición IA</p>
              </div>
            </div>

            {/* Status indicators */}
            <div className="hidden sm:flex items-center gap-4">
              {/* Connection status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100">
                <span className={`w-2 h-2 rounded-full ${sensorData ? 'bg-green-500 animate-pulse' : 'bg-surface-400'}`}></span>
                <span className="text-sm text-surface-600">
                  {sensorData ? 'Sensores conectados' : 'Sin datos de sensores'}
                </span>
              </div>

              {/* User ID */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700">
                <FiCpu className="w-4 h-4" />
                <span className="text-sm font-medium truncate max-w-[120px]" title={userId}>
                  {userId.slice(0, 12)}...
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero section - Welcome */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-surface-800">
            ¡Bienvenido a <span className="text-gradient">NutriBot</span>! 👋
          </h2>
          <p className="mt-2 text-surface-500 max-w-2xl">
            Tu asistente personal de nutrición. Basado en tus datos de salud, te recomendaré 
            las mejores opciones de comida para ti.
          </p>
        </div>

        {/* Main grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Chat (takes more space) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <ChatWindow className="h-[600px] lg:h-[700px]" />
          </div>

          {/* Right column - Dashboard */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Sensor Panel */}
            <SensorPanel />

            {/* Sensor Chart */}
            <SensorChart />

            {/* Recommendations */}
            <Recommendations />
          </div>
        </div>

        {/* Quick tips section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4 flex items-start gap-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <FiActivity className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-800">Paso 1: Sensores</h3>
              <p className="text-sm text-surface-500 mt-1">
                Haz clic en "Simular" para generar datos de oxígeno, pulso y temperatura.
              </p>
            </div>
          </div>

          <div className="card p-4 flex items-start gap-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center flex-shrink-0">
              <FiHeart className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-800">Paso 2: Pregunta</h3>
              <p className="text-sm text-surface-500 mt-1">
                Pregúntame "¿Qué debería comer?" usando texto o el botón de voz.
              </p>
            </div>
          </div>

          <div className="card p-4 flex items-start gap-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <GiMeal className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-800">Paso 3: Recibe</h3>
              <p className="text-sm text-surface-500 mt-1">
                Te daré recomendaciones personalizadas basadas en tu estado de salud.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-surface-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-surface-500 text-sm">
              <GiHealthNormal className="w-5 h-5 text-primary-500" />
              <span>NutriBot - Proyecto de Nutrición con IA</span>
            </div>
            <div className="flex items-center gap-4 text-surface-400">
              <span className="text-sm">Hecho con ❤️ usando React + FastAPI + Prolog + Dialogflow</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
