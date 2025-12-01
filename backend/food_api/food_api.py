import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")

BASE_URL_SEARCH = "https://api.nal.usda.gov/fdc/v1/foods/search"
BASE_URL_FOOD = "https://api.nal.usda.gov/fdc/v1/food"


def search_food(food_name: str, max_results: int = 2):
    """
    Busca alimentos por nombre en la API USDA FoodData Central.
    Devuelve los nutrientes principales (Energy, Protein, Fat, Carbs, etc.)
    """
    params = {"query": food_name, "pageSize": max_results, "api_key": API_KEY}

    try:
        response = requests.get(BASE_URL_SEARCH, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        foods = data.get("foods", [])
        results = []

        for item in foods:
            nutrientes = {}
            for n in item.get("foodNutrients", []):
                name = n.get("nutrientName")
                amount = n.get("value")
                unit = n.get("unitName")
                if name and amount is not None:
                    nutrientes[name] = f"{amount} {unit}"

            results.append(
                {
                    "nombre": item.get("description", ""),
                    "fdcId": item.get("fdcId"),
                    "nutrientes": nutrientes,
                }
            )

        return results

    except Exception as e:
        print(f"[ERROR] FoodData API: {e}")
        return [{"nombre": "Error fetching data", "nutrientes": {}}]


def get_food_details(fdc_id: int):
    """
    Obtiene detalles completos de un alimento por su FDC ID.
    Devuelve información nutricional completa y detallada.
    """
    url = f"{BASE_URL_FOOD}/{fdc_id}"
    params = {"api_key": API_KEY}

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Extraer información nutricional completa
        # La estructura de foodNutrients es: { "nutrient": { "name": "...", "unitName": "..." }, "amount": ... }
        nutrientes = {}
        for n in data.get("foodNutrients", []):
            nutrient_info = n.get("nutrient", {})
            name = nutrient_info.get("name")
            amount = n.get("amount")
            unit = nutrient_info.get("unitName", "")
            
            # Solo agregar si tiene nombre y cantidad válida
            if name and amount is not None:
                nutrientes[name] = {
                    "amount": float(amount) if amount else 0.0,
                    "unit": unit or "",
                    "value": f"{amount} {unit}".strip() if unit else str(amount)
                }

        return {
            "fdcId": data.get("fdcId"),
            "description": data.get("description", ""),
            "dataType": data.get("dataType", ""),
            "publicationDate": data.get("publicationDate", ""),
            "brandOwner": data.get("brandOwner", ""),
            "ingredients": data.get("ingredients", ""),
            "nutrientes": nutrientes,
            "foodNutrients": data.get("foodNutrients", []),
        }

    except Exception as e:
        print(f"[ERROR] FoodData API (get_food_details): {e}")
        return {
            "fdcId": fdc_id,
            "description": "Error fetching data",
            "nutrientes": {},
            "error": str(e)
        }
