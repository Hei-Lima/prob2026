from dataclasses import dataclass

@dataclass
class Resultado:
    P: int
    sequencia: list[str]

    def __str__(self) -> str:
        return f"{self.P}, {self.sequencia}"