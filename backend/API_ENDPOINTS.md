# 📚 Documentación de Endpoints - API de Recomendaciones de Comida

Esta guía explica todos los endpoints disponibles y cómo utilizarlos, especialmente el endpoint de chat con integración de Dialogflow.

## 🚀 Inicio Rápido

### Base URL
```
http://localhost:8000
```

### Documentación Interactiva
Una vez que el servidor esté corriendo, puedes acceder a:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 💬 Endpoint Principal: Chat con Dialogflow

### `POST /api/chat`

Este es el endpoint principal para interactuar con el sistema de chat que utiliza Dialogflow para entender las intenciones del usuario.

#### Descripción
- Recibe mensajes del usuario (texto o transcrito de voz)
- Usa Dialogflow para detectar la intención
- Genera recomendaciones personalizadas usando Prolog cuando corresponde
- Retorna respuestas del agente con información nutricional

#### Request Body

```json
{
  "user_id": "string",           // ID único del usuario (requerido)
  "message": "string",            // Mensaje del usuario (requerido)
  "prep_time_available": 30       // Tiempo disponible en minutos (opcional, default: 30)
}
```

#### Response

```json
{
  "agent_response": "string",     // Respuesta del agente
  "intent": "string",             // Intención detectada por Dialogflow
  "recommendations": [            // Array de recomendaciones (null si no aplica)
    {
      "comida": "string",         // Nombre de la comida en formato Prolog
      "display_name": "string",   // Nombre formateado para mostrar
      "info": {                   // Información nutricional (puede ser null)
        "nombre": "string",
        "nutrientes": {
          "Energy": "number",
          "Protein": "number",
          // ... más nutrientes
        }
      }
    }
  ]
}
```

#### Ejemplos de Uso

##### 1. Saludo Simple

```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "usuario-123",
    "message": "Hola",
    "prep_time_available": 30
  }'
```

**Respuesta:**
```json
{
  "agent_response": "¡Hola! Soy tu Agente de Asesoría de Estilo de Vida Saludable. ¿En qué puedo ayudarte hoy? Por ejemplo, puedes decirme 'Recomiéndame algo para comer' o '¿Qué debería comer?'",
  "intent": "greeting",
  "recommendations": null
}
```

##### 2. Solicitud de Recomendación (sin datos de sensores)

```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "usuario-123",
    "message": "Recomiéndame algo para comer",
    "prep_time_available": 45
  }'
```

**Respuesta:**
```json
{
  "agent_response": "Lo siento, necesito que me envíes tus datos de pulso/oxígeno para darte una recomendación personalizada. Por favor, envía tus datos de sensores primero.",
  "intent": "recommendation.food",
  "recommendations": null
}
```

##### 3. Solicitud de Recomendación (con datos de sensores)

**Paso 1: Enviar datos de sensores**
```bash
curl -X POST "http://localhost:8000/sensors" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "usuario-123",
    "oxygen_level": 95,
    "temperature": 18,
    "heart_rate": 72
  }'
```

**Paso 2: Solicitar recomendación**
```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "usuario-123",
    "message": "¿Qué debería comer para el almuerzo?",
    "prep_time_available": 30
  }'
```

**Respuesta:**
```json
{
  "agent_response": "Basado en tu estado (normal) y el clima (cold), te recomiendo **Chicken Soup**. Contiene aproximadamente 36.0 kcal de energía. Otras opciones: Beef Stew, Vegetable Soup.",
  "intent": "recommendation.food",
  "recommendations": [
    {
      "comida": "chicken_soup",
      "display_name": "Chicken Soup",
      "info": {
        "nombre": "Chicken Soup",
        "nutrientes": {
          "Energy": 36.0,
          "Protein": 2.5,
          "Fat": 1.2
        }
      }
    },
    {
      "comida": "beef_stew",
      "display_name": "Beef Stew",
      "info": { ... }
    },
    {
      "comida": "vegetable_soup",
      "display_name": "Vegetable Soup",
      "info": { ... }
    }
  ]
}
```

##### 4. Solicitud de Ayuda

```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "usuario-123",
    "message": "Ayuda",
    "prep_time_available": 30
  }'
```

**Respuesta:**
```json
{
  "agent_response": "Puedo ayudarte con:\n🍽️ Recomendaciones de comida personalizadas según tu estado de salud y clima\n⏱️ Sugerencias basadas en tu tiempo disponible para preparar comida\n📊 Información nutricional detallada\n\nPara obtener una recomendación, primero envía tus datos de sensores (oxígeno, temperatura, etc.) y luego pregunta 'Recomiéndame algo para comer'.",
  "intent": "help",
  "recommendations": null
}
```

#### Intenciones Soportadas

El sistema detecta las siguientes intenciones mediante Dialogflow:

| Intención | Descripción | Ejemplos de Mensajes |
|-----------|-------------|----------------------|
| `recommendation.food` | Solicitud de recomendación de comida | "Recomiéndame algo", "¿Qué debería comer?", "Necesito una recomendación" |
| `greeting` | Saludos | "Hola", "Buenos días", "Qué tal" |
| `help` | Solicitud de ayuda | "Ayuda", "Cómo funciona", "Qué puedo hacer" |
| `fallback` | Intención no reconocida | Cualquier mensaje que no coincida con las anteriores |

#### Flujo de Trabajo Recomendado

1. **Inicializar sesión**: El usuario envía un saludo
2. **Enviar datos de sensores**: `POST /sensors` con datos del usuario
3. **Solicitar recomendación**: `POST /api/chat` con mensaje de recomendación
4. **Continuar conversación**: El sistema mantiene el contexto de la sesión

---

## 📊 Endpoint de Sensores

### `POST /sensors`

Almacena los datos de sensores del usuario necesarios para generar recomendaciones personalizadas.

#### Request Body

```json
{
  "user_id": "string",           // ID único del usuario (requerido)
  "oxygen_level": 95,            // Nivel de oxígeno en sangre (requerido)
  "temperature": 18,             // Temperatura ambiente (requerido)
  "heart_rate": 72               // Frecuencia cardíaca (opcional)
}
```

#### Response

```json
{
  "status": "Sensor data received",
  "user": "usuario-123"
}
```

#### Ejemplo

```bash
curl -X POST "http://localhost:8000/sensors" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "usuario-123",
    "oxygen_level": 92,
    "temperature": 15,
    "heart_rate": 75
  }'
```

**Nota**: Los datos de sensores se usan para determinar:
- **Estado de salud**: `low_oxygen` si `oxygen_level < 94`, sino `normal`
- **Clima**: `cold` si `temperature < 20`, sino `hot`

---

## 🍽️ Endpoint de Recomendaciones (Legacy)

### `GET /recommend_food/{user_id}`

Endpoint alternativo para obtener recomendaciones sin usar el chat. Requiere que los datos de sensores estén previamente almacenados.

#### Ejemplo

```bash
curl "http://localhost:8000/recommend_food/usuario-123"
```

**Respuesta:**
```json
{
  "user_id": "usuario-123",
  "weather": "cold",
  "state": "normal",
  "recommendations": [
    {
      "comida": "chicken_soup",
      "info": { ... }
    }
  ]
}
```

---

## 🔧 Endpoints de Administración

### `POST /admin/reload-foods`

Recarga las comidas desde la API de FoodData Central.

#### Parámetros Query

- `force_refresh` (opcional): Si es `true`, ignora el cache y recarga desde la API

#### Ejemplo

```bash
# Recargar con cache
curl -X POST "http://localhost:8000/admin/reload-foods"

# Recargar sin cache (forzar actualización)
curl -X POST "http://localhost:8000/admin/reload-foods?force_refresh=true"
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Comidas recargadas exitosamente",
  "total_foods": 86,
  "generated_at": "2024-01-15T10:30:00",
  "force_refresh": false
}
```

### `GET /admin/food-stats`

Obtiene estadísticas sobre las comidas cargadas en el sistema.

#### Ejemplo

```bash
curl "http://localhost:8000/admin/food-stats"
```

**Respuesta:**
```json
{
  "cache_exists": true,
  "dynamic_file_exists": true,
  "static_file_exists": true,
  "using": "dynamic",
  "total_foods": 86,
  "generated_at": "2024-01-15T10:30:00",
  "by_category": {
    "soup": 15,
    "meat": 20,
    "vegetable": 18,
    "grain": 12,
    "dairy": 8,
    "fruit": 13
  },
  "cache_loaded": true
}
```

---

## 📱 Ejemplos de Integración Frontend

### JavaScript/TypeScript (Fetch API)

```javascript
// Función para enviar mensaje al chat
async function sendChatMessage(userId, message, prepTime = 30) {
  const response = await fetch('http://localhost:8000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      message: message,
      prep_time_available: prepTime
    })
  });
  
  const data = await response.json();
  return data;
}

// Uso
const result = await sendChatMessage('usuario-123', 'Hola');
console.log(result.agent_response);
```

### Python (requests)

```python
import requests

def send_chat_message(user_id, message, prep_time=30):
    url = "http://localhost:8000/api/chat"
    payload = {
        "user_id": user_id,
        "message": message,
        "prep_time_available": prep_time
    }
    response = requests.post(url, json=payload)
    return response.json()

# Uso
result = send_chat_message("usuario-123", "Recomiéndame algo para comer")
print(result["agent_response"])
```

### React Hook Example

```typescript
import { useState } from 'react';

function useChat(userId: string) {
  const [messages, setMessages] = useState<Array<{user: string, agent: string}>>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string, prepTime: number = 30) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          message: message,
          prep_time_available: prepTime
        })
      });
      
      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        { user: message, agent: data.agent_response }
      ]);
      
      return data;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}
```

---

## 🔍 Manejo de Errores

### Errores Comunes

#### 1. Usuario sin datos de sensores
```json
{
  "agent_response": "Lo siento, necesito que me envíes tus datos de pulso/oxígeno...",
  "intent": "recommendation.food",
  "recommendations": null
}
```
**Solución**: Enviar datos de sensores primero con `POST /sensors`

#### 2. Intención no reconocida
```json
{
  "agent_response": "No entendí tu solicitud...",
  "intent": "fallback",
  "recommendations": null
}
```
**Solución**: Reformular el mensaje o verificar que Dialogflow esté configurado correctamente

#### 3. No hay recomendaciones que cumplan criterios
```json
{
  "agent_response": "Lo siento, no pude encontrar una recomendación...",
  "intent": "recommendation.food",
  "recommendations": null
}
```
**Solución**: Intentar con un `prep_time_available` diferente

---

## 🎯 Mejores Prácticas

1. **Mantener sesiones**: Usa el mismo `user_id` para mantener el contexto de la conversación
2. **Actualizar sensores**: Envía datos de sensores periódicamente para recomendaciones actualizadas
3. **Manejar errores**: Siempre verifica si `recommendations` es `null` antes de usarlo
4. **Tiempo de preparación**: Ajusta `prep_time_available` según las necesidades del usuario
5. **Logging**: Revisa los logs del servidor para depurar problemas con Dialogflow

---

## 📝 Notas Importantes

- El sistema usa **Dialogflow** para detectar intenciones, pero tiene un **fallback automático** si Dialogflow no está disponible
- Cada `user_id` mantiene su propia **sesión** en Dialogflow para contexto conversacional
- Los datos de sensores se almacenan en memoria (se pierden al reiniciar el servidor)
- Las recomendaciones se generan usando **lógica Prolog** basada en estado de salud, clima y tiempo disponible
- La información nutricional proviene de la **FoodData Central API**

---

## 🔗 Recursos Adicionales

- **Documentación de FastAPI**: https://fastapi.tiangolo.com/
- **Documentación de Dialogflow**: https://cloud.google.com/dialogflow/docs
- **Swagger UI**: `http://localhost:8000/docs` (cuando el servidor esté corriendo)

