import csv
from pathlib import Path

def gerar_dados_trajetorias_exp2():
    base_dir = Path(__file__).resolve().parent.parent
    data_dir = base_dir / "data" / "exp2"
    exp2_out_dir = base_dir / "EXP-2"
    seeds = [10, 2026, 123456]
    trajetorias = {}

    for s in seeds:
        arquivos = list(data_dir.glob(f"exp2-{s}-*.csv"))
        if not arquivos:
            print(f"Erro: Arquivo para a semente {s} não encontrado.")
            return

        arquivos.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        arquivo_escolhido = arquivos[0]

        with open(arquivo_escolhido, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            lucros = [float(row["P"]) - 1.0 for row in reader]

        soma = 0.0
        pontos = []
        for i, x in enumerate(lucros, start=1):
            soma += x
            if i % 100 == 0:
                media = soma / i
                pontos.append((i, round(media, 4)))

        trajetorias[s] = pontos

    exp2_out_dir.mkdir(exist_ok=True)

    caminho_tex = exp2_out_dir / "grafico_exp2.tex"
    with open(caminho_tex, "w", encoding="utf-8") as f:
        f.write("% Codigo do grafico de trajetorias para o Experimento 2\n")
        f.write("\\begin{figure}[H]\n")
        f.write("\\centering\n")
        f.write("\\begin{tikzpicture}\n")
        f.write("\\begin{axis}[\n")
        f.write("    width=0.95\\textwidth,\n")
        f.write("    height=7cm,\n")
        f.write("    xlabel={Número de Rodadas},\n")
        f.write("    ylabel={Média Acumulada do Lucro ($X$)},\n")
        f.write("    xmin=0, xmax=10200,\n")
        f.write("    ymin=-0.8, ymax=0.35,\n")
        f.write("    legend style={at={(0.75,0.95)}, anchor=north, legend columns=2},\n")
        f.write("    grid=major,\n")
        f.write("    major grid style={dashed, gray!40}\n")
        f.write("]\n\n")

        f.write("% Linha teorica de esperança E[X] = -0.16\n")
        f.write("\\addplot[red!80!black, dashed, line width=1.3pt, domain=0:10000] {-0.16};\n")
        f.write("\\addlegendentry{Teórico $\\mathbb{E}[X] = -0{,}16$}\n\n")

        cores = {10: "blue!70!black", 2026: "orange!80!black", 123456: "green!60!black"}

        for s in seeds:
            f.write(f"% Trajetoria Semente {s}\n")
            f.write(f"\\addplot[{cores[s]}, thick] coordinates {{\n")
            for rodada, media in trajetorias[s]:
                f.write(f"    ({rodada}, {media})\n")
            f.write("};\n")
            f.write(f"\\addlegendentry{{Semente {s}}}\n\n")

        f.write("\\end{axis}\n")
        f.write("\\end{tikzpicture}\n")
        f.write("\\caption{Trajetórias da média acumulada do lucro líquido para as três sementes ao longo de $10.000$ rodadas. As oscilações iniciais atenuam-se conforme a amostra cresce, convergindo para a esperança teórica de $-0{,}16$ créditos.}\n")
        f.write("\\label{fig:exp2_trajetorias}\n")
        f.write("\\end{figure}\n")

    print(f"Sucesso! Código do gráfico de trajetórias gerado em: {caminho_tex}")

    # Segundo arquivo separado: grafico_exp2_diferenca.tex (sem modulo: \bar{X} - E[X])
    caminho_tex_dif = exp2_out_dir / "grafico_exp2_diferenca.tex"
    with open(caminho_tex_dif, "w", encoding="utf-8") as f:
        f.write("% Codigo do grafico de diferenca real (sem modulo) para o Experimento 2\n")
        f.write("\\begin{figure}[H]\n")
        f.write("\\centering\n")
        f.write("\\begin{tikzpicture}\n")
        f.write("\\begin{axis}[\n")
        f.write("    width=0.95\\textwidth,\n")
        f.write("    height=7cm,\n")
        f.write("    xlabel={Número de Rodadas},\n")
        f.write("    ylabel={Diferença $(\\bar{X} - \\mathbb{E}[X])$},\n")
        f.write("    xmin=0, xmax=10200,\n")
        f.write("    ymin=-0.65, ymax=0.45,\n")
        f.write("    legend style={at={(0.75,0.95)}, anchor=north, legend columns=2},\n")
        f.write("    grid=major,\n")
        f.write("    major grid style={dashed, gray!40}\n")
        f.write("]\n\n")

        # Linha zero de referencia
        f.write("% Linha de diferenca zero\n")
        f.write("\\addplot[red!80!black, dashed, line width=1.3pt, domain=0:10000] {0};\n")
        f.write("\\addlegendentry{Diferença Nula ($0$)}\n\n")

        for s in seeds:
            f.write(f"% Diferenca Semente {s}\n")
            f.write(f"\\addplot[{cores[s]}, thick] coordinates {{\n")
            for rodada, media in trajetorias[s]:
                dif = round(media - (-0.16), 4)
                f.write(f"    ({rodada}, {dif})\n")
            f.write("};\n")
            f.write(f"\\addlegendentry{{Semente {s}}}\n\n")

        f.write("\\end{axis}\n")
        f.write("\\end{tikzpicture}\n")
        f.write("\\caption{Evolução da diferença real $(\\bar{X} - \\mathbb{E}[X])$ entre a média acumulada e a esperança teórica ao longo de $10.000$ rodadas. Observa-se que as trajetórias oscilam acima e abaixo do eixo zero antes de convergirem para o equilíbrio.}\n")
        f.write("\\label{fig:exp2_diferenca}\n")
        f.write("\\end{figure}\n")

    print(f"Sucesso! Código do gráfico de diferença gerado em: {caminho_tex_dif}")

if __name__ == "__main__":
    gerar_dados_trajetorias_exp2()
