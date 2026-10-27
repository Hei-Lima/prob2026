import random
from typing import TypedDict


class ResultadoRodada(TypedDict):
    P: int
    sequencia: list[str]

class Maquina:
    def __init__(self, seed: int) -> None:
        random.seed(seed)
        self._opcoes = ['A', 'B', 'C', 'D', 'E']
        self._premios = {'A': 5, 'B': 10, 'C': 15, 'D': 25, 'E': 50} 

    def rodar(self) -> ResultadoRodada:
        # gera a matriz 3x3 aleatoria
        m = self.gerar_matriz()

        # estima o premio dada a matriz
        P = self.estimar_premio(m)

        # traduz sequencia de indices em letras
        sequencia = [self._opcoes[m[1][0]], self._opcoes[m[1][1]], self._opcoes[m[1][2]]]

        return {"P": P, "sequencia": sequencia}

    def gerar_matriz(self) -> list[list[int]]:
        # não consigo usar magic numbers, desculpa... t = 5 - 1 para [a, b, c, d, e]
        t  = len(self._opcoes) - 1
        x = random.randint(0, t)
        y = random.randint(0, t)
        z = random.randint(0, t)

        # t = 5
        t = t + 1
        l1 = [x, y, z]
        l2 = [(x + 1) % t, (y + 1) % t, (z + 1) % t]
        l3 = [(x + 2) % t, (y + 2) % t, (z + 2) % t]

        return [l1, l2, l3]

    def estimar_premio(self, m: list[list[int]]) -> int:
        # pega linha do meio (a que importa)
        l = m[1]

        if (l[0] == l[1] and l[0] == l[2]):
            return self._premios[self._opcoes[l[0]]]

        else:
            return 0