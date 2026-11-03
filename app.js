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
  "Boa sorte! 💕",
  "Mamadeira tá paga! 🍼",
  "Só perde quem desiste! 🚀",
  "O loss fortalece a cognição!",
  "99% dos bebês param antes da bolada!",
  "Chupeta penhorada com sucesso!",
  "Mais uma rodadinha só... 🥺",
  "O berçário inteiro tá torcendo!",
  "Idade é apenas um número! 👶",
  "Aposta que a sorte vem!"
];

// Frases satíricas para vitórias no 10x instantâneo
const WIN_10X_PHRASES = [
  (w, p, net) => `⚡ <strong>10x em 0.05s!</strong> ${w} vitória(s) relâmpago! Faturou <strong>+${p} moedas</strong> (Lucro Líquido: ${net >= 0 ? '+' + net : net})! O berçário tá em festa! 🍼🎉`,
  (w, p, net) => `⚡ <strong>Leite Ninho no atacado!</strong> ${w} acerto(s) instantâneo(s) (+${p} moedas)! Mamãe nem viu onde foi parar a mesada! 👶✨`,
  (w, p, net) => `⚡ <strong>Day trade no berço!</strong> O pequeno apostador faturou <strong>+${p} moedas</strong> em alta frequência! 📈👑`,
  (w, p, net) => `⚡ <strong>O algoritmo da Bebêt engasgou!</strong> ${w} acertos de uma vez só (+${p} moedas)! A sorte sorriu pro neném! 🚀`,
  (w, p, net) => `⚡ <strong>Pediatra aprovou a dopamina!</strong> ${w} acerto(s) rápidos e +${p} moedas no cofrinho infantil! 🎈`
];

// Frases satíricas para derrotas no 10x instantâneo
const LOSS_10X_PHRASES = [
  (spins) => `⚡ <strong>10 giros e 10 derrotas em 0.02s!</strong> A velocidade da ruína agora é quântica (-${spins} moedas)! 📉💸`,
  (spins) => `⚡ <strong>Speedrun de falência!</strong> O leitinho evaporou em menos de 1 segundo (-${spins} moedas). O Itaú Kids já tá de olho! 🍼💔`,
  (spins) => `⚡ <strong>0 vitórias em ${spins} giros!</strong> Não desista, 99% dos bebês param antes da grande bolada! 👶🚀`,
  (spins) => `⚡ <strong>Chupeta penhorada em alta velocidade!</strong> A Bebêt abocanhou -${spins} moedas num piscar de olhos! 🏦`,
  (spins) => `⚡ <strong>A Lei dos Grandes Números mandou lembranças!</strong> 10 derrotas instantâneas (-${spins} moedas). A casa sempre vence! 📊`,
  (spins) => `⚡ <strong>A mesada foi de arrasta pra cima!</strong> -${spins} moedas em tempo recorde! Quer um empréstimo com juros de 67%? 🧡`
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
  soundEnabled: true
};

// -------------------------------------------------------------
// SISTEMA DE ÁUDIO COM ASSETS EXTERNOS (BGM, YAY E SAD MP3)
// -------------------------------------------------------------
class SoundManager {
  constructor() {
    this.bgmAudio = null;
    this.yayAudio = null;
    this.sadAudio = null;
    this.audioCtx = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    this.bgmAudio = document.getElementById('bgm-audio');
    this.yayAudio = document.getElementById('yay-audio');
    this.sadAudio = document.getElementById('sad-audio');

    if (this.bgmAudio) {
      this.bgmAudio.volume = 0.28;
    }
    if (this.yayAudio) {
      this.yayAudio.volume = 0.65;
    }
    if (this.sadAudio) {
      this.sadAudio.volume = 0.60;
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
        console.log("Autoplay aguardando interação do usuário:", e);
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

  playSad() {
    if (!state.soundEnabled) return;
    this.init();
    if (this.sadAudio) {
      this.sadAudio.currentTime = 0;
      this.sadAudio.play().catch(e => console.warn(e));
    }
  }

  // Efeito sonoro de clique mecânico da roleta
  playClick() {
    if (!state.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420 + Math.random() * 100, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  // Som de caixa registradora ao pegar empréstimo
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
          label: 'Saldo do Bebê (Moedas)',
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
          title: { display: true, text: 'Moedas', font: { family: 'Fredoka', weight: 'bold' } },
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
// LÓGICA DO JOGO (MODELO MATEMÁTICO IFES 2026)
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
  document.getElementById('r1-top').innerHTML = `<div class="slot-symbol">${spinResult.reel1.top.emoji}</div>`;
  document.getElementById('r1-mid').innerHTML = `<div class="slot-symbol">${spinResult.reel1.mid.emoji}</div>`;
  document.getElementById('r1-bot').innerHTML = `<div class="slot-symbol">${spinResult.reel1.bot.emoji}</div>`;

  // Rolo 2
  document.getElementById('r2-top').innerHTML = `<div class="slot-symbol">${spinResult.reel2.top.emoji}</div>`;
  document.getElementById('r2-mid').innerHTML = `<div class="slot-symbol">${spinResult.reel2.mid.emoji}</div>`;
  document.getElementById('r2-bot').innerHTML = `<div class="slot-symbol">${spinResult.reel2.bot.emoji}</div>`;

  // Rolo 3
  document.getElementById('r3-top').innerHTML = `<div class="slot-symbol">${spinResult.reel3.top.emoji}</div>`;
  document.getElementById('r3-mid').innerHTML = `<div class="slot-symbol">${spinResult.reel3.mid.emoji}</div>`;
  document.getElementById('r3-bot').innerHTML = `<div class="slot-symbol">${spinResult.reel3.bot.emoji}</div>`;
}

function updateStatsUI() {
  // HUD Superior
  document.getElementById('player-balance').textContent = state.balance;
  const casinoProfit = state.totalBet - state.totalPaid;
  const casinoEl = document.getElementById('casino-profit');
  casinoEl.textContent = (casinoProfit >= 0 ? `+${casinoProfit}` : `${casinoProfit}`);

  // Mini HUD no card de ajuda
  const observedRTP = state.totalBet > 0 ? ((state.totalPaid / state.totalBet) * 100).toFixed(1) : '0.0';
  const miniRtp = document.getElementById('mini-rtp');
  if (miniRtp) miniRtp.textContent = `${observedRTP}%`;
  const miniRounds = document.getElementById('mini-rounds');
  if (miniRounds) miniRounds.textContent = state.rounds;

  // Painel detalhado do Laboratório da Ruína
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
      particleCount: 80,
      spread: 80,
      origin: { y: 0.62 },
      colors: ['#f472b6', '#fde047', '#38bdf8', '#a855f7', '#34d399']
    });
  }
}

function updateBunnyQuote(customQuote = null) {
  const quoteEl = document.getElementById('bunny-bubble');
  if (!quoteEl) return;
  const quote = customQuote || BUNNY_QUOTES[Math.floor(Math.random() * BUNNY_QUOTES.length)];
  quoteEl.textContent = quote;
}

function pullLever() {
  const lever = document.getElementById('slot-lever');
  if (!lever) return;
  lever.classList.add('pulled');
  setTimeout(() => lever.classList.remove('pulled'), 300);
}

/**
 * Executa uma rodada padrão com animação
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
  msgEl.className = 'round-status-pill neutral';
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
  }, 65);

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
      msgEl.className = 'round-status-pill win';
      msgEl.innerHTML = `🎉 <strong>PARABÉNS NENÉM!</strong> Tirou 3x ${outcome.symbol.emoji} no centro e faturou <strong>+${outcome.payout} moedas</strong>!`;
      
      sounds.playYay();
      triggerWinConfetti();
    } else {
      state.losses++;
      msgEl.className = 'round-status-pill loss';
      const lossMsgs = [
        "😢 Não deu desta vez! A Bebêt agradece sua contribuição (-1 moeda).",
        "🍼 Quase! Mais uma rodadinha e a sorte vira!",
        "💔 Que pena! O cofre da Bebêt engoliu sua moedinha.",
        "✨ Só perde quem desiste de tentar!"
      ];
      msgEl.textContent = lossMsgs[Math.floor(Math.random() * lossMsgs.length)];
      sounds.playSad();
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

/**
 * SISTEMA DE APOSTA 10X INSTANTÂNEO (Pedido expresso do usuário)
 * Executa as 10 rodadas instantaneamente em 1 clique, sem atraso de animação.
 */
function handleInstant10x() {
  if (state.isSpinning) return;

  if (state.balance < state.betCost) {
    showItauLoanModal();
    return;
  }

  pullLever();

  const startingBalance = state.balance;
  let batchWins = 0;
  let batchLosses = 0;
  let batchPaid = 0;
  let lastSpinResult = null;
  let bestWinResult = null;
  let maxPayoutInBatch = 0;

  const spinsToRun = Math.min(10, state.balance);

  for (let i = 0; i < spinsToRun; i++) {
    state.balance -= state.betCost;
    state.totalBet += state.betCost;
    state.rounds++;

    const res = spinReels();
    lastSpinResult = res;

    const out = evaluatePayout(res);
    state.totalPaid += out.payout;
    state.balance += out.payout;
    state.profitHistory.push(out.netProfit);
    state.balanceHistory.push(state.balance);
    state.roundLabels.push(state.rounds);

    if (out.isWin) {
      state.wins++;
      batchWins++;
      batchPaid += out.payout;
      if (out.payout > maxPayoutInBatch) {
        maxPayoutInBatch = out.payout;
        bestWinResult = res;
      }
    } else {
      state.losses++;
      batchLosses++;
    }

    if (state.balance < state.betCost) {
      break;
    }
  }

  // Exibe o melhor resultado ou o último
  renderReelSymbols(bestWinResult || lastSpinResult);

  const netBatchProfit = state.balance - startingBalance;
  const msgEl = document.getElementById('round-message');

  if (batchWins > 0) {
    msgEl.className = 'round-status-pill win';
    const pick = WIN_10X_PHRASES[Math.floor(Math.random() * WIN_10X_PHRASES.length)];
    msgEl.innerHTML = pick(batchWins, batchPaid, netBatchProfit);
    sounds.playYay();
    triggerWinConfetti();
  } else {
    msgEl.className = 'round-status-pill loss';
    const pick = LOSS_10X_PHRASES[Math.floor(Math.random() * LOSS_10X_PHRASES.length)];
    msgEl.innerHTML = pick(spinsToRun);
    sounds.playSad();
  }

  updateBunnyQuote(`⚡ 10 giros instantâneos!`);
  updateStatsUI();
  updateChart();

  if (state.balance < state.betCost) {
    setTimeout(() => {
      showItauLoanModal();
    }, 450);
  }
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
  msgEl.className = 'round-status-pill win';
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

  // 10x Instantâneo
  document.getElementById('btn-auto-instant').addEventListener('click', () => {
    sounds.init();
    handleInstant10x();
  });

  // Controle de som (engrenagem ou ícone de som)
  document.getElementById('btn-sound').addEventListener('click', () => {
    sounds.toggleSound();
  });

  // Home / Manifesto
  document.getElementById('btn-home').addEventListener('click', () => {
    introModal.classList.remove('hidden');
  });

  // Mascote Coelhinho clica para trocar frase
  const mascotBox = document.querySelector('.bunny-svg-box');
  if (mascotBox) {
    mascotBox.addEventListener('click', () => updateBunnyQuote());
  }

  // Sidebar navigation
  const labModal = document.getElementById('lab-modal');
  document.getElementById('menu-inicio').addEventListener('click', () => {
    introModal.classList.remove('hidden');
  });

  document.getElementById('menu-jogos').addEventListener('click', () => {
    labModal.classList.add('hidden');
  });

  document.getElementById('menu-itau').addEventListener('click', () => {
    showItauLoanModal();
  });

  document.getElementById('menu-lab').addEventListener('click', () => {
    labModal.classList.remove('hidden');
    setTimeout(() => updateChart(), 100);
  });

  document.getElementById('btn-close-lab').addEventListener('click', () => {
    labModal.classList.add('hidden');
  });

  // Empréstimo Itaú Kids
  document.getElementById('btn-accept-loan').addEventListener('click', () => {
    acceptLoan();
  });
});
