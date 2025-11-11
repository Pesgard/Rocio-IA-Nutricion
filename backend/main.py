from fastapi import FastAPI, Request
from food_api.food_api import search_food
from prolog.prolog_engine import PrologEngine

app = FastAPI(title="Food Recommendation API")
sensors_data = {}


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
