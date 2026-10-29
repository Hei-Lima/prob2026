from datetime import datetime
from libs.resultado import Resultado
import csv
from pathlib import Path

def _resolver_caminho_base(path: str | Path) -> Path:
    p = Path(path)
    if p.is_absolute():
        p.mkdir(parents=True, exist_ok=True)
        return p
    # Se existe localmente (ex: executando a partir de 'app/')
    if p.exists():
        return p.resolve()
    # Se executando a partir da raiz do repositório
    candidato = Path(__file__).resolve().parent.parent / path
    candidato.mkdir(parents=True, exist_ok=True)
    return candidato.resolve()

def _format_num(v: float | int) -> int | float:
    try:
        val = float(v)
        return int(val) if val == int(val) else val
    except (ValueError, TypeError):
        return v

def criar_csv(path: str | Path, seed: int | str, exp: int, sufixo: str = "") -> str:
    base = _resolver_caminho_base(path)
    pasta_exp = base / f"exp{exp}"
    pasta_exp.mkdir(parents=True, exist_ok=True)

    data = datetime.now().strftime("%Y%m%d_%H%M%S")
    if sufixo:
        nome_arquivo = f"exp{exp}-{sufixo}-{seed}-{data}.csv"
    else:
        nome_arquivo = f"exp{exp}-{seed}-{data}.csv"

    arquivo = pasta_exp / nome_arquivo
    with open(arquivo, "x", encoding="utf-8") as _f:
        pass

    return str(arquivo)

def escrever_lista_para_csv(path: str | Path, lista: list[Resultado]) -> None:
    arquivo = Path(path)

    with open(arquivo, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["P", "slot_1", "slot_2", "slot_3"])

        for resultado in lista:
            p_val = _format_num(resultado.P)
            writer.writerow([p_val, *resultado.sequencia])

def escrever_resumo_exp1_para_csv(path: str | Path, linhas_tabela: list[dict], metricas: dict) -> None:
    arquivo = Path(path)

    with open(arquivo, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["linha_central", "lucro_X", "prob_teorica", "contagem_obs", "freq_relativa_obs"])
        for row in linhas_tabela:
            writer.writerow([row["linha_central"], row["lucro_X"], row["prob_teorica"], row["contagem_obs"], row["freq_relativa_obs"]])

        writer.writerow([])
        writer.writerow(["metrica", "valor"])
        for k, v in metricas.items():
            writer.writerow([k, v])

def escrever_resumo_exp2_para_csv(path: str | Path, linhas_tabela: list[dict]) -> None:
    arquivo = Path(path)

    with open(arquivo, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["semente", "media_n_100", "media_n_1000", "media_n_10000", "esperanca_teorica"])
        for row in linhas_tabela:
            writer.writerow([row["semente"], row["media_100"], row["media_1000"], row["media_10000"], -0.16])

def escrever_participantes_exp3_para_csv(path: str | Path, participantes: list[dict]) -> None:
    arquivo = Path(path)

    with open(arquivo, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["participante", "saldo_inicial", "saldo_final", "rodadas_jogadas", "esgotou", "status"])
        for p in participantes:
            writer.writerow([
                p["id"],
                _format_num(p["saldo_inicial"]),
                _format_num(p["saldo_final"]),
                p["rodadas"],
                "SIM" if p["esgotou"] else "NAO",
                p["status"]
            ])

def escrever_trajetorias_exp3_para_csv(path: str | Path, participantes: list[dict]) -> None:
    arquivo = Path(path)

    with open(arquivo, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["participante", "rodada", "saldo"])
        for p in participantes:
            for rodada, saldo in enumerate(p["trajetoria"]):
                writer.writerow([p["id"], rodada, _format_num(saldo)])

def escrever_resumo_exp3_para_csv(path: str | Path, metricas: dict) -> None:
    arquivo = Path(path)

    with open(arquivo, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["metrica", "valor"])
        for k, v in metricas.items():
            writer.writerow([k, v])

def escrever_pares_exp4_para_csv(path: str | Path, pares: list[dict]) -> None:
    arquivo = Path(path)

    with open(arquivo, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["par_indice", "rodada_i", "premio_i", "ganhou_i", "rodada_prox", "premio_prox", "ganhou_prox"])
        for par in pares:
            writer.writerow([
                par["par_indice"],
                par["rodada_i"],
                _format_num(par["premio_i"]),
                par["ganhou_i"],
                par["rodada_prox"],
                _format_num(par["premio_prox"]),
                par["ganhou_prox"]
            ])

def escrever_resumo_exp4_para_csv(path: str | Path, linhas: list[dict]) -> None:
    arquivo = Path(path)

    with open(arquivo, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["condicao", "total_pares", "premios_rodada_seguinte", "proporcao_observada", "probabilidade_teorica"])
        for linha in linhas:
            writer.writerow([
                linha["condicao"],
                linha["total_pares"],
                linha["premios_rodada_seguinte"],
                linha["proporcao_observada"],
                linha["probabilidade_teorica"]
            ])

def escrever_rodadas_exp5_para_csv(path: str | Path, rodadas: list[dict]) -> None:
    arquivo = Path(path)

    with open(arquivo, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["rodada", "slot_1", "slot_2", "slot_3", "P_base", "X_base", "P_plus10", "X_plus10"])
        for r in rodadas:
            writer.writerow([
                r["rodada"],
                r["slot_1"],
                r["slot_2"],
                r["slot_3"],
                _format_num(r["P_base"]),
                _format_num(r["X_base"]),
                _format_num(r["P_plus10"]),
                _format_num(r["X_plus10"])
            ])

def escrever_resumo_exp5_para_csv(path: str | Path, linhas: list[dict]) -> None:
    arquivo = Path(path)

    with open(arquivo, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "configuracao",
            "prob_premio_teorica",
            "freq_premio_obs",
            "premio_medio_teorico",
            "premio_medio_obs",
            "lucro_medio_teorico",
            "lucro_medio_obs",
            "rtp_teorico",
            "rtp_obs"
        ])
        for linha in linhas:
            writer.writerow([
                linha["configuracao"],
                linha["prob_premio_teorica"],
                linha["freq_premio_obs"],
                linha["premio_medio_teorico"],
                linha["premio_medio_obs"],
                linha["lucro_medio_teorico"],
                linha["lucro_medio_obs"],
                linha["rtp_teorico"],
                linha["rtp_obs"]
            ])
