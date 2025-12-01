from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from food_api.food_api import search_food, get_food_details
from prolog.prolog_engine import PrologEngine
from dialogflow_integration import detect_intent, get_dialogflow_client
from dotenv import load_dotenv
import logging

# Cargar variables de entorno desde .env
load_dotenv()

# Configuración básica de logging para que se vean los logs en consola
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger("food_recommendation")

app = FastAPI(title="Food Recommendation API")
sensors_data = {}


# ============================================
# 📝 MODELOS PYDANTIC PARA CHAT
# ============================================

class ChatRequest(BaseModel):
    """Modelo para la solicitud de chat (envía el frontend)"""
    user_id: str
    message: str  # El texto transcrito o escrito
    prep_time_available: int = 30  # Tiempo de preparación en minutos (default 30)


class ChatResponse(BaseModel):
    """Modelo para la respuesta del chat"""
    agent_response: str
    intent: str
    recommendations: Optional[List[Dict[str, Any]]] = None


# ============================================
# 🤖 INTEGRACIÓN CON DIALOGFLOW
# ============================================

def get_dialogflow_intent(user_id: str, message: str) -> Dict[str, Any]:
    """
    Obtiene la intención usando Dialogflow real.
    
    Args:
        user_id: ID del usuario (usado como session_id)
        message: Mensaje del usuario
        
    Returns:
        Diccionario con:
        - intent: Nombre de la intención
        - confidence: Nivel de confianza
        - fulfillment_text: Texto de respuesta del agente (si existe)
        - entities: Entidades extraídas
        - parameters: Parámetros de la intención
    """
    try:
        result = detect_intent(session_id=user_id, text=message)
        logger.info(f"Dialogflow detectó intención: {result['intent']} (confianza: {result['confidence']:.2f})")
        return result
    except Exception as e:
        logger.error(f"Error al detectar intención con Dialogflow: {e}")
        # Fallback a detección básica
        return {
            "intent": "fallback",
            "confidence": 0.0,
            "fulfillment_text": "",
            "entities": [],
            "parameters": {}
        }


@app.get("/recommend_food/{user_id}")
def recommend_food(user_id: str):
    data = sensors_data.get(user_id)
    if not data:
        return {"error": "No sensor data found for this user."}

    state = "low_oxygen" if data["oxygen_level"] < 94 else "normal"
    weather = "cold" if data["temperature"] < 20 else "hot"

    prolog_engine = PrologEngine()
    prolog_engine.consult()
    logic_recommendations = prolog_engine.food_recommendation(weather, state)

    detailed_recommendations = []
    for comida in logic_recommendations:
        # Traducir a inglés para mejor búsqueda
        nombre_busqueda = comida.replace("_", " ")
        results = search_food(nombre_busqueda)
        detailed_recommendations.append({"comida": comida, "info": results})

    return {
        "user_id": user_id,
        "weather": weather,
        "state": state,
        "recommendations": detailed_recommendations,
    }


@app.post("/sensors")
async def receive_sensor_data(request: Request):
    body = await request.json()
    user_id = body["user_id"]
    sensors_data[user_id] = body
    return {"status": "Sensor data received", "user": user_id}


# ============================================
# 💬 ENDPOINT DE CHAT
# ============================================

@app.post("/api/chat", response_model=ChatResponse)
async def chat_interaction(request: ChatRequest):
    """
    Maneja la interacción de chat (texto o voz) y decide si usar Dialogflow o Prolog.
    
    Este endpoint:
    1. Recibe mensajes del usuario (transcrito de voz o texto)
    2. Identifica la intención usando Dialogflow (simulado)
    3. Si es recomendación de comida, usa Prolog para generar recomendaciones
    4. Si es otra intención, responde con lógica predefinida
    
    Args:
        request: ChatRequest con user_id, message y prep_time_available
        
    Returns:
        ChatResponse con agent_response, intent y opcionalmente recommendations
    """
    user_id = request.user_id
    user_message = request.message
    prep_time = request.prep_time_available
    
    # 1. Obtener la intención usando Dialogflow (o fallback básico)
    dialogflow_result = get_dialogflow_intent(user_id, user_message)
    logger.info(f"Resultado bruto de Dialogflow/fallback: {dialogflow_result}")
    # Normalizar el nombre de la intención para evitar problemas de mayúsculas/minúsculas
    raw_intent = dialogflow_result.get("intent", "") or ""
    intent = raw_intent.lower()
    fulfillment_text = dialogflow_result.get("fulfillment_text", "")
    dialogflow_confidence = dialogflow_result.get("confidence", 0.0)
    
    logger.info(
        f"Usuario {user_id}: '{user_message}' -> Intención: {intent} "
        f"(original: {raw_intent}, confianza: {dialogflow_confidence:.2f})"
    )
    
    # 2. Lógica de Respuesta
    if intent == "recommendation.food":
        # 2a. Si la intención es una recomendación, usar la lógica de Prolog
        
        # Obtener datos de sensores almacenados (del endpoint /sensors)
        data = sensors_data.get(user_id)
        if not data:
            agent_response = (
                "Lo siento, necesito que me envíes tus datos de pulso/oxígeno "
                "para darte una recomendación personalizada. "
                "Por favor, envía tus datos de sensores primero."
            )
            return ChatResponse(
                agent_response=agent_response,
                intent=intent,
                recommendations=None
            )
        
        # Calcular contexto para Prolog
        state = "low_oxygen" if data.get("oxygen_level", 100) < 94 else "normal"
        weather = "cold" if data.get("temperature", 25) < 20 else "hot"
        
        # Usar la lógica de Prolog para obtener recomendaciones
        try:
            prolog_engine = PrologEngine()
            prolog_engine.consult()
            
            # Usar la regla 'recomendar' con el tiempo disponible (prep_time)
            # La regla recomendar/4 usa (Climate, State, Time, Food)
            logic_recommendations = prolog_engine.food_recommendation(
                weather=weather,
                state=state,
                time=prep_time
            )
            
            # Si hay resultados, generar respuesta detallada
            if logic_recommendations:
                recommendations_list = []
                
                # Obtener información detallada de las comidas recomendadas
                for comida_prolog in logic_recommendations[:3]:  # Limitar a 3 recomendaciones
                    # Buscar información nutricional usando food_api
                    nombre_busqueda = comida_prolog.replace("_", " ")
                    results = search_food(nombre_busqueda, max_results=1)
                    
                    recommendations_list.append({
                        "comida": comida_prolog,
                        "display_name": comida_prolog.replace("_", " ").title(),
                        "info": results[0] if results else None
                    })
                
                # Formatear la respuesta del agente
                primera_comida = recommendations_list[0]["display_name"]
                agent_response = (
                    f"Basado en tu estado ({state.replace('_', ' ')}) "
                    f"y el clima ({weather}), te recomiendo **{primera_comida}**."
                )
                
                # Agregar información nutricional si está disponible
                if recommendations_list[0].get("info") and recommendations_list[0]["info"].get("nutrientes"):
                    nutrientes = recommendations_list[0]["info"]["nutrientes"]
                    energia = nutrientes.get("Energy", "N/A")
                    agent_response += f" Contiene aproximadamente {energia} de energía."
                
                # Si hay más recomendaciones, mencionarlas
                if len(recommendations_list) > 1:
                    otras_comidas = ", ".join([
                        rec["display_name"] 
                        for rec in recommendations_list[1:3]
                    ])
                    agent_response += f" Otras opciones: {otras_comidas}."
                
                return ChatResponse(
                    agent_response=agent_response,
                    intent=intent,
                    recommendations=recommendations_list
                )
            else:
                agent_response = (
                    f"Lo siento, no pude encontrar una recomendación que cumpla "
                    f"todos los criterios (clima: {weather}, estado: {state}, "
                    f"tiempo disponible: {prep_time} minutos). "
                    f"¿Podrías intentar con un tiempo diferente?"
                )
                return ChatResponse(
                    agent_response=agent_response,
                    intent=intent,
                    recommendations=None
                )
                
        except Exception as e:
            print(f"Error en la lógica Prolog/API: {e}")
            import traceback
            traceback.print_exc()
            agent_response = "Hubo un error interno al buscar tu recomendación. Por favor, intenta de nuevo."
            return ChatResponse(
                agent_response=agent_response,
                intent=intent,
                recommendations=None
            )
    
    # 2b. Si no es una recomendación, usar respuesta de Dialogflow o lógica predefinida
    elif intent == "greeting":
        # Si Dialogflow tiene una respuesta, usarla; si no, usar la predefinida
        agent_response = fulfillment_text if fulfillment_text else (
            "¡Hola! Soy tu Agente de Asesoría de Estilo de Vida Saludable. "
            "¿En qué puedo ayudarte hoy? Por ejemplo, puedes decirme "
            "'Recomiéndame algo para comer' o '¿Qué debería comer?'"
        )
        return ChatResponse(
            agent_response=agent_response,
            intent=intent,
            recommendations=None
        )
    
    # 2c. Intención de ayuda
    elif intent == "help":
        # Si Dialogflow tiene una respuesta, usarla; si no, usar la predefinida
        agent_response = fulfillment_text if fulfillment_text else (
            "Puedo ayudarte con:\n"
            "🍽️ Recomendaciones de comida personalizadas según tu estado de salud y clima\n"
            "⏱️ Sugerencias basadas en tu tiempo disponible para preparar comida\n"
            "📊 Información nutricional detallada\n\n"
            "Para obtener una recomendación, primero envía tus datos de sensores "
            "(oxígeno, temperatura, etc.) y luego pregunta 'Recomiéndame algo para comer'."
        )
        return ChatResponse(
            agent_response=agent_response,
            intent=intent,
            recommendations=None
        )
    
    # 2d. Fallback - usar respuesta de Dialogflow si está disponible
    else:
        agent_response = fulfillment_text if fulfillment_text else (
            "No entendí tu solicitud. ¿Estás buscando una recomendación de comida, "
            "o tienes alguna pregunta? Puedes decirme:\n"
            "- 'Recomiéndame algo para comer'\n"
            "- '¿Qué debería comer?'\n"
            "- 'Ayuda' para ver qué puedo hacer"
        )
        return ChatResponse(
            agent_response=agent_response,
            intent=intent,
            recommendations=None
        )


# ============================================
# 🔧 ENDPOINTS DE ADMINISTRACIÓN
# ============================================

@app.post("/admin/reload-foods")
async def reload_foods(force_refresh: bool = False):
    """
    Recargar comidas desde FoodData Central API
    
    Args:
        force_refresh: Si es True, ignora cache y recarga desde API
    """
    import subprocess
    from pathlib import Path
    
    prolog_dir = Path(__file__).parent / "prolog"
    script_path = prolog_dir / "food_loader.py"
    
    try:
        # Ejecutar script de recarga
        args = ["poetry", "run", "python", str(script_path)]
        if force_refresh:
            args.append("--refresh")
        
        result = subprocess.run(
            args,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            # Leer estadísticas del cache
            cache_file = prolog_dir / "food_cache.json"
            if cache_file.exists():
                import json
                with open(cache_file, 'r') as f:
                    cache = json.load(f)
                
                return {
                    "status": "success",
                    "message": "Comidas recargadas exitosamente",
                    "total_foods": cache.get('total_foods', 0),
                    "generated_at": cache.get('generated_at'),
                    "force_refresh": force_refresh
                }
            else:
                return {
                    "status": "success",
                    "message": "Script ejecutado",
                    "output": result.stdout
                }
        else:
            return {
                "status": "error",
                "message": "Error recargando comidas",
                "error": result.stderr
            }
    
    except subprocess.TimeoutExpired:
        return {
            "status": "error",
            "message": "Timeout recargando comidas (> 60s)"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/admin/food-stats")
def food_statistics():
    """Obtener estadísticas de las comidas cargadas"""
    from pathlib import Path
    import json
    
    prolog_dir = Path(__file__).parent / "prolog"
    cache_file = prolog_dir / "food_cache.json"
    dynamic_file = prolog_dir / "comidas_dynamic.pl"
    static_file = prolog_dir / "comidas.pl"
    
    stats = {
        "cache_exists": cache_file.exists(),
        "dynamic_file_exists": dynamic_file.exists(),
        "static_file_exists": static_file.exists(),
        "using": "dynamic" if dynamic_file.exists() else "static"
    }
    
    if cache_file.exists():
        try:
            with open(cache_file, 'r') as f:
                cache = json.load(f)
            
            # Contar por categoría
            by_category = {}
            for food in cache.get('foods', []):
                cat = food.get('category', 'unknown')
                by_category[cat] = by_category.get(cat, 0) + 1
            
            stats.update({
                "total_foods": cache.get('total_foods', 0),
                "generated_at": cache.get('generated_at'),
                "by_category": by_category,
                "cache_loaded": True
            })
        except Exception as e:
            stats["cache_error"] = str(e)
    
    return stats


@app.get("/api/food/{fdc_id}")
def get_food_detail(fdc_id: int):
    """
    Obtiene detalles completos de un alimento por su FDC ID.
    
    Args:
        fdc_id: ID del alimento en FoodData Central
        
    Returns:
        Diccionario con información completa del alimento incluyendo
        todos los nutrientes, ingredientes, y metadatos.
    """
    try:
        details = get_food_details(fdc_id)
        return details
    except Exception as e:
        logger.error(f"Error obteniendo detalles del alimento {fdc_id}: {e}")
        return {
            "error": str(e),
            "fdcId": fdc_id,
            "description": "Error al obtener detalles",
            "nutrientes": {}
        }


@app.get("/")
def root():
    """Información de la API"""
    return {
        "name": "Food Recommendation API",
        "version": "2.0.0",
        "features": {
            "dynamic_foods": "Comidas cargadas desde FoodData Central API",
            "user_management": "Gestión de usuarios y preferencias",
            "personalized_recommendations": "Recomendaciones personalizadas por usuario",
            "sensor_integration": "Integración con datos de sensores"
        },
        "endpoints": {
            "recommendations": {
                "general": "GET /recommend_food/{user_id}",
                "personalized": "GET /recommend_personalized/{user_id}"
            },
            "users": {
                "create": "POST /users",
                "get": "GET /users/{user_id}",
                "list": "GET /users",
                "preferences": "POST /users/{user_id}/preferences",
                "favorites": "POST /users/{user_id}/favoritas",
                "history": "POST /users/{user_id}/historial"
            },
            "sensors": {
                "send_data": "POST /sensors"
            },
            "chat": {
                "interaction": "POST /api/chat"
            },
            "admin": {
                "reload_foods": "POST /admin/reload-foods?force_refresh=true",
                "food_stats": "GET /admin/food-stats"
            }
        },
        "docs": "/docs"
    }

