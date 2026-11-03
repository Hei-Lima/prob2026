import csv
from pathlib import Path

def processar_frequencia_exp1():
    base_dir = Path(__file__).resolve().parent.parent
    data_dir = base_dir / "data" / "exp1"
    exp1_out_dir = base_dir / "EXP-1"
    
    arquivos = list(data_dir.glob("exp1-2026-*.csv"))
    if not arquivos:
        return

    arquivos.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    arquivo_exp1 = arquivos[0]

    contagens = {
        "AAA": 0,
        "BBB": 0,
        "CCC": 0,
        "DDD": 0,
        "EEE": 0,
        "Outros": 0
    }

    total = 0

    with open(arquivo_exp1, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1
            s1 = row["slot_1"]
            s2 = row["slot_2"]
            s3 = row["slot_3"]

            if s1 == s2 == s3:
                seq = s1 + s2 + s3
                if seq in contagens:
                    contagens[seq] += 1
                else:
                    contagens["Outros"] += 1
            else:
                contagens["Outros"] += 1

    exp1_out_dir.mkdir(exist_ok=True)

    with open(exp1_out_dir / "Frequencia.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["sequencia", "contagem", "frequencia_relativa", "taxa_percentual"])

        for seq, count in contagens.items():
            freq = count / total if total > 0 else 0
            taxa = f"{freq * 100:.2f}%"
            writer.writerow([seq, count, f"{freq:.6f}", taxa])

if __name__ == "__main__":
    processar_frequencia_exp1()
