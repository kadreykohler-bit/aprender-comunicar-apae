// =========================================================
// BANCO DE PALAVRAS COM DIVISÃO SILÁBICA
// =========================================================
const bancoPalavras = [
  { palavra: "ÁGUA", silabas: ["Á", "GUA"], emoji: "💧" },
  { palavra: "CASA", silabas: ["CA", "SA"], emoji: "🏠" },
  { palavra: "BOLA", silabas: ["BO", "LA"], emoji: "⚽" },
  { palavra: "GATO", silabas: ["GA", "TO"], emoji: "🐱" },
  { palavra: "MAÇÃ", silabas: ["MA", "ÇÃ"], emoji: "🍎" },
  { palavra: "SOL", silabas: ["SOL"], emoji: "☀️" },
  { palavra: "CARRO", silabas: ["CAR", "RO"], emoji: "🚗" },
  { palavra: "LIVRO", silabas: ["LI", "VRO"], emoji: "📖" },
  { palavra: "BANANA", silabas: ["BA", "NA", "NA"], emoji: "🍌" },
  { palavra: "SAPATO", silabas: ["SA", "PA", "TO"], emoji: "👟" },
  { palavra: "CAVALO", silabas: ["CA", "VA", "LO"], emoji: "🐴" }
];

// =========================================================
// BANCO DE NÚMEROS (1 A 10)
// =========================================================
const bancoNumeros = [
  { valor: 1, extenso: "UM" },
  { valor: 2, extenso: "DOIS" },
  { valor: 3, extenso: "TRÊS" },
  { valor: 4, extenso: "QUATRO" },
  { valor: 5, extenso: "CINCO" },
  { valor: 6, extenso: "SEIS" },
  { valor: 7, extenso: "SETE" },
  { valor: 8, extenso: "OITO" },
  { valor: 9, extenso: "NOVE" },
  { valor: 10, extenso: "DEZ" }
];

let palavraAtual = null;
let bloqueado = false;
let silabasEscolhidas = [];

// Variáveis do Modo 4 (Números)
let submodoNumeros = 'explorar'; // 'explorar' ou 'contar'
let numeroAlvo = null;

// =========================================================
// SISTEMA DE VOZ NATURAL / JOVEM EM PORTUGUÊS
// =========================================================
let vozSelecionada = null;

function carregarMelhorVoz() {
  if (!('speechSynthesis' in window)) return;

  const vozes = window.speechSynthesis.getVoices();
  const vozesPT = vozes.filter(v => v.lang.toLowerCase().includes('pt'));

  // Prioriza vozes mais naturais (Edge/Windows Neural, Google Android/Chrome, Apple)
  const preferencias = [
    'Thalita',
    'Francisca',
    'Google português do Brasil',
    'Luciana',
    'Maria'
  ];

  for (const nome of preferencias) {
    const encontrada = vozesPT.find(v => v.name.includes(nome));
    if (encontrada) {
      vozSelecionada = encontrada;
      break;
    }
  }

  // Fallback: pega a primeira voz em português disponível
  if (!vozSelecionada && vozesPT.length > 0) {
    vozSelecionada = vozesPT[0];
  }
}

if ('speechSynthesis' in window) {
  carregarMelhorVoz();
  window.speechSynthesis.onvoiceschanged = carregarMelhorVoz;
}

function falar(texto) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const fala = new SpeechSynthesisUtterance(texto.toLowerCase());
  fala.lang = 'pt-BR';

  if (vozSelecionada) {
    fala.voice = vozSelecionada;
  }

  // Tom levemente mais agudo (infantil/amigável) e ritmo natural
  fala.pitch = 1.28;
  fala.rate = 0.92;

  window.speechSynthesis.speak(fala);
}

// =========================================================
// MODO 1: EXPLORAR VOCABULÁRIO
// =========================================================
function iniciarExplorar() {
  const container = document.getElementById('tela-explorar');
  container.innerHTML = '';

  bancoPalavras.forEach(item => {
    const card = document.createElement('button');
    card.className = 'card-palavra';
    card.setAttribute('aria-label', `Palavra ${item.palavra}`);
    card.innerHTML = `
      <span class="emoji" aria-hidden="true">${item.emoji}</span>
      <span class="texto-palavra">${item.palavra}</span>
    `;
    card.onclick = () => falar(item.palavra);
    container.appendChild(card);
  });
}

// =========================================================
// MODO 2: ASSOCIAR IMAGEM E PALAVRA (QUIZ)
// =========================================================
function novaRodadaQuiz() {
  bloqueado = false;
  document.getElementById('feedback-quiz').textContent = '';

  palavraAtual = bancoPalavras[Math.floor(Math.random() * bancoPalavras.length)];
  document.getElementById('quiz-figura').textContent = palavraAtual.emoji;

  let opcoes = [palavraAtual];
  while (opcoes.length < 3) {
    const aleatoria = bancoPalavras[Math.floor(Math.random() * bancoPalavras.length)];
    if (!opcoes.some(o => o.palavra === aleatoria.palavra)) {
      opcoes.push(aleatoria);
    }
  }
  opcoes.sort(() => Math.random() - 0.5);

  const containerOpcoes = document.getElementById('opcoes-quiz');
  containerOpcoes.innerHTML = '';

  opcoes.forEach(opcao => {
    const btn = document.createElement('button');
    btn.className = 'opcao-btn';
    btn.textContent = opcao.palavra;
    btn.onclick = () => verificarRespostaQuiz(btn, opcao);
    containerOpcoes.appendChild(btn);
  });

  setTimeout(() => falar(palavraAtual.palavra), 300);
}

function verificarRespostaQuiz(botao, opcaoEscolhida) {
  if (bloqueado) return;

  if (opcaoEscolhida.palavra === palavraAtual.palavra) {
    bloqueado = true;
    botao.classList.add('correta');
    document.getElementById('feedback-quiz').textContent = `⭐ MUITO BEM! ${palavraAtual.palavra}!`;
    falar(`Muito bem! ${palavraAtual.palavra}`);
    setTimeout(novaRodadaQuiz, 2200);
  } else {
    botao.classList.add('tentar-novamente');
    document.getElementById('feedback-quiz').textContent = `TENTE OUTRA VEZ!`;
    falar(`Tente outra vez. Procure a palavra ${palavraAtual.palavra}`);
  }
}

// =========================================================
// MODO 3: FORMAR PALAVRAS COM SÍLABAS
// =========================================================
function novaRodadaSilabas() {
  bloqueado = false;
  silabasEscolhidas = [];
  document.getElementById('feedback-silabas').textContent = '';

  palavraAtual = bancoPalavras[Math.floor(Math.random() * bancoPalavras.length)];
  document.getElementById('silabas-figura').textContent = palavraAtual.emoji;

  renderizarSlotsSilabas();
  renderizarBotoesSilabas();

  setTimeout(() => falar(palavraAtual.palavra), 300);
}

function reiniciarPalavraSilabas() {
  if (bloqueado || !palavraAtual) return;
  silabasEscolhidas = [];
  document.getElementById('feedback-silabas').textContent = '';
  renderizarSlotsSilabas();
  renderizarBotoesSilabas();
  falar(palavraAtual.palavra);
}

function renderizarSlotsSilabas(completo = false) {
  const containerSlots = document.getElementById('slots-silabas');
  containerSlots.innerHTML = '';

  palavraAtual.silabas.forEach((_, index) => {
    const slot = document.createElement('div');
    slot.className = 'slot-box';

    if (silabasEscolhidas[index]) {
      slot.textContent = silabasEscolhidas[index];
      slot.classList.add('preenchido');
    } else {
      slot.textContent = '_';
    }

    if (completo) {
      slot.classList.add('completo');
    }

    containerSlots.appendChild(slot);
  });
}

function renderizarBotoesSilabas() {
  const containerBotoes = document.getElementById('botoes-silabas');
  containerBotoes.innerHTML = '';

  let listaEmbaralhada = palavraAtual.silabas.map((texto, idx) => ({ texto, idx }));

  if (listaEmbaralhada.length > 1) {
    do {
      listaEmbaralhada.sort(() => Math.random() - 0.5);
    } while (listaEmbaralhada.map(s => s.texto).join('') === palavraAtual.palavra);
  }

  listaEmbaralhada.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'silaba-btn';
    btn.textContent = item.texto;
    btn.onclick = () => selecionarSilaba(btn, item.texto);
    containerBotoes.appendChild(btn);
  });
}

function selecionarSilaba(botao, silabaTexto) {
  if (bloqueado) return;

  const proximaPosicao = silabasEscolhidas.length;
  const silabaEsperada = palavraAtual.silabas[proximaPosicao];

  if (silabaTexto === silabaEsperada) {
    silabasEscolhidas.push(silabaTexto);
    botao.disabled = true;
    renderizarSlotsSilabas();

    if (silabasEscolhidas.length === palavraAtual.silabas.length) {
      bloqueado = true;
      renderizarSlotsSilabas(true);
      document.getElementById('feedback-silabas').textContent = `⭐ PARABÉNS! ${palavraAtual.palavra}!`;
      falar(`Parabéns! ${palavraAtual.palavra}`);
      setTimeout(novaRodadaSilabas, 2400);
    } else {
      falar(silabaTexto);
    }
  } else {
    document.getElementById('feedback-silabas').textContent = `TENTE OUTRA SÍLABA!`;
    falar(`Tente outra sílaba. A palavra é ${palavraAtual.palavra}`);
  }
}

// =========================================================
// MODO 4: NÚMEROS DE 1 A 10
// =========================================================
function iniciarGradeNumeros() {
  const grade = document.getElementById('grade-numeros');
  grade.innerHTML = '';

  bancoNumeros.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'numero-btn';
    btn.id = `btn-num-${item.valor}`;
    btn.textContent = item.valor;
    btn.setAttribute('aria-label', `Número ${item.valor}, ${item.extenso}`);
    btn.onclick = () => aoClicarNumero(btn, item);
    grade.appendChild(btn);
  });
}

function alternarSubmodoNumeros(submodo) {
  submodoNumeros = submodo;
  bloqueado = false;
  document.getElementById('feedback-numeros').textContent = '';

  document.getElementById('btn-sub-explorar-num').classList.toggle('ativo', submodo === 'explorar');
  document.getElementById('btn-sub-contar-num').classList.toggle('ativo', submodo === 'contar');

  limparDestaquesNumeros();

  if (submodo === 'explorar') {
    document.getElementById('instrucao-numeros').textContent = 'TOQUE EM UM NÚMERO PARA OUVIR E VER A QUANTIDADE:';
    atualizarVisorNumero(bancoNumeros[0], true);
    falar('Ouvir números. Toque em um número.');
  } else {
    document.getElementById('instrucao-numeros').textContent = 'CONTE AS ESTRELAS E TOQUE NO NÚMERO CERTO:';
    novaRodadaContarNumeros();
  }
}

function limparDestaquesNumeros() {
  document.querySelectorAll('.numero-btn').forEach(btn => {
    btn.classList.remove('selecionado', 'correto');
    btn.style.opacity = '1';
  });
}

function atualizarVisorNumero(item, mostrarTexto) {
  document.getElementById('estrelas-container').textContent = '⭐'.repeat(item.valor);
  document.getElementById('numero-extenso').textContent = mostrarTexto
    ? `${item.valor} - ${item.extenso}`
    : 'QUANTAS ESTRELAS TEM AQUI?';
}

function novaRodadaContarNumeros() {
  bloqueado = false;
  limparDestaquesNumeros();
  document.getElementById('feedback-numeros').textContent = '';

  numeroAlvo = bancoNumeros[Math.floor(Math.random() * bancoNumeros.length)];
  atualizarVisorNumero(numeroAlvo, false);

  setTimeout(() => falar('Conte as estrelas e toque no número'), 300);
}

function aoClicarNumero(botao, item) {
  if (bloqueado) return;

  if (submodoNumeros === 'explorar') {
    limparDestaquesNumeros();
    botao.classList.add('selecionado');
    atualizarVisorNumero(item, true);
    falar(item.extenso);
  } else {
    // Submodo Contar Estrelas
    if (item.valor === numeroAlvo.valor) {
      bloqueado = true;
      botao.classList.add('correto');
      atualizarVisorNumero(item, true);
      document.getElementById('feedback-numeros').textContent = `⭐ MUITO BEM! ${item.valor} (${item.extenso})!`;
      falar(`Muito bem! ${item.extenso}`);
      setTimeout(novaRodadaContarNumeros, 2400);
    } else {
      botao.style.opacity = '0.4';
      document.getElementById('feedback-numeros').textContent = `VOCÊ TOCOU NO ${item.valor}. CONTE AS ESTRELAS NOVAMENTE!`;
      falar(`Esse é o ${item.extenso}. Conte as estrelas novamente.`);
    }
  }
}

// =========================================================
// NAVEGAÇÃO ENTRE MODOS E CONTRASTE
// =========================================================
function mudarModo(modo) {
  const telas = ['explorar', 'quiz', 'silabas', 'numeros'];

  telas.forEach(t => {
    const elTela = document.getElementById(`tela-${t}`);
    const elBtn = document.getElementById(`btn-modo-${t}`);

    if (t === modo) {
      elTela.classList.remove('oculto');
      elBtn.classList.add('ativo');
    } else {
      elTela.classList.add('oculto');
      elBtn.classList.remove('ativo');
    }
  });

  if (modo === 'explorar') {
    falar("Modo explorar");
  } else if (modo === 'quiz') {
    novaRodadaQuiz();
  } else if (modo === 'silabas') {
    novaRodadaSilabas();
  } else if (modo === 'numeros') {
    iniciarGradeNumeros();
    alternarSubmodoNumeros('explorar');
  }
}

function alternarContraste() {
  document.body.classList.toggle('alto-contraste');
  const ativo = document.body.classList.contains('alto-contraste');
  falar(ativo ? "Alto contraste ativado" : "Modo normal ativado");
}

// Inicializa o aplicativo
iniciarExplorar();