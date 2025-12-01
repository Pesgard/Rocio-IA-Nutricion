import { memo } from 'react';
import { FiUser, FiCpu } from 'react-icons/fi';
import { GiMeal } from 'react-icons/gi';
import clsx from 'clsx';
import type { ChatMessage, FoodRecommendation } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

function RecommendationCard({ rec }: { rec: FoodRecommendation }) {
  const nutrients = rec.info?.nutrientes;
  
  return (
    <div className="recommendation-card mt-3 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white flex-shrink-0">
          <GiMeal className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-surface-800 text-sm">
            {rec.display_name}
          </h4>
          {nutrients && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {nutrients.Energy !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent-400"></span>
                  <span className="text-surface-600">{nutrients.Energy} kcal</span>
                </div>
              )}
              {nutrients.Protein !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary-400"></span>
                  <span className="text-surface-600">{nutrients.Protein}g proteína</span>
                </div>
              )}
              {nutrients.Carbohydrate !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-surface-600">{nutrients.Carbohydrate}g carbos</span>
                </div>
              )}
              {nutrients.Fat !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <span className="text-surface-600">{nutrients.Fat}g grasa</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={clsx(
        'flex gap-3 animate-slide-up',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
            : 'bg-gradient-to-br from-accent-400 to-accent-500 text-white'
        )}
      >
        {isUser ? <FiUser className="w-4 h-4" /> : <FiCpu className="w-4 h-4" />}
      </div>

      {/* Message content */}
      <div className={clsx('flex flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={clsx(
            'chat-bubble',
            isUser ? 'chat-bubble-user' : 'chat-bubble-agent'
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Recommendations */}
        {message.recommendations && message.recommendations.length > 0 && (
          <div className="w-full max-w-md mt-2 space-y-2">
            {message.recommendations.slice(0, 3).map((rec, index) => (
              <RecommendationCard key={`${rec.comida}-${index}`} rec={rec} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-surface-400 mt-1 px-2">
          {new Date(message.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
});


