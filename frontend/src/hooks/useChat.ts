import { useCallback } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import type { ChatRequest, ChatResponse, ChatMessage } from '../types';

export function useChat() {
  const { 
    userId, 
    messages, 
    isLoading, 
    prepTime,
    addMessage, 
    setLoading, 
    clearMessages,
    setRecommendations 
  } = useStore();

  const sendMessage = useCallback(async (messageText: string): Promise<ChatResponse | null> => {
    if (!messageText.trim() || isLoading) return null;

    setLoading(true);

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    try {
      const request: ChatRequest = {
        user_id: userId,
        message: messageText,
        prep_time_available: prepTime,
      };

      const response = await axios.post<ChatResponse>(
        API_ENDPOINTS.chat, 
        request,
        API_CONFIG
      );
      const data = response.data;

      // Add agent response
      const agentMessage: ChatMessage = {
        id: `msg_${Date.now()}_agent`,
        role: 'agent',
        content: data.agent_response,
        timestamp: new Date(),
        intent: data.intent,
        recommendations: data.recommendations ?? undefined,
      };
      addMessage(agentMessage);

      // Update recommendations if present
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'agent',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, prepTime, isLoading, addMessage, setLoading, setRecommendations]);

  const resetChat = useCallback(() => {
    clearMessages();
    setRecommendations([]);
  }, [clearMessages, setRecommendations]);

  return {
    messages,
    isLoading,
    sendMessage,
    resetChat,
  };
}
