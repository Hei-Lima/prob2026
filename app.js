/**
 * Bebêt: A Bet Para Bebês! 🍼🎰
 * Simulador de Caça-Níqueis com regras matemáticas idênticas ao projeto Python (IFES 2026).
 * 
 * Regras Matemáticas:
 * - 5 símbolos circulares: A (Estrela), B (Cereja), C (Diamante), D (Ursinho), E (Coroa)
 * - Sorteio de K em {0..4} uniforme por rolo: Topo (K), Centro ((K+1)%5), Base ((K+2)%5)
 * - Paga apenas a linha central:
 *     A-A-A: 5 créditos (lucro +4)
 *     B-B-B: 10 créditos (lucro +9)
 *     C-C-C: 15 créditos (lucro +14)
 *     D-D-D: 25 créditos (lucro +24)
 *     E-E-E: 50 créditos (lucro +49)
 *     Outros: 0 créditos (lucro -1)
 * - Teórico: P(Vitória) = 4%, E[X] = -0.16, RTP = 84.0%
 */

// Símbolos e mapeamentos
const SYMBOLS = [
  { id: 0, code: 'A', name: 'Estrela', emoji: '⭐', payout: 5 },
  { id: 1, code: 'B', name: 'Cereja',  emoji: '🍒', payout: 10 },
  { id: 2, code: 'C', name: 'Diamante', emoji: '💎', payout: 15 },
  { id: 3, code: 'D', name: 'Ursinho', emoji: '🧸', payout: 25 },
  { id: 4, code: 'E', name: 'Coroa',   emoji: '👑', payout: 50 }
];

// Estado global da sessão
const state = {
  balance: 100,
  initialBalance: 100,
  betCost: 1,
  totalBet: 0,
  totalPaid: 0,
  rounds: 0,
  wins: 0,
  losses: 0,
  profitHistory: [],
  balanceHistory: [100],
  roundLabels: [0],
  loansTaken: 0,
  totalDebt: 0,
  isSpinning: false,
  soundEnabled: true,
  autoSpinning: false
};

// -------------------------------------------------------------
// SINTETIZADOR DE ÁUDIO WEB AUDIO API (100% autônomo sem arquivos)
// -------------------------------------------------------------
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.bgmPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.2, gainVal = 0.15) {
    if (!state.soundEnabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  playSpinClick() {
    if (!state.soundEnabled || !this.ctx) return;
    // Som tipo clique de roleta infantil de madeira
    this.playTone(320 + Math.random() * 120, 'triangle', 0.05, 0.08);
  }

  playWin() {
    if (!state.soundEnabled || !this.ctx) return;
    // Fanfarra infantil de marimba alegre (acorde triunfal)
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.35, 0.2);
      }, idx * 90);
    });
  }

  playJackpot() {
    if (!state.soundEnabled || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.45, 0.25);
      }, idx * 80);
    });
  }

  playLoss() {
    if (!state.soundEnabled || !this.ctx) return;
    // Choro cômico de bebê / som de corneta deslizando pra baixo
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      
      const t = this.ctx.currentTime;
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.35);

      // Filtro passa-baixa para parecer um choro fofo abafado
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(t + 0.35);
    } catch (e) {
      console.warn("Audio loss error:", e);
    }
  }

  playLoanSound() {
    if (!state.soundEnabled || !this.ctx) return;
    // Caixa registradora / sino financeiro
    this.playTone(987.77, 'sine', 0.15, 0.2);
    setTimeout(() => this.playTone(1318.51, 'sine', 0.4, 0.25), 120);
  }

  // Música de fundo relaxante estilo caixinha de música de berço
  startBgm() {
    if (!state.soundEnabled || this.bgmPlaying) return;
    this.init();
    this.bgmPlaying = true;
    
    // Melodia de canção de ninar (C, G, A, G, F, E, D, C)
    const melody = [
      523.25, 523.25, 783.99, 783.99, 880.00, 880.00, 783.99, null,
      698.46, 698.46, 659.25, 659.25, 587.33, 587.33, 523.25, null
    ];

    this.bgmTimer = setInterval(() => {
      if (!this.bgmPlaying || !state.soundEnabled) return;
      const note = melody[this.bgmStep];
      if (note) {
        this.playTone(note, 'sine', 0.45, 0.035); // Bem sutil e agradável
      }
      this.bgmStep = (this.bgmStep + 1) % melody.length;
    }, 420);
  }

  stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    const icon = document.getElementById('sound-icon');
    if (state.soundEnabled) {
      icon.textContent = '🔊';
      this.startBgm();
    } else {
      icon.textContent = '🔇';
      this.stopBgm();
    }
  }
}

const sounds = new SoundEffects();

// -------------------------------------------------------------
// GRÁFICO DINÂMICO DE SALDO COM CHART.JS
// -------------------------------------------------------------
let balanceChart = null;

function initChart() {
  const ctx = document.getElementById('balanceChart').getContext('2d');
  
  balanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [0],
      datasets: [
        {
          label: 'Saldo do Bebê (Créditos)',
          data: [100],
          borderColor: '#db2777',
          backgroundColor: 'rgba(244, 114, 182, 0.25)',
          fill: true,
          tension: 0.2,
          borderWidth: 3,
          pointRadius: 2,
          pointHoverRadius: 5
        },
        {
          label: 'Saldo Inicial (100)',
          data: [100],
          borderColor: '#94a3b8',
          borderDash: [5, 5],
          pointRadius: 0,
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 200 },
      plugins: {
        legend: {
          display: true,
          labels: { font: { family: 'Fredoka', size: 12 } }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Rodadas Jogadas', font: { family: 'Fredoka', weight: 'bold' } },
          grid: { display: false }
        },
        y: {
          title: { display: true, text: 'Créditos', font: { family: 'Fredoka', weight: 'bold' } },
          suggestedMin: 0,
          suggestedMax: 120
        }
      }
    }
  });
}

function updateChart() {
  if (!balanceChart) return;
  
  // Amostragem inteligente se passar de 300 pontos para manter performance suave
  if (state.balanceHistory.length > 300) {
    const step = Math.ceil(state.balanceHistory.length / 150);
    const sampledLabels = [];
    const sampledData = [];
    const baselineData = [];

    for (let i = 0; i < state.balanceHistory.length; i += step) {
      sampledLabels.push(state.roundLabels[i]);
      sampledData.push(state.balanceHistory[i]);
      baselineData.push(100);
    }
    // Garante que o último ponto esteja sempre presente
    const lastIdx = state.balanceHistory.length - 1;
    if (sampledLabels[sampledLabels.length - 1] !== state.roundLabels[lastIdx]) {
      sampledLabels.push(state.roundLabels[lastIdx]);
      sampledData.push(state.balanceHistory[lastIdx]);
      baselineData.push(100);
    }

    balanceChart.data.labels = sampledLabels;
    balanceChart.data.datasets[0].data = sampledData;
    balanceChart.data.datasets[1].data = baselineData;
  } else {
    balanceChart.data.labels = state.roundLabels;
    balanceChart.data.datasets[0].data = state.balanceHistory;
    balanceChart.data.datasets[1].data = state.balanceHistory.map(() => 100);
  }

  balanceChart.update('none');
}

// -------------------------------------------------------------
// LÓGICA DO JOGO (SIMULADOR DO IFES)
// -------------------------------------------------------------

/**
 * Sorteia uma rodada de caça-níqueis segundo a especificação exata do IFES:
 * 3 rolos independentes com índices circulares A, B, C, D, E (0..4).
 * Cada rolo sorteia uniformemente K in {0..4}.
 */
function spinReels() {
  const k1 = Math.floor(Math.random() * 5);
  const k2 = Math.floor(Math.random() * 5);
  const k3 = Math.floor(Math.random() * 5);

  return {
    reel1: {
      top: SYMBOLS[k1],
      mid: SYMBOLS[(k1 + 1) % 5],
      bot: SYMBOLS[(k1 + 2) % 5]
    },
    reel2: {
      top: SYMBOLS[k2],
      mid: SYMBOLS[(k2 + 1) % 5],
      bot: SYMBOLS[(k2 + 2) % 5]
    },
    reel3: {
      top: SYMBOLS[k3],
      mid: SYMBOLS[(k3 + 1) % 5],
      bot: SYMBOLS[(k3 + 2) % 5]
    }
  };
}

/**
 * Avalia o pagamento da linha central
 */
function evaluatePayout(spinResult) {
  const m1 = spinResult.reel1.mid;
  const m2 = spinResult.reel2.mid;
  const m3 = spinResult.reel3.mid;

  if (m1.id === m2.id && m2.id === m3.id) {
    return {
      isWin: true,
      symbol: m1,
      payout: m1.payout,
      netProfit: m1.payout - state.betCost
    };
  }

  return {
    isWin: false,
    symbol: null,
    payout: 0,
    netProfit: -state.betCost
  };
}

/**
 * Renderiza visualmente os símbolos nas células da máquina
 */
function renderReelSymbols(spinResult) {
  // Rolo 1
  document.getElementById('r1-top').innerHTML = `<span class="symbol-display">${spinResult.reel1.top.emoji}</span>`;
  document.getElementById('r1-mid').innerHTML = `<span class="symbol-display">${spinResult.reel1.mid.emoji}</span>`;
  document.getElementById('r1-bot').innerHTML = `<span class="symbol-display">${spinResult.reel1.bot.emoji}</span>`;

  // Rolo 2
  document.getElementById('r2-top').innerHTML = `<span class="symbol-display">${spinResult.reel2.top.emoji}</span>`;
  document.getElementById('r2-mid').innerHTML = `<span class="symbol-display">${spinResult.reel2.mid.emoji}</span>`;
  document.getElementById('r2-bot').innerHTML = `<span class="symbol-display">${spinResult.reel2.bot.emoji}</span>`;

  // Rolo 3
  document.getElementById('r3-top').innerHTML = `<span class="symbol-display">${spinResult.reel3.top.emoji}</span>`;
  document.getElementById('r3-mid').innerHTML = `<span class="symbol-display">${spinResult.reel3.mid.emoji}</span>`;
  document.getElementById('r3-bot').innerHTML = `<span class="symbol-display">${spinResult.reel3.bot.emoji}</span>`;
}

/**
 * Atualiza o painel de estatísticas empíricas
 */
function updateStatsUI() {
  document.getElementById('player-balance').textContent = state.balance;
  
  const casinoProfit = state.totalBet - state.totalPaid;
  const casinoEl = document.getElementById('casino-profit');
  casinoEl.textContent = (casinoProfit >= 0 ? `+${casinoProfit}` : `${casinoProfit}`);

  document.getElementById('m-rounds').textContent = state.rounds;

  const winPct = state.rounds > 0 ? ((state.wins / state.rounds) * 100).toFixed(1) : '0.0';
  document.getElementById('m-wins').textContent = `${state.wins} (${winPct}%)`;

  const lossPct = state.rounds > 0 ? ((state.losses / state.rounds) * 100).toFixed(1) : '0.0';
  document.getElementById('m-losses').textContent = `${state.losses} (${lossPct}%)`;

  const observedRTP = state.totalBet > 0 ? ((state.totalPaid / state.totalBet) * 100).toFixed(2) : '0.00';
  document.getElementById('m-rtp').textContent = `${observedRTP}%`;

  // Média amostral do lucro líquido X_bar
  let meanX = 0;
  if (state.rounds > 0) {
    const sumProfit = state.profitHistory.reduce((acc, val) => acc + val, 0);
    meanX = sumProfit / state.rounds;
  }
  document.getElementById('m-mean').textContent = (meanX >= 0 ? `+${meanX.toFixed(2)}` : meanX.toFixed(2));

  // Desvio padrão amostral s
  let stdDev = 0;
  if (state.rounds > 1) {
    const variance = state.profitHistory.reduce((acc, val) => acc + Math.pow(val - meanX, 2), 0) / (state.rounds - 1);
    stdDev = Math.sqrt(variance);
  }
  document.getElementById('m-std').textContent = stdDev.toFixed(2);
}

/**
 * Dispara confetes fofinhos na vitória
 */
function triggerWinConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#fde047', '#38bdf8', '#a855f7', '#34d399']
    });
  }
}

/**
 * Executa uma rodada do jogo com animação
 */
function handleSpin() {
  if (state.isSpinning) return;

  // Verificação de saldo
  if (state.balance < state.betCost) {
    showItauLoanModal();
    return;
  }

  state.isSpinning = true;
  document.getElementById('btn-spin').disabled = true;

  // Desconta custo de aposta
  state.balance -= state.betCost;
  state.totalBet += state.betCost;
  state.rounds++;
  
  // Feedback inicial
  const msgEl = document.getElementById('round-message');
  msgEl.className = 'round-message neutral';
  msgEl.textContent = 'Girando os rolinhos... 🍼💫';

  // Efeito de animação dos rolos (embaralhar aleatório visualmente)
  const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
  ];

  reels.forEach(r => r.classList.add('spinning'));

  let tickCount = 0;
  const tickInterval = setInterval(() => {
    sounds.playSpinClick();
    tickCount++;
    if (tickCount > 10) clearInterval(tickInterval);
  }, 75);

  // Determina o resultado matemático oficial
  const result = spinReels();
  const outcome = evaluatePayout(result);

  setTimeout(() => {
    reels.forEach(r => r.classList.remove('spinning'));
    renderReelSymbols(result);

    // Registra métricas
    state.totalPaid += outcome.payout;
    state.balance += outcome.payout;
    state.profitHistory.push(outcome.netProfit);
    state.balanceHistory.push(state.balance);
    state.roundLabels.push(state.rounds);

    if (outcome.isWin) {
      state.wins++;
      msgEl.className = 'round-message win';
      msgEl.innerHTML = `🎉 <strong>PARABÉNS NENÉM!</strong> Tirou 3x ${outcome.symbol.emoji} e ganhou <strong>+${outcome.payout} créditos</strong>!`;
      
      if (outcome.symbol.id === 4) {
        sounds.playJackpot();
      } else {
        sounds.playWin();
      }
      triggerWinConfetti();
    } else {
      state.losses++;
      msgEl.className = 'round-message loss';
      const lossPhrases = [
        "😢 Não deu desta vez! Seu leitinho foi pro cofre da Bebêt (-1 crédito).",
        "🍼 Quase! Apenas 99% dos bebês perdem antes do prêmio!",
        "💔 Que peninha! Mais 1 crédito doado para o bem dos acionistas.",
        "✨ Continue girando! A sorte está virando (ou não)!"
      ];
      msgEl.textContent = lossPhrases[Math.floor(Math.random() * lossPhrases.length)];
      sounds.playLoss();
    }

    updateStatsUI();
    updateChart();

    state.isSpinning = false;
    document.getElementById('btn-spin').disabled = false;

    // Se o saldo zerou, abre o empréstimo do Itaú Kids
    if (state.balance < state.betCost) {
      setTimeout(() => {
        showItauLoanModal();
      }, 700);
    }
  }, 650);
}

/**
 * Modo Automático (10 rodadas rápidas)
 */
function handleAutoSpin() {
  if (state.isSpinning || state.autoSpinning) return;
  state.autoSpinning = true;
  const btnAuto = document.getElementById('btn-auto');
  btnAuto.disabled = true;

  let remaining = 10;
  const interval = setInterval(() => {
    if (remaining <= 0 || state.balance < state.betCost) {
      clearInterval(interval);
      state.autoSpinning = false;
      btnAuto.disabled = false;
      if (state.balance < state.betCost) {
        showItauLoanModal();
      }
      return;
    }
    handleSpin();
    remaining--;
  }, 850);
}

/**
 * Modal do Empréstimo Itaú Kids
 */
function showItauLoanModal() {
  sounds.playLoanSound();
  const modal = document.getElementById('itau-modal');
  modal.classList.remove('hidden');
}

function acceptLoan() {
  state.loansTaken++;
  state.totalDebt += 100;
  state.balance += 100;

  sounds.playLoanSound();
  
  const modal = document.getElementById('itau-modal');
  modal.classList.add('hidden');

  const msgEl = document.getElementById('round-message');
  msgEl.className = 'round-message win';
  msgEl.innerHTML = `💸 <strong>Empréstimo Aprovado!</strong> +100 créditos adicionados! Dívida atual: ${state.totalDebt} créditos (+67% a.m.). Continue apostando!`;

  updateStatsUI();
  updateChart();
}

// -------------------------------------------------------------
// INICIALIZAÇÃO E EVENTOS
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Renderiza rolos iniciais com símbolos amigáveis
  renderReelSymbols({
    reel1: { top: SYMBOLS[0], mid: SYMBOLS[1], bot: SYMBOLS[2] },
    reel2: { top: SYMBOLS[2], mid: SYMBOLS[3], bot: SYMBOLS[4] },
    reel3: { top: SYMBOLS[4], mid: SYMBOLS[0], bot: SYMBOLS[1] }
  });

  initChart();
  updateStatsUI();

  // Modal de entrada
  const introModal = document.getElementById('intro-modal');
  const btnEnter = document.getElementById('btn-enter');
  btnEnter.addEventListener('click', () => {
    sounds.init();
    sounds.startBgm();
    introModal.classList.add('hidden');
  });

  // Botão girar
  document.getElementById('btn-spin').addEventListener('click', () => {
    sounds.init();
    handleSpin();
  });

  // Botão auto
  document.getElementById('btn-auto').addEventListener('click', () => {
    sounds.init();
    handleAutoSpin();
  });

  // Som toggle
  document.getElementById('btn-sound').addEventListener('click', () => {
    sounds.toggleSound();
  });

  // Empréstimo Itaú Kids
  document.getElementById('btn-accept-loan').addEventListener('click', () => {
    acceptLoan();
  });
});
