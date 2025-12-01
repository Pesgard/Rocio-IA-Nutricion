from pyswip import Prolog
import os
from pathlib import Path


class PrologEngine:
    def __init__(self):
        self.prolog = Prolog()
        # 1. Obtiene la ruta del directorio donde se encuentra este archivo (prolog_engine.py)
        self.base_dir = Path(__file__).parent

        # 2. Archivos de comidas (priorizar dinámico sobre estático)
        self.comidas_dynamic = str(self.base_dir / "comidas_dynamic.pl")
        self.comidas_static = str(self.base_dir / "comidas.pl")
        self.comidas_rules = str(self.base_dir / "comidas_rules.pl")
        
        # 3. Archivos de usuarios
        self.usuarios_file = str(self.base_dir / "usuarios.pl")
        self.usuarios_data_file = str(self.base_dir / "usuarios_data.pl")

    def consult(self):
        """Load a Prolog file."""
        # This method needs to be updated to load the new file paths.
        # For now, it will attempt to load the dynamic food data if it exists,
        # otherwise it will fall back to the static food data.
        # It also loads the rules and user data.
        
        # Load rules first as they might define predicates used by data files
        self.prolog.consult(self.comidas_rules)
        
        # Prioritize dynamic food data
        if Path(self.comidas_dynamic).exists():
            self.prolog.consult(self.comidas_dynamic)
        else:
            self.prolog.consult(self.comidas_static)

        # Load user-related data
        if Path(self.usuarios_file).exists():
            self.prolog.consult(self.usuarios_file)
        if Path(self.usuarios_data_file).exists():
            self.prolog.consult(self.usuarios_data_file)


    def query(self, query_string):
        """Execute a Prolog query and return the results."""
        print("Query string:", query_string)
        return list(self.prolog.query(query_string))

    def assertz(self, fact):
        """Add a fact to the Prolog database."""
        self.prolog.assertz(fact)

    def retract(self, fact):
        """Remove a fact from the Prolog database."""
        self.prolog.retract(fact)

    def food_recommendation(self, weather: str, state: str, time: int = 40):
        query = f"recomendar({weather}, {state}, {time}, Comida)"
        results = self.query(query)
        return [result["Comida"] for result in results]
