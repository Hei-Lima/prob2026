import csv
from pathlib import Path

def gerar_grafico_exp3():
    base_dir = Path(__file__).resolve().parent.parent
    data_dir = base_dir / "data" / "exp3"
    exp3_out_dir = base_dir / "EXP-3"
    exp3_out_dir.mkdir(exist_ok=True)

    files = list(data_dir.glob("exp3-*.csv"))
    if not files:
        print("Erro: Nenhum arquivo CSV encontrado em data/exp3.")
        return

    # Pega o timestamp com mais arquivos
    timestamps = {}
    for f in files:
        parts = f.stem.split("-")
        if len(parts) >= 3:
            ts = parts[2]
            timestamps[ts] = timestamps.get(ts, 0) + 1

    best_ts = max(timestamps.keys(), key=lambda k: timestamps[k])

    trajetorias = {}
    # 5 primeiros participantes exigidos pelo edital
    for pid in [1, 2, 3, 4, 5]:
        arquivo = data_dir / f"exp3-{pid}-{best_ts}.csv"
        with open(arquivo, "r", encoding="utf-8") as fp:
            reader = csv.DictReader(fp)
            # Saldo inicial no instante t=0 é 100
            saldos = [100.0] + [float(row["saldo"]) for row in reader]

        # Amostragem para ficar leve no pgfplots (passo de 10 rodadas, mais os pontos extremos)
        pontos = [(0, 100.0)]
        for t in range(10, len(saldos), 10):
            pontos.append((t, saldos[t]))
        if (len(saldos) - 1, saldos[-1]) not in pontos:
            pontos.append((len(saldos) - 1, saldos[-1]))

        # Edital pág 9: "Após a parada, manter o saldo constante no gráfico, se necessário."
        saldo_final = saldos[-1]
        t_final = len(saldos) - 1
        if t_final < 500:
            for t in range(((t_final // 10) + 1) * 10, 501, 50):
                pontos.append((t, saldo_final))
            if (500, saldo_final) not in pontos:
                pontos.append((500, saldo_final))

        trajetorias[pid] = (pontos, saldo_final, t_final)

    # Escreve arquivo LaTeX
    caminho_tex = exp3_out_dir / "grafico_exp3.tex"
    cores = {
        1: "blue!80!black",
        2: "red!80!black",
        3: "orange!80!black",
        4: "green!60!black",
        5: "purple!80!black"
    }

    with open(caminho_tex, "w", encoding="utf-8") as f:
        f.write("% Codigo do grafico de trajetorias dos 5 primeiros participantes (Exp 3)\n")
        f.write("\\begin{figure}[H]\n")
        f.write("\\centering\n")
        f.write("\\begin{tikzpicture}\n")
        f.write("\\begin{axis}[\n")
        f.write("    width=0.95\\textwidth,\n")
        f.write("    height=7.5cm,\n")
        f.write("    xlabel={Número de Rodadas},\n")
        f.write("    ylabel={Saldo do Participante (créditos)},\n")
        f.write("    xmin=0, xmax=510,\n")
        f.write("    ymin=-5, ymax=335,\n")
        f.write("    legend style={at={(0.5,1.03)}, anchor=south, legend columns=3, font=\\scriptsize},\n")
        f.write("    grid=major,\n")
        f.write("    major grid style={dashed, gray!40}\n")
        f.write("]\n\n")

        # Linha de referencia do saldo inicial (100)
        f.write("% Linha de referencia: Saldo Inicial 100\n")
        f.write("\\addplot[gray!80!black, dotted, line width=1.1pt, domain=0:500] {100};\n")
        f.write("\\addlegendentry{Saldo Inicial ($100$)}\n")

        # Linha de ruina / esgotamento (0)
        f.write("% Linha de esgotamento: 0\n")
        f.write("\\addplot[red!70!black, dashed, line width=1.0pt, domain=0:500] {0};\n")
        f.write("\\addlegendentry{Esgotamento ($0$)}\n\n")

        for pid in [1, 2, 3, 4, 5]:
            pontos, sf, tf = trajetorias[pid]
            status = f"Saldo final: {int(sf)}"
            f.write(f"% Participante {pid}\n")
            f.write(f"\\addplot[{cores[pid]}, thick] coordinates {{\n")
            for t, val in pontos:
                f.write(f"    ({t}, {val})\n")
            f.write("};\n")
            f.write(f"\\addlegendentry{{Part. {pid} ({status})}}\n\n")

        f.write("\\end{axis}\n")
        f.write("\\end{tikzpicture}\n")
        f.write("\\caption{Evolução do saldo dos cinco primeiros participantes virtuais ao longo de até $500$ rodadas (semente 42). Nota-se que os participantes 2 e 5 sofreram esgotamento precoce (ruína do jogador), o participante 3 terminou em perda sem ruína, enquanto os participantes 1 e 4 encerraram com lucro.}\n")
        f.write("\\label{fig:exp3_trajetorias_5}\n")
        f.write("\\end{figure}\n")

    print(f"Sucesso! Código do gráfico gerado em: {caminho_tex}")

if __name__ == "__main__":
    gerar_grafico_exp3()
