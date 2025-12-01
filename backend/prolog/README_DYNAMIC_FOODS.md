# 🍽️ Sistema Dinámico de Comidas con FoodData Central

Este sistema carga comidas **dinámicamente** desde la API de FoodData Central del USDA en lugar de usar hechos estáticos.

## 📋 Descripción

En lugar de tener ~50 comidas hardcodeadas en `comidas.pl`, ahora el sistema:

1. **Busca comidas reales** desde FoodData Central API
2. **Categoriza automáticamente** basándose en nutrientes y nombres
3. **Genera hechos Prolog** dinámicamente
4. **Cachea resultados** para evitar llamadas innecesarias a la API

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│   FoodData Central API (USDA)           │
│   https://fdc.nal.usda.gov/             │
└───────────────┬─────────────────────────┘
                │
                │ HTTP Request
                ▼
┌─────────────────────────────────────────┐
│   food_loader.py                        │
│   - Busca comidas                       │
│   - Categoriza automáticamente          │
│   - Extrae nutrientes                   │
└───────────────┬─────────────────────────┘
                │
                │ Genera
                ▼
┌─────────────────────────────────────────┐
│   comidas_dynamic.pl (86 comidas)       │
│   comida(Name, Climate, State,          │
│          TimeType, Category,            │
│          Calories, FdcId)               │
└───────────────┬─────────────────────────┘
                │
                │ Consulta
                ▼
┌─────────────────────────────────────────┐
│   comidas_rules.pl                      │
│   - Reglas de recomendación             │
│   - Lógica de negocio                   │
└───────────────┬─────────────────────────┘
                │
                │ Usa
                ▼
┌─────────────────────────────────────────┐
│   prolog_engine.py                      │
│   - Carga Prolog                        │
│   - Ejecuta consultas                   │
└───────────────┬─────────────────────────┘
                │
                │ Sirve
                ▼
┌─────────────────────────────────────────┐
│   main.py (FastAPI)                     │
│   - Endpoints REST                      │
│   - Recomendaciones personalizadas      │
└─────────────────────────────────────────┘
```

## 🚀 Uso

### 1. Generar/Recargar Comidas

```bash
# Desde el directorio backend
poetry run python prolog/food_loader.py

# O forzar recarga desde API
poetry run python prolog/food_loader.py --refresh

# Especificar cuántas comidas por búsqueda
poetry run python prolog/food_loader.py --max-per-query 3
```

### 2. Usar en el Servidor

El servidor automáticamente carga `comidas_dynamic.pl` si existe, sino usa `comidas.pl` (estático).

```bash
poetry run uvicorn main:app --reload
```

### 3. Endpoints Disponibles

```bash
# Recomendación general (usa sensores)
GET /recommend_food/{user_id}

# Recomendación personalizada
GET /recommend_personalized/{user_id}

# Crear usuario
POST /users
{
  "user_id": "user123",
  "nombre": "Juan",
  "edad": 25
}

# Agregar comida favorita
POST /users/{user_id}/favoritas
{
  "comida": "grilled_chicken"
}

# Establecer preferencias
POST /users/{user_id}/preferences
{
  "clima": "hot",
  "estado": "low_oxygen"
}
```

## 🤖 Categorización Automática

El sistema categoriza cada comida automáticamente:

### **Climate** (Clima recomendado)

- `hot`: Comidas ligeras, frescas, ensaladas
- `cold`: Comidas calientes, sopas, guisos
- `warm`: Comidas templadas, general

### **State** (Estado de oxigenación)

- `normal`: Para condiciones normales
- `low_oxygen`: Alta en proteína/hierro (para altitud)

### **TimeType** (Tiempo de preparación)

- `quick`: < 20 min (comidas simples, crudas)
- `medium`: 20-45 min (mayoría de comidas)
- `long`: > 45 min (horneados, asados)

### **Category** (Tipo de comida)

- `breakfast`: Desayuno
- `lunch`: Almuerzo
- `dinner`: Cena
- `snack`: Snack

### **Calories**

Extraídas directamente de FoodData Central

## 📊 Archivos Generados

### `comidas_dynamic.pl`

Archivo Prolog con todos los hechos de comidas:

```prolog
comida(grilled_chicken, warm, normal, medium, dinner, 217, '2315141').
food_display_name(grilled_chicken, 'GRILLED CHICKEN').
food_fdc_id(grilled_chicken, '2315141').
```

### `food_cache.json`

Cache JSON con todas las comidas para evitar llamadas repetidas a la API:

```json
{
  "generated_at": "2025-11-24T13:46:08",
  "total_foods": 86,
  "foods": [...]
}
```

## 🔄 Actualización de Comidas

Para agregar más comidas, edita `food_loader.py`:

```python
FOOD_CATEGORIES = {
    'breakfast': [
        'oatmeal', 'scrambled eggs', ...
        'tu_nueva_comida_aqui'  # Agregar aquí
    ],
    # ...
}
```

Luego ejecuta:

```bash
poetry run python prolog/food_loader.py --refresh
```

## ⚡ Ventajas del Sistema Dinámico

1. ✅ **Datos Reales**: Información nutricional directa del USDA
2. ✅ **Escalable**: Fácil agregar nuevas comidas
3. ✅ **Actualizable**: Puedes recargar datos cuando quieras
4. ✅ **Trazable**: Cada comida tiene FdcId para más detalles
5. ✅ **Cache Inteligente**: No hace llamadas innecesarias a la API
6. ✅ **Categorización Automática**: No necesitas categorizar manualmente

## 🔧 Personalización

### Cambiar Categorización

Edita la clase `FoodCategorizer` en `food_loader.py`:

```python
@staticmethod
def categorize_meal_time(name: str, nutrients: dict) -> str:
    # Modifica las palabras clave aquí
    breakfast_keywords = ['oatmeal', 'egg', ...]
    # ...
```

### Agregar Más Nutrientes

El sistema puede extraer cualquier nutriente de FoodData Central. Para agregar más:

1. Modifica `_process_food()` en `food_loader.py`
2. Actualiza la estructura `comida/N` en `comidas_dynamic.pl`
3. Ajusta `comidas_rules.pl` para usar los nuevos datos

## 📝 Notas

- Primera ejecución tarda ~30-60 segundos (busca 86 comidas en la API)
- Ejecuciones posteriores usan cache (instantáneo)
- Si cambias las categorías, usa `--refresh` para actualizar
- El archivo `comidas.pl` original se mantiene como fallback

## 🐛 Troubleshooting

**Error: "No module named 'dotenv'"**

```bash
poetry install
```

**No se generan comidas**

- Verifica que tu `API_KEY` esté en `.env`
- Verifica conexión a internet
- Revisa que FoodData Central API esté disponible

**Prolog no carga las comidas**

- Verifica que `comidas_dynamic.pl` exista
- Verifica que `comidas_rules.pl` exista
- Revisa los logs del servidor

## 📚 Recursos

- [FoodData Central API](https://fdc.nal.usda.gov/api-guide.html)
- [SWI-Prolog Docs](https://www.swi-prolog.org/pldoc/doc_for?object=manual)
- [PySwip GitHub](https://github.com/yuce/pyswip)
