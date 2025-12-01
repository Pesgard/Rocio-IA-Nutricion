import { memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useSensors } from '../../hooks/useSensors';
import clsx from 'clsx';

interface SensorChartProps {
  className?: string;
}

export const SensorChart = memo(function SensorChart({ className }: SensorChartProps) {
  const { getChartData, sensorHistory } = useSensors();
  const chartData = getChartData();

  if (sensorHistory.length < 2) {
    return (
      <div className={clsx('card p-6', className)}>
        <h3 className="text-lg font-semibold text-surface-800 mb-4">
          Historial de Sensores
        </h3>
        <div className="h-64 flex items-center justify-center text-surface-400">
          <p>Se necesitan al menos 2 lecturas para mostrar el gráfico</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('card p-6', className)}>
      <h3 className="text-lg font-semibold text-surface-800 mb-4">
        Historial de Sensores
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis 
              dataKey="time" 
              stroke="#78716c"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              yAxisId="left"
              stroke="#78716c"
              fontSize={12}
              tickLine={false}
              domain={[80, 100]}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#78716c"
              fontSize={12}
              tickLine={false}
              domain={[40, 120]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{ color: '#44403c', fontWeight: 600 }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="oxygen"
              name="Oxígeno (%)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="heartRate"
              name="Pulso (bpm)"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

// Nutrient pie chart for recommendations
import {
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { FoodRecommendation } from '../../types';

interface NutrientChartProps {
  recommendation: FoodRecommendation;
  className?: string;
}

const COLORS = ['#10b981', '#f97316', '#3b82f6', '#ef4444'];

export const NutrientChart = memo(function NutrientChart({ recommendation, className }: NutrientChartProps) {
  const nutrients = recommendation.info?.nutrientes;
  
  if (!nutrients) return null;

  const data = [
    { name: 'Proteína', value: nutrients.Protein || 0 },
    { name: 'Carbos', value: nutrients.Carbohydrate || 0 },
    { name: 'Grasa', value: nutrients.Fat || 0 },
    { name: 'Fibra', value: nutrients.Fiber || 0 },
  ].filter(d => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className={clsx('flex items-center gap-4', className)}>
      <div className="w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={40}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-surface-600">{item.name}: {item.value}g</span>
          </div>
        ))}
      </div>
    </div>
  );
});


