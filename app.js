/**
 * Bebêt: A Bet Para Bebês! 🍼🎰
 * Simulador oficial do IFES 2026 adaptado para Web interativa.
 * Estilo visual e interativo fiel à referência MiniWin.
 */

// Símbolos do modelo matemático (IFES)
const SYMBOLS = [
  { id: 0, code: 'A', name: 'Estrela', emoji: '⭐', payout: 5 },
  { id: 1, code: 'B', name: 'Cereja',  emoji: '🍒', payout: 10 },
  { id: 2, code: 'C', name: 'Diamante', emoji: '💎', payout: 15 },
  { id: 3, code: 'D', name: 'Ursinho', emoji: '🧸', payout: 25 },
  { id: 4, code: 'E', name: 'Coroa',   emoji: '👑', payout: 50 }
];

// Frases satíricas do mascote Coelhinho
const BUNNY_QUOTES = [
  "Mamadeira tá paga! 🍼",
  "Só perde quem desiste! 🚀",
  "O loss fortalece a cognição!",
  "99% dos bebês param antes da bolada!",
  "Chupeta penhorada com sucesso!",
  "Mais uma rodadinha só... 🥺",
  "O berçário inteiro tá torcendo!",
  "Idade é só um número! 👶",
  "Aposta que a sorte vem!"
];

// Estado da sessão
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
// SISTEMA DE ÁUDIO COM ASSETS EXTERNOS (BGM & YAY MP3)
// -------------------------------------------------------------
class SoundManager {
  constructor() {
    this.bgmAudio = null;
    this.yayAudio = null;
    this.audioCtx = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    this.bgmAudio = document.getElementById('bgm-audio');
    this.yayAudio = document.getElementById('yay-audio');

    if (this.bgmAudio) {
      this.bgmAudio.volume = 0.30; // Volume agradável de fundo
    }
    if (this.yayAudio) {
      this.yayAudio.volume = 0.65;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }

    this.initialized = true;
  }

  playBgm() {
    if (!state.soundEnabled) return;
    this.init();
    if (this.bgmAudio) {
      this.bgmAudio.play().catch(e => {
        console.log("Autoplay bloqueado até interação do usuário:", e);
      });
    }
  }

  pauseBgm() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  playYay() {
    if (!state.soundEnabled) return;
    this.init();
    if (this.yayAudio) {
      this.yayAudio.currentTime = 0;
      this.yayAudio.play().catch(e => console.warn(e));
    }
  }

  // Efeito sonoro de clique de roleta mecânica
  playClick() {
    if (!state.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380 + Math.random() * 120, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  // Efeito de perda: cartoon slide descendente fofo
  playLoss() {
    if (!state.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      const t = this.audioCtx.currentTime;
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.28);

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, t);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(t + 0.28);
    } catch (e) {}
  }

  // Som de dinheiro / empréstimo aprovado
  playCash() {
    if (!state.soundEnabled || !this.audioCtx) return;
    try {
      const t = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.frequency.setValueAtTime(987.77, t);
      gain1.gain.setValueAtTime(0.12, t);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start();
      osc1.stop(t + 0.2);

      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.frequency.setValueAtTime(1318.51, t + 0.1);
      gain2.gain.setValueAtTime(0.15, t + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(t + 0.1);
      osc2.stop(t + 0.35);
    } catch (e) {}
  }

  toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    const soundIcon = document.getElementById('sound-icon');
    if (state.soundEnabled) {
      soundIcon.textContent = '🔊';
      this.playBgm();
    } else {
      soundIcon.textContent = '🔇';
      this.pauseBgm();
    }
  }
}

const sounds = new SoundManager();

// -------------------------------------------------------------
// GRÁFICO DINÂMICO DE SALDO COM CHART.JS (LABORATÓRIO)
// -------------------------------------------------------------
let balanceChart = null;

function initChart() {
  const canvas = document.getElementById('balanceChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  balanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [0],
      datasets: [
        {
          label: 'Saldo do Bebê (Créditos)',
          data: [100],
          borderColor: '#db2777',
          backgroundColor: 'rgba(244, 114, 182, 0.22)',
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
      animation: { duration: 150 },
      plugins: {
        legend: {
          display: true,
          labels: { font: { family: 'Fredoka', size: 12 } }
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
// LÓGICA DO JOGO (SIMULADOR DO ARTIGO IFES)
// -------------------------------------------------------------

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

function renderReelSymbols(spinResult) {
  // Rolo 1
  document.getElementById('r1-top').innerHTML = `<div class="sym-box">${spinResult.reel1.top.emoji}</div>`;
  document.getElementById('r1-mid').innerHTML = `<div class="sym-box">${spinResult.reel1.mid.emoji}</div>`;
  document.getElementById('r1-bot').innerHTML = `<div class="sym-box">${spinResult.reel1.bot.emoji}</div>`;

  // Rolo 2
  document.getElementById('r2-top').innerHTML = `<div class="sym-box">${spinResult.reel2.top.emoji}</div>`;
  document.getElementById('r2-mid').innerHTML = `<div class="sym-box">${spinResult.reel2.mid.emoji}</div>`;
  document.getElementById('r2-bot').innerHTML = `<div class="sym-box">${spinResult.reel2.bot.emoji}</div>`;

  // Rolo 3
  document.getElementById('r3-top').innerHTML = `<div class="sym-box">${spinResult.reel3.top.emoji}</div>`;
  document.getElementById('r3-mid').innerHTML = `<div class="sym-box">${spinResult.reel3.mid.emoji}</div>`;
  document.getElementById('r3-bot').innerHTML = `<div class="sym-box">${spinResult.reel3.bot.emoji}</div>`;
}

function updateStatsUI() {
  // HUD Superior
  document.getElementById('player-balance').textContent = state.balance;
  const casinoProfit = state.totalBet - state.totalPaid;
  const casinoEl = document.getElementById('casino-profit');
  casinoEl.textContent = (casinoProfit >= 0 ? `+${casinoProfit}` : `${casinoProfit}`);

  // Quick stats card
  const observedRTP = state.totalBet > 0 ? ((state.totalPaid / state.totalBet) * 100).toFixed(1) : '0.0';
  const quickRtp = document.getElementById('quick-rtp');
  if (quickRtp) quickRtp.textContent = `${observedRTP}%`;
  const quickRounds = document.getElementById('quick-rounds');
  if (quickRounds) quickRounds.textContent = state.rounds;

  // Painel detalhado do Laboratório
  const elRounds = document.getElementById('m-rounds');
  if (elRounds) elRounds.textContent = state.rounds;

  const winPct = state.rounds > 0 ? ((state.wins / state.rounds) * 100).toFixed(1) : '0.0';
  const elWins = document.getElementById('m-wins');
  if (elWins) elWins.textContent = `${state.wins} (${winPct}%)`;

  const lossPct = state.rounds > 0 ? ((state.losses / state.rounds) * 100).toFixed(1) : '0.0';
  const elLosses = document.getElementById('m-losses');
  if (elLosses) elLosses.textContent = `${state.losses} (${lossPct}%)`;

  const elRtp = document.getElementById('m-rtp');
  if (elRtp) elRtp.textContent = `${observedRTP}%`;

  let meanX = 0;
  if (state.rounds > 0) {
    const sumProfit = state.profitHistory.reduce((acc, val) => acc + val, 0);
    meanX = sumProfit / state.rounds;
  }
  const elMean = document.getElementById('m-mean');
  if (elMean) elMean.textContent = (meanX >= 0 ? `+${meanX.toFixed(2)}` : meanX.toFixed(2));

  let stdDev = 0;
  if (state.rounds > 1) {
    const variance = state.profitHistory.reduce((acc, val) => acc + Math.pow(val - meanX, 2), 0) / (state.rounds - 1);
    stdDev = Math.sqrt(variance);
  }
  const elStd = document.getElementById('m-std');
  if (elStd) elStd.textContent = stdDev.toFixed(2);
}

function triggerWinConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.62 },
      colors: ['#f472b6', '#fde047', '#38bdf8', '#a855f7', '#34d399']
    });
  }
}

function updateBunnyQuote() {
  const quoteEl = document.getElementById('bunny-quote');
  if (!quoteEl) return;
  const quote = BUNNY_QUOTES[Math.floor(Math.random() * BUNNY_QUOTES.length)];
  quoteEl.textContent = quote;
}

/**
 * Animação da alavanca lateral
 */
function pullLever() {
  const lever = document.getElementById('slot-lever');
  if (!lever) return;
  lever.classList.add('pulled');
  setTimeout(() => lever.classList.remove('pulled'), 300);
}

/**
 * Executa o giro
 */
function handleSpin() {
  if (state.isSpinning) return;

  if (state.balance < state.betCost) {
    showItauLoanModal();
    return;
  }

  state.isSpinning = true;
  document.getElementById('btn-spin').disabled = true;

  pullLever();

  state.balance -= state.betCost;
  state.totalBet += state.betCost;
  state.rounds++;

  const msgEl = document.getElementById('round-message');
  msgEl.className = 'round-status-banner neutral';
  msgEl.textContent = 'Girando os rolos... 🍼✨';

  const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
  ];
  reels.forEach(r => r.classList.add('spinning'));

  let ticks = 0;
  const tickTimer = setInterval(() => {
    sounds.playClick();
    ticks++;
    if (ticks > 9) clearInterval(tickTimer);
  }, 70);

  const result = spinReels();
  const outcome = evaluatePayout(result);

  setTimeout(() => {
    reels.forEach(r => r.classList.remove('spinning'));
    renderReelSymbols(result);

    state.totalPaid += outcome.payout;
    state.balance += outcome.payout;
    state.profitHistory.push(outcome.netProfit);
    state.balanceHistory.push(state.balance);
    state.roundLabels.push(state.rounds);

    if (outcome.isWin) {
      state.wins++;
      msgEl.className = 'round-status-banner win';
      msgEl.innerHTML = `🎉 <strong>PARABÉNS NENÉM!</strong> Tirou 3x ${outcome.symbol.emoji} no centro e faturou <strong>+${outcome.payout} moedas</strong>!`;
      
      sounds.playYay();
      triggerWinConfetti();
    } else {
      state.losses++;
      msgEl.className = 'round-status-banner loss';
      const lossMsgs = [
        "😢 Não deu desta vez! A Bebêt agradece sua contribuição (-1 moeda).",
        "🍼 Quase! Mais uma rodadinha e a sorte vira!",
        "💔 Que pena! O cofre da Bebêt engoliu sua moedinha.",
        "✨ Só perde quem desiste de tentar!"
      ];
      msgEl.textContent = lossMsgs[Math.floor(Math.random() * lossMsgs.length)];
      sounds.playLoss();
    }

    if (state.rounds % 3 === 0) {
      updateBunnyQuote();
    }

    updateStatsUI();
    updateChart();

    state.isSpinning = false;
    document.getElementById('btn-spin').disabled = false;

    if (state.balance < state.betCost) {
      setTimeout(() => {
        showItauLoanModal();
      }, 650);
    }
  }, 650);
}

function handleAutoSpin() {
  if (state.isSpinning || state.autoSpinning) return;
  state.autoSpinning = true;
  const btnAuto = document.getElementById('btn-auto');
  btnAuto.disabled = true;

  let count = 10;
  const autoInterval = setInterval(() => {
    if (count <= 0 || state.balance < state.betCost) {
      clearInterval(autoInterval);
      state.autoSpinning = false;
      btnAuto.disabled = false;
      if (state.balance < state.betCost) {
        showItauLoanModal();
      }
      return;
    }
    handleSpin();
    count--;
  }, 820);
}

function showItauLoanModal() {
  sounds.playCash();
  const modal = document.getElementById('itau-modal');
  modal.classList.remove('hidden');
}

function acceptLoan() {
  state.loansTaken++;
  state.totalDebt += 100;
  state.balance += 100;

  sounds.playCash();

  const modal = document.getElementById('itau-modal');
  modal.classList.add('hidden');

  const msgEl = document.getElementById('round-message');
  msgEl.className = 'round-status-banner win';
  msgEl.innerHTML = `💸 <strong>Empréstimo Aprovado!</strong> +100 moedas liberadas! Dívida: ${state.totalDebt} créditos (67% a.m.). Continue apostando!`;

  updateStatsUI();
  updateChart();
}

// -------------------------------------------------------------
// EVENT LISTENERS & INICIALIZAÇÃO
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  renderReelSymbols({
    reel1: { top: SYMBOLS[0], mid: SYMBOLS[1], bot: SYMBOLS[2] },
    reel2: { top: SYMBOLS[2], mid: SYMBOLS[1], bot: SYMBOLS[4] },
    reel3: { top: SYMBOLS[4], mid: SYMBOLS[1], bot: SYMBOLS[0] }
  });

  initChart();
  updateStatsUI();

  // Intro modal
  const introModal = document.getElementById('intro-modal');
  const btnEnter = document.getElementById('btn-enter');
  btnEnter.addEventListener('click', () => {
    sounds.init();
    sounds.playBgm();
    introModal.classList.add('hidden');
  });

  // Botões de giro
  document.getElementById('btn-spin').addEventListener('click', () => {
    sounds.init();
    handleSpin();
  });

  const lever = document.getElementById('slot-lever');
  if (lever) {
    lever.addEventListener('click', () => {
      sounds.init();
      handleSpin();
    });
  }

  document.getElementById('btn-auto').addEventListener('click', () => {
    sounds.init();
    handleAutoSpin();
  });

  // Controle de som
  document.getElementById('btn-sound').addEventListener('click', () => {
    sounds.toggleSound();
  });

  // Home / Sobre
  document.getElementById('btn-home').addEventListener('click', () => {
    introModal.classList.remove('hidden');
  });

  // Sidebar navigation
  const labModal = document.getElementById('lab-modal');
  document.getElementById('menu-jogos').addEventListener('click', () => {
    labModal.classList.add('hidden');
  });

  document.getElementById('menu-lab').addEventListener('click', () => {
    labModal.classList.remove('hidden');
    setTimeout(() => updateChart(), 100);
  });

  document.getElementById('btn-close-lab').addEventListener('click', () => {
    labModal.classList.add('hidden');
  });

  document.getElementById('menu-itau').addEventListener('click', () => {
    showItauLoanModal();
  });

  document.getElementById('menu-sobre').addEventListener('click', () => {
    introModal.classList.remove('hidden');
  });

  // Empréstimo Itaú Kids
  document.getElementById('btn-accept-loan').addEventListener('click', () => {
    acceptLoan();
  });
});
