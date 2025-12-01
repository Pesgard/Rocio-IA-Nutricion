"""
Integración real con Google Dialogflow CX/ES.

Este módulo maneja la comunicación con Dialogflow para:
- Detección de intenciones
- Extracción de entidades
- Gestión de sesiones
- Respuestas del agente
"""

import os
from typing import Optional, Dict, Any, List
from google.cloud import dialogflow_v2beta1 as dialogflow
from google.api_core import exceptions as google_exceptions
import logging

logger = logging.getLogger(__name__)


class DialogflowClient:
    """
    Cliente para interactuar con Dialogflow.
    
    Requiere:
    - GOOGLE_APPLICATION_CREDENTIALS: Ruta al archivo JSON de credenciales
    - DIALOGFLOW_PROJECT_ID: ID del proyecto de Google Cloud
    - DIALOGFLOW_LOCATION: Ubicación del agente (default: global)
    - DIALOGFLOW_AGENT_ID: ID del agente (para Dialogflow CX) o None para ES
    """
    
    def __init__(
        self,
        project_id: Optional[str] = None,
        location: str = "global",
        agent_id: Optional[str] = None,
        language_code: str = "es"
    ):
        """
        Inicializa el cliente de Dialogflow.
        
        Args:
            project_id: ID del proyecto de Google Cloud (o desde env)
            location: Ubicación del agente (global, us-central1, etc.)
            agent_id: ID del agente (para Dialogflow CX, opcional)
            language_code: Código de idioma (es, en, etc.)
        """
        self.project_id = project_id or os.getenv("DIALOGFLOW_PROJECT_ID")
        self.location = location or os.getenv("DIALOGFLOW_LOCATION", "global")
        self.agent_id = agent_id or os.getenv("DIALOGFLOW_AGENT_ID")
        self.language_code = language_code
        
        if not self.project_id:
            raise ValueError(
                "DIALOGFLOW_PROJECT_ID debe estar configurado en variables de entorno"
            )
        
        # Verificar credenciales
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not credentials_path or not os.path.exists(credentials_path):
            logger.warning(
                "GOOGLE_APPLICATION_CREDENTIALS no configurado o archivo no encontrado. "
                "Dialogflow no funcionará sin credenciales válidas."
            )
        
        # Inicializar cliente según el tipo de agente
        if self.agent_id:
            # Dialogflow CX
            self.client = dialogflow.AgentsClient()
            self.session_client = dialogflow.SessionsClient()
            self.use_cx = True
        else:
            # Dialogflow ES (Enterprise Edition)
            self.session_client = dialogflow.SessionsClient()
            self.use_cx = False
    
    def _get_session_path(self, session_id: str) -> str:
        """
        Genera la ruta de sesión según el tipo de agente.
        
        Args:
            session_id: ID único de la sesión (típicamente user_id)
            
        Returns:
            Ruta de sesión formateada
        """
        if self.use_cx:
            # Dialogflow CX
            return self.session_client.session_path(
                project=self.project_id,
                location=self.location,
                agent=self.agent_id,
                session=session_id
            )
        else:
            # Dialogflow ES
            return self.session_client.session_path(
                project=self.project_id,
                session=session_id
            )
    
    def detect_intent(
        self,
        session_id: str,
        text: str,
        language_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Detecta la intención del usuario usando Dialogflow.
        
        Args:
            session_id: ID de sesión (típicamente user_id)
            text: Texto del usuario
            language_code: Código de idioma (opcional, usa el default si no se proporciona)
            
        Returns:
            Diccionario con:
            - intent: Nombre de la intención detectada
            - confidence: Nivel de confianza (0.0-1.0)
            - fulfillment_text: Texto de respuesta del agente
            - entities: Lista de entidades extraídas
            - parameters: Parámetros extraídos de la intención
            - raw_response: Respuesta completa de Dialogflow
        """
        if not text or not text.strip():
            return {
                "intent": "fallback",
                "confidence": 0.0,
                "fulfillment_text": "",
                "entities": [],
                "parameters": {},
                "raw_response": None
            }
        
        try:
            session_path = self._get_session_path(session_id)
            lang = language_code or self.language_code
            
            # Crear el texto de entrada
            text_input = dialogflow.TextInput(text=text, language_code=lang)
            query_input = dialogflow.QueryInput(text=text_input)
            
            # Detectar intención
            response = self.session_client.detect_intent(
                request={
                    "session": session_path,
                    "query_input": query_input
                }
            )
            
            # Extraer información de la respuesta
            intent_name = response.query_result.intent.display_name if response.query_result.intent else "fallback"
            confidence = response.query_result.intent_detection_confidence
            fulfillment_text = response.query_result.fulfillment_text
            
            # Extraer parámetros
            parameters = {}
            if response.query_result.parameters:
                for key, value in response.query_result.parameters.items():
                    if value:
                        parameters[key] = value
            
            # Extraer entidades
            entities = []
            if response.query_result.parameters:
                for param_name, param_value in response.query_result.parameters.items():
                    if param_value:
                        entities.append({
                            "name": param_name,
                            "value": param_value
                        })
            
            return {
                "intent": intent_name,
                "confidence": confidence,
                "fulfillment_text": fulfillment_text,
                "entities": entities,
                "parameters": parameters,
                "raw_response": response
            }
            
        except google_exceptions.GoogleAPIError as e:
            logger.error(f"Error de API de Google Dialogflow: {e}")
            # Fallback a detección básica
            return self._fallback_intent_detection(text)
            
        except Exception as e:
            logger.error(f"Error inesperado en Dialogflow: {e}")
            return self._fallback_intent_detection(text)
    
    def _fallback_intent_detection(self, text: str) -> Dict[str, Any]:
        """
        Detección básica de intención como fallback si Dialogflow falla.
        
        Args:
            text: Texto del usuario
            
        Returns:
            Diccionario con intención detectada básica
        """
        text_lower = text.lower()
        
        # Intenciones básicas
        if any(keyword in text_lower for keyword in [
            "recomienda", "recomendar", "comer", "almuerzo", "cena",
            "desayuno", "dieta", "comida", "qué comer", "que comer",
            "recomendación", "recomendame", "recomiéndame"
        ]):
            return {
                "intent": "recommendation.food",
                "confidence": 0.7,
                "fulfillment_text": "",
                "entities": [],
                "parameters": {},
                "raw_response": None
            }
        
        if any(keyword in text_lower for keyword in [
            "hola", "saludos", "hi", "hello", "buenos días", "buenas tardes",
            "buenas noches", "qué tal", "que tal"
        ]):
            return {
                "intent": "greeting",
                "confidence": 0.7,
                "fulfillment_text": "",
                "entities": [],
                "parameters": {},
                "raw_response": None
            }
        
        if any(keyword in text_lower for keyword in [
            "ayuda", "help", "cómo funciona", "que puedo hacer"
        ]):
            return {
                "intent": "help",
                "confidence": 0.7,
                "fulfillment_text": "",
                "entities": [],
                "parameters": {},
                "raw_response": None
            }
        
        return {
            "intent": "fallback",
            "confidence": 0.5,
            "fulfillment_text": "",
            "entities": [],
            "parameters": {},
            "raw_response": None
        }
    
    def get_intent_only(self, session_id: str, text: str) -> str:
        """
        Método de conveniencia que solo retorna el nombre de la intención.
        
        Args:
            session_id: ID de sesión
            text: Texto del usuario
            
        Returns:
            Nombre de la intención detectada
        """
        result = self.detect_intent(session_id, text)
        return result["intent"]


# Instancia global del cliente (se inicializa bajo demanda)
_dialogflow_client: Optional[DialogflowClient] = None


def get_dialogflow_client() -> Optional[DialogflowClient]:
    """
    Obtiene o crea la instancia global del cliente de Dialogflow.
    
    Returns:
        Instancia de DialogflowClient o None si no se puede inicializar
    """
    global _dialogflow_client
    
    if _dialogflow_client is None:
        try:
            _dialogflow_client = DialogflowClient()
            logger.info("Cliente de Dialogflow inicializado correctamente")
        except ValueError as e:
            logger.warning(f"Dialogflow no configurado correctamente: {e}. Usando fallback.")
            _dialogflow_client = None
        except Exception as e:
            logger.error(f"Error inicializando Dialogflow: {e}. Usando fallback.")
            _dialogflow_client = None
    
    return _dialogflow_client


def detect_intent(session_id: str, text: str) -> Dict[str, Any]:
    """
    Función de conveniencia para detectar intención.
    
    Args:
        session_id: ID de sesión (user_id)
        text: Texto del usuario
        
    Returns:
        Diccionario con resultado de detección de intención
    """
    client = get_dialogflow_client()
    if client is None:
        # Si no hay cliente, usar fallback estático
        logger.debug("Dialogflow no disponible, usando detección de intención básica")
        return _fallback_intent_detection_static(text)
    
    return client.detect_intent(session_id, text)


def _fallback_intent_detection_static(text: str) -> Dict[str, Any]:
    """
    Detección básica de intención como fallback estático.
    
    Args:
        text: Texto del usuario
        
    Returns:
        Diccionario con intención detectada básica
    """
    text_lower = text.lower()
    
    # Intenciones básicas
    if any(keyword in text_lower for keyword in [
        "recomienda", "recomendar", "comer", "almuerzo", "cena",
        "desayuno", "dieta", "comida", "qué comer", "que comer",
        "recomendación", "recomendame", "recomiéndame"
    ]):
        return {
            "intent": "recommendation.food",
            "confidence": 0.7,
            "fulfillment_text": "",
            "entities": [],
            "parameters": {},
            "raw_response": None
        }
    
    if any(keyword in text_lower for keyword in [
        "hola", "saludos", "hi", "hello", "buenos días", "buenas tardes",
        "buenas noches", "qué tal", "que tal"
    ]):
        return {
            "intent": "greeting",
            "confidence": 0.7,
            "fulfillment_text": "",
            "entities": [],
            "parameters": {},
            "raw_response": None
        }
    
    if any(keyword in text_lower for keyword in [
        "ayuda", "help", "cómo funciona", "que puedo hacer"
    ]):
        return {
            "intent": "help",
            "confidence": 0.7,
            "fulfillment_text": "",
            "entities": [],
            "parameters": {},
            "raw_response": None
        }
    
    return {
        "intent": "fallback",
        "confidence": 0.5,
        "fulfillment_text": "",
        "entities": [],
        "parameters": {},
        "raw_response": None
    }

