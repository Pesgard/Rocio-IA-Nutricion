"""
Script de ejemplo para probar el endpoint de chat con Dialogflow.

Uso:
    poetry run python examples/test_chat.py
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"


def print_response(title: str, response: Dict[Any, Any]):
    """Imprime una respuesta formateada"""
    print(f"\n{'='*60}")
    print(f"📝 {title}")
    print(f"{'='*60}")
    print(json.dumps(response, indent=2, ensure_ascii=False))
    print(f"{'='*60}\n")


def send_sensor_data(user_id: str, oxygen: int, temperature: int, heart_rate: int = 72):
    """Envía datos de sensores al servidor"""
    url = f"{BASE_URL}/sensors"
    payload = {
        "user_id": user_id,
        "oxygen_level": oxygen,
        "temperature": temperature,
        "heart_rate": heart_rate
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print_response("📊 Datos de Sensores Enviados", response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Error enviando datos de sensores: {e}")
        return None


def send_chat_message(user_id: str, message: str, prep_time: int = 30):
    """Envía un mensaje al endpoint de chat"""
    url = f"{BASE_URL}/api/chat"
    payload = {
        "user_id": user_id,
        "message": message,
        "prep_time_available": prep_time
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        
        # Formatear respuesta de manera más legible
        print(f"\n{'='*60}")
        print(f"💬 Usuario: {message}")
        print(f"{'='*60}")
        print(f"🤖 Agente: {data['agent_response']}")
        print(f"🎯 Intención: {data['intent']}")
        
        if data.get('recommendations'):
            print(f"\n🍽️ Recomendaciones ({len(data['recommendations'])}):")
            for i, rec in enumerate(data['recommendations'], 1):
                print(f"  {i}. {rec['display_name']}")
                if rec.get('info') and rec['info'].get('nutrientes'):
                    energia = rec['info']['nutrientes'].get('Energy', 'N/A')
                    print(f"     Energía: {energia} kcal")
        else:
            print("\n📋 Sin recomendaciones en esta respuesta")
        
        print(f"{'='*60}\n")
        
        return data
    except requests.exceptions.RequestException as e:
        print(f"❌ Error enviando mensaje: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Respuesta del servidor: {e.response.text}")
        return None


def main():
    """Ejecuta una secuencia de pruebas del chat"""
    user_id = "test-user-123"
    
    print("🚀 Iniciando pruebas del sistema de chat con Dialogflow\n")
    
    # Test 1: Saludo
    print("📌 Test 1: Saludo")
    send_chat_message(user_id, "Hola")
    
    # Test 2: Solicitud de recomendación sin datos de sensores
    print("📌 Test 2: Solicitud de recomendación (sin datos de sensores)")
    send_chat_message(user_id, "Recomiéndame algo para comer")
    
    # Test 3: Enviar datos de sensores
    print("📌 Test 3: Enviando datos de sensores")
    send_sensor_data(user_id, oxygen=95, temperature=18, heart_rate=72)
    
    # Test 4: Solicitud de recomendación con datos de sensores
    print("📌 Test 4: Solicitud de recomendación (con datos de sensores)")
    send_chat_message(user_id, "¿Qué debería comer para el almuerzo?", prep_time=30)
    
    # Test 5: Solicitud con tiempo diferente
    print("📌 Test 5: Solicitud con más tiempo disponible")
    send_chat_message(user_id, "Tengo 60 minutos para preparar algo", prep_time=60)
    
    # Test 6: Solicitud de ayuda
    print("📌 Test 6: Solicitud de ayuda")
    send_chat_message(user_id, "Ayuda")
    
    # Test 7: Mensaje no reconocido
    print("📌 Test 7: Mensaje no reconocido")
    send_chat_message(user_id, "¿Cómo está el clima?")
    
    # Test 8: Conversación continua (misma sesión)
    print("📌 Test 8: Continuación de conversación")
    send_chat_message(user_id, "Gracias")
    
    print("\n✅ Pruebas completadas!")


if __name__ == "__main__":
    main()

