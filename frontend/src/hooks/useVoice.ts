import { useCallback, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useStore } from '../store/useStore';

export function useVoice() {
  const { setListening } = useStore();
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  // Sync listening state with store
  useEffect(() => {
    setListening(listening);
  }, [listening, setListening]);

  // Start listening
  const startListening = useCallback(() => {
    resetTranscript();
    SpeechRecognition.startListening({ 
      language: 'es-ES',
      continuous: false,
    });
  }, [resetTranscript]);

  // Stop listening
  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    resetTranscript();
  }, [resetTranscript]);

  return {
    transcript,
    isListening: listening,
    isSupported: browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
  };
}

