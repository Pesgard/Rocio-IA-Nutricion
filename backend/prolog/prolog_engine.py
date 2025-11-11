from pyswip import Prolog
import os
from pathlib import Path


class PrologEngine:
    def __init__(self):
        self.prolog = Prolog()
        # 1. Obtiene la ruta del directorio donde se encuentra este archivo (prolog_engine.py)
        base_dir = Path(__file__).parent

        # 2. Construye la ruta al archivo 'comidas.pl'
        self.filePath = str(base_dir / "comidas.pl")

    def consult(self):
        """Load a Prolog file."""
        self.prolog.consult(self.filePath)

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
