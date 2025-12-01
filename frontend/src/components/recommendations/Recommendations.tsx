import { memo, useState } from 'react';
import { FiZap } from 'react-icons/fi';
import { GiMeal, GiBroccoli, GiMeat } from 'react-icons/gi';
import clsx from 'clsx';
import { useRecommendations } from '../../store/useStore';
import { NutrientChart } from '../sensors/SensorChart';
import { FoodDetailModal } from './FoodDetailModal';
import type { FoodRecommendation } from '../../types';

interface RecommendationCardProps {
  recommendation: FoodRecommendation;
  index: number;
}

const RecommendationCard = memo(function RecommendationCard({ 
  recommendation, 
  index,
  onClick,
}: RecommendationCardProps & { onClick: () => void }) {
  const nutrients = recommendation.info?.nutrientes;
  
  // Get icon based on food type
  const getIcon = () => {
    const name = recommendation.comida.toLowerCase();
    if (name.includes('soup') || name.includes('sopa')) return <GiBroccoli className="w-6 h-6" />;
    if (name.includes('meat') || name.includes('beef') || name.includes('chicken')) 
      return <GiMeat className="w-6 h-6" />;
    return <GiMeal className="w-6 h-6" />;
  };

  return (
    <div 
      className="recommendation-card animate-slide-up cursor-pointer hover:shadow-lg transition-shadow"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-surface-800 text-lg">
                {recommendation.display_name}
              </h4>
              {index === 0 && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-medium">
                  ⭐ Recomendado
                </span>
              )}
            </div>
          </div>

          {/* Nutrient highlights */}
          {nutrients && (
            <div className="mt-3 flex flex-wrap gap-3">
              {nutrients.Energy !== undefined && (
                <div className="flex items-center gap-1.5 text-sm">
                  <FiZap className="w-4 h-4 text-accent-500" />
                  <span className="text-surface-600">{nutrients.Energy} kcal</span>
                </div>
              )}
              {nutrients.Protein !== undefined && (
                <div className="flex items-center gap-1.5 text-sm">
                  <GiMeat className="w-4 h-4 text-primary-500" />
                  <span className="text-surface-600">{nutrients.Protein}g proteína</span>
                </div>
              )}
              {nutrients.Carbohydrate !== undefined && (
                <div className="flex items-center gap-1.5 text-sm">
                  <GiBroccoli className="w-4 h-4 text-amber-500" />
                  <span className="text-surface-600">{nutrients.Carbohydrate}g carbos</span>
                </div>
              )}
            </div>
          )}

          {/* Nutrient chart */}
          {recommendation.info && (
            <div className="mt-4">
              <NutrientChart recommendation={recommendation} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

interface RecommendationsProps {
  className?: string;
}

export const Recommendations = memo(function Recommendations({ className }: RecommendationsProps) {
  const recommendations = useRecommendations();
  const [selectedFood, setSelectedFood] = useState<FoodRecommendation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFoodClick = (recommendation: FoodRecommendation) => {
    setSelectedFood(recommendation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFood(null);
  };

  if (recommendations.length === 0) {
    return (
      <div className={clsx('card p-6', className)}>
        <h3 className="text-lg font-semibold text-surface-800 mb-4">
          Recomendaciones
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-surface-100 flex items-center justify-center mb-4">
            <GiMeal className="w-8 h-8 text-surface-400" />
          </div>
          <p className="text-surface-500">
            Aún no hay recomendaciones.
          </p>
          <p className="text-sm text-surface-400 mt-1">
            Envía tus datos de sensores y pregúntame qué deberías comer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('card p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-surface-800">
            Recomendaciones
          </h3>
          <p className="text-sm text-surface-500">
            Basadas en tu estado de salud
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
          {recommendations.length} opciones
        </span>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <RecommendationCard 
            key={`${rec.comida}-${index}`} 
            recommendation={rec}
            index={index}
            onClick={() => handleFoodClick(rec)}
          />
        ))}
      </div>

      {/* Food Detail Modal */}
      <FoodDetailModal
        recommendation={selectedFood}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
});

