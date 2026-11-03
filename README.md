# Máquina Estatística - Probabilidade e Estatística I (IFES)

Simulador acadêmico de máquina de apostas (créditos fictícios) e scripts de análise estatística desenvolvidos para a disciplina de Probabilidade e Estatística I — IFES Campus Serra.

**Integrantes:**
- Heitor Lima Peixoto
- Jhessye Lorrayne Fraga da Silva

---

## Como Executar

### 1. Clonar o repositório
```bash
git clone https://github.com/hei-lima/prob2026.git
cd prob2026/app
```

### 2. Executar o programa
```bash
python cli/main.py
```

O menu interativo será exibido no terminal com as opções:
- **`1`**: Gerar todos os CSVs dos experimentos (1, 2 e 3);
- **`2`**: Acessar interface CLI interativa para jogar na máquina;
- **`0`**: Sair.

---

## Estrutura de Pastas

```text
app/
├── cli/              # Interface do usuário e execução dos experimentos
│   ├── main.py       # Menu principal e jogo via terminal
│   └── experimentos.py # Funções que rodam os experimentos 1, 2 e 3
│
├── libs/             # Lógica e regras de negócio da máquina
│   ├── maquina.py    # Modelo da máquina, sorteio dos rolos e regras de pagamento
│   ├── resultado.py  # Classes e estruturas de dados de cada rodada
│   └── csv.py        # Utilitários para criação e escrita dos arquivos CSV
│
├── data/             # Dados brutos gerados pelas simulações
│   ├── exp1/         # 10.000 rodadas com semente 2026
│   ├── exp2/         # Rodadas com sementes 10, 2026 e 123456
│   └── exp3/         # Histórico de saldo dos 100 participantes (semente 42)
│
├── dataanalysis/     # Scripts que processam os dados dos CSVs brutos
│   ├── analise_exp1.py      # Calcula frequências e taxas do Experimento 1
│   ├── analise_exp2.py      # Gera dados de trajetórias e diferenças do Exp 2
│   ├── analise_exp3.py      # Gera trajetórias dos 5 primeiros participantes do Exp 3
│   └── experimento2_extra.py # Simulação em larga escala (até 10M de rodadas)
│
├── EXP-1/            # Resultados processados do Experimento 1 (Frequencia.csv)
├── EXP-2/            # Gráficos LaTeX e convergência do Experimento 2
└── EXP-3/            # Gráfico LaTeX das trajetórias dos participantes do Exp 3
```

---

## Declaração de Uso de IA
Ferramentas de IA generativa foram utilizadas como suporte acadêmico para auxílio na formatação de tabelas/gráficos em LaTeX, revisão ortográfica e estruturação de scripts. Todos os cálculos teóricos e resultados foram conferidos e validados pelos integrantes.
