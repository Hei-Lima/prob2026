import sys
import time
from pathlib import Path

# Garante que a pasta 'app' esteja no sys.path mesmo executando o script diretamente
sys.path.append(str(Path(__file__).resolve().parent.parent))

from libs import maquina
try:
    from cli import experimentos
except ImportError:
    import experimentos

def main() -> None:
    menu()

def menu() -> None:
    while True:
        print("\n" + "=" * 50)
        print("         MÁQUINA ESTATÍSTICA - MENU")
        print("=" * 50)
        print("1. Gerar CSVs dos experimentos")
        print("2. Acessar interface CLI para Jogar")
        print("0. Sair")
        print("-" * 50)

        opcao = input("Escolha uma opção: ").strip()

        if opcao == "1":
            gerar_csvs()
        elif opcao == "2":
            interface_cli_jogar()
        elif opcao == "0":
            print("\nBabaye")
            break
        else:
            print("\n[!] Opção inválida! Escolha 1, 2 ou 0.")

def interface_cli_jogar() -> None:
    print("\n" + "=" * 50)
    print("      MÁQUINA DE ROLOS")
    print("=" * 50)
    print("Regras:")
    print("  - Aposta: 1 crédito fictício por rodada")
    print("  - Paga apenas linha central igual:")
    print("      A-A-A: 5 | B-B-B: 10 | C-C-C: 15 | D-D-D: 25 | E-E-E: 50")
    print("-" * 50)

    saldo = 100
    maq = maquina.Maquina(int(time.time()))

    print(f"Saldo inicial: {saldo} créditos fictícios.\n")
    print("Comandos: Pressione [ENTER] para girar | 's' para sair\n")

    while saldo >= 1:
        entrada = input(f"[Saldo: {saldo} cr] Girar? (Enter/s): ").strip().lower()
        if entrada == "s":
            print("\nVoltando ao menu principal...")
            break

        saldo -= 1
        resultado = maq.rodar()
        saldo += resultado.P

        slots = " | ".join(resultado.sequencia)
        print(f"\n  >> [ {slots} ] <<")
        if resultado.P > 0:
            print(f"  PARABÉNS! Vitória: +{resultado.P} créditos (Lucro na rodada: +{resultado.P - 1})")
        else:
            print("  Não foi dessa vez. (0 créditos)")
        print(f"  Saldo atual: {saldo} créditos\n")

    if saldo < 1:
        print("\n[!] Seus créditos acabaram! O saldo chegou a zero.")
        input("Pressione [ENTER] para voltar ao menu...")

def gerar_csvs() -> None:
    experimentos.gerar_todos_csvs()
    input("\nPressione [ENTER] para voltar ao menu...")

if __name__ == "__main__":
    main()