# 📝 Ejemplos de Uso del Chat

Este directorio contiene scripts de ejemplo para probar el sistema de chat con Dialogflow.

## 🚀 Scripts Disponibles

### 1. `test_chat.py` - Pruebas Automatizadas

Ejecuta una secuencia completa de pruebas del sistema de chat.

```bash
poetry run python examples/test_chat.py
```

**Qué prueba:**
- ✅ Saludos
- ✅ Solicitud de recomendación sin datos de sensores
- ✅ Envío de datos de sensores
- ✅ Solicitud de recomendación con datos de sensores
- ✅ Diferentes tiempos de preparación
- ✅ Solicitud de ayuda
- ✅ Mensajes no reconocidos
- ✅ Continuación de conversación

### 2. `chat_interactive.py` - Chat Interactivo

Chat en tiempo real para probar el sistema manualmente.

```bash
poetry run python examples/chat_interactive.py
```

**Características:**
- 💬 Chat interactivo en tiempo real
- 📊 Comando `/sensors` para enviar datos de sensores
- ⏱️ Comando `/time` para cambiar tiempo de preparación
- 🎯 Muestra intenciones detectadas y recomendaciones

**Comandos disponibles:**
- `/sensors <oxigeno> <temperatura> [frecuencia]` - Enviar datos de sensores
- `/time <minutos>` - Cambiar tiempo de preparación
- `/quit` o `/exit` - Salir

## 📋 Requisitos

Asegúrate de que:
1. El servidor esté corriendo: `poetry run uvicorn main:app --reload`
2. Las dependencias estén instaladas: `poetry install`
3. (Opcional) Dialogflow esté configurado (ver `DIALOGFLOW_SETUP.md`)

## 💡 Ejemplo de Uso del Chat Interactivo

```
💬 Chat Interactivo - Sistema de Recomendaciones
============================================================

Ingresa tu ID de usuario: usuario-123

✅ Conectado como: usuario-123
⏱️  Tiempo de preparación: 30 minutos
📊 Datos de sensores: ❌ No enviados

💡 Tip: Envía datos de sensores primero para obtener recomendaciones personalizadas

Tú: Hola
🤖 Agente: ¡Hola! Soy tu Agente de Asesoría de Estilo de Vida Saludable...
🎯 Intención detectada: greeting

Tú: /sensors 95 18 72
✅ Datos de sensores enviados correctamente

Tú: Recomiéndame algo para comer
🤖 Agente: Basado en tu estado (normal) y el clima (cold), te recomiendo **Chicken Soup**...
🎯 Intención detectada: recommendation.food

🍽️ Recomendaciones (3):
  1. Chicken Soup
     📊 Nutrientes:
        • Energy: 36.0
        • Protein: 2.5
        ...
```

## 🔗 Ver También

- `../API_ENDPOINTS.md` - Documentación completa de endpoints
- `../DIALOGFLOW_SETUP.md` - Guía de configuración de Dialogflow

