"""
🍽️ food_loader.py
Carga comidas dinámicamente desde FoodData Central API
y genera hechos Prolog automáticamente
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from food_api.food_api import search_food
from typing import List, Dict, Any, Optional
from datetime import datetime
import json


class FoodCategorizer:
    """Categoriza comidas basándose en sus nutrientes"""
    
    @staticmethod
    def categorize_meal_time(name: str, nutrients: dict) -> str:
        """Determina si es desayuno, almuerzo, cena o snack"""
        name_lower = name.lower()
        
        # Palabras clave para categorías
        breakfast_keywords = ['oatmeal', 'cereal', 'egg', 'toast', 'pancake', 'waffle', 
                             'yogurt', 'fruit', 'smoothie', 'avena', 'huevo']
        lunch_keywords = ['sandwich', 'salad', 'pasta', 'rice', 'chicken', 'fish',
                         'ensalada', 'pollo', 'pescado', 'arroz']
        dinner_keywords = ['steak', 'soup', 'stew', 'roast', 'grilled', 'sopa', 
                          'asado', 'guiso']
        snack_keywords = ['bar', 'nuts', 'cookie', 'chips', 'fruit', 'fruta', 
                         'galleta', 'barra']
        
        # Verificar palabras clave
        if any(kw in name_lower for kw in breakfast_keywords):
            return 'breakfast'
        elif any(kw in name_lower for kw in snack_keywords):
            return 'snack'
        elif any(kw in name_lower for kw in dinner_keywords):
            return 'dinner'
        elif any(kw in name_lower for kw in lunch_keywords):
            return 'lunch'
        
        # Basado en calorías
        calories = FoodCategorizer._extract_calories(nutrients)
        if calories < 200:
            return 'snack'
        elif calories < 400:
            return 'breakfast'
        elif calories < 600:
            return 'lunch'
        else:
            return 'dinner'
    
    @staticmethod
    def categorize_climate(name: str, nutrients: dict) -> str:
        """Determina si es para clima frío, caliente o templado"""
        name_lower = name.lower()
        
        # Comidas frías (para clima caliente)
        hot_climate_keywords = ['salad', 'cold', 'fresh', 'raw', 'smoothie', 
                               'ensalada', 'fresco', 'fría']
        
        # Comidas calientes (para clima frío)
        cold_climate_keywords = ['soup', 'stew', 'hot', 'warm', 'roast', 'baked',
                                'sopa', 'caliente', 'horneado']
        
        if any(kw in name_lower for kw in hot_climate_keywords):
            return 'hot'
        elif any(kw in name_lower for kw in cold_climate_keywords):
            return 'cold'
        else:
            return 'warm'
    
    @staticmethod
    def categorize_preparation_time(name: str) -> str:
        """Determina tiempo de preparación basado en el nombre"""
        name_lower = name.lower()
        
        quick_keywords = ['raw', 'fresh', 'simple', 'easy', 'bar', 'shake', 'smoothie']
        long_keywords = ['roast', 'baked', 'stew', 'slow', 'braised', 'asado', 'horneado']
        
        if any(kw in name_lower for kw in quick_keywords):
            return 'quick'
        elif any(kw in name_lower for kw in long_keywords):
            return 'long'
        else:
            return 'medium'
    
    @staticmethod
    def categorize_oxygen_state(nutrients: dict) -> str:
        """Determina si es bueno para baja oxigenación basado en nutrientes"""
        # Alimentos ricos en hierro y proteína son buenos para baja oxigenación
        protein = FoodCategorizer._extract_nutrient(nutrients, 'Protein')
        iron = FoodCategorizer._extract_nutrient(nutrients, 'Iron')
        
        # Si tiene buen contenido de proteína o hierro
        if protein and protein > 15:
            return 'low_oxygen'
        elif iron and iron > 2:
            return 'low_oxygen'
        else:
            return 'normal'
    
    @staticmethod
    def _extract_calories(nutrients: dict) -> float:
        """Extrae calorías de los nutrientes"""
        for key, value in nutrients.items():
            if 'energy' in key.lower() or 'calor' in key.lower():
                try:
                    # Extraer número del string "123.45 kcal"
                    return float(value.split()[0])
                except:
                    pass
        return 300  # Default
    
    @staticmethod
    def _extract_nutrient(nutrients: dict, nutrient_name: str) -> Optional[float]:
        """Extrae un nutriente específico"""
        for key, value in nutrients.items():
            if nutrient_name.lower() in key.lower():
                try:
                    return float(value.split()[0])
                except:
                    pass
        return None


class FoodLoader:
    """Carga comidas desde FoodData Central y genera hechos Prolog"""
    
    def __init__(self, output_dir: str = "./prolog"):
        self.output_dir = Path(output_dir)
        self.comidas_file = self.output_dir / "comidas_dynamic.pl"
        self.cache_file = self.output_dir / "food_cache.json"
        self.categorizer = FoodCategorizer()
        self.loaded_foods = []
    
    def search_and_load_foods(self, food_queries: List[str], max_per_query: int = 5):
        """
        Busca múltiples comidas en la API y las carga
        
        Args:
            food_queries: Lista de nombres de comida a buscar
            max_per_query: Cantidad máxima de resultados por búsqueda
        """
        print(f"🔍 Buscando {len(food_queries)} comidas en FoodData Central...")
        
        all_foods = []
        
        for query in food_queries:
            print(f"  📥 Buscando: {query}")
            results = search_food(query, max_results=max_per_query)
            
            for food_data in results:
                if food_data.get('nombre') and food_data['nombre'] != "Error fetching data":
                    processed = self._process_food(food_data)
                    if processed:
                        all_foods.append(processed)
        
        self.loaded_foods = all_foods
        print(f"✅ Se cargaron {len(all_foods)} comidas")
        
        return all_foods
    
    def _process_food(self, food_data: dict) -> Optional[dict]:
        """Procesa una comida de la API y la categoriza"""
        try:
            name = food_data['nombre']
            nutrients = food_data.get('nutrientes', {})
            fdc_id = food_data.get('fdcId')
            
            # Generar nombre Prolog (sin espacios, lowercase, underscore)
            prolog_name = name.lower().replace(' ', '_').replace(',', '').replace('-', '_')
            prolog_name = ''.join(c for c in prolog_name if c.isalnum() or c == '_')
            prolog_name = prolog_name[:50]  # Limitar longitud
            
            # Categorizar
            category = self.categorizer.categorize_meal_time(name, nutrients)
            climate = self.categorizer.categorize_climate(name, nutrients)
            state = self.categorizer.categorize_oxygen_state(nutrients)
            prep_time = self.categorizer.categorize_preparation_time(name)
            calories = int(self.categorizer._extract_calories(nutrients))
            
            return {
                'prolog_name': prolog_name,
                'display_name': name,
                'fdc_id': fdc_id,
                'climate': climate,
                'state': state,
                'prep_time': prep_time,
                'category': category,
                'calories': calories,
                'nutrients': nutrients
            }
        except Exception as e:
            print(f"⚠️  Error procesando {food_data.get('nombre', 'unknown')}: {e}")
            return None
    
    def generate_prolog_file(self):
        """Genera el archivo .pl con todas las comidas cargadas"""
        if not self.loaded_foods:
            print("❌ No hay comidas cargadas")
            return
        
        with open(self.comidas_file, 'w', encoding='utf-8') as f:
            # Header
            f.write(f"/* {'='*60}\n")
            f.write(f"   📘 comidas_dynamic.pl (AUTOGENERADO)\n")
            f.write(f"   Generado desde FoodData Central API\n")
            f.write(f"   Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"   Total de comidas: {len(self.loaded_foods)}\n")
            f.write(f"   {'='*60} */\n\n")
            
            # Documentación
            f.write("% comida(Name, Climate, State, TimeType, Category, Calories, FdcId)\n")
            f.write("% Climate: cold | hot | warm\n")
            f.write("% State: normal | low_oxygen\n")
            f.write("% TimeType: quick | medium | long\n")
            f.write("% Category: breakfast | lunch | dinner | snack\n\n")
            
            # Agrupar por categoría
            by_category = {}
            for food in self.loaded_foods:
                cat = food['category']
                if cat not in by_category:
                    by_category[cat] = []
                by_category[cat].append(food)
            
            # Escribir por categoría
            for category in ['breakfast', 'lunch', 'dinner', 'snack']:
                if category not in by_category:
                    continue
                
                foods = by_category[category]
                f.write(f"% --- {category.upper()} ({len(foods)}) ---\n")
                
                for food in foods:
                    f.write(f"comida({food['prolog_name']}, ")
                    f.write(f"{food['climate']}, ")
                    f.write(f"{food['state']}, ")
                    f.write(f"{food['prep_time']}, ")
                    f.write(f"{food['category']}, ")
                    f.write(f"{food['calories']}, ")
                    f.write(f"'{food['fdc_id']}').\n")
                
                f.write("\n")
            
            # Mapeo de nombres para display
            f.write("% Mapeo de nombres internos a nombres para mostrar\n")
            for food in self.loaded_foods:
                f.write(f"food_display_name({food['prolog_name']}, '{food['display_name']}').\n")
            
            f.write("\n")
            
            # Información nutricional completa
            f.write("% Información nutricional completa\n")
            for food in self.loaded_foods:
                f.write(f"food_fdc_id({food['prolog_name']}, '{food['fdc_id']}').\n")
        
        print(f"✅ Archivo Prolog generado: {self.comidas_file}")
        
        # Guardar cache
        self._save_cache()
    
    def _save_cache(self):
        """Guardar cache de comidas en JSON"""
        cache = {
            'generated_at': datetime.now().isoformat(),
            'total_foods': len(self.loaded_foods),
            'foods': self.loaded_foods
        }
        
        with open(self.cache_file, 'w', encoding='utf-8') as f:
            json.dump(cache, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Cache guardado: {self.cache_file}")
    
    def load_from_cache(self) -> bool:
        """Cargar desde cache si existe"""
        if self.cache_file.exists():
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    cache = json.load(f)
                
                self.loaded_foods = cache.get('foods', [])
                print(f"✅ {len(self.loaded_foods)} comidas cargadas desde cache")
                return True
            except Exception as e:
                print(f"⚠️  Error cargando cache: {e}")
        return False


# ============================================
# 🧪 CATEGORÍAS PREDEFINIDAS DE COMIDAS
# ============================================

FOOD_CATEGORIES = {
    'breakfast': [
        'oatmeal', 'scrambled eggs', 'avocado toast', 'yogurt granola',
        'pancakes', 'fruit salad', 'smoothie bowl', 'bagel cream cheese',
        'french toast', 'breakfast burrito'
    ],
    'lunch': [
        'chicken salad', 'quinoa bowl', 'tuna sandwich', 'pasta',
        'rice bowl', 'burrito', 'wrap', 'soup', 'pizza slice',
        'grilled chicken', 'salmon', 'veggie burger'
    ],
    'dinner': [
        'grilled fish', 'roasted chicken', 'steak', 'vegetable stir fry',
        'pasta primavera', 'curry', 'tacos', 'enchiladas',
        'pork chops', 'turkey breast', 'lamb chops'
    ],
    'snack': [
        'almonds', 'protein bar', 'apple', 'banana', 'carrots',
        'hummus', 'cheese', 'crackers', 'popcorn', 'yogurt'
    ]
}


def get_default_food_queries() -> List[str]:
    """Obtiene lista de comidas a buscar"""
    queries = []
    for category, foods in FOOD_CATEGORIES.items():
        queries.extend(foods)
    return queries


# ============================================
# 🚀 MAIN - Ejecutar carga de comidas
# ============================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Cargar comidas desde FoodData Central')
    parser.add_argument('--refresh', action='store_true', help='Forzar recarga desde API')
    parser.add_argument('--max-per-query', type=int, default=3, help='Máximo de resultados por búsqueda')
    
    args = parser.parse_args()
    
    loader = FoodLoader()
    
    # Intentar cargar desde cache
    if not args.refresh and loader.load_from_cache():
        print("📦 Usando comidas desde cache")
    else:
        # Cargar desde API
        queries = get_default_food_queries()
        loader.search_and_load_foods(queries, max_per_query=args.max_per_query)
    
    # Generar archivo Prolog
    loader.generate_prolog_file()
    
    print("\n" + "="*60)
    print("✅ Proceso completado")
    print(f"📄 Archivo generado: {loader.comidas_file}")
    print(f"💾 Cache guardado: {loader.cache_file}")
    print(f"🍽️  Total de comidas: {len(loader.loaded_foods)}")
    print("="*60)
