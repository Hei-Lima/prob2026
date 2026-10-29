# Máquina Estatística: Probabilidade, Apostas e Pensamento Crítico

Trabalho I da disciplina de **Probabilidade e Estatística I** (2026/2)  
**Instituto Federal do Espírito Santo (IFES) – Campus Serra**  
Bacharelado em Sistemas de Informação  
Professor: Fidelis Zanetti de Castro  

---

## 👥 Integrantes da Equipe
* **Jhessye Lorrayne**
* **Heitor Lima**

---

## 📋 Descrição do Projeto
Implementação e análise computacional de um simulador didático de máquina de caça-níqueis (*slot machine*), baseado em sorteios uniformes e independentes de 3 rolos com 5 símbolos ($A, B, C, D, E$).  
O objetivo é confrontar a percepção subjetiva de ganhos ocasionais com as leis matemáticas que determinam a perda esperada a longo prazo ($\mathbb{E}[X] = -0{,}16$ créditos, $\text{RTP} = 84{,}0\%$), estabelecendo conexões com a literatura científica de saúde pública, economia comportamental e políticas públicas sobre apostas.

> **Aviso:** Simulador puramente acadêmico - somente créditos fictícios.

---

## 🚀 Instruções de Execução

### Requisitos
* Python 3.10 ou superior (testado e homologado em Python 3.14).
* Nenhuma biblioteca externa necessária (utiliza apenas a biblioteca padrão: `random`, `math`, `statistics`, `csv`, `pathlib`).

### Como Executar
A partir da raiz do repositório, execute:
```bash
python app/cli/main.py
```
Ou, se preferir acessar a pasta da aplicação:
```bash
cd app
python cli/main.py
```

O programa executará em sequência os 5 experimentos solicitados, exibirá os resumos estatísticos e tabelas formatadas no terminal e gravará os arquivos CSV correspondentes na estrutura de diretórios.

---

## 📁 Localização dos Resultados e Dados Gerados

Todos os arquivos de dados simulados são gerados automaticamente dentro do diretório `app/data/`, organizados por experimento:

* **Experimento 1 (Frequências e Parâmetros Base):**  
  `app/data/exp1/exp1-2026-<data_hora>.csv` (10.000 rodadas brutas: $P$, slot 1, slot 2, slot 3)  
  `app/data/exp1/exp1-resumo-2026-<data_hora>.csv` (Tabela de frequências observadas vs teóricas e métricas de lucro/RTP)

* **Experimento 2 (Lei dos Grandes Números - LGN):**  
  `app/data/exp2/exp2-10-<data_hora>.csv` (10.000 rodadas da semente 10)  
  `app/data/exp2/exp2-2026-<data_hora>.csv` (10.000 rodadas da semente 2026)  
  `app/data/exp2/exp2-123456-<data_hora>.csv` (10.000 rodadas da semente 123456)  
  `app/data/exp2/exp2-resumo-2026-<data_hora>.csv` (Tabela 3x3 com as médias para $n \in \{100, 1000, 10000\}$)

* **Experimento 3 (Dinâmica de Saldo Limitado):**  
  `app/data/exp3/exp3-42-<data_hora>.csv` (Resultado final dos 100 participantes: saldo, rodadas, esgotamento, status)  
  `app/data/exp3/exp3-trajetorias-42-<data_hora>.csv` (Evolução rodada a rodada do saldo de todos os participantes)  
  `app/data/exp3/exp3-resumo-42-<data_hora>.csv` (Proporções de ganho, empate, perda, ruína, média e mediana)

* **Experimento 4 (Independência e Probabilidade Condicional):**  
  `app/data/exp4/exp4-2026-<data_hora>.csv` (Detalhamento dos 9.999 pares consecutivos)  
  `app/data/exp4/exp4-resumo-2026-<data_hora>.csv` (Tabela de probabilidade de vitória condicionada ao resultado anterior)

* **Experimento 5 (Sensibilidade de Pagamentos +10%):**  
  `app/data/exp5/exp5-2026-<data_hora>.csv` (10.000 rodadas com cálculo paralelo sob a tabela base e a tabela +10%)  
  `app/data/exp5/exp5-resumo-2026-<data_hora>.csv` (Comparativo teórico e observado de prêmio médio, lucro e RTP)

---

## 🤖 Declaração do Uso de Inteligência Artificial
Em conformidade com as diretrizes acadêmicas do trabalho:
* **Uso:** Ferramentas de Inteligência Artificial Generativa foram utilizadas como suporte técnico para organização modular dos códigos em Python, auxílio na estilização de tabelas e equações na linguagem LaTeX e conferência da redação do relatório.
* **Autoria e Validação:** Todos os sorteios, modelos probabilísticos, implementações das regras, análises estatísticas e conclusões interpretativas foram minuciosamente auditados, testados, compreendidos e subscritos integralmente pelos integrantes da equipe.
