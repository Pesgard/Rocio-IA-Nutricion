# 🔧 Configuración de Dialogflow

Esta guía explica cómo configurar la integración real de Dialogflow en el backend.

## 📋 Requisitos Previos

1. **Cuenta de Google Cloud** con un proyecto creado
2. **Agente de Dialogflow** (ES o CX) configurado en Google Cloud
3. **Credenciales de servicio** de Google Cloud

## 🚀 Pasos de Configuración

### 1. Instalar Dependencias

```bash
poetry install
```

Esto instalará `google-cloud-dialogflow` automáticamente.

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# ID del proyecto de Google Cloud
DIALOGFLOW_PROJECT_ID=tu-proyecto-id-aqui

# Ubicación del agente (para Dialogflow CX)
# Para Dialogflow ES, usar "global" o dejar vacío
DIALOGFLOW_LOCATION=global

# ID del agente (solo necesario para Dialogflow CX)
# Para Dialogflow ES, comentar o dejar vacío
# DIALOGFLOW_AGENT_ID=tu-agent-id-aqui

# Ruta al archivo JSON de credenciales
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

### 3. Obtener Credenciales de Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **IAM & Admin** > **Service Accounts**
4. Crea una nueva cuenta de servicio o selecciona una existente
5. Haz clic en **Keys** > **Add Key** > **Create new key**
6. Selecciona **JSON** y descarga el archivo
7. Coloca el archivo JSON en la raíz del proyecto (o en la ruta que especificaste en `.env`)
8. **IMPORTANTE**: Asegúrate de que el archivo esté en `.gitignore` para no subirlo a Git

### 4. Configurar el Agente en Dialogflow

#### Para Dialogflow ES (Enterprise Edition):
- No necesitas `DIALOGFLOW_AGENT_ID`
- Solo configura `DIALOGFLOW_PROJECT_ID` y `GOOGLE_APPLICATION_CREDENTIALS`

#### Para Dialogflow CX:
- Necesitas `DIALOGFLOW_PROJECT_ID`, `DIALOGFLOW_LOCATION` y `DIALOGFLOW_AGENT_ID`
- El `DIALOGFLOW_AGENT_ID` lo encuentras en la URL del agente en Dialogflow Console

### 5. Crear Intenciones en Dialogflow

Asegúrate de tener las siguientes intenciones configuradas en tu agente:

- **`recommendation.food`**: Para solicitudes de recomendaciones de comida
  - Ejemplos de entrenamiento: "recomiéndame algo para comer", "qué debería comer", "necesito una recomendación"
  
- **`greeting`**: Para saludos
  - Ejemplos: "hola", "buenos días", "qué tal"
  
- **`help`**: Para solicitudes de ayuda
  - Ejemplos: "ayuda", "cómo funciona", "qué puedo hacer"

- **`fallback`**: Intención por defecto (ya existe en Dialogflow)

## 🔍 Verificación

Para verificar que la integración funciona:

1. Inicia el servidor:
   ```bash
   poetry run uvicorn main:app --reload
   ```

2. Prueba el endpoint de chat:
   ```bash
   curl -X POST "http://localhost:8000/api/chat" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "test-user",
       "message": "Hola",
       "prep_time_available": 30
     }'
   ```

3. Revisa los logs del servidor para ver si Dialogflow está funcionando correctamente.

## 🛠️ Solución de Problemas

### Error: "GOOGLE_APPLICATION_CREDENTIALS no configurado"
- Verifica que el archivo `.env` existe y tiene la variable `GOOGLE_APPLICATION_CREDENTIALS`
- Verifica que la ruta al archivo JSON es correcta
- Asegúrate de que el archivo JSON existe y es válido

### Error: "DIALOGFLOW_PROJECT_ID debe estar configurado"
- Verifica que `DIALOGFLOW_PROJECT_ID` está en tu archivo `.env`
- Asegúrate de que el proyecto existe en Google Cloud

### Error: "Permission denied" o errores de autenticación
- Verifica que la cuenta de servicio tiene los permisos necesarios:
  - **Dialogflow API User** o **Dialogflow API Client**
- Asegúrate de que la API de Dialogflow está habilitada en tu proyecto

### El sistema usa fallback en lugar de Dialogflow
- Revisa los logs del servidor para ver el error específico
- Verifica que las credenciales son válidas
- Asegúrate de que el agente está activo en Dialogflow Console

## 📝 Notas Importantes

- El sistema tiene un **fallback automático**: si Dialogflow falla, usará detección básica de intenciones
- Cada usuario tiene su propia sesión en Dialogflow (usando `user_id` como `session_id`)
- Las sesiones se mantienen durante la conversación para contexto
- El sistema prioriza las respuestas de Dialogflow sobre las respuestas predefinidas

## 🔐 Seguridad

- **NUNCA** subas el archivo de credenciales JSON a Git
- Asegúrate de que `.env` está en `.gitignore`
- Usa variables de entorno en producción en lugar de archivos `.env`
- Considera usar Google Secret Manager para producción

