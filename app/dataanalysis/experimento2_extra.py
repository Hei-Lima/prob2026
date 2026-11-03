import random
from pathlib import Path

def executar_experimento2_extra():
    seed = 2026
    random.seed(seed)
    
    tabela_lucros = {0: 4, 1: 9, 2: 14, 3: 24, 4: 49}
    
    # Pontos de amostragem solicitados (ate 10 milhoes para viabilidade computacional no Python)
    checkpoints = [100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000]
    set_checkpoints = set(checkpoints)
    max_rodadas = checkpoints[-1]
    
    resultados = {}
    lucro_total = 0
    
    for i in range(1, max_rodadas + 1):
        x = (random.randint(0, 4) + 1) % 5
        y = (random.randint(0, 4) + 1) % 5
        z = (random.randint(0, 4) + 1) % 5
        
        if x == y == z:
            lucro_total += tabela_lucros[x]
        else:
            lucro_total -= 1
            
        if i in set_checkpoints:
            media = lucro_total / i
            dif = media - (-0.16)
            resultados[i] = (media, dif)
            print(f"Rodadas: {i:>10} | Media: {media:>10.6f} | Dif: {dif:>+10.6f}")

    base_dir = Path(__file__).resolve().parent.parent
    exp2_out_dir = base_dir / "EXP-2"
    exp2_out_dir.mkdir(exist_ok=True)
    with open(exp2_out_dir / "extra_convergencia_2026.csv", "w", encoding="utf-8") as f:
        f.write("rodadas,media_lucro,diferenca_teorica\n")
        for n in checkpoints:
            m, d = resultados[n]
            f.write(f"{n},{m:.6f},{d:.6f}\n")

if __name__ == "__main__":
    executar_experimento2_extra()
