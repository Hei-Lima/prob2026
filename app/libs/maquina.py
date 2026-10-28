import random
from libs.resultado import Resultado

class Maquina:
    def __init__(self, seed: int):
        random.seed(seed)
        self._opcoes = ['A', 'B', 'C', 'D', 'E']
        self._premios = {'A': 5, 'B': 10, 'C': 15, 'D': 25, 'E': 50}

    def rodar(self):
        m = self.gerar_matriz()
        P = self.estimar_premio(m)
        sequencia = [self._opcoes[m[1][0]], self._opcoes[m[1][1]], self._opcoes[m[1][2]]]

        res = Resultado(P, sequencia)
        
        return res

    def gerar_matriz(self):
        t = len(self._opcoes) - 1
        x = random.randint(0, t)
        y = random.randint(0, t)
        z = random.randint(0, t)

        t = t + 1
        l1 = [x, y, z]
        l2 = [(x + 1) % t, (y + 1) % t, (z + 1) % t]
        l3 = [(x + 2) % t, (y + 2) % t, (z + 2) % t]

        return [l1, l2, l3]

    def estimar_premio(self, m:list[list[int]]) -> int:
        l = m[1]

        if l[0] == l[1] == l[2]:
            return self._premios[self._opcoes[l[0]]]

        return 0