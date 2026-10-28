from datetime import datetime
from libs.resultado import Resultado
import csv
from pathlib import Path

def escrever_lista_para_csv(path: str, lista: list[Resultado]) -> None:
    arquivo = Path(path)

    with open(arquivo, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)

        writer.writerow(["P", "slot_1", "slot_2", "slot_3"])

        for resultado in lista:
            writer.writerow([resultado.P, *resultado.sequencia])

def criar_csv(path: str, seed: int, exp: int) -> str:
    data = datetime.now().strftime("%Y%m%d_%H%M%S")
    nome = f"{path}exp{exp}/exp{exp}-{seed}-{data}.csv"

    with open(nome, "x", encoding="utf-8") as _f:
        pass

    return nome