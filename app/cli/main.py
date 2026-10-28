from libs import csv, maquina

def main() -> None:
    experimento_1()
    experimento_2()
    

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

def rodar_n_vezes(n, seed):
    lista = []

    maq = maquina.Maquina(seed)

    
    for _ in range(n):
        resultado = maq.rodar()
        lista.append(resultado)

    return lista

if __name__ == "__main__":
    main()