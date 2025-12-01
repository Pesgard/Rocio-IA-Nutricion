"""
Chat interactivo para probar el endpoint de chat en tiempo real.

Uso:
    poetry run python examples/chat_interactive.py
"""

import requests
import json
from typing import Optional

BASE_URL = "http://localhost:8000"


class ChatClient:
    """Cliente simple para interactuar con el chat"""
    
    def __init__(self, user_id: str, base_url: str = BASE_URL):
        self.user_id = user_id
        self.base_url = base_url
        self.sensor_data_sent = False
    
    def send_sensors(self, oxygen: int, temperature: int, heart_rate: int = 72):
        """Envía datos de sensores"""
        url = f"{self.base_url}/sensors"
        payload = {
            "user_id": self.user_id,
            "oxygen_level": oxygen,
            "temperature": temperature,
            "heart_rate": heart_rate
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            self.sensor_data_sent = True
            print("✅ Datos de sensores enviados correctamente\n")
            return True
        except Exception as e:
            print(f"❌ Error: {e}\n")
            return False
    
    def chat(self, message: str, prep_time: int = 30) -> Optional[dict]:
        """Envía un mensaje al chat"""
        url = f"{self.base_url}/api/chat"
        payload = {
            "user_id": self.user_id,
            "message": message,
            "prep_time_available": prep_time
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Error: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"   Detalles: {e.response.text}")
            return None


def print_chat_response(data: dict):
    """Imprime la respuesta del chat de forma legible"""
    print(f"\n🤖 Agente: {data['agent_response']}")
    print(f"🎯 Intención detectada: {data['intent']}")
    
    if data.get('recommendations'):
        print(f"\n🍽️ Recomendaciones ({len(data['recommendations'])}):")
        for i, rec in enumerate(data['recommendations'], 1):
            print(f"\n  {i}. {rec['display_name']}")
            if rec.get('info'):
                info = rec['info']
                if isinstance(info, dict):
                    if 'nutrientes' in info:
                        nutrientes = info['nutrientes']
                        print(f"     📊 Nutrientes:")
                        for key, value in list(nutrientes.items())[:5]:  # Mostrar primeros 5
                            print(f"        • {key}: {value}")
    print()


def main():
    """Ejecuta el chat interactivo"""
    print("="*60)
    print("💬 Chat Interactivo - Sistema de Recomendaciones")
    print("="*60)
    print("\nComandos especiales:")
    print("  /sensors <oxigeno> <temperatura> [frecuencia] - Enviar datos de sensores")
    print("  /time <minutos> - Cambiar tiempo de preparación")
    print("  /quit o /exit - Salir")
    print("="*60 + "\n")
    
    user_id = input("Ingresa tu ID de usuario (o presiona Enter para usar 'default-user'): ").strip()
    if not user_id:
        user_id = "default-user"
    
    client = ChatClient(user_id)
    prep_time = 30
    
    print(f"\n✅ Conectado como: {user_id}")
    print(f"⏱️  Tiempo de preparación: {prep_time} minutos")
    print(f"📊 Datos de sensores: {'✅ Enviados' if client.sensor_data_sent else '❌ No enviados'}")
    print("\n💡 Tip: Envía datos de sensores primero para obtener recomendaciones personalizadas\n")
    
    while True:
        try:
            message = input("Tú: ").strip()
            
            if not message:
                continue
            
            # Comandos especiales
            if message.startswith('/'):
                parts = message.split()
                cmd = parts[0].lower()
                
                if cmd in ['/quit', '/exit']:
                    print("\n👋 ¡Hasta luego!")
                    break
                
                elif cmd == '/sensors' and len(parts) >= 3:
                    try:
                        oxygen = int(parts[1])
                        temperature = int(parts[2])
                        heart_rate = int(parts[3]) if len(parts) > 3 else 72
                        client.send_sensors(oxygen, temperature, heart_rate)
                    except (ValueError, IndexError):
                        print("❌ Uso: /sensors <oxigeno> <temperatura> [frecuencia]")
                
                elif cmd == '/time' and len(parts) >= 2:
                    try:
                        prep_time = int(parts[1])
                        print(f"⏱️  Tiempo de preparación actualizado: {prep_time} minutos\n")
                    except ValueError:
                        print("❌ Uso: /time <minutos>")
                
                else:
                    print("❌ Comando no reconocido")
                
                continue
            
            # Enviar mensaje al chat
            response = client.chat(message, prep_time)
            
            if response:
                print_chat_response(response)
            else:
                print("❌ No se pudo obtener respuesta del servidor\n")
        
        except KeyboardInterrupt:
            print("\n\n👋 ¡Hasta luego!")
            break
        except Exception as e:
            print(f"❌ Error: {e}\n")


if __name__ == "__main__":
    main()

