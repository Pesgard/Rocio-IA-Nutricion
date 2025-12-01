import { memo, useEffect, useState } from 'react';
import { FiX, FiZap, FiInfo } from 'react-icons/fi';
import { GiMeat, GiBroccoli } from 'react-icons/gi';
import axios from 'axios';
import clsx from 'clsx';
import { API_ENDPOINTS, API_CONFIG } from '../../config/api';
import type { FoodRecommendation } from '../../types';

interface FoodDetailModalProps {
  recommendation: FoodRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FoodDetails {
  fdcId: number;
  description: string;
  brandOwner?: string;
  ingredients?: string;
  publicationDate?: string;
  nutrientes: Record<string, { amount: number; unit: string; value: string }>;
  error?: string;
}

export const FoodDetailModal = memo(function FoodDetailModal({
  recommendation,
  isOpen,
  onClose,
}: FoodDetailModalProps) {
  const [details, setDetails] = useState<FoodDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && recommendation?.info?.fdcId) {
      fetchFoodDetails(recommendation.info.fdcId);
    } else {
      setDetails(null);
      setError(null);
    }
  }, [isOpen, recommendation]);

  const fetchFoodDetails = async (fdcId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<FoodDetails>(
        API_ENDPOINTS.foodDetails(fdcId),
        API_CONFIG
      );
      setDetails(response.data);
    } catch (err) {
      console.error('Error fetching food details:', err);
      setError('No se pudieron cargar los detalles del alimento');
      // Usar datos básicos si están disponibles
      if (recommendation?.info) {
        setDetails({
          fdcId: recommendation.info.fdcId || 0,
          description: recommendation.info.nombre || recommendation.display_name,
          nutrientes: Object.entries(recommendation.info.nutrientes || {}).reduce(
            (acc, [key, value]) => {
              if (typeof value === 'string') {
                const match = value.match(/^([\d.]+)\s*(.*)$/);
                if (match) {
                  acc[key] = {
                    amount: parseFloat(match[1]),
                    unit: match[2] || '',
                    value: value,
                  };
                } else {
                  acc[key] = { amount: 0, unit: '', value: value };
                }
              }
              return acc;
            },
            {} as Record<string, { amount: number; unit: string; value: string }>
          ),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayName = recommendation?.display_name || details?.description || 'Alimento';
  const nutrients = details?.nutrientes || {};

  // Categorizar nutrientes
  const macronutrients = ['Energy', 'Protein', 'Total lipid (fat)', 'Carbohydrate, by difference', 'Fiber, total dietary'];
  const vitamins = Object.keys(nutrients).filter(k => k.toLowerCase().includes('vitamin'));
  const minerals = ['Calcium, Ca', 'Iron, Fe', 'Potassium, K', 'Sodium, Na', 'Magnesium, Mg', 'Phosphorus, P', 'Zinc, Zn'];
  const other = Object.keys(nutrients).filter(
    k => !macronutrients.includes(k) && !vitamins.includes(k) && !minerals.includes(k)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-elevated max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-surface-200 bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <GiBroccoli className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white text-lg">{displayName}</h2>
                <p className="text-primary-100 text-sm">Información nutricional completa</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
                <p className="text-surface-500">Cargando detalles...</p>
              </div>
            </div>
          ) : error && !details ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <>
              {/* Información básica */}
              {details && (
                <div className="mb-6 p-4 bg-surface-50 rounded-xl">
                  {details.brandOwner && (
                    <p className="text-sm text-surface-600">
                      <span className="font-medium">Marca:</span> {details.brandOwner}
                    </p>
                  )}
                  {details.publicationDate && (
                    <p className="text-sm text-surface-600 mt-1">
                      <span className="font-medium">Fecha de publicación:</span>{' '}
                      {new Date(details.publicationDate).toLocaleDateString('es-ES')}
                    </p>
                  )}
                  {details.ingredients && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-surface-700 mb-1">Ingredientes:</p>
                      <p className="text-sm text-surface-600">{details.ingredients}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Macronutrientes */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-surface-800 mb-4 flex items-center gap-2">
                  <FiZap className="w-5 h-5 text-accent-500" />
                  Macronutrientes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {macronutrients.map((nutrient) => {
                    const nutrientData = nutrients[nutrient];
                    if (!nutrientData) return null;
                    return (
                      <div
                        key={nutrient}
                        className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl"
                      >
                        <p className="text-sm font-medium text-surface-700 mb-1">
                          {nutrient === 'Energy' ? 'Energía' :
                           nutrient === 'Protein' ? 'Proteína' :
                           nutrient === 'Total lipid (fat)' ? 'Grasas' :
                           nutrient === 'Carbohydrate, by difference' ? 'Carbohidratos' :
                           nutrient === 'Fiber, total dietary' ? 'Fibra' : nutrient}
                        </p>
                        <p className="text-2xl font-bold text-primary-700">
                          {nutrientData.amount.toFixed(1)}
                          <span className="text-sm font-normal ml-1">{nutrientData.unit}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vitaminas */}
              {vitamins.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-surface-800 mb-4 flex items-center gap-2">
                    <GiBroccoli className="w-5 h-5 text-green-500" />
                    Vitaminas
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {vitamins.map((vitamin) => {
                      const vitaminData = nutrients[vitamin];
                      if (!vitaminData) return null;
                      return (
                        <div
                          key={vitamin}
                          className="p-3 bg-green-50 rounded-lg border border-green-100"
                        >
                          <p className="text-sm font-medium text-surface-700 mb-1">{vitamin}</p>
                          <p className="text-lg font-semibold text-green-700">
                            {vitaminData.amount.toFixed(1)} {vitaminData.unit}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Minerales */}
              {minerals.some(m => nutrients[m]) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-surface-800 mb-4 flex items-center gap-2">
                    <GiMeat className="w-5 h-5 text-amber-500" />
                    Minerales
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {minerals.map((mineral) => {
                      const mineralData = nutrients[mineral];
                      if (!mineralData) return null;
                      return (
                        <div
                          key={mineral}
                          className="p-3 bg-amber-50 rounded-lg border border-amber-100"
                        >
                          <p className="text-sm font-medium text-surface-700 mb-1">
                            {mineral === 'Calcium, Ca' ? 'Calcio' :
                             mineral === 'Iron, Fe' ? 'Hierro' :
                             mineral === 'Potassium, K' ? 'Potasio' :
                             mineral === 'Sodium, Na' ? 'Sodio' :
                             mineral === 'Magnesium, Mg' ? 'Magnesio' :
                             mineral === 'Phosphorus, P' ? 'Fósforo' :
                             mineral === 'Zinc, Zn' ? 'Zinc' : mineral}
                          </p>
                          <p className="text-lg font-semibold text-amber-700">
                            {mineralData.amount.toFixed(1)} {mineralData.unit}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Otros nutrientes */}
              {other.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-surface-800 mb-4 flex items-center gap-2">
                    <FiInfo className="w-5 h-5 text-blue-500" />
                    Otros nutrientes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {other.map((nutrient) => {
                      const nutrientData = nutrients[nutrient];
                      if (!nutrientData) return null;
                      return (
                        <div
                          key={nutrient}
                          className="p-3 bg-blue-50 rounded-lg border border-blue-100"
                        >
                          <p className="text-sm font-medium text-surface-700 mb-1">{nutrient}</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {nutrientData.amount.toFixed(1)} {nutrientData.unit}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {Object.keys(nutrients).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-surface-500">No hay información nutricional disponible</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-surface-200 bg-surface-50">
          <button
            onClick={onClose}
            className="w-full btn btn-primary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
});

