import { useState, useRef, useEffect, useCallback, memo, type FormEvent } from 'react';
import { FiSend, FiTrash2, FiSettings } from 'react-icons/fi';
import { GiHealthNormal } from 'react-icons/gi';
import clsx from 'clsx';
import { useChat } from '../../hooks/useChat';
import { useStore } from '../../store/useStore';
import { MessageBubble } from './MessageBubble';
import { VoiceButton, TranscriptDisplay } from './VoiceButton';

interface ChatWindowProps {
  className?: string;
}

export const ChatWindow = memo(function ChatWindow({ className }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, resetChat } = useChat();
  const { prepTime, setPrepTime } = useStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
    inputRef.current?.focus();
  }, [inputValue, isLoading, sendMessage]);

  // Handle voice transcript
  const handleVoiceTranscript = useCallback(async (text: string) => {
    if (text.trim()) {
      await sendMessage(text);
    }
  }, [sendMessage]);

  // Handle prep time change
  const handlePrepTimeChange = useCallback((value: number) => {
    setPrepTime(value);
    setShowSettings(false);
  }, [setPrepTime]);

  return (
    <div className={clsx('flex flex-col h-full bg-white rounded-2xl shadow-elevated overflow-hidden', className)}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-surface-200 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <GiHealthNormal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">NutriBot</h2>
              <p className="text-primary-100 text-sm">Tu asistente de nutrición</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Settings button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Configuración"
              >
                <FiSettings className="w-5 h-5" />
              </button>
              
              {/* Settings dropdown */}
              {showSettings && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-elevated p-4 z-10 animate-slide-up">
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Tiempo de preparación
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[15, 30, 45, 60].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handlePrepTimeChange(time)}
                        className={clsx(
                          'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                          prepTime === time
                            ? 'bg-primary-500 text-white'
                            : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                        )}
                      >
                        {time} min
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clear chat button */}
            <button
              type="button"
              onClick={resetChat}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Limpiar chat"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-4">
              <GiHealthNormal className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-800 mb-2">
              ¡Hola! Soy NutriBot 👋
            </h3>
            <p className="text-surface-500 max-w-sm">
              Estoy aquí para ayudarte con recomendaciones de comida personalizadas. 
              Primero, asegúrate de enviar tus datos de sensores y luego pregúntame qué deberías comer.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {['Hola', 'Ayuda', '¿Qué debería comer?'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="px-4 py-2 rounded-full bg-surface-100 text-surface-700 text-sm hover:bg-surface-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center flex-shrink-0">
                  <GiHealthNormal className="w-4 h-4 text-white" />
                </div>
                <div className="chat-bubble chat-bubble-agent">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 p-4 border-t border-surface-200 bg-surface-50 relative">
        <TranscriptDisplay />
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <VoiceButton onTranscript={handleVoiceTranscript} disabled={isLoading} />
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className="input pr-12"
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={clsx(
              'p-3 rounded-xl transition-all duration-200',
              inputValue.trim() && !isLoading
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:shadow-glow-primary hover:scale-105'
                : 'bg-surface-200 text-surface-400 cursor-not-allowed'
            )}
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
});

