import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")

BASE_URL_SEARCH = "https://api.nal.usda.gov/fdc/v1/foods/search"


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
