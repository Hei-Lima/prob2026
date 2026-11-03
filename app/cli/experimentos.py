import sys

from libs import csv, maquina, resultado as r

def rodar_n_vezes(n: int, seed: int) -> list:
    lista = []
    maq = maquina.Maquina(seed)

    for _ in range(n):
        resultado = maq.rodar()
        lista.append(resultado)

    return lista

def rodar_n_vezes_com_saldo(n: int, saldo: int, maq: maquina.Maquina) -> list:
    lista = []
    s = saldo

    for _ in range(n):
        resultado = maq.rodar()
        s = s - 1 + resultado.P
        resultado_saldo = r.ResultadoSaldo(P=resultado.P, sequencia=resultado.sequencia, saldo=s)
        lista.append(resultado_saldo)
        if s < 1:
            break

    return lista

def experimento_1() -> None:
    seed = 2026
    l = rodar_n_vezes(10000, seed)

    arquivo = csv.criar_csv("data/", seed, 1)
    csv.escrever_lista_para_csv(arquivo, l)

def experimento_2() -> None:
    l1 = rodar_n_vezes(10000, 10)
    l2 = rodar_n_vezes(10000, 2026)
    l3 = rodar_n_vezes(10000, 123456)

    arquivo = csv.criar_csv("data/", 10, 2)
    csv.escrever_lista_para_csv(arquivo, l1)

    arquivo = csv.criar_csv("data/", 2026, 2)
    csv.escrever_lista_para_csv(arquivo, l2)

    arquivo = csv.criar_csv("data/", 123456, 2)
    csv.escrever_lista_para_csv(arquivo, l3)

def experimento_3() -> None:
    maq = maquina.Maquina(42)

    for i in range(100):
        l = rodar_n_vezes_com_saldo(500, 100, maq)
        arquivo = csv.criar_csv("data/", i + 1, 3)
        csv.escrever_lista_para_csv_saldo(arquivo, l)

def gerar_todos_csvs() -> None:
    print("\n" + "=" * 50)
    print("         GERANDO CSVS DOS EXPERIMENTOS")
    print("=" * 50)
    print("-> Executando Experimento 1 (10.000 rodadas, seed 2026)...")
    experimento_1()
    print("   [OK] Experimento 1 finalizado!")

    print("-> Executando Experimento 2 (3 x 10.000 rodadas, seeds 10, 2026, 123456)...")
    experimento_2()
    print("   [OK] Experimento 2 finalizado!")

    print("-> Executando Experimento 3 (100 participantes, seed 42)...")
    experimento_3()
    print("   [OK] Experimento 3 finalizado!")

    print("\n[SUCESSO] Todos os CSVs foram gerados com sucesso na pasta data/!")
