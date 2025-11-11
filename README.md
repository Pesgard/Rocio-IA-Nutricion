
## Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Arquitectura](#-arquitectura)
- [Requisitos del Sistema](#-requisitos-del-sistema)
- [Setup Inicial](#-setup-inicial)
- [Gestión de Dependencias](#-gestión-de-dependencias)
- [Ejecutar el Proyecto](#-ejecutar-el-proyecto)
- [Endpoints Principales](#-endpoints-principales)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Troubleshooting](#-troubleshooting)

---

## Descripción General

combina sensores IoT (ESP32 + oxímetro), backend en Python (FastAPI), motor lógico en Prolog y datos nutricionales reales de la API de USDA para generar recomendaciones personalizadas de comida según:

- Estado fisiológico (oxígeno, pulso)
- Condiciones ambientales (temperatura, luz)
- Tiempo disponible (~40 minutos)
- Clima actual
- Información nutricional verificada

---

## Arquitectura

```
ESP32 (Sensores) 
    ↓
FastAPI Backend (Python)
    ↓
Motor Lógico (Prolog)
    ↓
FoodData Central API (USDA)
    ↓
Frontend (Chat / Web UI)
```

| Componente | Tecnología | Descripción |
|-----------|-----------|-------------|
| Microcontrolador | ESP32-S3 | Envía datos del usuario |
| Backend API | FastAPI + Poetry | Procesa datos y ejecuta lógica |
| Motor Lógico | SWI-Prolog + PySwip | Reglas nutricionales |
| API Nutricional | FoodData Central | Datos reales de nutrientes |
| Frontend | React/Chat UI | Interfaz conversacional |

---

## 🔧 Requisitos del Sistema

### 1️⃣ Python

**Versión mínima requerida:** Python **3.11**

Verifica tu versión actual:

```bash
python --version
# o
python3 --version
```

**Instalación:**

- **macOS** (Homebrew):
  ```bash
  brew install python@3.11
  ```

- **Ubuntu/Debian**:
  ```bash
  sudo apt update
  sudo apt install python3.11 python3.11-venv python3.11-dev
  ```

- **Windows**: Descarga desde [python.org](https://www.python.org/downloads/)

---

### 2️⃣ pipx (para instalar Poetry aisladamente)

pipx permite instalar herramientas CLI de Python en entornos aislados, evitando conflictos.

**Instalación:**

```bash
# macOS (Homebrew)
brew install pipx
pipx ensurepath

# Ubuntu/Debian
sudo apt install pipx
pipx ensurepath

# Windows (PowerShell)
python -m pip install --user pipx
python -m pipx ensurepath
```

Cierra y vuelve a abrir la terminal después de instalar.

Verifica:
```bash
pipx --version
```

---

### 3️⃣ Poetry (gestor de dependencias)

Poetry maneja las dependencias del proyecto de forma determinista.

**Instalación con pipx** (recomendado):

```bash
pipx install poetry
```

Verifica:
```bash
poetry --version
```

**Configuración recomendada:**

```bash
# Crear virtualenvs dentro del proyecto (opcional pero útil)
poetry config virtualenvs.in-project true
```

---

### 4️⃣ SWI-Prolog

Motor de lógica necesario para las reglas de recomendación.

**Instalación:**

- **macOS**:
  ```bash
  brew install swi-prolog
  ```

- **Ubuntu/Debian**:
  ```bash
  sudo apt-add-repository ppa:swi-prolog/stable
  sudo apt update
  sudo apt install swi-prolog
  ```

- **Windows**: Descarga desde [swi-prolog.org](https://www.swi-prolog.org/Download.html)

Verifica:
```bash
swipl --version
```

---

## 🚀 Setup Inicial

### 1️⃣ Clonar el Repositorio

```bash
git clone <url-del-repo>
```

### 2️⃣ Configurar el Backend

```bash
cd backend
```

### 3️⃣ Instalar Dependencias con Poetry

```bash
# Instala todas las dependencias del pyproject.toml
poetry install
```

Esto creará un virtualenv automáticamente y instalará:
- FastAPI
- Uvicorn
- PySwip
- Python-dotenv
- Requests
- Pydantic

### 4️⃣ Configurar Variables de Entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Edita `.env` y agrega tu API Key:

```env
FOODDATA_API_KEY=tu_api_key_aqui
```

**Obtener API Key gratuita:**
👉 [https://fdc.nal.usda.gov/api-key-signup.html](https://fdc.nal.usda.gov/api-key-signup.html)

---

## 📦 Gestión de Dependencias

### ➕ Agregar una Nueva Librería

```bash
# Agregar dependencia de producción
poetry add nombre-libreria

# Agregar dependencia de desarrollo (testing, linting, etc.)
poetry add --group dev nombre-libreria

# Ejemplo: agregar pytest
poetry add --group dev pytest
```

### 📝 Actualizar poetry.lock

Después de agregar librerías, Poetry actualiza automáticamente `poetry.lock`. **Siempre commitea este archivo** para mantener versiones consistentes en el equipo.

```bash
git add poetry.lock pyproject.toml
git commit -m "Add nueva-libreria dependency"
```

### 🔄 Sincronizar Dependencias

Si otro dev agregó librerías, sincroniza tu entorno:

```bash
poetry install
```

### 📋 Ver Dependencias Instaladas

```bash
poetry show
```

### ⬆️ Actualizar Dependencias

```bash
# Actualizar todas las dependencias
poetry update

# Actualizar una específica
poetry update nombre-libreria
```

---

## ▶️ Ejecutar el Proyecto

### Activar el Entorno Virtual (opcional)

```bash
# Opción 1: Activar manualmente
poetry shell

# Opción 2: Ejecutar comandos directamente con poetry run
```

### Iniciar el Servidor de Desarrollo

```bash
# Dentro de /backend
poetry run uvicorn main:app --reload
```

El servidor estará disponible en:
- **API**: http://127.0.0.1:8000
- **Docs interactivas**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

---

## 🔌 Endpoints Principales

### 1️⃣ Registrar Datos de Sensores

**Endpoint:** `POST /sensors`

```bash
curl -X POST http://127.0.0.1:8000/sensors \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "alumno_123",
    "oxygen_level": 96,
    "temperature": 25
  }'
```

### 2️⃣ Obtener Recomendaciones

**Endpoint:** `GET /recommend_food/{user_id}`

```bash
curl http://127.0.0.1:8000/recommend_food/alumno_123
```

**Respuesta esperada:**

```json
{
  "user_id": "alumno_123",
  "weather": "hot",
  "state": "normal",
  "recommendations": [
    {
      "comida": "omelette_spinach",
      "info": [
        {
          "nombre": "Omelet with spinach",
          "nutrientes": {
            "Energy": 230,
            "Protein": 12.5,
            "Carbohydrate": 6.1
          }
        }
      ]
    }
  ]
}
```

---

## 📂 Estructura del Proyecto

```
/project-root
│
├── /backend
│   ├── main.py                 # Servidor FastAPI principal
│   ├── prolog/
│   │   ├── prolog_engine.py    # Conector con SWI-Prolog
│   │   └── foods.pl            # Base de conocimiento (50+ hechos, 8+ reglas)
│   ├── food_api/
│   │   └── food_api.py         # Conector con API de FoodData Central
│   ├── .env.example            # Variables de entorno de ejemplo
│   ├── .env                    # Tu archivo local (NO commitear)
│   ├── pyproject.toml          # Configuración de Poetry y dependencias
│   ├── poetry.lock             # Versiones exactas (SÍ commitear)
│   ├── README.md               # Documentación técnica
│   └── .gitignore
│
├── /firmware                   # (Futuro) Código ESP32
├── /frontend                   # (Futuro) Interfaz React
└── README.md                   # Documentación general
```

---

## 🐛 Troubleshooting

### Error: `Poetry not found`

```bash
# Reinstala con pipx
pipx install poetry

# Asegúrate de que esté en el PATH
pipx ensurepath
```

### Error: `SWI-Prolog not found`

Verifica que SWI-Prolog esté instalado:
```bash
swipl --version
```

Si no está, revisa la sección de instalación arriba.

### Error: `Python version mismatch`

Poetry requiere Python 3.11+. Verifica con:
```bash
poetry env info
```

Para usar una versión específica:
```bash
poetry env use python3.11
poetry install
```

### Error al importar `pyswip`

En macOS con Apple Silicon, puede requerir:
```bash
brew install swi-prolog
poetry add pyswip
```

### Problemas con `.env`

Asegúrate de que:
1. Existe el archivo `.env` en `/backend`
2. Contiene la clave `API_KEY=...`
3. La API key es válida

---

## Próximos Pasos

- [ ] Conectar ESP32 vía Wi-Fi/MQTT
- [ ] Agregar Persistencia de datos
- [ ] Implementar frontend
- [ ] Sistema de perfiles de usuario
---
