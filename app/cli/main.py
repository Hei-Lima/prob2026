"""
Simulador Acadêmico de Máquina de Apostas Didática
Probabilidade e Estatística I - IFES Campus Serra
Trabalho I - Máquina Estatística

Autores: Jhessye Lorrayne e Heitor Lima
Outubro de 2026
"""

import sys
from pathlib import Path
import statistics

# Configuração de encoding para compatibilidade com consoles Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Garante acesso aos módulos em 'libs'
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from libs import csv, maquina
from libs.resultado import Resultado

DATA_DIR = BASE_DIR / "data"

def rodar_n_vezes(n: int, seed: int) -> list[Resultado]:
    maq = maquina.Maquina(seed)
    return [maq.rodar() for _ in range(n)]

def exibir_banner() -> None:
    print("\n" + "=" * 70)
    print("      SIMULADOR ACADÊMICO - SOMENTE CRÉDITOS FICTÍCIOS      ")
    print("     Trabalho I de Probabilidade e Estatística I - IFES     ")
    print("=" * 70 + "\n")

def experimento_1() -> list[Resultado]:
    print("\n" + "-" * 70)
    print(">>> EXPERIMENTO 1: Acompanhamento de Frequências")
    print("    Parâmetros: Semente 2026 | N = 10.000 rodadas | Sem regra de parada")
    print("-" * 70)

    seed = 2026
    n = 10000
    lista = rodar_n_vezes(n, seed)

    # Criação do CSV com formato original: P, slot_1, slot_2, slot_3
    arquivo_raw = csv.criar_csv(DATA_DIR, seed, 1)
    csv.escrever_lista_para_csv(arquivo_raw, lista)
    print(f"[Arquivo gerado] Rodadas brutas salvas em: {arquivo_raw}")

    # Contagem dos 6 resultados
    contagens = {"A-A-A": 0, "B-B-B": 0, "C-C-C": 0, "D-D-D": 0, "E-E-E": 0, "Sem Prêmio": 0}
    for r in lista:
        if r.P == 5.0 or r.P == 5:
            contagens["A-A-A"] += 1
        elif r.P == 10.0 or r.P == 10:
            contagens["B-B-B"] += 1
        elif r.P == 15.0 or r.P == 15:
            contagens["C-C-C"] += 1
        elif r.P == 25.0 or r.P == 25:
            contagens["D-D-D"] += 1
        elif r.P == 50.0 or r.P == 50:
            contagens["E-E-E"] += 1
        else:
            contagens["Sem Prêmio"] += 1

    total_contagens = sum(contagens.values())
    assert total_contagens == n, f"Erro: contagens somam {total_contagens}, esperado {n}"

    tabela_dados = [
        {"linha_central": "A-A-A", "lucro_X": 4.0, "prob_teorica": "1/125 (0,80%)", "contagem_obs": contagens["A-A-A"], "freq_relativa_obs": f"{contagens['A-A-A']/n:.4%}"},
        {"linha_central": "B-B-B", "lucro_X": 9.0, "prob_teorica": "1/125 (0,80%)", "contagem_obs": contagens["B-B-B"], "freq_relativa_obs": f"{contagens['B-B-B']/n:.4%}"},
        {"linha_central": "C-C-C", "lucro_X": 14.0, "prob_teorica": "1/125 (0,80%)", "contagem_obs": contagens["C-C-C"], "freq_relativa_obs": f"{contagens['C-C-C']/n:.4%}"},
        {"linha_central": "D-D-D", "lucro_X": 24.0, "prob_teorica": "1/125 (0,80%)", "contagem_obs": contagens["D-D-D"], "freq_relativa_obs": f"{contagens['D-D-D']/n:.4%}"},
        {"linha_central": "E-E-E", "lucro_X": 49.0, "prob_teorica": "1/125 (0,80%)", "contagem_obs": contagens["E-E-E"], "freq_relativa_obs": f"{contagens['E-E-E']/n:.4%}"},
        {"linha_central": "Sem Prêmio", "lucro_X": -1.0, "prob_teorica": "120/125 (96,00%)", "contagem_obs": contagens["Sem Prêmio"], "freq_relativa_obs": f"{contagens['Sem Prêmio']/n:.4%}"},
    ]

    lucros = [r.X for r in lista]
    premios = [r.P for r in lista]

    lucro_medio = sum(lucros) / n
    rtp_obs = (sum(premios) / n) * 100.0
    prop_premiadas = (sum(1 for r in lista if r.P > 0) / n) * 100.0
    desvio_padrao = statistics.stdev(lucros)

    metricas = {
        "total_rodadas": n,
        "lucro_medio_obs (X_barra)": f"{lucro_medio:.4f} créditos",
        "lucro_medio_teorico (E[X])": "-0.1600 créditos",
        "rtp_obs": f"{rtp_obs:.2f}%",
        "rtp_teorico": "84.00%",
        "prop_rodadas_premiadas_obs": f"{prop_premiadas:.2f}%",
        "prop_rodadas_premiadas_teorica": "4.00%",
        "desvio_padrao_amostral (s)": f"{desvio_padrao:.4f} créditos",
        "desvio_padrao_teorico (sigma)": "5.2052 créditos"
    }

    arquivo_resumo = csv.criar_csv(DATA_DIR, seed, 1, sufixo="resumo")
    csv.escrever_resumo_exp1_para_csv(arquivo_resumo, tabela_dados, metricas)
    print(f"[Arquivo gerado] Resumo estatístico salvo em: {arquivo_resumo}")

    # Exibição
    print("\nTabela de Frequências (Exp 1):")
    print(f"{'Linha Central':<15} | {'Lucro X':<8} | {'Prob. Teórica':<18} | {'Contagem':<10} | {'Freq. Obs.'}")
    print("-" * 70)
    for row in tabela_dados:
        print(f"{row['linha_central']:<15} | {row['lucro_X']:<8} | {row['prob_teorica']:<18} | {row['contagem_obs']:<10} | {row['freq_relativa_obs']}")
    print("-" * 70)
    print(f"Total de rodadas conferido: {total_contagens}")
    print(f"- Lucro médio amostral (X_barra): {lucro_medio:.4f} créditos (Teórico E[X]: -0,1600)")
    print(f"- RTP observado: {rtp_obs:.2f}% (Teórico: 84,00%)")
    print(f"- Proporção de rodadas premiadas: {prop_premiadas:.2f}% (Teórico: 4,00%)")
    print(f"- Desvio-padrão amostral (s): {desvio_padrao:.4f} créditos (Teórico sigma: 5,2052)")

    return lista

def experimento_2(lista_exp1: list[Resultado] | None = None) -> None:
    print("\n" + "-" * 70)
    print(">>> EXPERIMENTO 2: Impacto do Tamanho da Amostra (Lei dos Grandes Números)")
    print("    Parâmetros: Sementes 10, 2026, 123456 | N = 10.000 rodadas")
    print("-" * 70)

    # Reutilização da sequência 2026 de Exp 1 conforme exigido pelo enunciado
    l_10 = rodar_n_vezes(10000, 10)
    l_2026 = lista_exp1 if lista_exp1 is not None else rodar_n_vezes(10000, 2026)
    l_123456 = rodar_n_vezes(10000, 123456)

    # Salvamento dos CSVs brutos
    arq_10 = csv.criar_csv(DATA_DIR, 10, 2)
    csv.escrever_lista_para_csv(arq_10, l_10)

    arq_2026 = csv.criar_csv(DATA_DIR, 2026, 2)
    csv.escrever_lista_para_csv(arq_2026, l_2026)

    arq_123456 = csv.criar_csv(DATA_DIR, 123456, 2)
    csv.escrever_lista_para_csv(arq_123456, l_123456)

    # Teste de verificação de reprodutibilidade dos 10 primeiros resultados da semente 2026
    maq_teste = maquina.Maquina(2026)
    primeiros_10_teste = [maq_teste.rodar() for _ in range(10)]
    for idx, (r_orig, r_reprod) in enumerate(zip(l_2026[:10], primeiros_10_teste), start=1):
        assert r_orig.P == r_reprod.P and r_orig.sequencia == r_reprod.sequencia, f"Erro de reprodutibilidade na rodada {idx}"
    print("[OK] Reprodutibilidade confirmada: Os 10 primeiros resultados da semente 2026 foram reproduzidos identicamente.")

    sequencias = [
        {"semente": 10, "dados": l_10},
        {"semente": 2026, "dados": l_2026},
        {"semente": 123456, "dados": l_123456}
    ]

    tabela_3x3 = []
    for s in sequencias:
        lucros = [r.X for r in s["dados"]]
        m100 = sum(lucros[:100]) / 100
        m1000 = sum(lucros[:1000]) / 1000
        m10000 = sum(lucros[:10000]) / 10000
        tabela_3x3.append({
            "semente": s["semente"],
            "media_100": f"{m100:.4f}",
            "media_1000": f"{m1000:.4f}",
            "media_10000": f"{m10000:.4f}"
        })

    arq_resumo_exp2 = csv.criar_csv(DATA_DIR, 2026, 2, sufixo="resumo")
    csv.escrever_resumo_exp2_para_csv(arq_resumo_exp2, tabela_3x3)
    print(f"[Arquivo gerado] Tabela 3x3 salva em: {arq_resumo_exp2}")

    print("\nTabela 3x3 de Médias Acumuladas do Lucro (Exp 2):")
    print(f"{'Semente':<12} | {'n = 100':<12} | {'n = 1.000':<12} | {'n = 10.000':<12} | {'E[X] Teórico'}")
    print("-" * 65)
    for row in tabela_3x3:
        print(f"{row['semente']:<12} | {row['media_100']:<12} | {row['media_1000']:<12} | {row['media_10000']:<12} | -0,1600")
    print("-" * 65)

def experimento_3() -> None:
    print("\n" + "-" * 70)
    print(">>> EXPERIMENTO 3: Dinâmica de Saldo Limitado (100 Participantes)")
    print("    Parâmetros: Semente 42 única | Saldo inicial = 100 | Max 500 rodadas")
    print("-" * 70)

    # Iniciar gerador com semente 42 uma única vez e continuar entre participantes
    maq = maquina.Maquina(42)

    num_participantes = 100
    saldo_inicial = 100.0
    max_rodadas = 500

    participantes = []
    for p_id in range(1, num_participantes + 1):
        saldo = saldo_inicial
        rodadas_jogadas = 0
        trajetoria = [saldo]
        esgotou = False

        for _ in range(max_rodadas):
            if saldo < 1.0:
                esgotou = True
                break

            res = maq.rodar()
            saldo += res.X
            rodadas_jogadas += 1
            trajetoria.append(saldo)

        if saldo < 1.0:
            esgotou = True

        # Preenche com o saldo congelado até o horizonte 500 para análise gráfica
        while len(trajetoria) <= max_rodadas:
            trajetoria.append(saldo)

        status = "GANHO" if saldo > 100.0 else ("EMPATE" if saldo == 100.0 else "PERDA")

        participantes.append({
            "id": p_id,
            "saldo_inicial": saldo_inicial,
            "saldo_final": saldo,
            "rodadas": rodadas_jogadas,
            "esgotou": esgotou,
            "status": status,
            "trajetoria": trajetoria
        })

    # Proporções
    qtd_ganho = sum(1 for p in participantes if p["status"] == "GANHO")
    qtd_empate = sum(1 for p in participantes if p["status"] == "EMPATE")
    qtd_perda = sum(1 for p in participantes if p["status"] == "PERDA")
    qtd_esgotamento = sum(1 for p in participantes if p["esgotou"])

    saldos_finais = [p["saldo_final"] for p in participantes]
    media_saldos = statistics.mean(saldos_finais)
    mediana_saldos = statistics.median(saldos_finais)

    metricas_exp3 = {
        "proporcao_ganho": f"{qtd_ganho / num_participantes:.1%}",
        "proporcao_empate": f"{qtd_empate / num_participantes:.1%}",
        "proporcao_perda": f"{qtd_perda / num_participantes:.1%}",
        "soma_proporcoes": f"{(qtd_ganho + qtd_empate + qtd_perda) / num_participantes:.1%}",
        "proporcao_esgotamento_ruina": f"{qtd_esgotamento / num_participantes:.1%}",
        "media_saldos_finais": f"{media_saldos:.2f}",
        "mediana_saldos_finais": f"{mediana_saldos:.2f}"
    }

    # Salva arquivos CSV
    arq_participantes = csv.criar_csv(DATA_DIR, 42, 3)
    csv.escrever_participantes_exp3_para_csv(arq_participantes, participantes)

    arq_trajetorias = csv.criar_csv(DATA_DIR, 42, 3, sufixo="trajetorias")
    csv.escrever_trajetorias_exp3_para_csv(arq_trajetorias, participantes)

    arq_resumo_exp3 = csv.criar_csv(DATA_DIR, 42, 3, sufixo="resumo")
    csv.escrever_resumo_exp3_para_csv(arq_resumo_exp3, metricas_exp3)

    print(f"[Arquivo gerado] Dados de participantes salvos em: {arq_participantes}")
    print(f"[Arquivo gerado] Trajetórias completas salvas em: {arq_trajetorias}")
    print(f"[Arquivo gerado] Resumo de saldo limitado salvo em: {arq_resumo_exp3}")

    print("\nResultados Consolidados dos 100 Participantes (Exp 3):")
    print(f"- Proporção de Ganho (Bf > 100):       {qtd_ganho}%")
    print(f"- Proporção de Empate (Bf == 100):     {qtd_empate}%")
    print(f"- Proporção de Perda (Bf < 100):       {qtd_perda}%")
    print(f"  -> Soma das proporções:              {qtd_ganho + qtd_empate + qtd_perda}% (Confere 100%)")
    print(f"- Proporção de Esgotamento (Bf < 1):   {qtd_esgotamento}% (subconjunto das perdas)")
    print(f"- Média dos saldos finais:             {media_saldos:.2f} créditos")
    print(f"- Mediana dos saldos finais:           {mediana_saldos:.2f} créditos")

    print("\nTrajetória dos 5 Primeiros Participantes:")
    print(f"{'Part.':<6} | {'Saldo Final':<12} | {'Rodadas':<8} | {'Esgotou?':<9} | {'Status'}")
    print("-" * 50)
    for p in participantes[:5]:
        print(f"#{p['id']:<5} | {p['saldo_final']:<12.1f} | {p['rodadas']:<8} | {'Sim' if p['esgotou'] else 'Não':<9} | {p['status']}")
    print("-" * 50)

def experimento_4(lista_exp1: list[Resultado] | None = None) -> None:
    print("\n" + "-" * 70)
    print(">>> EXPERIMENTO 4: Independência e Probabilidade Condicional")
    print("    Parâmetros: Reutilização das 10.000 rodadas do Exp 1 (9.999 pares)")
    print("-" * 70)

    lista = lista_exp1 if lista_exp1 is not None else rodar_n_vezes(10000, 2026)

    pares = []
    pares_apos_premio = 0
    vitorias_apos_premio = 0

    pares_apos_perda = 0
    vitorias_apos_perda = 0

    for i in range(len(lista) - 1):
        r_atual = lista[i]
        r_prox = lista[i + 1]

        ganhou_atual = r_atual.P > 0
        ganhou_prox = r_prox.P > 0

        pares.append({
            "par_indice": i + 1,
            "rodada_i": i + 1,
            "premio_i": r_atual.P,
            "ganhou_i": "SIM" if ganhou_atual else "NAO",
            "rodada_prox": i + 2,
            "premio_prox": r_prox.P,
            "ganhou_prox": "SIM" if ganhou_prox else "NAO"
        })

        if ganhou_atual:
            pares_apos_premio += 1
            if ganhou_prox:
                vitorias_apos_premio += 1
        else:
            pares_apos_perda += 1
            if ganhou_prox:
                vitorias_apos_perda += 1

    total_pares = pares_apos_premio + pares_apos_perda
    assert total_pares == 9999, f"Erro: total de pares é {total_pares}, esperado 9.999"

    prop_apos_premio = vitorias_apos_premio / pares_apos_premio if pares_apos_premio > 0 else 0.0
    prop_apos_perda = vitorias_apos_perda / pares_apos_perda if pares_apos_perda > 0 else 0.0

    tabela_condicional = [
        {
            "condicao": "Após Prêmio (G_i)",
            "total_pares": pares_apos_premio,
            "premios_rodada_seguinte": vitorias_apos_premio,
            "proporcao_observada": f"{prop_apos_premio:.4%}",
            "probabilidade_teorica": "4,00%"
        },
        {
            "condicao": "Após Sem Prêmio (G_i^c)",
            "total_pares": pares_apos_perda,
            "premios_rodada_seguinte": vitorias_apos_perda,
            "proporcao_observada": f"{prop_apos_perda:.4%}",
            "probabilidade_teorica": "4,00%"
        }
    ]

    arq_pares = csv.criar_csv(DATA_DIR, 2026, 4)
    csv.escrever_pares_exp4_para_csv(arq_pares, pares)

    arq_resumo_exp4 = csv.criar_csv(DATA_DIR, 2026, 4, sufixo="resumo")
    csv.escrever_resumo_exp4_para_csv(arq_resumo_exp4, tabela_condicional)

    print(f"[Arquivo gerado] Detalhamento de pares salvo em: {arq_pares}")
    print(f"[Arquivo gerado] Resumo condicional salvo em: {arq_resumo_exp4}")

    print("\nTabela de Probabilidade Condicional (Exp 4):")
    print(f"{'Condição (Rodada i)':<25} | {'Total Pares':<12} | {'Vitórias i+1':<14} | {'Prop. Obs.':<12} | {'Ref. Teórica'}")
    print("-" * 75)
    for row in tabela_condicional:
        print(f"{row['condicao']:<25} | {row['total_pares']:<12} | {row['premios_rodada_seguinte']:<14} | {row['proporcao_observada']:<12} | {row['probabilidade_teorica']}")
    print("-" * 75)
    print(f"Total de pares conferido: {total_pares} rodadas consecutivas.")

def experimento_5(lista_exp1: list[Resultado] | None = None) -> None:
    print("\n" + "-" * 70)
    print(">>> EXPERIMENTO 5: Sensibilidade da Tabela de Pagamentos (+10%)")
    print("    Parâmetros: Reutilização dos 10.000 sorteios do Exp 1 | Sem novo sorteio")
    print("-" * 70)

    lista = lista_exp1 if lista_exp1 is not None else rodar_n_vezes(10000, 2026)
    n = len(lista)

    rodadas_comparativas = []
    p_base_list = []
    p_plus10_list = []

    for idx, r in enumerate(lista, start=1):
        p_base = float(r.P)
        x_base = float(r.X)

        p_plus10 = round(p_base * 1.10, 4)
        x_plus10 = round(p_plus10 - 1.0, 4)

        p_base_list.append(p_base)
        p_plus10_list.append(p_plus10)

        rodadas_comparativas.append({
            "rodada": idx,
            "slot_1": r.sequencia[0],
            "slot_2": r.sequencia[1],
            "slot_3": r.sequencia[2],
            "P_base": p_base,
            "X_base": x_base,
            "P_plus10": p_plus10,
            "X_plus10": x_plus10
        })

    # Métricas Base
    prop_premio_base = sum(1 for p in p_base_list if p > 0) / n
    premio_medio_base = sum(p_base_list) / n
    lucro_medio_base = premio_medio_base - 1.0
    rtp_base = (premio_medio_base / 1.0) * 100.0

    # Métricas +10%
    prop_premio_plus = sum(1 for p in p_plus10_list if p > 0) / n
    premio_medio_plus = sum(p_plus10_list) / n
    lucro_medio_plus = premio_medio_plus - 1.0
    rtp_plus = (premio_medio_plus / 1.0) * 100.0

    tabela_comparativa = [
        {
            "configuracao": "Tabela Base",
            "prob_premio_teorica": "4,00%",
            "freq_premio_obs": f"{prop_premio_base:.2%}",
            "premio_medio_teorico": "0,8400",
            "premio_medio_obs": f"{premio_medio_base:.4f}",
            "lucro_medio_teorico": "-0,1600",
            "lucro_medio_obs": f"{lucro_medio_base:.4f}",
            "rtp_teorico": "84,00%",
            "rtp_obs": f"{rtp_base:.2f}%"
        },
        {
            "configuracao": "Prêmios +10%",
            "prob_premio_teorica": "4,00%",
            "freq_premio_obs": f"{prop_premio_plus:.2%}",
            "premio_medio_teorico": "0,9240",
            "premio_medio_obs": f"{premio_medio_plus:.4f}",
            "lucro_medio_teorico": "-0,0760",
            "lucro_medio_obs": f"{lucro_medio_plus:.4f}",
            "rtp_teorico": "92,40%",
            "rtp_obs": f"{rtp_plus:.2f}%"
        }
    ]

    arq_rodadas_exp5 = csv.criar_csv(DATA_DIR, 2026, 5)
    csv.escrever_rodadas_exp5_para_csv(arq_rodadas_exp5, rodadas_comparativas)

    arq_resumo_exp5 = csv.criar_csv(DATA_DIR, 2026, 5, sufixo="resumo")
    csv.escrever_resumo_exp5_para_csv(arq_resumo_exp5, tabela_comparativa)

    print(f"[Arquivo gerado] Rodadas com pagamentos comparados salvas em: {arq_rodadas_exp5}")
    print(f"[Arquivo gerado] Tabela comparativa salva em: {arq_resumo_exp5}")

    print("\nTabela Comparativa de Sensibilidade de Pagamentos (Exp 5):")
    print(f"{'Configuração':<15} | {'P(Prêmio)':<10} | {'Prêmio Médio':<14} | {'Lucro Médio':<14} | {'RTP'}")
    print("-" * 65)
    print(f"{'Base (Teórico)':<15} | {'4,00%':<10} | {'0,8400 cr':<14} | {'-0,1600 cr':<14} | {'84,00%'}")
    print(f"{'Base (Observ.)':<15} | {tabela_comparativa[0]['freq_premio_obs']:<10} | {tabela_comparativa[0]['premio_medio_obs'] + ' cr':<14} | {tabela_comparativa[0]['lucro_medio_obs'] + ' cr':<14} | {tabela_comparativa[0]['rtp_obs']}")
    print("-" * 65)
    print(f"{'+10% (Teórico)':<15} | {'4,00%':<10} | {'0,9240 cr':<14} | {'-0,0760 cr':<14} | {'92,40%'}")
    print(f"{'+10% (Observ.)':<15} | {tabela_comparativa[1]['freq_premio_obs']:<10} | {tabela_comparativa[1]['premio_medio_obs'] + ' cr':<14} | {tabela_comparativa[1]['lucro_medio_obs'] + ' cr':<14} | {tabela_comparativa[1]['rtp_obs']}")
    print("-" * 65)

def main() -> None:
    exibir_banner()
    lista_exp1 = experimento_1()
    experimento_2(lista_exp1)
    experimento_3()
    experimento_4(lista_exp1)
    experimento_5(lista_exp1)
    print("\n" + "=" * 70)
    print(" Todos os 5 experimentos foram executados e salvos com sucesso! ")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()
