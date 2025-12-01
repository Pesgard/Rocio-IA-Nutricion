import { memo, useEffect, useCallback } from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi';
import clsx from 'clsx';
import { useVoice } from '../../hooks/useVoice';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceButton = memo(function VoiceButton({ 
  onTranscript, 
  disabled = false 
}: VoiceButtonProps) {
  const {
    transcript,
    isListening,
    isSupported,
    toggleListening,
    clearTranscript,
  } = useVoice();

  // Handle transcript completion
  const handleTranscriptComplete = useCallback(() => {
    if (transcript.trim() && !isListening) {
      onTranscript(transcript.trim());
      clearTranscript();
    }
  }, [transcript, isListening, onTranscript, clearTranscript]);

  // When listening stops and we have a transcript, send it
  useEffect(() => {
    handleTranscriptComplete();
  }, [isListening, handleTranscriptComplete]);

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        className="p-3 rounded-full bg-surface-200 text-surface-400 cursor-not-allowed"
        title="Tu navegador no soporta reconocimiento de voz"
      >
        <FiMicOff className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={clsx(
        'relative p-3 rounded-full transition-all duration-300',
        isListening
          ? 'bg-gradient-to-br from-danger to-red-600 text-white shadow-glow-accent scale-110'
          : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:shadow-glow-primary hover:scale-105',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      title={isListening ? 'Detener grabación' : 'Iniciar grabación de voz'}
    >
      {/* Pulsing ring animation when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-danger animate-ping opacity-25"></span>
          <span className="absolute inset-0 rounded-full bg-danger animate-pulse opacity-50"></span>
        </>
      )}
      
      {isListening ? (
        <FiMic className="w-5 h-5 relative z-10" />
      ) : (
        <FiMic className="w-5 h-5" />
      )}
    </button>
  );
});

// Transcript display component
export const TranscriptDisplay = memo(function TranscriptDisplay() {
  const { transcript, isListening } = useVoice();

  if (!isListening && !transcript) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 px-4">
      <div className="glass rounded-xl p-3 border border-surface-200 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" style={{ animationDelay: '0.4s' }}></span>
          </div>
          <span className="text-sm text-surface-600">
            {transcript || 'Escuchando...'}
          </span>
        </div>
      </div>
    </div>
  );
});


