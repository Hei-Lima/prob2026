from dataclasses import dataclass

@dataclass
class Resultado:
    P: float
    sequencia: list[str]
    X: float = 0.0

    def __post_init__(self):
        self.X = self.P - 1.0

    def __str__(self) -> str:
        return f"{self.P}, {self.sequencia}"