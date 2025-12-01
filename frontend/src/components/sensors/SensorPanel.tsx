import { memo, useState, useCallback, useEffect } from 'react';
import { FiHeart, FiThermometer, FiPlay, FiPause, FiRefreshCw } from 'react-icons/fi';
import { TbLungs } from 'react-icons/tb';
import clsx from 'clsx';
import { useSensors } from '../../hooks/useSensors';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  color: 'primary' | 'accent' | 'danger' | 'info';
  status?: 'normal' | 'warning' | 'critical';
}

const colorClasses = {
  primary: {
    bg: 'bg-gradient-to-br from-primary-100 to-primary-200',
    icon: 'text-primary-600',
    value: 'text-primary-700',
  },
  accent: {
    bg: 'bg-gradient-to-br from-accent-100 to-accent-200',
    icon: 'text-accent-600',
    value: 'text-accent-700',
  },
  danger: {
    bg: 'bg-gradient-to-br from-red-100 to-red-200',
    icon: 'text-red-600',
    value: 'text-red-700',
  },
  info: {
    bg: 'bg-gradient-to-br from-blue-100 to-blue-200',
    icon: 'text-blue-600',
    value: 'text-blue-700',
  },
};

const StatCard = memo(function StatCard({ icon, label, value, unit, color, status }: StatCardProps) {
  const classes = colorClasses[color];
  
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', classes.bg)}>
          <span className={classes.icon}>{icon}</span>
        </div>
        {status && (
          <span
            className={clsx(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              status === 'normal' && 'bg-green-100 text-green-700',
              status === 'warning' && 'bg-amber-100 text-amber-700',
              status === 'critical' && 'bg-red-100 text-red-700'
            )}
          >
            {status === 'normal' ? 'Normal' : status === 'warning' ? 'Atención' : 'Crítico'}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-surface-500">{label}</p>
        <p className={clsx('text-2xl font-bold', classes.value)}>
          {value}
          <span className="text-sm font-normal text-surface-400 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
});

interface SensorPanelProps {
  className?: string;
}

export const SensorPanel = memo(function SensorPanel({ className }: SensorPanelProps) {
  const {
    sensorData,
    updateSensors,
    startSimulation,
    stopSimulation,
    getHealthStatus,
    simulateSensorReading,
  } = useSensors();

  const [isSimulating, setIsSimulating] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualValues, setManualValues] = useState({
    oxygen: sensorData?.oxygen_level ?? 96,
    heartRate: sensorData?.heart_rate ?? 72,
    temperature: sensorData?.temperature ?? 22,
  });

  // Update manual values when sensor data changes
  useEffect(() => {
    if (sensorData && !manualMode) {
      setManualValues({
        oxygen: sensorData.oxygen_level,
        heartRate: sensorData.heart_rate,
        temperature: sensorData.temperature,
      });
    }
  }, [sensorData, manualMode]);

  // Get health status
  const { state, weather } = getHealthStatus();

  // Toggle simulation
  const handleToggleSimulation = useCallback(() => {
    if (isSimulating) {
      stopSimulation();
      setIsSimulating(false);
    } else {
      startSimulation(5000);
      setIsSimulating(true);
    }
  }, [isSimulating, startSimulation, stopSimulation]);

  // Manual update
  const handleManualUpdate = useCallback(async () => {
    await updateSensors(
      manualValues.oxygen,
      manualValues.heartRate,
      manualValues.temperature
    );
    setManualMode(false);
  }, [manualValues, updateSensors]);

  // Single reading
  const handleSingleReading = useCallback(async () => {
    const data = simulateSensorReading();
    await updateSensors(data.oxygen_level, data.heart_rate, data.temperature);
  }, [simulateSensorReading, updateSensors]);

  // Get oxygen status
  const getOxygenStatus = (level: number) => {
    if (level >= 95) return 'normal';
    if (level >= 92) return 'warning';
    return 'critical';
  };

  // Get heart rate status
  const getHeartRateStatus = (rate: number) => {
    if (rate >= 60 && rate <= 100) return 'normal';
    if (rate >= 50 && rate <= 110) return 'warning';
    return 'critical';
  };

  return (
    <div className={clsx('card p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-surface-800">Sensores</h3>
          <p className="text-sm text-surface-500">
            Datos en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSingleReading}
            disabled={isSimulating}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              isSimulating
                ? 'bg-surface-100 text-surface-400 cursor-not-allowed'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            )}
            title="Lectura única"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleToggleSimulation}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              isSimulating
                ? 'bg-danger text-white hover:bg-red-600'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            )}
          >
            {isSimulating ? (
              <>
                <FiPause className="w-4 h-4" />
                <span>Detener</span>
              </>
            ) : (
              <>
                <FiPlay className="w-4 h-4" />
                <span>Simular</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status badges */}
      {sensorData && (
        <div className="flex gap-2 mb-6">
          <span
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium',
              state === 'normal'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            )}
          >
            Estado: {state === 'normal' ? 'Normal' : 'Bajo oxígeno'}
          </span>
          <span
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium',
              weather === 'hot'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-blue-100 text-blue-700'
            )}
          >
            Clima: {weather === 'hot' ? 'Caliente' : 'Frío'}
          </span>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<TbLungs className="w-6 h-6" />}
          label="Oxígeno en sangre"
          value={sensorData?.oxygen_level ?? '--'}
          unit="%"
          color="info"
          status={sensorData ? getOxygenStatus(sensorData.oxygen_level) : undefined}
        />
        <StatCard
          icon={<FiHeart className="w-6 h-6" />}
          label="Frecuencia cardíaca"
          value={sensorData?.heart_rate ?? '--'}
          unit="bpm"
          color="danger"
          status={sensorData ? getHeartRateStatus(sensorData.heart_rate) : undefined}
        />
        <StatCard
          icon={<FiThermometer className="w-6 h-6" />}
          label="Temperatura ambiente"
          value={sensorData?.temperature ?? '--'}
          unit="°C"
          color="accent"
        />
      </div>

      {/* Manual input section */}
      {manualMode && (
        <div className="mt-6 p-4 bg-surface-50 rounded-xl animate-slide-up">
          <h4 className="font-medium text-surface-700 mb-4">Valores manuales</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-surface-600 mb-1">Oxígeno (%)</label>
              <input
                type="number"
                value={manualValues.oxygen}
                onChange={(e) => setManualValues(v => ({ ...v, oxygen: Number(e.target.value) }))}
                min={80}
                max={100}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-surface-600 mb-1">Pulso (bpm)</label>
              <input
                type="number"
                value={manualValues.heartRate}
                onChange={(e) => setManualValues(v => ({ ...v, heartRate: Number(e.target.value) }))}
                min={40}
                max={200}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-surface-600 mb-1">Temp (°C)</label>
              <input
                type="number"
                value={manualValues.temperature}
                onChange={(e) => setManualValues(v => ({ ...v, temperature: Number(e.target.value) }))}
                min={-10}
                max={50}
                className="input"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleManualUpdate}
              className="btn btn-primary"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setManualMode(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Manual mode toggle */}
      {!manualMode && (
        <button
          type="button"
          onClick={() => setManualMode(true)}
          className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Ingresar valores manualmente →
        </button>
      )}
    </div>
  );
});

