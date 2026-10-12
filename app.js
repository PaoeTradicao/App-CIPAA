'use strict';

/* =========================================================
   CONFIGURAÇÃO DO FIREBASE
   Substitua pelos dados do projeto Firebase da Pão & Tradição
   (Console Firebase > Configurações do projeto > Seus apps).
   ========================================================= */
const firebaseConfig = {
  apiKey: 'AIzaSyBOkzW1ywZMA5LgBltU1Kml_-TWKTLcZvs',
  authDomain: 'cipa-33291.firebaseapp.com',
  projectId: 'cipa-33291',
  storageBucket: 'cipa-33291.firebasestorage.app',
  messagingSenderId: '138143848833',
  appId: '1:138143848833:web:af5178894046396d4a7080'
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Persistência offline: permite marcar checkboxes e salvar
// vistorias mesmo sem sinal; sincroniza quando a rede voltar.
db.enablePersistence({ synchronizeTabs: true }).catch((erro) => {
  console.warn('Persistência offline não disponível:', erro.code);
});

// Domínio interno usado para transformar "nome de usuário" em
// e-mail válido para o Firebase Auth, sem exigir e-mail real do colaborador.
const DOMINIO_AUTH = '@cipa.paoetradicao.local';

function usuarioParaEmail(usuario) {
  const limpo = usuario
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]/g, '');
  return `${limpo}${DOMINIO_AUTH}`;
}

/* =========================================================
   TIPOS DE RISCO (mapa de risco / NR-5)
   ========================================================= */
const TIPOS_RISCO = {
  fisico: {
    nome: 'Físico',
    cor: '#43B032',
    descricao: 'Formas de energia presentes no ambiente que podem afetar o organismo.',
    exemplos: 'Ruídos, vibrações, calor, frio, umidade, radiações ionizantes e não ionizantes, pressões anormais.'
  },
  quimico: {
    nome: 'Químico',
    cor: '#C0392B',
    descricao: 'Substâncias, compostos ou produtos que podem entrar no corpo por inalação, pele ou ingestão.',
    exemplos: 'Poeiras, fumos, névoas, neblinas, gases e vapores.'
  },
  biologico: {
    nome: 'Biológico',
    cor: '#6F4E37',
    descricao: 'Microrganismos e seres vivos capazes de causar doenças ou infecções.',
    exemplos: 'Vírus, bactérias, fungos, protozoários, bacilos e parasitas.'
  },
  ergonomico: {
    nome: 'Ergonômico',
    cor: '#E1A100',
    descricao: 'Fatores que interferem nas características físicas e psicológicas do trabalhador, causando desconforto ou fadiga.',
    exemplos: 'Postura inadequada, esforço físico intenso, levantamento de peso, monotonia, repetitividade, ritmo excessivo.'
  },
  acidentes: {
    nome: 'Acidentes / Mecânicos',
    cor: '#1F6FB2',
    descricao: 'Condições físicas ou operacionais que colocam o trabalhador em perigo imediato e podem causar lesões.',
    exemplos: 'Máquinas sem proteção, arranjo físico inadequado, risco de incêndio ou explosão, ferramentas defeituosas.'
  },
  // As cinco categorias acima são as do mapa de risco oficial
  // (Portaria 25/1994), cada uma com sua cor definida em norma.
  // O risco psicossocial entrou na gestão de riscos com a atualização
  // da NR-1 e não tem cor oficial no mapa: o roxo é uso corrente.
  psicossocial: {
    nome: 'Psicossocial',
    cor: '#7B4FA8',
    oficial: false,
    descricao: 'Fatores da organização do trabalho e das relações interpessoais que afetam a saúde mental do trabalhador.',
    exemplos: 'Assédio moral ou sexual, cobrança abusiva, jornada excessiva, isolamento, ameaças e constrangimentos.'
  }
};

function opcoesTipoRiscoHtml(valorSelecionado) {
  const semSelecao = valorSelecionado === undefined || valorSelecionado === null || valorSelecionado === '';
  let html = `<option value="" ${semSelecao ? 'selected' : ''} disabled>Selecione o tipo de risco</option>`;
  html += Object.entries(TIPOS_RISCO).map(([chave, tipo]) =>
    `<option value="${chave}" ${valorSelecionado === chave ? 'selected' : ''}>${tipo.nome}</option>`
  ).join('');
  return html;
}

function seloTipoRisco(chave) {
  const tipo = TIPOS_RISCO[chave];
  if (!tipo) return '';
  return `<span class="selo-risco" style="background:${tipo.cor}" title="Risco ${tipo.nome}"></span>`;
}

function hexParaRgb(hex) {
  const limpo = hex.replace('#', '');
  const num = parseInt(limpo, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/* =========================================================
   AGRUPAMENTO, ORDENAÇÃO E RESUMO DO RELATÓRIO
   Compartilhado entre a tela e a exportação em PDF, para os
   dois ficarem sempre consistentes.
   ========================================================= */
const RANK_URGENCIA = { alta: 0, media: 1, baixa: 2 };

function agruparPorSetor(lista, obterNomeSetor) {
  const mapa = new Map();
  lista.forEach((item) => {
    const nome = obterNomeSetor(item) || 'Geral';
    if (!mapa.has(nome)) mapa.set(nome, []);
    mapa.get(nome).push(item);
  });
  return mapa;
}

function obterObservacoesRelevantes(vistorias, avulsas, filtroStatus) {
  const idsVistorias = new Set(vistorias.map((v) => v.id));
  const obsDeVistorias = estado.observacoes.filter((o) =>
    o.vistoriaId && idsVistorias.has(o.vistoriaId) && (!filtroStatus || o.status === filtroStatus)
  );
  return [...avulsas, ...obsDeVistorias];
}

function calcularResumoObservacoes(observacoes) {
  const porUrgencia = { alta: 0, media: 0, baixa: 0 };
  const porRisco = {};
  observacoes.forEach((o) => {
    if (porUrgencia[o.urgencia] !== undefined) porUrgencia[o.urgencia]++;
    if (o.tipoRisco) porRisco[o.tipoRisco] = (porRisco[o.tipoRisco] || 0) + 1;
  });
  return { total: observacoes.length, porUrgencia, porRisco };
}

// Agrupa avulsas por setor, ordenando do mais novo para o mais antigo
// dentro de cada setor. Usado nas seções de pendentes e resolvidos.
/* =========================================================
   VISTORIAS VINCULADAS
   Quando dois membros vistoriam juntos e cada um registra a sua,
   o mesmo trabalho aparece duas vezes. Vincular marca uma delas
   como duplicada, apontando para a principal, e leva o nome de
   quem registrou a duplicada para a lista de fiscalizadores da
   principal. A duplicada some das contagens e dos relatórios,
   mas continua salva no banco, porque vistoria não se apaga.
   ========================================================= */

// Vistorias que valem para contagens e relatórios, sem as duplicadas.
function vistoriasAtivas() {
  return estado.vistorias.filter((v) => !v.vinculadaA && !v.fechamentoId);
}

/* =========================================================
   FECHAMENTO DE PERÍODO
   Depois da reunião, o Presidente encerra o período já
   exportado. As vistorias e as observações resolvidas daquele
   intervalo saem das telas do dia a dia, mas continuam no banco
   por um ano, e o relatório pode ser gerado de novo a partir do
   histórico. As fotos são mantidas, apenas recomprimidas para
   ocupar menos espaço.
   ========================================================= */
const RETENCAO_MESES = 12;

function ehPresidente() {
  return (estado.usuario && estado.usuario.cargo) === 'Presidente';
}

// Observações que ainda pedem ação continuam visíveis mesmo depois
// do encerramento. Só as resolvidas somem junto com o período.
function observacoesAtivas() {
  return estado.observacoes.filter((o) => !o.fechamentoId || o.status !== 'resolvida');
}

// Nome de quem fiscalizou, juntando quem registrou e quem vistoriou junto.
function fiscalizadoresDaVistoria(vistoria) {
  const nomes = [vistoria.colaboradorNome].filter(Boolean);
  (vistoria.coFiscalizadores || []).forEach((nome) => {
    if (nome && !nomes.includes(nome)) nomes.push(nome);
  });
  return nomes;
}

function textoFiscalizadores(vistoria) {
  const nomes = fiscalizadoresDaVistoria(vistoria);
  if (nomes.length <= 1) return nomes[0] || '';
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

function agruparAvulsasPorSetorData(avulsas) {
  const mapa = agruparPorSetor(avulsas, (o) => limparNomeSetor(o.setorNome) || 'Geral');
  return [...mapa.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR')).map((nome) => {
    const itens = mapa.get(nome).slice().sort((a, b) => {
      const dataA = a.criadoEm ? a.criadoEm.toMillis() : 0;
      const dataB = b.criadoEm ? b.criadoEm.toMillis() : 0;
      return dataB - dataA;
    });
    return { nome, itens, total: itens.length, altaCount: itens.filter((o) => o.urgencia === 'alta').length };
  });
}

// Agrupa os registros avulsos por setor (ordem alfabética dos setores) e,
// dentro de cada setor, ordena por urgência (alta, media, baixa) e
// depois por data mais recente.
function organizarAvulsasPorSetor(avulsas) {
  const mapa = agruparPorSetor(avulsas, (o) => limparNomeSetor(o.setorNome) || 'Geral');
  return [...mapa.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR')).map((nome) => {
    const itens = mapa.get(nome).slice().sort((a, b) => {
      const diff = (RANK_URGENCIA[a.urgencia] ?? 3) - (RANK_URGENCIA[b.urgencia] ?? 3);
      if (diff !== 0) return diff;
      const dataA = a.criadoEm ? a.criadoEm.toMillis() : 0;
      const dataB = b.criadoEm ? b.criadoEm.toMillis() : 0;
      return dataB - dataA;
    });
    const altaCount = itens.filter((o) => o.urgencia === 'alta').length;
    return { nome, itens, total: itens.length, altaCount };
  });
}

// Mesma ideia para as vistorias, mas a "urgência" de uma vistoria é a
// maior urgência entre as observações registradas nela.
function organizarVistoriasPorSetor(vistorias, filtroStatus) {
  const mapa = agruparPorSetor(vistorias, (v) => limparNomeSetor(v.setorNome) || 'Geral');
  return [...mapa.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR')).map((nome) => {
    const itens = mapa.get(nome).slice();
    const infoPorVistoria = new Map();
    itens.forEach((v) => {
      const obsDaVistoria = estado.observacoes.filter((o) => o.vistoriaId === v.id && (!filtroStatus || o.status === filtroStatus));
      const rank = obsDaVistoria.reduce((min, o) => Math.min(min, RANK_URGENCIA[o.urgencia] ?? 3), 3);
      infoPorVistoria.set(v.id, { rank, obs: obsDaVistoria });
    });
    itens.sort((a, b) => {
      const diff = infoPorVistoria.get(a.id).rank - infoPorVistoria.get(b.id).rank;
      if (diff !== 0) return diff;
      const dataA = a.criadoEm ? a.criadoEm.toMillis() : 0;
      const dataB = b.criadoEm ? b.criadoEm.toMillis() : 0;
      return dataB - dataA;
    });
    let altaCount = 0;
    itens.forEach((v) => { altaCount += infoPorVistoria.get(v.id).obs.filter((o) => o.urgencia === 'alta').length; });
    return { nome, itens, total: itens.length, altaCount, infoPorVistoria };
  });
}

/* =========================================================
   ESTADO EM MEMÓRIA
   ========================================================= */
const estado = {
  usuario: null,          // { uid, nome, cargo }
  setores: [],            // [{ id, nome, checklist: [{id, texto}] }]
  vistorias: [],          // cache do relatório
  observacoes: [],        // cache do relatório
  acidentes: [],          // investigações de acidentes e quase acidentes
  resolucoes: [],         // resoluções registradas com foto
  fechamentos: [],        // períodos já encerrados pelo Presidente
  ultimoExportado: null,  // período do último PDF exportado nesta sessão
  telaAtual: 'vistoriar',
  subAbaRelatorio: 'avulsos',
  vistoriaEmAndamento: {
    setorId: null,
    itens: [],            // snapshot do checklist com {id, texto, checado}
    observacoes: []        // [{texto, urgencia}]
  }
};

/* =========================================================
   UTILITÁRIOS DE INTERFACE
   ========================================================= */
function $(seletor) { return document.querySelector(seletor); }
function $$(seletor) { return Array.from(document.querySelectorAll(seletor)); }

// Tolerantes a elemento ausente de proposito: durante uma publicacao,
// o app.js novo pode chegar antes do index.html novo, e um elemento
// que ainda nao existe nao pode derrubar o resto do app.
function mostrar(elemento) { if (elemento) elemento.classList.remove('oculto'); }
function esconder(elemento) { if (elemento) elemento.classList.add('oculto'); }

function formatarDataHora(data) {
  const d = data instanceof Date ? data : data.toDate();
  const dataTexto = d.toLocaleDateString('pt-BR');
  const horaTexto = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return { dataTexto, horaTexto, d };
}

function limparErro(elemento) {
  elemento.textContent = '';
  esconder(elemento);
}

function mostrarErro(elemento, mensagem) {
  elemento.textContent = mensagem;
  mostrar(elemento);
}

// Tocar em qualquer foto de observação abre ela ampliada em tela cheia.
document.addEventListener('click', (evento) => {
  const img = evento.target.closest('.foto-observacao');
  if (!img) return;
  const visor = document.createElement('div');
  visor.className = 'visor-foto';
  visor.innerHTML = `<img src="${img.src}" alt="Foto ampliada" />`;
  visor.addEventListener('click', () => visor.remove());
  document.body.appendChild(visor);
});

function abrirModal(tituloHtml, conteudoHtml) {
  const raiz = $('#raiz-modais');
  raiz.innerHTML = `
    <div class="overlay" id="overlay-modal">
      <div class="modal-wrap" style="width:100%">
        <div class="modal">
          <button type="button" class="fechar-modal" id="fechar-modal-botao" aria-label="Fechar">Fechar</button>
          <h2>${tituloHtml}</h2>
          ${conteudoHtml}
        </div>
      </div>
    </div>
  `;
  $('#overlay-modal').addEventListener('click', (evento) => {
    if (evento.target.id === 'overlay-modal') fecharModal();
  });
  $('#fechar-modal-botao').addEventListener('click', fecharModal);
}

function fecharModal() {
  $('#raiz-modais').innerHTML = '';
}

/* =========================================================
   STATUS DE CONEXÃO
   ========================================================= */
function atualizarStatusConexao() {
  const ponto = $('#ponto-conexao');
  const texto = $('#texto-conexao');
  const container = $('#status-conexao');
  if (navigator.onLine) {
    ponto.classList.remove('offline');
    texto.textContent = '';
    esconder(texto);
    container.title = 'Online';
  } else {
    ponto.classList.add('offline');
    texto.textContent = 'offline';
    mostrar(texto);
    container.title = 'Sem conexão. As vistorias são sincronizadas assim que a internet voltar.';
  }
}
window.addEventListener('online', atualizarStatusConexao);
window.addEventListener('offline', atualizarStatusConexao);

/* =========================================================
   AUTENTICAÇÃO
   ========================================================= */
$('#ir-para-cadastro').addEventListener('click', () => {
  esconder($('#form-login'));
  mostrar($('#form-cadastro'));
});

$('#ir-para-login').addEventListener('click', () => {
  esconder($('#form-cadastro'));
  mostrar($('#form-login'));
});

$('#form-login').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const erroEl = $('#erro-login');
  limparErro(erroEl);
  const usuario = $('#login-usuario').value;
  const senha = $('#login-senha').value;
  const botao = $('#botao-login');
  botao.disabled = true;
  botao.textContent = 'Entrando...';
  try {
    await auth.signInWithEmailAndPassword(usuarioParaEmail(usuario), senha);
  } catch (erro) {
    mostrarErro(erroEl, traduzirErroAuth(erro));
  } finally {
    botao.disabled = false;
    botao.textContent = 'Entrar';
  }
});

$('#form-cadastro').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const erroEl = $('#erro-cadastro');
  limparErro(erroEl);

  const nome = $('#cadastro-nome').value.trim();
  const cargo = $('#cadastro-cargo').value;
  const usuario = $('#cadastro-usuario').value.trim();
  const senha = $('#cadastro-senha').value;
  const confirmar = $('#cadastro-confirmar').value;

  if (senha !== confirmar) {
    mostrarErro(erroEl, 'As senhas não coincidem.');
    return;
  }
  if (usuario.length < 3) {
    mostrarErro(erroEl, 'O nome de usuário precisa ter pelo menos 3 caracteres.');
    return;
  }

  const botao = $('#botao-cadastro');
  botao.disabled = true;
  botao.textContent = 'Criando conta...';
  try {
    const credencial = await auth.createUserWithEmailAndPassword(usuarioParaEmail(usuario), senha);
    await db.collection('colaboradores').doc(credencial.user.uid).set({
      nome,
      cargo,
      usuario: usuario.toLowerCase(),
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (erro) {
    mostrarErro(erroEl, traduzirErroAuth(erro));
    botao.disabled = false;
    botao.textContent = 'Criar conta';
  }
});

function traduzirErroAuth(erro) {
  const mapa = {
    'auth/user-not-found': 'Usuário ou senha incorretos.',
    'auth/wrong-password': 'Usuário ou senha incorretos.',
    'auth/invalid-credential': 'Usuário ou senha incorretos.',
    'auth/email-already-in-use': 'Esse nome de usuário já está em uso.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/network-request-failed': 'Sem conexão com a internet no momento.'
  };
  return mapa[erro.code] || 'Não foi possível concluir. Tente novamente.';
}

$('#botao-google').addEventListener('click', async () => {
  const botao = $('#botao-google');
  botao.disabled = true;
  try {
    const provedor = new firebase.auth.GoogleAuthProvider();
    // signInWithRedirect (não popup): dentro de um app instalado (PWA) no
    // iOS não existe um popup de verdade, e signInWithPopup falha com
    // "the requested action is invalid". O redirect navega a própria
    // tela para o Google e volta, o que funciona em qualquer contexto.
    await auth.signInWithRedirect(provedor);
  } catch (erro) {
    botao.disabled = false;
    const erroEl = $('#form-login').classList.contains('oculto') ? $('#erro-cadastro') : $('#erro-login');
    mostrarErro(erroEl, 'Não foi possível entrar com o Google. Tente novamente.');
    console.error(erro);
  }
});

// Depois do redirect de volta do Google, o Firebase resolve o login
// sozinho via onAuthStateChanged. Aqui só capturamos erros do processo.
auth.getRedirectResult().catch((erro) => {
  if (erro && erro.code && erro.code !== 'auth/no-auth-event') {
    console.error('Erro no retorno do login com Google:', erro);
    mostrarErro($('#erro-login'), 'Não foi possível concluir o login com o Google.');
  }
});

$('#botao-sair').addEventListener('click', () => auth.signOut());

/* ---------------------------------------------------------
   TIPOS DE RISCO DENTRO DO CHAT

   O que antes era um botão separado no perfil agora é resposta
   do chat, porque é onde a pessoa procura quando a dúvida
   aparece: no meio de uma vistoria.
   --------------------------------------------------------- */

// Palavras que a pessoa usa e que não estão no nome nem nos
// exemplos de cada tipo.
const SINONIMOS_RISCO = {
  fisico: 'barulho temperatura mofado quente frio molhado iluminacao',
  quimico: 'produto limpeza desengraxante cloro soda detergente farinha po',
  biologico: 'contaminacao bolor praga rato inseto sujeira alimento estragado',
  ergonomico: 'coluna dor postura peso bancada repetitivo cansaco em pe',
  acidentes: 'mecanico queda corte queimadura choque maquina piso escorregadio fogo',
  psicossocial: 'mental emocional estresse pressao meta clima humilhacao'
};

// O indice e montado na primeira busca, e nao quando o arquivo carrega.
// Assim ele depende do nr5.js so na hora de usar o chat, e nunca na
// hora de abrir o app.
let INDICE_RISCOS = null;

function indiceRiscos() {
  if (INDICE_RISCOS) return INDICE_RISCOS;
  INDICE_RISCOS = Object.keys(TIPOS_RISCO).map((chave) => {
    const tipo = TIPOS_RISCO[chave];
    return {
      chave,
      tipo,
      campo: nr5Campo(`${chave} ${tipo.nome} ${tipo.descricao} ${tipo.exemplos} ${SINONIMOS_RISCO[chave] || ''}`)
    };
  });
  return INDICE_RISCOS;
}

// O chat depende do nr5.js, que traz o texto da norma e a busca.
// Se esse arquivo nao tiver sido publicado, o chat avisa em vez de
// quebrar, e o resto do app continua funcionando normalmente.
function baseDaNormaCarregada() {
  return typeof nr5Campo === 'function'
    && typeof nr5BuscarPerguntas === 'function'
    && typeof CIPA_PERGUNTAS !== 'undefined';
}

// Reconhece a categoria escrita pelo nome, como "risco ergonomico"
// ou so "psicossocial". O nome composto de acidentes tem variacoes,
// por isso cada chave tem sua propria lista.
const NOMES_TIPOS_RISCO = {
  fisico: ['fisico', 'fisicos'],
  quimico: ['quimico', 'quimicos'],
  biologico: ['biologico', 'biologicos'],
  ergonomico: ['ergonomico', 'ergonomicos', 'ergonomia'],
  acidentes: ['acidentes', 'mecanico', 'mecanicos'],
  psicossocial: ['psicossocial', 'psicossociais']
};

function tipoRiscoNomeado(texto) {
  const campo = nr5Campo(texto);
  const chaves = Object.keys(NOMES_TIPOS_RISCO);
  for (let i = 0; i < chaves.length; i++) {
    const chave = chaves[i];
    const casou = NOMES_TIPOS_RISCO[chave].some((nome) => nr5Casa(campo, nome));
    if (!casou) continue;
    // "acidentes" sozinho é assunto de investigação, não de categoria:
    // só vale como categoria quando vem junto da palavra risco.
    if (chave === 'acidentes' && !/risco/i.test(texto)) continue;
    return { chave, tipo: TIPOS_RISCO[chave] };
  }
  return null;
}

function buscarTipoRisco(texto) {
  const termos = nr5TermosDaBusca(texto);
  if (!termos.length) return [];
  const achados = [];
  indiceRiscos().forEach((entrada) => {
    let pontos = 0;
    termos.forEach((termo) => { if (nr5Casa(entrada.campo, termo)) pontos += 1; });
    if (pontos > 0) achados.push({ entrada, pontos });
  });
  achados.sort((a, b) => b.pontos - a.pontos);
  return achados.map((a) => a.entrada);
}

function cartaoRiscoHtml(tipo) {
  return `
    <div class="cartao-risco-chat">
      <div class="cabecalho-tipo-risco">
        <span class="selo-risco-grande" style="background:${tipo.cor}"></span>
        <span class="nome-tipo-risco">${escaparHtml(tipo.nome)}</span>
        ${tipo.oficial === false ? '<span class="etiqueta-fora-mapa">fora do mapa oficial</span>' : ''}
      </div>
      <p class="descricao-tipo-risco">${escaparHtml(tipo.descricao)}</p>
      <p class="exemplos-tipo-risco"><strong>Exemplos:</strong> ${escaparHtml(tipo.exemplos)}</p>
    </div>
  `;
}

const NOTA_MAPA_RISCO = 'As cinco primeiras categorias e suas cores vêm do mapa de risco oficial, da Portaria 25/1994. O risco psicossocial entrou na gestão de riscos com a atualização da NR-1 e não tem cor definida em norma: o roxo é uso corrente.';

/* ---------------------------------------------------------
   BOLINHA FLUTUANTE

   Um toque abre o chat. Arrastando, ela sai da frente e gruda
   na lateral mais próxima. A posição escolhida fica guardada
   no próprio aparelho, então cada pessoa deixa onde preferir.
   --------------------------------------------------------- */
const CHAVE_POSICAO_BOLHA = 'cipaPosicaoBolha';
const MARGEM_BOLHA = 14;

function limitesDaBolha() {
  const bolha = $('#bolha-chat');
  const lado = (bolha && bolha.offsetWidth) || 54;
  return {
    lado,
    minX: MARGEM_BOLHA,
    maxX: window.innerWidth - lado - MARGEM_BOLHA,
    // Não encosta no cabeçalho em cima nem na barra de abas embaixo.
    minY: 70,
    maxY: window.innerHeight - lado - 78
  };
}

function posicionarBolha(x, y) {
  const bolha = $('#bolha-chat');
  if (!bolha) return { x: 0, y: 0 };
  const lim = limitesDaBolha();
  const px = Math.min(Math.max(x, lim.minX), Math.max(lim.minX, lim.maxX));
  const py = Math.min(Math.max(y, lim.minY), Math.max(lim.minY, lim.maxY));
  bolha.style.left = `${px}px`;
  bolha.style.top = `${py}px`;
  bolha.style.right = 'auto';
  bolha.style.bottom = 'auto';
  return { x: px, y: py };
}

function guardarPosicaoBolha(x, y) {
  const lim = limitesDaBolha();
  // O lado é guardado como escolha, e a altura como proporção, para
  // a bolinha continuar no mesmo lugar se a tela girar ou mudar.
  const dados = {
    lado: x + lim.lado / 2 > window.innerWidth / 2 ? 'direita' : 'esquerda',
    alturaRelativa: window.innerHeight ? y / window.innerHeight : 0.7
  };
  try {
    localStorage.setItem(CHAVE_POSICAO_BOLHA, JSON.stringify(dados));
  } catch (erro) {
    // Navegador em modo privado ou com armazenamento bloqueado:
    // a bolinha simplesmente volta ao canto padrão na próxima vez.
  }
  return dados;
}

function aplicarPosicaoGuardada() {
  if (!$('#bolha-chat')) return;
  let dados = null;
  try {
    dados = JSON.parse(localStorage.getItem(CHAVE_POSICAO_BOLHA) || 'null');
  } catch (erro) {
    dados = null;
  }
  if (!dados) return;
  const lim = limitesDaBolha();
  const x = dados.lado === 'esquerda' ? lim.minX : lim.maxX;
  posicionarBolha(x, (dados.alturaRelativa || 0.7) * window.innerHeight);
}

function configurarBolhaChat() {
  const bolha = $('#bolha-chat');
  if (!bolha) return;
  let arrastando = false;
  let moveu = false;
  let deslocX = 0;
  let deslocY = 0;

  bolha.addEventListener('pointerdown', (evento) => {
    arrastando = true;
    moveu = false;
    const caixa = bolha.getBoundingClientRect();
    deslocX = evento.clientX - caixa.left;
    deslocY = evento.clientY - caixa.top;
    bolha.setPointerCapture(evento.pointerId);
  });

  bolha.addEventListener('pointermove', (evento) => {
    if (!arrastando) return;
    const x = evento.clientX - deslocX;
    const y = evento.clientY - deslocY;
    // Só vira arrasto depois de alguns pixels, senão um toque
    // com a mão tremida deixaria de abrir o chat.
    if (!moveu) {
      const caixa = bolha.getBoundingClientRect();
      if (Math.abs(x - caixa.left) < 5 && Math.abs(y - caixa.top) < 5) return;
      moveu = true;
      bolha.classList.add('arrastando');
    }
    posicionarBolha(x, y);
  });

  function encerrar(evento) {
    if (!arrastando) return;
    arrastando = false;
    bolha.classList.remove('arrastando');
    if (bolha.hasPointerCapture && bolha.hasPointerCapture(evento.pointerId)) {
      bolha.releasePointerCapture(evento.pointerId);
    }
    if (!moveu) {
      abrirChatDuvidas();
      return;
    }
    // Ao soltar, gruda na lateral mais próxima.
    const caixa = bolha.getBoundingClientRect();
    const lim = limitesDaBolha();
    const paraDireita = caixa.left + lim.lado / 2 > window.innerWidth / 2;
    const alvo = posicionarBolha(paraDireita ? lim.maxX : lim.minX, caixa.top);
    guardarPosicaoBolha(alvo.x, alvo.y);
  }

  bolha.addEventListener('pointerup', encerrar);
  bolha.addEventListener('pointercancel', encerrar);

  // Girar o aparelho ou abrir o teclado muda a área útil.
  window.addEventListener('resize', () => {
    if (bolha.classList.contains('oculto')) return;
    if (bolha.style.left) aplicarPosicaoGuardada();
  });
}

// A bolinha e um extra. Se qualquer coisa nela falhar, o app precisa
// continuar funcionando: era aqui que um erro impedia o registro do
// onAuthStateChanged la embaixo e travava a entrada na conta.
try {
  configurarBolhaChat();
} catch (erro) {
  console.warn('Bolinha de dúvidas indisponível:', erro);
}

$('#botao-assedio').addEventListener('click', () => {
  abrirModal('Assédio e a CIPA', `
    <div class="aviso-sigilo">
      Denúncia de assédio não deve ser registrada como observação de vistoria.
      O que se escreve aqui fica visível para todos os membros da CIPA, com setor
      e data, o que pode identificar a pessoa. Use a Ouvidoria Interna, que é o
      canal com tratamento sigiloso.
    </div>

    <div class="cartao-tipo-risco">
      <div class="cabecalho-tipo-risco">
        <span class="nome-tipo-risco">O que a lei atribui à CIPA</span>
      </div>
      <p class="descricao-tipo-risco">
        A Lei 14.457/2022 incluiu entre as atribuições da CIPA a prevenção ao
        assédio sexual e às demais formas de violência no trabalho.
      </p>
      <p class="exemplos-tipo-risco">
        Entre as medidas previstas estão: incluir regras de conduta sobre assédio
        sexual nas normas internas da empresa, divulgar essas regras aos
        empregados, fixar procedimentos para receber e acompanhar denúncias, e
        realizar ações de capacitação sobre o tema.
      </p>
    </div>

    <div class="cartao-tipo-risco">
      <div class="cabecalho-tipo-risco">
        <span class="nome-tipo-risco">Assédio moral</span>
      </div>
      <p class="descricao-tipo-risco">
        Conduta abusiva e repetitiva que expõe a pessoa a situações humilhantes e
        constrangedoras, degradando o ambiente de trabalho.
      </p>
      <p class="exemplos-tipo-risco">
        Exemplos: humilhação diante de colegas, isolamento proposital, metas
        impossíveis usadas como punição, retirada injustificada de funções,
        ameaças constantes e gritos.
      </p>
    </div>

    <div class="cartao-tipo-risco">
      <div class="cabecalho-tipo-risco">
        <span class="nome-tipo-risco">Assédio sexual</span>
      </div>
      <p class="descricao-tipo-risco">
        Conduta de conotação sexual não desejada, que constrange a pessoa, seja
        por insistência, chantagem ou abuso de posição hierárquica.
      </p>
      <p class="exemplos-tipo-risco">
        Exemplos: cantadas insistentes após recusa, comentários sobre o corpo,
        contato físico não consentido, envio de conteúdo sexual e promessas ou
        ameaças ligadas ao emprego.
      </p>
    </div>

    <div class="cartao-tipo-risco">
      <div class="cabecalho-tipo-risco">
        <span class="nome-tipo-risco">O que a CIPA pode registrar aqui</span>
      </div>
      <p class="descricao-tipo-risco">
        Condições do ambiente que favorecem esses riscos, sem identificar pessoas
        nem relatar casos.
      </p>
      <p class="exemplos-tipo-risco">
        Exemplos: cartaz das regras de conduta ausente no setor, equipe sem
        capacitação sobre o tema, canal de denúncia não divulgado, escala que
        deixa alguém sozinho com o mesmo supervisor em local isolado.
      </p>
    </div>
  `);
});

/* =========================================================
   CHAT DE DUVIDAS DA CIPA

   A pessoa escreve a duvida e recebe UMA resposta, como numa
   conversa. A busca por palavra-chave escolhe a pergunta mais
   proxima entre as preparadas pela CIPA. Quando nada casa, o
   chat procura o item da NR-5 e, em ultimo caso, indica onde
   consultar. O texto da norma nunca e reescrito: aparece com o
   numero do item e a redacao oficial.
   ========================================================= */

// Dados do nosso estabelecimento, usados quando a duvida e sobre
// dimensionamento. O grau de risco vem do Quadro I da NR-4.
const CIPA_EMPREGADOS = 59;
const CIPA_GRAU_RISCO = 2;

const EXEMPLOS_DUVIDA = [
  'O que faço quando vejo um risco?',
  'Fogo na fritadeira, o que fazer?',
  'A empresa tem que dar EPI de graça?',
  'Quando precisa emitir CAT?',
  'Quantos membros a CIPA deve ter?',
  'Quais são os tipos de risco?'
];

function blocoItensNorma(numeros, recolhido) {
  const itens = (numeros || []).map(nr5ItemPorNumero).filter(Boolean);
  if (!itens.length) return '';
  const corpo = itens.map((registro) => `
    <div class="item-norma">
      <span class="numero-item-norma">NR-5, item ${escaparHtml(registro.item)}</span>
      <p class="texto-item-norma">${escaparHtml(registro.texto)}</p>
      <p class="grupo-item-norma">${escaparHtml(registro.grupo)}</p>
    </div>
  `).join('');

  if (!recolhido) return `<div class="bloco-norma">${corpo}</div>`;

  const rotulo = itens.length === 1
    ? `Ver o texto da NR-5, item ${escaparHtml(itens[0].item)}`
    : `Ver o texto da NR-5, itens ${itens.map((r) => escaparHtml(r.item)).join(', ')}`;
  return `
    <details class="norma-recolhida">
      <summary>${rotulo}</summary>
      <div class="bloco-norma">${corpo}</div>
    </details>
  `;
}

function blocoLinksApoio() {
  return NR5_LINKS_APOIO.map((link) => `
    <a class="link-apoio" href="${link.url}" target="_blank" rel="noopener">
      <div class="titulo-link-apoio">${escaparHtml(link.titulo)}</div>
      <div class="descricao-link-apoio">${escaparHtml(link.descricao)}</div>
    </a>
  `).join('');
}

function respostaDaPerguntaHtml(faq) {
  const cipeiro = faq.cipeiro
    ? `<div class="bloco-cipeiro"><strong>O que cabe ao cipeiro</strong>${escaparHtml(faq.cipeiro)}</div>`
    : '';
  const encaminhar = faq.encaminhar
    ? `<p class="linha-encaminhar"><strong>Encaminhar a:</strong> ${escaparHtml(faq.encaminhar)}</p>`
    : '';
  const normas = faq.normas
    ? `<p class="outras-normas">Também se aplica: ${escaparHtml(faq.normas)}.</p>`
    : '';
  return `
    <p>${escaparHtml(faq.resposta)}</p>
    ${cipeiro}
    ${encaminhar}
    ${blocoItensNorma(faq.base, true)}
    ${normas}
  `;
}

// A duvida sobre quantidade de membros tem resposta de tabela, e
// nela os nossos numeros ja sao conhecidos, entao o chat responde
// direto em vez de abrir um formulario.
function respostaDimensionamentoHtml() {
  const calculo = nr5Dimensionar(CIPA_GRAU_RISCO, CIPA_EMPREGADOS);
  if (!calculo) return '';
  if (!calculo.exigeCipa) {
    return `
      <p>Com ${CIPA_EMPREGADOS} empregados e grau de risco ${CIPA_GRAU_RISCO}, o Quadro I da NR-5 não prevê CIPA.</p>
      <p>${escaparHtml(calculo.observacao)}</p>
      ${blocoItensNorma(['5.4.13'], true)}
    `;
  }
  return `
    <p>Com ${CIPA_EMPREGADOS} empregados e grau de risco ${CIPA_GRAU_RISCO}, que é a nossa situação, o Quadro I da NR-5 prevê ${calculo.efetivos} efetivo e ${calculo.suplentes} suplente como representantes dos empregados, na faixa de ${escaparHtml(calculo.faixa)} empregados.

A empresa designa os representantes dela em igual número, e o presidente sai dos designados pela empresa, enquanto o vice sai dos eleitos pelos empregados.</p>
    ${blocoItensNorma(['5.4.1', '5.4.5'], true)}
  `;
}

// rolagem: 'inicio' deixa o topo da mensagem na altura dos olhos, que
// e o certo para uma resposta longa; 'fim' desce tudo, que e o certo
// para a pergunta que a pessoa acabou de mandar; 'nenhuma' nao mexe,
// para um recado curto depois da resposta nao empurrar a resposta
// para fora da tela.
function adicionarMensagem(html, dequem, rolagem) {
  const area = $('#chat-mensagens');
  const div = document.createElement('div');
  div.className = `msg msg-${dequem}`;
  div.innerHTML = html;
  area.appendChild(div);

  const modo = rolagem || (dequem === 'eu' ? 'fim' : 'inicio');
  if (modo === 'fim') {
    area.scrollTop = area.scrollHeight;
  } else if (modo === 'inicio') {
    // Medido pela posição na tela, e não por offsetTop, porque a área
    // de mensagens não é o elemento de referência dos filhos.
    const deslocamento = div.getBoundingClientRect().top - area.getBoundingClientRect().top;
    area.scrollTop += deslocamento - 8;
  }
  return div;
}

function mostrarSugestoes(lista) {
  const area = $('#chat-sugestoes');
  if (!lista || !lista.length) {
    area.innerHTML = '';
    return;
  }
  area.innerHTML = lista.map((texto) =>
    `<button type="button" class="chip-sugestao" data-sugestao="${escaparHtml(texto)}">${escaparHtml(texto)}</button>`
  ).join('');
}

function responderDuvida(texto) {
  mostrarSugestoes([]);

  const perguntas = nr5BuscarPerguntas(texto, 4);
  const itens = nr5BuscarItens(texto, 3);
  const sobreDimensionamento = /dimensionament|quantos membros|quantidade de membros|efetivos|suplentes|quadro i/i.test(texto);
  const pedeTodosOsRiscos = /tipos? de risco|quais (sao os )?riscos|categorias de risco|mapa de risco|cores? do (mapa|risco)/i.test(texto);

  if (sobreDimensionamento) {
    adicionarMensagem(respostaDimensionamentoHtml(), 'app');
    return;
  }

  if (pedeTodosOsRiscos) {
    adicionarMensagem(`
      <p>São estas as categorias de risco que usamos nas vistorias:</p>
      ${Object.values(TIPOS_RISCO).map(cartaoRiscoHtml).join('')}
      <p class="outras-normas">${escaparHtml(NOTA_MAPA_RISCO)}</p>
    `, 'app');
    return;
  }

  // Quando a pessoa escreve o nome da categoria, ela quer a categoria.
  const nomeado = tipoRiscoNomeado(texto);
  if (nomeado) {
    adicionarMensagem(`
      ${cartaoRiscoHtml(nomeado.tipo)}
      <p class="outras-normas">Para ver todas as categorias, escreva tipos de risco.</p>
    `, 'app');
    return;
  }

  // Fora isso, o tipo de risco só é resposta direta quando a busca não
  // encontrou uma dúvida preparada melhor: "fogo na fritadeira" deve
  // cair na orientação do caso, e não na definição de risco de acidentes.
  const riscos = buscarTipoRisco(texto);
  if (riscos.length && !perguntas.length) {
    adicionarMensagem(`
      <p>Pelo que você escreveu, isso entra em:</p>
      ${riscos.slice(0, 2).map((r) => cartaoRiscoHtml(r.tipo)).join('')}
      <p class="outras-normas">Para ver todas as categorias, escreva tipos de risco.</p>
    `, 'app');
    return;
  }

  if (perguntas.length) {
    adicionarMensagem(respostaDaPerguntaHtml(perguntas[0]), 'app');
    // As demais viram atalhos, para a pessoa não ter que reescrever.
    const outras = perguntas.slice(1, 3).map((faq) => faq.pergunta);
    if (outras.length) {
      adicionarMensagem('<p>Se não era isso, talvez seja uma destas:</p>', 'app', 'nenhuma');
      mostrarSugestoes(outras);
    }
    return;
  }

  if (itens.length) {
    adicionarMensagem(`
      <p>Não tenho uma dúvida preparada sobre isso, mas encontrei na NR-5:</p>
      ${blocoItensNorma(itens.map((r) => r.item), false)}
    `, 'app');
    return;
  }

  adicionarMensagem(`
    <p>Não encontrei nada com essas palavras. Tente de outro jeito, por exemplo com uma palavra só, como forno, EPI, reunião, assédio, acidente ou extintor. Também dá para digitar o número de um item da NR-5, como 5.6.1.

Se a dúvida for de outra norma, estes são os lugares para consultar:</p>
    ${blocoLinksApoio()}
  `, 'app');
  mostrarSugestoes(EXEMPLOS_DUVIDA.slice(0, 3));
}

function abrirChatDuvidas() {
  if (!baseDaNormaCarregada()) {
    abrirModal('Dúvidas da CIPA', `
      <p class="descricao-tipo-risco">
        O chat não carregou porque faltam arquivos no site: nr5.js, com o
        texto da NR-5, e perguntas.js, com as dúvidas respondidas. Envie os
        dois para a mesma pasta do index.html e recarregue a página.
      </p>
    `);
    return;
  }
  abrirModal('Dúvidas da CIPA', `
    <div class="chat-cipa">
      <div class="chat-mensagens" id="chat-mensagens"></div>
      <div class="chat-sugestoes" id="chat-sugestoes"></div>
      <form class="chat-entrada" id="chat-entrada" autocomplete="off">
        <input type="text" id="chat-campo" placeholder="Escreva sua dúvida" />
        <button type="submit" aria-label="Enviar">
          <svg viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg>
        </button>
      </form>
    </div>
  `);

  adicionarMensagem(`
    <p>${escaparHtml(CIPA_PRINCIPIO)}

Escreva sua dúvida do jeito que se fala. São ${CIPA_PERGUNTAS.length} dúvidas respondidas e o texto da NR-5 inteiro.</p>
  `, 'app', 'fim');
  // Só três exemplos: a lista inteira virava uma parede de texto no celular.
  mostrarSugestoes(EXEMPLOS_DUVIDA.slice(0, 3));

  function enviar(texto) {
    const limpo = (texto || '').trim();
    if (limpo.length < 2) return;
    adicionarMensagem(escaparHtml(limpo), 'eu');
    $('#chat-campo').value = '';
    responderDuvida(limpo);
  }

  $('#chat-entrada').addEventListener('submit', (evento) => {
    evento.preventDefault();
    enviar($('#chat-campo').value);
  });

  $('#chat-sugestoes').addEventListener('click', (evento) => {
    const chip = evento.target.closest('[data-sugestao]');
    if (chip) enviar(chip.dataset.sugestao);
  });

  $('#chat-campo').focus();
}


auth.onAuthStateChanged(async (usuarioFirebase) => {
  if (usuarioFirebase) {
    const ref = db.collection('colaboradores').doc(usuarioFirebase.uid);
    const doc = await ref.get();
    if (!doc.exists) {
      abrirModalCompletarCadastroGoogle(usuarioFirebase, ref);
      return;
    }
    const dados = doc.data();
    estado.usuario = { uid: usuarioFirebase.uid, nome: dados.nome || 'Colaborador', cargo: dados.cargo || '' };
    entrarNoApp();
  } else {
    estado.usuario = null;
    sairDoApp();
  }
});

function abrirModalCompletarCadastroGoogle(usuarioFirebase, ref) {
  const nomeSugerido = usuarioFirebase.displayName || '';
  const raiz = $('#raiz-modais');
  raiz.innerHTML = `
    <div class="overlay">
      <div class="modal-wrap" style="width:100%">
        <div class="modal">
          <h2>Complete seu cadastro</h2>
          <p style="font-size:0.85rem;color:var(--texto-suave);margin:-8px 0 16px;">Falta só o seu cargo na CIPA para continuar.</p>
          <div class="campo">
            <label for="google-nome">Nome completo</label>
            <input type="text" id="google-nome" value="${escaparHtml(nomeSugerido)}" />
          </div>
          <div class="campo">
            <label for="google-cargo">Cargo na CIPA</label>
            <select id="google-cargo">
              <option value="" disabled selected>Selecione</option>
              <option>Presidente</option>
              <option>Vice-presidente</option>
              <option>Secretário</option>
              <option>Membro titular</option>
              <option>Membro suplente</option>
            </select>
          </div>
          <div id="erro-google-cadastro" class="erro-mensagem oculto"></div>
          <button type="button" class="botao-primario" id="google-salvar-cadastro">Concluir</button>
          <button type="button" class="botao-texto" id="google-cancelar-cadastro" style="width:100%;text-align:center;margin-top:6px;">Cancelar e sair</button>
        </div>
      </div>
    </div>
  `;

  $('#google-cancelar-cadastro').addEventListener('click', async () => {
    fecharModal();
    await auth.signOut();
  });

  $('#google-salvar-cadastro').addEventListener('click', async () => {
    const nome = $('#google-nome').value.trim();
    const cargo = $('#google-cargo').value;
    const erroEl = $('#erro-google-cadastro');
    if (!nome || !cargo) {
      mostrarErro(erroEl, 'Preencha nome e cargo para continuar.');
      return;
    }
    await ref.set({
      nome,
      cargo,
      usuario: null,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    estado.usuario = { uid: usuarioFirebase.uid, nome, cargo };
    fecharModal();
    entrarNoApp();
  });
}

function entrarNoApp() {
  esconder($('#tela-auth'));
  mostrar($('#topo-app'));
  mostrar($('#app-principal'));
  mostrar($('#nav-tabs'));
  mostrar($('#bolha-chat'));
  aplicarPosicaoGuardada();
  preencherPerfil();
  atualizarStatusConexao();
  ouvirSetores();
  ouvirRelatorio();
  ouvirAcidentes();
  ouvirResolucoes();
  ouvirFechamentos();
}

function sairDoApp() {
  esconder($('#topo-app'));
  esconder($('#app-principal'));
  esconder($('#nav-tabs'));
  esconder($('#bolha-chat'));
  mostrar($('#tela-auth'));
  $('#form-login').reset();
  $('#form-cadastro').reset();
  esconder($('#form-cadastro'));
  mostrar($('#form-login'));
}

function preencherPerfil() {
  $('#perfil-nome-completo').textContent = estado.usuario.nome;
  $('#perfil-cargo-atual').textContent = estado.usuario.cargo;
}

/* =========================================================
   NAVEGAÇÃO ENTRE ABAS
   ========================================================= */
const telas = {
  vistoriar: $('#tela-vistoriar'),
  painel: $('#tela-painel'),
  acidentes: $('#tela-acidentes'),
  setores: $('#tela-setores'),
  relatorio: $('#tela-relatorio'),
  perfil: $('#tela-perfil')
};

$$('.tab-item').forEach((botao) => {
  botao.addEventListener('click', () => irParaTela(botao.dataset.tela));
});

function irParaTela(nomeTela) {
  estado.telaAtual = nomeTela;
  Object.entries(telas).forEach(([nome, elemento]) => {
    nome === nomeTela ? mostrar(elemento) : esconder(elemento);
  });
  $$('.tab-item').forEach((botao) => {
    botao.classList.toggle('ativo', botao.dataset.tela === nomeTela);
  });
  // O painel usa mais largura em telas de computador (gráficos e
  // cartões lado a lado); as outras telas continuam no formato
  // estreito, pensado para celular.
  $('#app-principal').classList.toggle('main-largo', nomeTela === 'painel');
  atualizarFab();
  if (nomeTela === 'painel') renderizarPainel();
  if (nomeTela === 'acidentes') renderizarListaAcidentes();
}

/* =========================================================
   SETORES E CHECKLISTS
   ========================================================= */
function ouvirSetores() {
  db.collection('setores').orderBy('nome').onSnapshot((snapshot) => {
    estado.setores = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderizarListaSetores();
    renderizarSelectSetorVistoria();
    renderizarFiltroSetorRelatorio();
    renderizarFiltroSetorAcidente();
  });
}

function renderizarListaSetores() {
  const lista = $('#lista-setores');
  const vazio = $('#vazio-setores');
  if (estado.setores.length === 0) {
    lista.innerHTML = '';
    mostrar(vazio);
    return;
  }
  esconder(vazio);
  lista.innerHTML = estado.setores.map((setor) => {
    const checklist = setor.checklist || [];
    const riscosUnicos = [...new Set(checklist.map((item) => item.tipoRisco).filter(Boolean))];
    const plural = checklist.length === 1 ? 'item' : 'itens';
    return `
    <button type="button" class="item-setor" data-abrir-setor="${setor.id}">
      <div>
        <div class="nome-setor">${escaparHtml(limparNomeSetor(setor.nome))}</div>
        <div class="contagem-itens">
          <span>${checklist.length} ${plural} no checklist</span>
          ${riscosUnicos.length ? `<span class="dots-risco-setor">${riscosUnicos.map((r) => seloTipoRisco(r)).join('')}</span>` : ''}
        </div>
      </div>
      <svg class="seta-item-setor" viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>
    </button>
  `;
  }).join('');

  $$('[data-abrir-setor]').forEach((botao) => {
    botao.addEventListener('click', () => abrirModalSetor(botao.dataset.abrirSetor));
  });
}

function abrirModalSetor(setorId) {
  const setor = setorId ? estado.setores.find((s) => s.id === setorId) : null;
  const checklist = setor ? [...(setor.checklist || [])] : [];

  abrirModal(setor ? 'Editar setor' : 'Novo setor', `
    <div class="campo">
      <label for="modal-nome-setor">Nome do setor</label>
      <input type="text" id="modal-nome-setor" value="${setor ? escaparHtml(limparNomeSetor(setor.nome)) : ''}" placeholder="Ex.: Padaria, Confeitaria, Estoque" />
    </div>
    <label style="display:block;font-size:0.82rem;font-weight:600;color:var(--texto-suave);margin-bottom:6px;">Itens do checklist</label>
    <div id="lista-itens-modal-setor"></div>
    <div class="add-item-linha">
      <input type="text" id="modal-novo-item" placeholder="Ex.: Piso limpo e seco" />
      <select id="modal-novo-item-risco">${opcoesTipoRiscoHtml(null)}</select>
      <button type="button" id="modal-add-item">Adicionar</button>
    </div>
    <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
      <button type="button" class="botao-primario" id="modal-salvar-setor">${setor ? 'Salvar alterações' : 'Criar setor'}</button>
      ${setor ? '<button type="button" class="botao-perigo" id="modal-excluir-setor">Excluir setor</button>' : ''}
    </div>
  `);

  function renderizarItensModal() {
    $('#lista-itens-modal-setor').innerHTML = checklist.length
      ? checklist.map((item, indice) => `
        <div class="linha-checklist">
          ${seloTipoRisco(item.tipoRisco)}
          <span class="texto-item-checklist">${escaparHtml(item.texto)}</span>
          <button type="button" class="chip-item-checklist-remover" data-remover-indice="${indice}">Remover</button>
        </div>
      `).join('')
      : '<p style="font-size:0.86rem;color:var(--texto-suave);margin:8px 0;">Nenhum item ainda.</p>';

    $$('[data-remover-indice]').forEach((botao) => {
      botao.addEventListener('click', () => {
        checklist.splice(Number(botao.dataset.removerIndice), 1);
        renderizarItensModal();
      });
    });
  }
  renderizarItensModal();

  $('#modal-add-item').addEventListener('click', () => {
    const campo = $('#modal-novo-item');
    const campoRisco = $('#modal-novo-item-risco');
    const texto = campo.value.trim();
    if (!texto) return;
    if (!campoRisco.value) {
      campoRisco.focus();
      return;
    }
    checklist.push({ id: gerarId(), texto, tipoRisco: campoRisco.value });
    campo.value = '';
    campoRisco.value = '';
    renderizarItensModal();
    campo.focus();
  });

  $('#modal-novo-item').addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      $('#modal-add-item').click();
    }
  });

  $('#modal-salvar-setor').addEventListener('click', async () => {
    const nome = limparNomeSetor($('#modal-nome-setor').value);
    if (!nome) {
      $('#modal-nome-setor').focus();
      return;
    }
    const dados = { nome, checklist };
    if (setor) {
      await db.collection('setores').doc(setor.id).update(dados);
    } else {
      dados.criadoPor = estado.usuario.nome;
      dados.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('setores').add(dados);
    }
    fecharModal();
  });

  const botaoExcluir = $('#modal-excluir-setor');
  if (botaoExcluir) {
    botaoExcluir.addEventListener('click', async () => {
      abrirModal('Excluir setor', `
        <p style="font-size:0.92rem;margin-bottom:18px;">Tem certeza que deseja excluir "${escaparHtml(limparNomeSetor(setor.nome))}"? As vistorias já registradas continuam no relatório.</p>
        <button type="button" class="botao-perigo" style="width:100%;padding:12px;background:var(--alerta-alta);color:#fff;border-radius:10px;font-weight:700;" id="confirmar-exclusao-setor">Confirmar exclusão</button>
      `);
      $('#confirmar-exclusao-setor').addEventListener('click', async () => {
        await db.collection('setores').doc(setor.id).delete();
        fecharModal();
      });
    });
  }
}

/* =========================================================
   FOTOS DAS OBSERVAÇÕES E ACIDENTES
   As fotos são guardadas como base64 dentro do próprio documento
   no Firestore (mesmo método do Portal do Colaborador), sem
   precisar do Firebase Storage. Como o documento tem limite de
   ~1MB, cada imagem é redimensionada e comprimida, e existe um
   teto de quantidade e de tamanho somado para não estourar.
   ========================================================= */
const FOTO_LADO_MAX = 900;
const FOTO_QUALIDADE_INICIAL = 0.65;
const FOTO_BYTES_MAX = 130 * 1024;          // por foto
const FOTOS_MAX = 4;                        // por registro
const FOTOS_BYTES_TOTAL_MAX = 620 * 1024;   // soma, com folga para o resto do documento

// Aceita tanto o formato novo (fotos: []) quanto o antigo (foto: '')
// dos registros já salvos antes desta mudança.
function fotosDe(registro) {
  if (!registro) return [];
  if (Array.isArray(registro.fotos)) return registro.fotos.filter(Boolean);
  return registro.foto ? [registro.foto] : [];
}

function galeriaFotosHtml(registro, classeExtra) {
  const fotos = fotosDe(registro);
  if (!fotos.length) return '';
  return `<div class="galeria-fotos">${fotos.map((f) => `
    <img class="foto-observacao ${classeExtra || ''}" src="data:image/jpeg;base64,${f}" alt="Foto do registro" />
  `).join('')}</div>`;
}

function comprimirImagem(file) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > FOTO_LADO_MAX) {
          height = Math.round((height * FOTO_LADO_MAX) / width);
          width = FOTO_LADO_MAX;
        } else if (height >= width && height > FOTO_LADO_MAX) {
          width = Math.round((width * FOTO_LADO_MAX) / height);
          height = FOTO_LADO_MAX;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        // Vai baixando a qualidade até caber no limite por foto.
        let qualidade = FOTO_QUALIDADE_INICIAL;
        let dataUrl = canvas.toDataURL('image/jpeg', qualidade);
        while (dataUrl.length * 0.75 > FOTO_BYTES_MAX && qualidade > 0.25) {
          qualidade -= 0.08;
          dataUrl = canvas.toDataURL('image/jpeg', qualidade);
        }
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
      img.src = leitor.result;
    };
    leitor.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    leitor.readAsDataURL(file);
  });
}

// Liga o input de arquivo à galeria de preview. Devolve uma função
// que entrega a lista de fotos no momento de salvar.
function configurarCampoFoto(idInput, idPreview, idAviso, fotosIniciais) {
  let fotos = (fotosIniciais || []).slice();
  const input = $(`#${idInput}`);
  const preview = $(`#${idPreview}`);
  const aviso = $(`#${idAviso}`);

  function tamanhoTotal() {
    return fotos.reduce((soma, f) => soma + f.length * 0.75, 0);
  }

  function mostrarAviso(texto) {
    aviso.textContent = texto || '';
    aviso.classList.toggle('oculto', !texto);
  }

  function renderizar() {
    preview.innerHTML = fotos.length
      ? fotos.map((f, i) => `
          <div class="miniatura-foto">
            <img src="data:image/jpeg;base64,${f}" alt="Foto ${i + 1}" />
            <button type="button" class="remover-miniatura" data-remover-foto="${i}" aria-label="Remover foto ${i + 1}">Remover</button>
          </div>
        `).join('')
      : '';
    $$('[data-remover-foto]').forEach((botao) => {
      botao.addEventListener('click', () => {
        fotos.splice(Number(botao.dataset.removerFoto), 1);
        mostrarAviso('');
        renderizar();
      });
    });
  }

  input.addEventListener('change', async () => {
    const arquivos = Array.from(input.files || []);
    if (!arquivos.length) return;
    mostrarAviso('Processando...');

    for (const file of arquivos) {
      if (fotos.length >= FOTOS_MAX) {
        mostrarAviso(`Máximo de ${FOTOS_MAX} fotos por registro.`);
        break;
      }
      try {
        const base64 = await comprimirImagem(file);
        if (tamanhoTotal() + base64.length * 0.75 > FOTOS_BYTES_TOTAL_MAX) {
          mostrarAviso('As fotos somadas ficaram grandes demais. Remova uma antes de adicionar outra.');
          break;
        }
        fotos.push(base64);
        mostrarAviso('');
      } catch (erro) {
        console.error(erro);
        mostrarAviso('Não foi possível usar uma das fotos.');
      }
    }

    input.value = '';
    renderizar();
  });

  renderizar();
  return () => fotos;
}

function blocoCampoFotoHtml(idInput, idPreview, idAviso) {
  return `
    <div class="campo">
      <label>Fotos (opcional, até ${FOTOS_MAX})</label>
      <label class="botao-escolher-foto" for="${idInput}">Escolher ou tirar fotos</label>
      <input type="file" id="${idInput}" accept="image/*" multiple class="input-foto-oculto" />
      <div class="aviso-foto oculto" id="${idAviso}"></div>
      <div class="preview-foto" id="${idPreview}"></div>
    </div>
  `;
}

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

// Teclados de celular às vezes inserem espaço duplo ou caracteres
// invisíveis (zero-width) antes/depois do texto digitado. Isso não
// aparece ao digitar, mas cria um espaço estranho antes do nome
// quando exibido. Limpa tanto ao salvar quanto ao exibir.
function limparNomeSetor(texto) {
  return (texto || '')
    .replace(/[\u200B-\u200F\uFEFF\u00AD]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Botão flutuante, criado só na aba que precisa dele.
   Antes essa lógica estava duplicada em dois lugares e só servia
   para setores; agora uma tabela define o botão de cada tela. */
const FABS_POR_TELA = {
  setores: { rotulo: 'Novo setor', acao: () => abrirModalSetor(null) },
  acidentes: { rotulo: 'Registrar acidente', acao: () => abrirModalAcidente(null) }
};

function atualizarFab() {
  const existente = $('#fab-tela');
  const config = FABS_POR_TELA[estado.telaAtual];
  if (existente) existente.remove();
  if (!config) return;
  const fab = document.createElement('button');
  fab.id = 'fab-tela';
  fab.className = 'fab';
  fab.setAttribute('aria-label', config.rotulo);
  fab.textContent = '+';
  fab.addEventListener('click', config.acao);
  document.body.appendChild(fab);
}

/* =========================================================
   VISTORIA
   ========================================================= */
function renderizarSelectSetorVistoria() {
  const select = $('#select-setor-vistoria');
  const valorAtual = select.value;
  const opcaoPlaceholder = '<option value="" disabled selected>Selecione um setor</option>';
  select.innerHTML = opcaoPlaceholder + estado.setores.map((setor) => `<option value="${setor.id}">${escaparHtml(limparNomeSetor(setor.nome))}</option>`).join('');

  if (estado.setores.length === 0) {
    mostrar($('#vazio-sem-setor'));
    esconder($('#aviso-selecione-setor'));
    esconder($('#area-checklist-vistoria'));
    return;
  }
  esconder($('#vazio-sem-setor'));

  // Só reaproveita a seleção anterior se o setor escolhido ainda existir;
  // caso contrário, volta ao estado de espera. Nunca escolhe um setor
  // sozinho no lugar da pessoa.
  const existeAinda = valorAtual && estado.setores.some((s) => s.id === valorAtual);
  if (existeAinda) {
    select.value = valorAtual;
    mostrar($('#area-checklist-vistoria'));
    esconder($('#aviso-selecione-setor'));
    carregarChecklistParaVistoria(select.value);
  } else {
    select.value = '';
    esconder($('#area-checklist-vistoria'));
    mostrar($('#aviso-selecione-setor'));
    estado.vistoriaEmAndamento = { setorId: null, itens: [], observacoes: [] };
  }
}

$('#select-setor-vistoria').addEventListener('change', (evento) => {
  const setorId = evento.target.value;
  if (!setorId) {
    esconder($('#area-checklist-vistoria'));
    mostrar($('#aviso-selecione-setor'));
    return;
  }
  esconder($('#aviso-selecione-setor'));
  mostrar($('#area-checklist-vistoria'));
  carregarChecklistParaVistoria(setorId);
});

function carregarChecklistParaVistoria(setorId) {
  const setor = estado.setores.find((s) => s.id === setorId);
  estado.vistoriaEmAndamento = {
    setorId,
    itens: (setor?.checklist || []).map((item) => ({ ...item, checado: false })),
    observacoes: []
  };
  renderizarChecklistVistoria();
  renderizarObservacoesAdicionadas();
}

function renderizarChecklistVistoria() {
  const lista = $('#lista-checklist-vistoria');
  const itens = estado.vistoriaEmAndamento.itens;

  const total = itens.length;
  const marcados = itens.filter((i) => i.checado).length;
  const percentual = total ? Math.round((marcados / total) * 100) : 0;
  $('#barra-progresso-vistoria').style.width = `${percentual}%`;
  $('#contagem-checklist-vistoria').textContent = total ? `${marcados}/${total}` : '';

  lista.innerHTML = itens.length
    ? itens.map((item, indice) => `
      <div class="linha-checklist">
        <button type="button" class="caixa-marcar ${item.checado ? 'marcada' : ''}" data-toggle-item="${indice}" aria-label="Marcar item">
          ${item.checado ? '<svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg>' : ''}
        </button>
        ${seloTipoRisco(item.tipoRisco)}
        <span class="texto-item-checklist">${escaparHtml(item.texto)}</span>
      </div>
    `).join('')
    : '<p style="font-size:0.88rem;color:var(--texto-suave);">Este setor ainda não tem itens no checklist. Adicione na aba Setores.</p>';

  $$('[data-toggle-item]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const indice = Number(botao.dataset.toggleItem);
      estado.vistoriaEmAndamento.itens[indice].checado = !estado.vistoriaEmAndamento.itens[indice].checado;
      renderizarChecklistVistoria();
    });
  });
}

$('#botao-abrir-observacao').addEventListener('click', () => {
  abrirModal('Nova observação', `
    <div class="campo">
      <label for="modal-texto-observacao">O que precisa ser resolvido?</label>
      <textarea id="modal-texto-observacao" placeholder="Descreva o problema ou a situação encontrada"></textarea>
    </div>
    <div class="campo">
      <label for="modal-risco-observacao">Tipo de risco (opcional)</label>
      <select id="modal-risco-observacao">
        <option value="">Não se aplica</option>
        ${opcoesTipoRiscoHtml(null).replace('<option value="" selected disabled>Selecione o tipo de risco</option>', '')}
      </select>
    </div>
    <div class="campo">
      <label>Nível de urgência</label>
      <div class="seletor-urgencia" id="seletor-urgencia-modal">
        <button type="button" class="opcao-urgencia baixa" data-urgencia="baixa">Baixa</button>
        <button type="button" class="opcao-urgencia media" data-urgencia="media">Média</button>
        <button type="button" class="opcao-urgencia alta" data-urgencia="alta">Alta</button>
      </div>
    </div>
    ${blocoCampoFotoHtml('obs-foto-input', 'obs-foto-preview', 'obs-foto-aviso')}
    <button type="button" class="botao-primario" id="modal-salvar-observacao" style="margin-top:8px;">Adicionar observação</button>
  `);

  const obterFotos = configurarCampoFoto('obs-foto-input', 'obs-foto-preview', 'obs-foto-aviso');

  let urgenciaSelecionada = 'baixa';
  const botoesUrgencia = $$('#seletor-urgencia-modal .opcao-urgencia');
  function marcarUrgencia(valor) {
    urgenciaSelecionada = valor;
    botoesUrgencia.forEach((b) => b.classList.toggle('selecionada', b.dataset.urgencia === valor));
  }
  marcarUrgencia('baixa');
  botoesUrgencia.forEach((botao) => {
    botao.addEventListener('click', () => marcarUrgencia(botao.dataset.urgencia));
  });

  $('#modal-salvar-observacao').addEventListener('click', () => {
    const texto = $('#modal-texto-observacao').value.trim();
    if (!texto) {
      $('#modal-texto-observacao').focus();
      return;
    }
    const tipoRisco = $('#modal-risco-observacao').value || null;
    estado.vistoriaEmAndamento.observacoes.push({ texto, urgencia: urgenciaSelecionada, tipoRisco, fotos: obterFotos() });
    renderizarObservacoesAdicionadas();
    fecharModal();
  });
});

function renderizarObservacoesAdicionadas() {
  const lista = $('#lista-observacoes-adicionadas');
  const observacoes = estado.vistoriaEmAndamento.observacoes;
  lista.innerHTML = observacoes.map((obs, indice) => `
    <div class="observacao-adicionada">
      <div class="cabecalho-obs">
        <div style="display:flex;align-items:center;gap:7px;">
          ${obs.tipoRisco ? seloTipoRisco(obs.tipoRisco) : ''}
          <span class="etiqueta-urgencia ${obs.urgencia}">${obs.urgencia}</span>
        </div>
        <button type="button" class="chip-item-checklist-remover" data-remover-obs="${indice}">Remover</button>
      </div>
      <p>${escaparHtml(obs.texto)}</p>
      ${galeriaFotosHtml(obs)}
    </div>
  `).join('');

  $$('[data-remover-obs]').forEach((botao) => {
    botao.addEventListener('click', () => {
      observacoes.splice(Number(botao.dataset.removerObs), 1);
      renderizarObservacoesAdicionadas();
    });
  });
}

$('#botao-concluir-vistoria').addEventListener('click', async () => {
  const { setorId, itens, observacoes } = estado.vistoriaEmAndamento;
  const setor = estado.setores.find((s) => s.id === setorId);
  if (!setor) return;

  const botao = $('#botao-concluir-vistoria');
  botao.disabled = true;
  botao.textContent = 'Salvando...';

  try {
    const agora = firebase.firestore.Timestamp.now();
    const vistoriaRef = await db.collection('vistorias').add({
      setorId,
      setorNome: limparNomeSetor(setor.nome),
      colaboradorId: estado.usuario.uid,
      colaboradorNome: estado.usuario.nome,
      colaboradorCargo: estado.usuario.cargo,
      itens,
      criadoEm: agora
    });

    await Promise.all(observacoes.map((obs) => db.collection('observacoes').add({
      vistoriaId: vistoriaRef.id,
      setorId,
      setorNome: limparNomeSetor(setor.nome),
      texto: obs.texto,
      urgencia: obs.urgencia,
      tipoRisco: obs.tipoRisco || null,
      fotos: obs.fotos || [],
      status: 'aberta',
      criadoPor: estado.usuario.nome,
      criadoEm: agora,
      resolvidoPor: null,
      dataResolucao: null
    })));

    carregarChecklistParaVistoria(setorId);
    irParaTela('relatorio');
  } catch (erro) {
    alert('Não foi possível salvar a vistoria agora. Ela será enviada assim que a conexão voltar.');
    console.error(erro);
  } finally {
    botao.disabled = false;
    botao.textContent = 'Concluir vistoria';
  }
});

$('#botao-registro-rapido').addEventListener('click', abrirModalEscolhaRegistro);

// O "+" passou a servir para dois tipos de registro, então primeiro
// pergunta qual deles.
function abrirModalEscolhaRegistro() {
  abrirModal('O que deseja registrar?', `
    <button type="button" class="opcao-registro" id="opcao-situacao">
      <div>
        <div class="titulo-opcao">Situação a resolver</div>
        <div class="desc-opcao">Um problema encontrado fora de uma vistoria</div>
      </div>
      <svg viewBox="0 0 24 24" class="seta-item-setor" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>
    </button>
    <button type="button" class="opcao-registro" id="opcao-resolucao">
      <div>
        <div class="titulo-opcao">Solicitação resolvida</div>
        <div class="desc-opcao">Registrar o que foi feito, com foto, e vincular às petições</div>
      </div>
      <svg viewBox="0 0 24 24" class="seta-item-setor" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>
    </button>
  `);
  $('#opcao-situacao').addEventListener('click', abrirModalRegistroRapido);
  $('#opcao-resolucao').addEventListener('click', () => abrirModalResolucao());
}

/* =========================================================
   SOLICITAÇÃO RESOLVIDA
   A resolução vira um registro próprio, com foto, e pode ser
   vinculada a várias petições de uma vez. Assim uma manutenção
   que resolveu três pedidos é registrada uma única vez, e a
   prova do que foi feito não se perde.
   ========================================================= */
function abrirModalResolucao(observacaoPreSelecionada) {
  const opcoesSetor = '<option value="">Geral (não é de um setor específico)</option>' +
    estado.setores.map((s) => `<option value="${s.id}">${escaparHtml(limparNomeSetor(s.nome))}</option>`).join('');

  abrirModal('Registrar solicitação resolvida', `
    <div class="campo">
      <label for="res-setor">Setor (opcional)</label>
      <select id="res-setor">${opcoesSetor}</select>
    </div>
    <div class="campo">
      <label for="res-texto">O que foi feito</label>
      <textarea id="res-texto" placeholder="Descreva a solução aplicada"></textarea>
    </div>
    <div class="campo">
      <label for="res-por">Resolvido por</label>
      <input type="text" id="res-por" placeholder="Nome de quem resolveu (CIPA, gerência, manutenção...)" />
    </div>
    <div class="campo">
      <label for="res-data">Data da resolução</label>
      <input type="date" id="res-data" />
    </div>

    ${blocoCampoFotoHtml('res-foto-input', 'res-foto-preview', 'res-foto-aviso')}

    <p class="subtitulo-registro">Petições resolvidas por esta ação</p>
    <p class="intro-porques">Marque tudo que esta resolução encerra. Pode deixar em branco e vincular depois.</p>
    <div id="lista-peticoes-vincular"></div>

    <div id="erro-resolucao" class="erro-mensagem oculto"></div>
    <button type="button" class="botao-primario" id="res-salvar">Registrar resolução</button>
  `);

  $('#res-data').valueAsDate = new Date();
  const obterFotos = configurarCampoFoto('res-foto-input', 'res-foto-preview', 'res-foto-aviso');

  const selecionadas = new Set(observacaoPreSelecionada ? [observacaoPreSelecionada] : []);

  // A lista acompanha o setor escolhido, para não mostrar petições
  // de outras áreas quando já se sabe onde foi a resolução.
  function renderizarPeticoes() {
    const setorId = $('#res-setor').value;
    const abertas = estado.observacoes
      .filter((o) => o.status !== 'resolvida')
      .filter((o) => !setorId || o.setorId === setorId)
      .sort((a, b) => (b.criadoEm ? b.criadoEm.toMillis() : 0) - (a.criadoEm ? a.criadoEm.toMillis() : 0));

    $('#lista-peticoes-vincular').innerHTML = abertas.length
      ? abertas.map((o) => {
        const d = o.criadoEm ? formatarDataHora(o.criadoEm).dataTexto : '';
        return `
          <button type="button" class="item-peticao ${selecionadas.has(o.id) ? 'selecionada' : ''}" data-peticao="${o.id}">
            <span class="caixa-marcar ${selecionadas.has(o.id) ? 'marcada' : ''}">
              ${selecionadas.has(o.id) ? '<svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg>' : ''}
            </span>
            <span class="corpo-peticao">
              <span class="texto-peticao">${escaparHtml(o.texto)}</span>
              <span class="meta-peticao">${escaparHtml(limparNomeSetor(o.setorNome) || 'Geral')} · ${d} · ${o.urgencia}</span>
            </span>
          </button>
        `;
      }).join('')
      : '<p style="font-size:0.85rem;color:var(--texto-suave);">Nenhuma petição em aberto neste setor.</p>';

    $$('[data-peticao]').forEach((botao) => {
      botao.addEventListener('click', () => {
        const id = botao.dataset.peticao;
        selecionadas.has(id) ? selecionadas.delete(id) : selecionadas.add(id);
        renderizarPeticoes();
      });
    });
  }

  $('#res-setor').addEventListener('change', renderizarPeticoes);
  renderizarPeticoes();

  $('#res-salvar').addEventListener('click', async () => {
    const texto = $('#res-texto').value.trim();
    const resolvidoPor = $('#res-por').value.trim();
    const dataValor = $('#res-data').value;
    const erroEl = $('#erro-resolucao');

    if (!texto || !resolvidoPor || !dataValor) {
      mostrarErro(erroEl, 'Preencha o que foi feito, quem resolveu e a data.');
      return;
    }

    const botao = $('#res-salvar');
    botao.disabled = true;
    botao.textContent = 'Salvando...';

    try {
      const setorId = $('#res-setor').value || null;
      const setor = setorId ? estado.setores.find((s) => s.id === setorId) : null;
      const dataResolucao = firebase.firestore.Timestamp.fromDate(new Date(`${dataValor}T12:00:00`));
      const ids = [...selecionadas];

      const resolucaoRef = await db.collection('resolucoes').add({
        setorId,
        setorNome: setor ? limparNomeSetor(setor.nome) : 'Geral',
        texto,
        resolvidoPor,
        dataResolucao,
        fotos: obterFotos(),
        observacaoIds: ids,
        registradoPor: estado.usuario.nome,
        criadoEm: firebase.firestore.Timestamp.now()
      });

      // Fecha as petições marcadas, apontando para esta resolução.
      for (const id of ids) {
        await db.collection('observacoes').doc(id).update({
          status: 'resolvida',
          resolvidoPor,
          dataResolucao,
          descricaoResolucao: texto,
          resolucaoId: resolucaoRef.id
        });
      }

      fecharModal();
    } catch (erro) {
      console.error(erro);
      // Mostra o motivo real em vez de uma mensagem genérica, porque
      // "confira as regras" escondia erros de outra natureza, como
      // documento grande demais por causa das fotos.
      mostrarErro(erroEl, `Não foi possível salvar. ${erro.code ? `[${erro.code}] ` : ''}${erro.message || erro}`);
      botao.disabled = false;
      botao.textContent = 'Registrar resolução';
    }
  });
}

function abrirModalRegistroRapido() {
  const opcoesSetor = '<option value="">Geral (não é de um setor específico)</option>' +
    estado.setores.map((s) => `<option value="${s.id}">${escaparHtml(s.nome)}</option>`).join('');

  abrirModal('Registro rápido', `
    <p style="font-size:0.85rem;color:var(--texto-suave);margin:-6px 0 16px;">Use isso para lançar uma situação importante fora de uma vistoria completa.</p>
    <div class="campo">
      <label for="rapido-setor">Setor (opcional)</label>
      <select id="rapido-setor">${opcoesSetor}</select>
    </div>
    <div class="campo">
      <label for="rapido-risco">Tipo de risco (opcional)</label>
      <select id="rapido-risco">
        <option value="">Não se aplica</option>
        ${opcoesTipoRiscoHtml(null).replace('<option value="" selected disabled>Selecione o tipo de risco</option>', '')}
      </select>
    </div>
    <div class="campo">
      <label for="rapido-texto">O que precisa ser resolvido?</label>
      <textarea id="rapido-texto" placeholder="Descreva a situação"></textarea>
    </div>
    <div class="campo">
      <label>Nível de urgência</label>
      <div class="seletor-urgencia" id="seletor-urgencia-rapido">
        <button type="button" class="opcao-urgencia baixa" data-urgencia="baixa">Baixa</button>
        <button type="button" class="opcao-urgencia media" data-urgencia="media">Média</button>
        <button type="button" class="opcao-urgencia alta" data-urgencia="alta">Alta</button>
      </div>
    </div>
    ${blocoCampoFotoHtml('rapido-foto-input', 'rapido-foto-preview', 'rapido-foto-aviso')}
    <button type="button" class="botao-primario" id="rapido-salvar">Registrar</button>
  `);

  const obterFotos = configurarCampoFoto('rapido-foto-input', 'rapido-foto-preview', 'rapido-foto-aviso');

  let urgenciaSelecionada = 'baixa';
  const botoesUrgencia = $$('#seletor-urgencia-rapido .opcao-urgencia');
  function marcarUrgencia(valor) {
    urgenciaSelecionada = valor;
    botoesUrgencia.forEach((b) => b.classList.toggle('selecionada', b.dataset.urgencia === valor));
  }
  marcarUrgencia('baixa');
  botoesUrgencia.forEach((botao) => {
    botao.addEventListener('click', () => marcarUrgencia(botao.dataset.urgencia));
  });

  $('#rapido-salvar').addEventListener('click', async () => {
    const texto = $('#rapido-texto').value.trim();
    if (!texto) {
      $('#rapido-texto').focus();
      return;
    }
    const setorId = $('#rapido-setor').value || null;
    const setor = setorId ? estado.setores.find((s) => s.id === setorId) : null;
    const botao = $('#rapido-salvar');
    botao.disabled = true;
    botao.textContent = 'Salvando...';
    try {
      await db.collection('observacoes').add({
        vistoriaId: null,
        setorId,
        setorNome: setor ? limparNomeSetor(setor.nome) : 'Geral',
        tipoRisco: $('#rapido-risco').value || null,
        texto,
        urgencia: urgenciaSelecionada,
        fotos: obterFotos(),
        status: 'aberta',
        criadoPor: estado.usuario.nome,
        criadoEm: firebase.firestore.Timestamp.now(),
        resolvidoPor: null,
        dataResolucao: null
      });
      fecharModal();
    } catch (erro) {
      alert('Não foi possível salvar agora. Será enviado quando a conexão voltar.');
      console.error(erro);
      fecharModal();
    }
  });
}

/* =========================================================
   ACIDENTES E INVESTIGAÇÃO (5 PORQUÊS)
   Conforme a NR-5, a CIPA investiga as causas dos acidentes.
   O método dos 5 porquês encadeia perguntas até chegar numa
   causa que seja gerenciável, e não parar na causa aparente.
   Por decisão da CIPA, o nome do acidentado não é registrado.
   ========================================================= */
const TIPOS_ACIDENTE = {
  tipico: 'Acidente típico',
  trajeto: 'Acidente de trajeto',
  doenca: 'Doença ocupacional',
  quase: 'Quase acidente'
};

function ouvirAcidentes() {
  db.collection('acidentes').orderBy('dataOcorrido', 'desc').limit(300).onSnapshot((snapshot) => {
    estado.acidentes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderizarListaAcidentes();
    if (estado.telaAtual === 'painel') renderizarPainel();
  });
}

function renderizarFiltroSetorAcidente() {
  const select = $('#filtro-setor-acidente');
  const valorAtual = select.value;
  select.innerHTML = '<option value="">Todos os setores</option>' +
    estado.setores.map((s) => `<option value="${s.id}">${escaparHtml(limparNomeSetor(s.nome))}</option>`).join('');
  select.value = valorAtual;
}

$('#filtro-periodo-painel').addEventListener('change', renderizarPainel);
$('#filtro-tipo-acidente').addEventListener('change', renderizarListaAcidentes);
$('#filtro-setor-acidente').addEventListener('change', renderizarListaAcidentes);

function obterAcidentesFiltrados() {
  const tipo = $('#filtro-tipo-acidente').value;
  const setorId = $('#filtro-setor-acidente').value;
  return estado.acidentes.filter((a) => {
    if (tipo && a.tipo !== tipo) return false;
    if (setorId && a.setorId !== setorId) return false;
    return true;
  });
}

function renderizarListaAcidentes() {
  const lista = $('#lista-acidentes');
  const vazio = $('#vazio-acidentes');
  const acidentes = obterAcidentesFiltrados();

  if (acidentes.length === 0) {
    lista.innerHTML = '';
    mostrar(vazio);
    return;
  }
  esconder(vazio);

  lista.innerHTML = acidentes.map((ac) => {
    const { dataTexto, horaTexto } = ac.dataOcorrido ? formatarDataHora(ac.dataOcorrido) : { dataTexto: '', horaTexto: '' };
    const classeCartao = ac.tipo === 'quase' ? 'quase' : (ac.comAfastamento ? 'grave' : '');
    const porques = (ac.porques || []).filter(Boolean);
    const acoes = ac.acoes || [];

    return `
      <div class="cartao-acidente ${classeCartao}">
        <button type="button" class="cabecalho-acidente" data-abrir-acidente="${ac.id}">
          <div>
            <div class="setor-acidente">${escaparHtml(limparNomeSetor(ac.setorNome) || 'Geral')}</div>
            <div class="meta-acidente">${dataTexto} às ${horaTexto} · registrado por ${escaparHtml(ac.registradoPor || '')}</div>
          </div>
          <span class="etiqueta-tipo ${ac.tipo}">${TIPOS_ACIDENTE[ac.tipo] || ac.tipo}</span>
        </button>
        <div class="corpo-acidente oculto" id="corpo-acidente-${ac.id}">
          <p class="subtitulo-registro">O que aconteceu</p>
          <p style="font-size:0.89rem;margin:0 0 4px;">${escaparHtml(ac.descricao || '')}</p>
          ${galeriaFotosHtml(ac)}
          <div class="meta-acidente" style="margin-bottom:4px;">
            ${ac.parteCorpo ? `Parte atingida: ${escaparHtml(ac.parteCorpo)}` : ''}
            ${ac.agente ? `${ac.parteCorpo ? ' · ' : ''}Agente: ${escaparHtml(ac.agente)}` : ''}
          </div>
          <div class="meta-acidente">
            ${ac.comAfastamento ? `Com afastamento${ac.diasAfastamento ? ` de ${ac.diasAfastamento} dia(s)` : ''}` : 'Sem afastamento'}
            ${ac.numeroCat ? ` · CAT ${escaparHtml(ac.numeroCat)}` : ''}
          </div>

          ${porques.length ? `
            <p class="subtitulo-registro">Análise dos 5 porquês</p>
            <div class="porques-lista">
              ${porques.map((p, i) => `
                <div class="item-porque">
                  <span class="num-porque">${i + 1}</span>
                  <span class="texto-porque">${escaparHtml(p)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${ac.causaRaiz ? `
            <div class="bloco-causa-raiz">
              <div class="rotulo-causa">Causa raiz</div>
              <p>${escaparHtml(ac.causaRaiz)}</p>
            </div>
          ` : ''}

          ${acoes.length ? `
            <p class="subtitulo-registro">Ações corretivas</p>
            ${acoes.map((acao, i) => `
              <div class="item-acao">
                <span class="marca ${acao.concluida ? 'ok' : 'pendente'}">${acao.concluida ? '<svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg>' : ''}</span>
                <div class="corpo-acao">
                  <p class="texto-acao">${escaparHtml(acao.texto)}</p>
                  <div class="meta-acao">
                    ${acao.responsavel ? `Responsável: ${escaparHtml(acao.responsavel)}` : 'Sem responsável definido'}
                    ${acao.prazo ? ` · Prazo: ${acao.prazo.split('-').reverse().join('/')}` : ''}
                  </div>
                </div>
                <button type="button" class="botao-texto" data-alternar-acao="${ac.id}|${i}">${acao.concluida ? 'Reabrir' : 'Concluir'}</button>
              </div>
            `).join('')}
          ` : ''}

          <div class="acoes-card-obs" style="margin-top:12px;">
            <button type="button" class="botao-texto" data-editar-acidente="${ac.id}">Editar</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  $$('[data-abrir-acidente]').forEach((botao) => {
    botao.addEventListener('click', () => {
      $(`#corpo-acidente-${botao.dataset.abrirAcidente}`).classList.toggle('oculto');
    });
  });

  $$('[data-editar-acidente]').forEach((botao) => {
    botao.addEventListener('click', () => abrirModalAcidente(botao.dataset.editarAcidente));
  });

  $$('[data-alternar-acao]').forEach((botao) => {
    botao.addEventListener('click', async () => {
      const [acidenteId, indice] = botao.dataset.alternarAcao.split('|');
      const acidente = estado.acidentes.find((a) => a.id === acidenteId);
      if (!acidente) return;
      const acoes = (acidente.acoes || []).map((a, i) =>
        i === Number(indice) ? { ...a, concluida: !a.concluida } : a
      );
      await db.collection('acidentes').doc(acidenteId).update({ acoes });
    });
  });
}

function abrirModalAcidente(acidenteId) {
  const ac = acidenteId ? estado.acidentes.find((a) => a.id === acidenteId) : null;
  const acoes = ac ? (ac.acoes || []).slice() : [];
  const porquesExistentes = ac ? (ac.porques || []) : [];

  const opcoesSetor = '<option value="">Selecione o setor</option>' +
    estado.setores.map((s) => `<option value="${s.id}" ${ac && s.id === ac.setorId ? 'selected' : ''}>${escaparHtml(limparNomeSetor(s.nome))}</option>`).join('');

  const opcoesTipo = Object.entries(TIPOS_ACIDENTE).map(([chave, nome]) =>
    `<option value="${chave}" ${ac && ac.tipo === chave ? 'selected' : ''}>${nome}</option>`
  ).join('');

  abrirModal(ac ? 'Editar investigação' : 'Registrar acidente', `
    <div class="campo">
      <label for="ac-tipo">Tipo</label>
      <select id="ac-tipo">${opcoesTipo}</select>
    </div>
    <div class="campo">
      <label for="ac-setor">Setor</label>
      <select id="ac-setor">${opcoesSetor}</select>
    </div>
    <div class="campo">
      <label for="ac-data">Data e hora do ocorrido</label>
      <input type="datetime-local" id="ac-data" />
    </div>
    <div class="campo">
      <label for="ac-descricao">O que aconteceu</label>
      <textarea id="ac-descricao" placeholder="Descreva o ocorrido sem identificar o colaborador">${ac ? escaparHtml(ac.descricao || '') : ''}</textarea>
    </div>
    <div class="campo">
      <label for="ac-parte">Parte do corpo atingida (opcional)</label>
      <input type="text" id="ac-parte" value="${ac ? escaparHtml(ac.parteCorpo || '') : ''}" placeholder="Ex.: antebraço direito" />
    </div>
    <div class="campo">
      <label for="ac-agente">Agente causador (opcional)</label>
      <input type="text" id="ac-agente" value="${ac ? escaparHtml(ac.agente || '') : ''}" placeholder="Ex.: chapa quente, piso molhado" />
    </div>
    <div class="campo">
      <label for="ac-afastamento">Houve afastamento?</label>
      <select id="ac-afastamento">
        <option value="nao" ${ac && !ac.comAfastamento ? 'selected' : ''}>Não</option>
        <option value="sim" ${ac && ac.comAfastamento ? 'selected' : ''}>Sim</option>
      </select>
    </div>
    <div class="campo oculto" id="campo-dias-afastamento">
      <label for="ac-dias">Dias de afastamento</label>
      <input type="number" id="ac-dias" min="0" value="${ac ? (ac.diasAfastamento || '') : ''}" />
    </div>
    <div class="campo">
      <label for="ac-cat">Número da CAT (opcional)</label>
      <input type="text" id="ac-cat" value="${ac ? escaparHtml(ac.numeroCat || '') : ''}" />
    </div>

    ${blocoCampoFotoHtml('ac-foto-input', 'ac-foto-preview', 'ac-foto-aviso')}

    <p class="subtitulo-registro">Análise dos 5 porquês</p>
    <p class="intro-porques">Cada pergunta parte da resposta anterior. Siga até chegar numa causa que a empresa consiga corrigir.</p>
    <div class="cadeia-porques">
      ${[0, 1, 2, 3, 4].map((i) => `
        <div class="passo-porque" id="passo-porque-${i}">
          <div class="marcador-porque"><span>${i + 1}</span></div>
          <div class="conteudo-porque">
            <label class="pergunta-porque" id="pergunta-porque-${i}" for="ac-porque-${i}"></label>
            <textarea id="ac-porque-${i}" class="campo-porque" rows="2" placeholder="${i === 0 ? 'Descreva a causa imediata' : 'Continue a partir da resposta acima'}">${escaparHtml(porquesExistentes[i] || '')}</textarea>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="campo">
      <label for="ac-causa-raiz">Causa raiz identificada</label>
      <textarea id="ac-causa-raiz" placeholder="A causa que, se corrigida, evita a repetição">${ac ? escaparHtml(ac.causaRaiz || '') : ''}</textarea>
    </div>

    <p class="subtitulo-registro">Ações corretivas</p>
    <div id="lista-acoes-modal"></div>
    <button type="button" class="botao-secundario" id="ac-add-acao" style="margin-bottom:16px;">+ Adicionar ação corretiva</button>

    <div id="erro-acidente" class="erro-mensagem oculto"></div>
    <button type="button" class="botao-primario" id="ac-salvar">${ac ? 'Salvar alterações' : 'Registrar investigação'}</button>
  `);

  // Data: preenche com o valor salvo ou com o momento atual.
  const campoData = $('#ac-data');
  if (ac && ac.dataOcorrido) {
    const d = ac.dataOcorrido.toDate();
    const pad = (n) => String(n).padStart(2, '0');
    campoData.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } else {
    const agora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    campoData.value = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}T${pad(agora.getHours())}:${pad(agora.getMinutes())}`;
  }

  const obterFotos = configurarCampoFoto('ac-foto-input', 'ac-foto-preview', 'ac-foto-aviso', fotosDe(ac));

  /* Cadeia dos 5 porquês: cada pergunta é montada a partir da resposta
     anterior, para o raciocínio ficar visível em vez de repetir sempre
     a mesma frase genérica. */
  function frasePergunta(indice, respostaAnterior) {
    if (indice === 0) return 'Por que aconteceu?';
    const texto = (respostaAnterior || '').trim();
    if (!texto) return 'E por que isso aconteceu?';

    // Tira o "porque" inicial e a pontuação final, para a resposta
    // encaixar dentro da próxima pergunta sem ficar truncada.
    let trecho = texto
      .replace(/^(porque|por que|pq)\s+/i, '')
      .replace(/[.;!?]+\s*$/, '')
      .trim();
    if (!trecho) return 'E por que isso aconteceu?';
    if (trecho.length > 120) trecho = `${trecho.slice(0, 120).trim()}...`;
    const inicial = trecho.charAt(0).toLowerCase() + trecho.slice(1);
    return `E por que ${inicial}?`;
  }

  function ajustarAltura(campo) {
    campo.style.height = 'auto';
    campo.style.height = `${Math.max(campo.scrollHeight, 52)}px`;
  }

  function atualizarCadeiaPorques() {
    for (let i = 0; i < 5; i++) {
      const campo = $(`#ac-porque-${i}`);
      const anterior = i > 0 ? $(`#ac-porque-${i - 1}`).value : '';
      $(`#pergunta-porque-${i}`).textContent = `${i + 1}. ${frasePergunta(i, anterior)}`;

      // Passos à frente da resposta atual ficam esmaecidos, para a
      // pessoa seguir a ordem sem ficar olhando cinco caixas vazias.
      const liberado = i === 0 || anterior.trim() !== '' || campo.value.trim() !== '';
      $(`#passo-porque-${i}`).classList.toggle('porque-inativo', !liberado);
      ajustarAltura(campo);
    }
  }

  [0, 1, 2, 3, 4].forEach((i) => {
    const campo = $(`#ac-porque-${i}`);
    campo.addEventListener('input', atualizarCadeiaPorques);
  });
  atualizarCadeiaPorques();

  function alternarDiasAfastamento() {
    const mostrarDias = $('#ac-afastamento').value === 'sim';
    $('#campo-dias-afastamento').classList.toggle('oculto', !mostrarDias);
  }
  $('#ac-afastamento').addEventListener('change', alternarDiasAfastamento);
  alternarDiasAfastamento();

  function renderizarAcoesModal() {
    $('#lista-acoes-modal').innerHTML = acoes.length
      ? acoes.map((acao, i) => `
        <div class="linha-acao-form">
          <div class="campo">
            <label for="acao-texto-${i}">Ação ${i + 1}</label>
            <input type="text" id="acao-texto-${i}" value="${escaparHtml(acao.texto || '')}" placeholder="O que será feito" />
          </div>
          <div class="campo">
            <label for="acao-resp-${i}">Responsável</label>
            <input type="text" id="acao-resp-${i}" value="${escaparHtml(acao.responsavel || '')}" />
          </div>
          <div class="campo">
            <label for="acao-prazo-${i}">Prazo</label>
            <input type="date" id="acao-prazo-${i}" value="${acao.prazo || ''}" />
          </div>
          <button type="button" class="botao-texto" style="color:var(--alerta-alta);" data-remover-acao="${i}">Remover ação</button>
        </div>
      `).join('')
      : '<p style="font-size:0.84rem;color:var(--texto-suave);margin:0 0 12px;">Nenhuma ação definida ainda.</p>';

    $$('[data-remover-acao]').forEach((botao) => {
      botao.addEventListener('click', () => {
        lerAcoesDoFormulario();
        acoes.splice(Number(botao.dataset.removerAcao), 1);
        renderizarAcoesModal();
      });
    });
  }

  // Guarda o que já foi digitado antes de redesenhar a lista.
  function lerAcoesDoFormulario() {
    acoes.forEach((acao, i) => {
      const campoTexto = $(`#acao-texto-${i}`);
      if (!campoTexto) return;
      acao.texto = campoTexto.value;
      acao.responsavel = $(`#acao-resp-${i}`).value;
      acao.prazo = $(`#acao-prazo-${i}`).value;
    });
  }

  renderizarAcoesModal();

  $('#ac-add-acao').addEventListener('click', () => {
    lerAcoesDoFormulario();
    acoes.push({ texto: '', responsavel: '', prazo: '', concluida: false });
    renderizarAcoesModal();
  });

  $('#ac-salvar').addEventListener('click', async () => {
    const tipo = $('#ac-tipo').value;
    const setorId = $('#ac-setor').value;
    const descricao = $('#ac-descricao').value.trim();
    const dataValor = $('#ac-data').value;
    const erroEl = $('#erro-acidente');

    if (!tipo || !setorId || !descricao || !dataValor) {
      mostrarErro(erroEl, 'Preencha tipo, setor, data e a descrição do ocorrido.');
      return;
    }

    lerAcoesDoFormulario();
    const setor = estado.setores.find((s) => s.id === setorId);
    const comAfastamento = $('#ac-afastamento').value === 'sim';
    const porques = [0, 1, 2, 3, 4].map((i) => $(`#ac-porque-${i}`).value.trim());

    const dados = {
      tipo,
      setorId,
      setorNome: setor ? limparNomeSetor(setor.nome) : 'Geral',
      dataOcorrido: firebase.firestore.Timestamp.fromDate(new Date(dataValor)),
      descricao,
      parteCorpo: $('#ac-parte').value.trim() || null,
      agente: $('#ac-agente').value.trim() || null,
      comAfastamento,
      diasAfastamento: comAfastamento ? Number($('#ac-dias').value) || 0 : 0,
      numeroCat: $('#ac-cat').value.trim() || null,
      porques,
      causaRaiz: $('#ac-causa-raiz').value.trim() || null,
      acoes: acoes.filter((a) => (a.texto || '').trim()),
      fotos: obterFotos()
    };

    const botao = $('#ac-salvar');
    botao.disabled = true;
    botao.textContent = 'Salvando...';
    try {
      if (ac) {
        await db.collection('acidentes').doc(ac.id).update(dados);
      } else {
        dados.registradoPor = estado.usuario.nome;
        dados.registradoPorId = estado.usuario.uid;
        dados.criadoEm = firebase.firestore.Timestamp.now();
        await db.collection('acidentes').add(dados);
      }
      fecharModal();
    } catch (erro) {
      console.error(erro);
      mostrarErro(erroEl, 'Não foi possível salvar agora. Tente novamente.');
      botao.disabled = false;
      botao.textContent = ac ? 'Salvar alterações' : 'Registrar investigação';
    }
  });
}

/* =========================================================
   PAINEL (DASHBOARD)
   ========================================================= */
let graficoUrgenciaInstancia = null;
let graficoRiscoInstancia = null;

// Intervalo escolhido no filtro do painel. Períodos já encerrados
// continuam contando aqui, para dar para comparar com meses passados.
function intervaloPainel() {
  const valor = ($('#filtro-periodo-painel') || {}).value || 'tudo';
  const agora = new Date();

  if (valor === 'mes') {
    return { de: new Date(agora.getFullYear(), agora.getMonth(), 1), ate: null };
  }
  if (valor === 'mes-anterior') {
    return {
      de: new Date(agora.getFullYear(), agora.getMonth() - 1, 1),
      ate: new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, -1)
    };
  }
  if (valor === '90') {
    const de = new Date(agora);
    de.setDate(de.getDate() - 90);
    return { de, ate: null };
  }
  return { de: null, ate: null };
}

function dentroDoIntervaloPainel(timestamp, intervalo) {
  if (!intervalo.de && !intervalo.ate) return true;
  if (!timestamp) return false;
  const data = timestamp.toDate();
  if (intervalo.de && data < intervalo.de) return false;
  if (intervalo.ate && data > intervalo.ate) return false;
  return true;
}

function renderizarPainel() {
  const vazio = $('#painel-vazio');
  const conteudo = $('#painel-conteudo');

  const intervalo = intervaloPainel();
  // No painel entram também os períodos encerrados, porque a ideia
  // aqui é justamente poder olhar para trás e comparar.
  const vistorias = estado.vistorias
    .filter((v) => !v.vinculadaA)
    .filter((v) => dentroDoIntervaloPainel(v.criadoEm, intervalo));
  const observacoes = estado.observacoes
    .filter((o) => dentroDoIntervaloPainel(o.criadoEm, intervalo));

  if (vistorias.length === 0 && observacoes.length === 0) {
    mostrar(vazio);
    esconder(conteudo);
    return;
  }
  esconder(vazio);
  mostrar(conteudo);

  const abertas = observacoes.filter((o) => o.status !== 'resolvida');
  const resolvidas = observacoes.filter((o) => o.status === 'resolvida');

  // ---- KPIs ----
  $('#kpi-total-vistorias').textContent = vistorias.length;
  $('#kpi-abertas').textContent = abertas.length;
  $('#kpi-resolvidas').textContent = resolvidas.length;

  let totalItens = 0;
  let itensConformes = 0;
  vistorias.forEach((v) => {
    (v.itens || []).forEach((item) => {
      totalItens++;
      if (item.checado) itensConformes++;
    });
  });
  const conformidade = totalItens ? Math.round((itensConformes / totalItens) * 100) : 0;
  $('#kpi-conformidade').textContent = `${conformidade}%`;

  // Quase acidentes não entram na contagem de acidentes, mas suas
  // ações corretivas contam igual, porque servem para prevenir.
  const acidentesPeriodo = estado.acidentes.filter((a) => dentroDoIntervaloPainel(a.dataOcorrido, intervalo));
  const acidentesReais = acidentesPeriodo.filter((a) => a.tipo !== 'quase');
  $('#kpi-acidentes').textContent = acidentesReais.length;

  let acoesPendentes = 0;
  acidentesPeriodo.forEach((a) => {
    (a.acoes || []).forEach((acao) => { if (!acao.concluida) acoesPendentes++; });
  });
  $('#kpi-acoes-pendentes').textContent = acoesPendentes;

  // ---- Gráfico de urgência (observações abertas) ----
  const porUrgencia = { alta: 0, media: 0, baixa: 0 };
  abertas.forEach((o) => { if (porUrgencia[o.urgencia] !== undefined) porUrgencia[o.urgencia]++; });

  const ctxUrgencia = document.getElementById('grafico-urgencia');
  if (graficoUrgenciaInstancia) graficoUrgenciaInstancia.destroy();
  graficoUrgenciaInstancia = new Chart(ctxUrgencia, {
    type: 'doughnut',
    data: {
      labels: ['Alta', 'Média', 'Baixa'],
      datasets: [{
        data: [porUrgencia.alta, porUrgencia.media, porUrgencia.baixa],
        backgroundColor: ['#C0392B', '#D9740F', '#43B032'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
    }
  });

  // ---- Gráfico de tipo de risco (observações abertas) ----
  const porRisco = {};
  abertas.forEach((o) => { if (o.tipoRisco) porRisco[o.tipoRisco] = (porRisco[o.tipoRisco] || 0) + 1; });
  const chavesRisco = Object.keys(porRisco);

  const ctxRisco = document.getElementById('grafico-risco');
  if (graficoRiscoInstancia) graficoRiscoInstancia.destroy();
  graficoRiscoInstancia = new Chart(ctxRisco, {
    type: 'bar',
    data: {
      labels: chavesRisco.map((c) => TIPOS_RISCO[c].nome),
      datasets: [{
        data: chavesRisco.map((c) => porRisco[c]),
        backgroundColor: chavesRisco.map((c) => TIPOS_RISCO[c].cor),
        borderRadius: 5,
        maxBarThickness: 28
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { precision: 0 } } }
    }
  });

  // ---- Ranking de setores com mais ocorrências abertas ----
  const porSetor = new Map();
  abertas.forEach((o) => {
    const nome = limparNomeSetor(o.setorNome) || 'Geral';
    porSetor.set(nome, (porSetor.get(nome) || 0) + 1);
  });
  const ranking = [...porSetor.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maiorContagem = ranking.length ? ranking[0][1] : 1;

  $('#ranking-setores').innerHTML = ranking.length
    ? ranking.map(([nome, contagem]) => `
      <div class="item-ranking-setor">
        <span class="nome-ranking" title="${escaparHtml(nome)}">${escaparHtml(nome)}</span>
        <div class="barra-ranking-trilha"><div class="barra-ranking-fill" style="width:${Math.max((contagem / maiorContagem) * 100, 6)}%"></div></div>
        <span class="contagem-ranking">${contagem}</span>
      </div>
    `).join('')
    : '<p style="font-size:0.85rem;color:var(--texto-suave);">Nenhuma observação aberta no momento.</p>';

  // ---- Atividade recente (últimos registros, vistorias + avulsos) ----
  const recentesVistorias = vistorias.map((v) => ({
    tipo: 'vistoria', data: v.criadoEm, setor: v.setorNome, autor: v.colaboradorNome
  }));
  const recentesAvulsos = observacoes.filter((o) => !o.vistoriaId).map((o) => ({
    tipo: 'avulso', data: o.criadoEm, setor: o.setorNome, autor: o.criadoPor, texto: o.texto
  }));
  const recentes = [...recentesVistorias, ...recentesAvulsos]
    .sort((a, b) => (b.data ? b.data.toMillis() : 0) - (a.data ? a.data.toMillis() : 0))
    .slice(0, 6);

  $('#atividade-recente').innerHTML = recentes.length
    ? recentes.map((item) => {
      const { dataTexto, horaTexto } = item.data ? formatarDataHora(item.data) : { dataTexto: '', horaTexto: '' };
      const descricao = item.tipo === 'vistoria'
        ? `Vistoria em ${escaparHtml(limparNomeSetor(item.setor) || 'Geral')}`
        : `Registro avulso em ${escaparHtml(limparNomeSetor(item.setor) || 'Geral')}`;
      return `
        <div class="item-atividade">
          <div class="linha1">${descricao}</div>
          <div class="linha2">${dataTexto} ${horaTexto} · ${escaparHtml(item.autor || '')}</div>
        </div>
      `;
    }).join('')
    : '<p style="font-size:0.85rem;color:var(--texto-suave);">Nenhuma atividade registrada ainda.</p>';

  // ---- Todos os pedidos em aberto, ordenados por urgência ----
  const abertasOrdenadas = abertas.slice().sort((a, b) => {
    const diff = (RANK_URGENCIA[a.urgencia] ?? 3) - (RANK_URGENCIA[b.urgencia] ?? 3);
    if (diff !== 0) return diff;
    const dataA = a.criadoEm ? a.criadoEm.toMillis() : 0;
    const dataB = b.criadoEm ? b.criadoEm.toMillis() : 0;
    return dataB - dataA;
  });

  $('#contagem-pedidos-abertos').textContent = abertasOrdenadas.length;
  $('#lista-pedidos-abertos').innerHTML = abertasOrdenadas.length
    ? abertasOrdenadas.map((obs) => {
      const dataTx = obs.criadoEm ? formatarDataHora(obs.criadoEm).dataTexto : '';
      const autor = autorDaObservacao(obs);
      return `
        <div class="item-pedido-aberto">
          ${obs.tipoRisco ? seloTipoRisco(obs.tipoRisco) : ''}
          <div class="corpo-pedido">
            <div class="linha-topo-pedido">
              <span class="setor-pedido">${escaparHtml(limparNomeSetor(obs.setorNome) || 'Geral')}</span>
              <span class="etiqueta-urgencia ${obs.urgencia}">${obs.urgencia}</span>
            </div>
            <p class="texto-pedido">${escaparHtml(obs.texto)}</p>
            ${galeriaFotosHtml(obs, 'foto-pedido')}
            <div class="meta-pedido">${dataTx} · ${escaparHtml(autor)}</div>
          </div>
        </div>
      `;
    }).join('')
    : '<p style="font-size:0.85rem;color:var(--texto-suave);">Nenhum pedido em aberto, tudo resolvido.</p>';

  renderizarReincidencia();
}

/* Itens de checklist que reprovam repetidamente no mesmo setor.
   A chave é setor + texto do item (não o id), porque o checklist é
   copiado para dentro de cada vistoria e o id pode mudar se o item
   for recriado. O texto é o que identifica o problema de verdade. */
function renderizarReincidencia() {
  const contagem = new Map();

  // Usa TODO o histórico, inclusive períodos já encerrados: a
  // reincidência só tem valor se enxergar as vistorias antigas.
  // Só as duplicadas ficam de fora, para não contar duas vezes.
  estado.vistorias.filter((v) => !v.vinculadaA).forEach((vistoria) => {
    const setor = limparNomeSetor(vistoria.setorNome) || 'Geral';
    (vistoria.itens || []).forEach((item) => {
      const chave = `${setor}||${item.texto}`;
      if (!contagem.has(chave)) {
        contagem.set(chave, { setor, texto: item.texto, tipoRisco: item.tipoRisco, total: 0, falhas: 0 });
      }
      const registro = contagem.get(chave);
      registro.total++;
      if (!item.checado) registro.falhas++;
      if (item.tipoRisco && !registro.tipoRisco) registro.tipoRisco = item.tipoRisco;
    });
  });

  // Só interessa o que já foi vistoriado ao menos 3 vezes e falhou
  // mais de uma. Abaixo disso ainda é ocorrência pontual, não padrão.
  const reincidentes = [...contagem.values()]
    .filter((r) => r.total >= 3 && r.falhas >= 2)
    .map((r) => ({ ...r, taxa: r.falhas / r.total }))
    .sort((a, b) => (b.taxa - a.taxa) || (b.falhas - a.falhas))
    .slice(0, 8);

  $('#lista-reincidencia').innerHTML = reincidentes.length
    ? reincidentes.map((r) => {
      const percentual = Math.round(r.taxa * 100);
      const nivel = percentual >= 60 ? 'critica' : percentual >= 40 ? 'atencao' : 'leve';
      return `
        <div class="item-reincidencia">
          <div class="corpo-reincidencia">
            <div class="texto-reincidencia">
              ${r.tipoRisco ? seloTipoRisco(r.tipoRisco) : ''}
              <span>${escaparHtml(r.texto)}</span>
            </div>
            <div class="setor-reincidencia">${escaparHtml(r.setor)} · reprovou ${r.falhas} de ${r.total} vistorias</div>
          </div>
          <span class="selo-reincidencia ${nivel}">${percentual}%</span>
        </div>
      `;
    }).join('')
    : '<p style="font-size:0.85rem;color:var(--texto-suave);">Nenhum padrão de reincidência ainda. São necessárias pelo menos 3 vistorias do mesmo setor para identificar repetições.</p>';
}


function ouvirRelatorio() {
  db.collection('vistorias').orderBy('criadoEm', 'desc').limit(200).onSnapshot((snapshot) => {
    estado.vistorias = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderizarRelatorio();
    if (estado.telaAtual === 'painel') renderizarPainel();
  });
  db.collection('observacoes').orderBy('criadoEm', 'desc').limit(500).onSnapshot((snapshot) => {
    estado.observacoes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderizarRelatorio();
    if (estado.telaAtual === 'painel') renderizarPainel();
  });
}

function renderizarFiltroSetorRelatorio() {
  const select = $('#filtro-setor-relatorio');
  const valorAtual = select.value;
  select.innerHTML = '<option value="">Todos os setores</option>' +
    estado.setores.map((s) => `<option value="${s.id}">${escaparHtml(limparNomeSetor(s.nome))}</option>`).join('');
  select.value = valorAtual;
}

// Mudar qualquer filtro reavalia o botão de encerrar, para ele não
// ficar visível apontando para um período diferente do exportado.
function aoMudarFiltroRelatorio() {
  renderizarRelatorio();
  atualizarBotaoEncerrar();
}

$('#filtro-setor-relatorio').addEventListener('change', aoMudarFiltroRelatorio);
$('#filtro-status-relatorio').addEventListener('change', aoMudarFiltroRelatorio);
$('#filtro-data-inicio').addEventListener('change', aoMudarFiltroRelatorio);
$('#filtro-data-fim').addEventListener('change', aoMudarFiltroRelatorio);
$('#botao-limpar-periodo').addEventListener('click', () => {
  $('#filtro-data-inicio').value = '';
  $('#filtro-data-fim').value = '';
  renderizarRelatorio();
  atualizarBotaoEncerrar();
});

$$('.subaba-relatorio').forEach((botao) => {
  botao.addEventListener('click', () => {
    estado.subAbaRelatorio = botao.dataset.subaba;
    $$('.subaba-relatorio').forEach((b) => b.classList.toggle('ativa', b === botao));
    renderizarRelatorio();
  });
});

function obterDadosFiltradosRelatorio() {
  const filtroSetor = $('#filtro-setor-relatorio').value;
  const filtroStatus = $('#filtro-status-relatorio').value;
  const dataInicioValor = $('#filtro-data-inicio').value;
  const dataFimValor = $('#filtro-data-fim').value;

  $('#botao-limpar-periodo').classList.toggle('oculto', !dataInicioValor && !dataFimValor);

  const dataInicio = dataInicioValor ? new Date(`${dataInicioValor}T00:00:00`) : null;
  const dataFim = dataFimValor ? new Date(`${dataFimValor}T23:59:59`) : null;

  function dentroDoPeriodo(timestamp) {
    if (!dataInicio && !dataFim) return true;
    if (!timestamp) return false;
    const data = timestamp.toDate();
    if (dataInicio && data < dataInicio) return false;
    if (dataFim && data > dataFim) return false;
    return true;
  }

  let vistorias = vistoriasAtivas().filter((v) => dentroDoPeriodo(v.criadoEm));
  if (filtroSetor) vistorias = vistorias.filter((v) => v.setorId === filtroSetor);

  // Entram aqui os registros avulsos e também as observações de
  // vistorias já encerradas que continuam em aberto. Sem isso elas
  // sumiriam do relatório junto com a vistoria, mesmo pendentes.
  const idsVistoriasAtivas = new Set(vistoriasAtivas().map((v) => v.id));
  let avulsas = observacoesAtivas().filter((o) => {
    if (!dentroDoPeriodo(o.criadoEm)) return false;
    if (!o.vistoriaId) return true;
    return !idsVistoriasAtivas.has(o.vistoriaId) && o.status !== 'resolvida';
  });
  if (filtroSetor) avulsas = avulsas.filter((o) => o.setorId === filtroSetor);
  if (filtroStatus) avulsas = avulsas.filter((o) => o.status === filtroStatus);

  return { vistorias, avulsas, filtroSetor, filtroStatus, dataInicioValor, dataFimValor };
}

function renderizarResumoExecutivo(resumo) {
  if (resumo.total === 0) return '';
  const chipsUrgencia = ['alta', 'media', 'baixa']
    .filter((u) => resumo.porUrgencia[u])
    .map((u) => `<span class="chip-resumo urgencia-${u}">${resumo.porUrgencia[u]} ${u}</span>`)
    .join('');
  const chipsRisco = Object.entries(resumo.porRisco)
    .map(([chave, qtd]) => `<span class="chip-resumo-risco">${seloTipoRisco(chave)} ${TIPOS_RISCO[chave].nome}: ${qtd}</span>`)
    .join('');
  return `
    <div class="resumo-executivo">
      <p class="resumo-total">${resumo.total} ${resumo.total === 1 ? 'ocorrência no período' : 'ocorrências no período'}</p>
      <div class="chips-resumo-linha">${chipsUrgencia}</div>
      ${chipsRisco ? `<div class="chips-resumo-linha" style="margin-top:6px;">${chipsRisco}</div>` : ''}
    </div>
  `;
}

function renderizarCardVistoria(vistoria, obsDaVistoria) {
  const { dataTexto, horaTexto } = vistoria.criadoEm ? formatarDataHora(vistoria.criadoEm) : { dataTexto: '', horaTexto: '' };
  const itens = vistoria.itens || [];
  const conformes = itens.filter((i) => i.checado).length;
  const naoConformes = itens.length - conformes;

  return `
    <div class="registro-vistoria">
      <button type="button" class="cabecalho-registro" data-abrir-registro="${vistoria.id}" style="width:100%;text-align:left;">
        <div>
          <div class="info-principal">${escaparHtml(limparNomeSetor(vistoria.setorNome))}</div>
          <div class="meta-registro">${dataTexto} ${horaTexto} · ${escaparHtml(textoFiscalizadores(vistoria))}</div>
        </div>
        <span class="etiqueta-status ${naoConformes > 0 ? 'aberta' : 'resolvida'}">${naoConformes > 0 ? naoConformes + ' pendente(s)' : 'completo'}</span>
      </button>
      <div class="corpo-registro oculto" id="corpo-registro-${vistoria.id}">
        <p class="subtitulo-registro cabecalho-checklist-relatorio">
          <span>Checklist</span>
          ${itens.length ? `<span class="contagem-conformidade">${conformes} conforme${conformes === 1 ? '' : 's'} · ${naoConformes} não conforme${naoConformes === 1 ? '' : 's'}</span>` : ''}
        </p>
        ${itens.map((item) => `
          <div class="item-relatorio-checklist">
            <span class="marca ${item.checado ? 'ok' : 'pendente'}">${item.checado ? '<svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg>' : ''}</span>
            ${seloTipoRisco(item.tipoRisco)}
            <span class="${item.checado ? '' : 'texto-pendente'}">${escaparHtml(item.texto)}</span>
          </div>
        `).join('') || '<p style="font-size:0.86rem;color:var(--texto-suave);">Sem itens de checklist.</p>'}

        <p class="subtitulo-registro">Observações</p>
        ${obsDaVistoria.length ? obsDaVistoria.map((obs) => renderizarCardObservacao(obs)).join('') : '<p style="font-size:0.86rem;color:var(--texto-suave);">Nenhuma observação registrada.</p>'}

        ${(vistoria.coFiscalizadores || []).length ? `
          <div class="aviso-vinculo">Vistoria feita em conjunto. Uma duplicata foi vinculada a este registro.</div>
        ` : ''}

        <div class="acoes-card-obs" style="margin-top:12px;">
          <button type="button" class="botao-texto" data-vincular-vistoria="${vistoria.id}">Vincular vistoria duplicada</button>
        </div>
      </div>
    </div>
  `;
}

function abrirModalVincularVistoria(vistoriaId) {
  const principal = estado.vistorias.find((v) => v.id === vistoriaId);
  if (!principal) return;

  const dataPrincipal = principal.criadoEm ? principal.criadoEm.toMillis() : 0;
  const JANELA_MS = 24 * 60 * 60 * 1000;

  // Candidatas: mesma vistoria não, já vinculadas não, e por padrão
  // só o mesmo setor num intervalo de um dia, que é o caso real de
  // duas pessoas registrando a mesma ronda.
  const candidatas = estado.vistorias
    .filter((v) => v.id !== principal.id && !v.vinculadaA)
    .filter((v) => v.setorId === principal.setorId)
    .filter((v) => {
      if (!v.criadoEm || !dataPrincipal) return true;
      return Math.abs(v.criadoEm.toMillis() - dataPrincipal) <= JANELA_MS;
    })
    .sort((a, b) => (b.criadoEm ? b.criadoEm.toMillis() : 0) - (a.criadoEm ? a.criadoEm.toMillis() : 0));

  const jaVinculadas = estado.vistorias.filter((v) => v.vinculadaA === principal.id);

  const { dataTexto, horaTexto } = principal.criadoEm ? formatarDataHora(principal.criadoEm) : { dataTexto: '', horaTexto: '' };

  abrirModal('Vincular vistoria duplicada', `
    <p style="font-size:0.85rem;color:var(--texto-suave);margin:-6px 0 14px;">
      Mantendo esta como principal: ${escaparHtml(limparNomeSetor(principal.setorNome))}, ${dataTexto} às ${horaTexto}, por ${escaparHtml(textoFiscalizadores(principal))}.
      A vistoria escolhida sai das contagens e dos relatórios, e o nome de quem a registrou passa a constar aqui.
    </p>

    ${jaVinculadas.length ? `
      <p class="subtitulo-registro" style="margin-top:0;">Já vinculadas</p>
      ${jaVinculadas.map((v) => {
        const d = v.criadoEm ? formatarDataHora(v.criadoEm) : { dataTexto: '', horaTexto: '' };
        return `
          <div class="item-vinculo">
            <div>
              <div class="titulo-vinculo">${escaparHtml(v.colaboradorNome)}</div>
              <div class="meta-vinculo">${d.dataTexto} às ${d.horaTexto}</div>
            </div>
            <button type="button" class="botao-texto" style="color:var(--alerta-alta);" data-desvincular="${v.id}">Desvincular</button>
          </div>
        `;
      }).join('')}
    ` : ''}

    <p class="subtitulo-registro">Escolha a vistoria duplicada</p>
    ${candidatas.length ? candidatas.map((v) => {
      const d = v.criadoEm ? formatarDataHora(v.criadoEm) : { dataTexto: '', horaTexto: '' };
      const itens = v.itens || [];
      const conformes = itens.filter((i) => i.checado).length;
      return `
        <button type="button" class="item-vinculo item-vinculo-clicavel" data-escolher-duplicada="${v.id}">
          <div>
            <div class="titulo-vinculo">${escaparHtml(v.colaboradorNome)}</div>
            <div class="meta-vinculo">${d.dataTexto} às ${d.horaTexto} · ${conformes} de ${itens.length} conformes</div>
          </div>
          <span class="seta-item-setor-wrap">Vincular</span>
        </button>
      `;
    }).join('') : '<p style="font-size:0.85rem;color:var(--texto-suave);">Nenhuma outra vistoria deste setor foi registrada no mesmo dia.</p>'}

    <div id="erro-vinculo" class="erro-mensagem oculto" style="margin-top:12px;"></div>
  `);

  $$('[data-escolher-duplicada]').forEach((botao) => {
    botao.addEventListener('click', async () => {
      const duplicadaId = botao.dataset.escolherDuplicada;
      const duplicada = estado.vistorias.find((v) => v.id === duplicadaId);
      if (!duplicada) return;
      botao.disabled = true;
      try {
        const nomes = principal.coFiscalizadores || [];
        const novos = nomes.includes(duplicada.colaboradorNome) ? nomes : [...nomes, duplicada.colaboradorNome];
        await db.collection('vistorias').doc(principal.id).update({ coFiscalizadores: novos });
        await db.collection('vistorias').doc(duplicadaId).update({ vinculadaA: principal.id });
        fecharModal();
      } catch (erro) {
        console.error(erro);
        mostrarErro($('#erro-vinculo'), 'Não foi possível vincular agora. Verifique se as regras do Firestore foram atualizadas.');
        botao.disabled = false;
      }
    });
  });

  $$('[data-desvincular]').forEach((botao) => {
    botao.addEventListener('click', async () => {
      const duplicadaId = botao.dataset.desvincular;
      const duplicada = estado.vistorias.find((v) => v.id === duplicadaId);
      botao.disabled = true;
      try {
        await db.collection('vistorias').doc(duplicadaId).update({ vinculadaA: null });
        if (duplicada) {
          const restantes = (principal.coFiscalizadores || []).filter((n) => n !== duplicada.colaboradorNome);
          await db.collection('vistorias').doc(principal.id).update({ coFiscalizadores: restantes });
        }
        fecharModal();
      } catch (erro) {
        console.error(erro);
        mostrarErro($('#erro-vinculo'), 'Não foi possível desvincular agora.');
        botao.disabled = false;
      }
    });
  });
}

function renderizarRelatorio() {
  const { vistorias, avulsas, filtroStatus } = obterDadosFiltradosRelatorio();

  const lista = $('#lista-relatorio');
  const vazio = $('#vazio-relatorio');
  const resumoContainer = $('#resumo-executivo-relatorio');

  if (vistorias.length === 0 && avulsas.length === 0) {
    resumoContainer.innerHTML = '';
    lista.innerHTML = '';
    mostrar(vazio);
    return;
  }
  esconder(vazio);

  const observacoesRelevantes = obterObservacoesRelevantes(vistorias, avulsas, filtroStatus);
  resumoContainer.innerHTML = renderizarResumoExecutivo(calcularResumoObservacoes(observacoesRelevantes));

  const gruposAvulsos = organizarAvulsasPorSetor(avulsas);
  const gruposVistorias = organizarVistoriasPorSetor(vistorias, filtroStatus)
    .map((grupo) => ({ ...grupo, itens: grupo.itens.filter((v) => !filtroStatus || grupo.infoPorVistoria.get(v.id).obs.length > 0) }))
    .filter((grupo) => grupo.itens.length > 0);

  const totalAvulsos = gruposAvulsos.reduce((soma, g) => soma + g.total, 0);
  const totalVistorias = gruposVistorias.reduce((soma, g) => soma + g.total, 0);
  $('#subaba-avulsos').textContent = `Registros avulsos (${totalAvulsos})`;
  $('#subaba-vistorias').textContent = `Vistorias com checklist (${totalVistorias})`;

  const blocoAvulsas = gruposAvulsos.length ? gruposAvulsos.map((grupo) => `
    <div class="grupo-setor-relatorio">
      <p class="subtotal-setor">${escaparHtml(grupo.nome)}: ${grupo.total} ${grupo.total === 1 ? 'registro' : 'registros'}${grupo.altaCount ? `, sendo ${grupo.altaCount} de alta urgência` : ''}</p>
      ${grupo.itens.map((obs) => renderizarCardAvulso(obs)).join('')}
    </div>
  `).join('') : '<p style="font-size:0.9rem;color:var(--texto-suave);text-align:center;padding:30px 0;">Nenhum registro avulso encontrado.</p>';

  // Um card por setor, fechado. Mostra só o nome, quantas vistorias e
  // a data da última, que é o que responde "esse setor andou sendo
  // vistoriado?". As vistorias em si só aparecem ao abrir o card.
  const blocoVistorias = gruposVistorias.length ? `
    <div class="grade-setores-vistoria">
      ${gruposVistorias.map((grupo, indice) => {
        const maisRecente = grupo.itens.reduce((maior, v) => {
          const t = v.criadoEm ? v.criadoEm.toMillis() : 0;
          return t > maior ? t : maior;
        }, 0);
        const ultima = maisRecente
          ? formatarDataHora(firebase.firestore.Timestamp.fromMillis(maisRecente)).dataTexto
          : '';
        const idGrupo = `grupo-vist-${indice}`;
        return `
          <div class="card-setor-vistoria" id="${idGrupo}">
            <button type="button" class="cabecalho-setor-vistoria" data-abrir-grupo="${idGrupo}">
              <div class="info-setor-vistoria">
                <div class="nome-setor-vistoria">${escaparHtml(grupo.nome)}</div>
                <div class="meta-setor-vistoria">${grupo.total} ${grupo.total === 1 ? 'vistoria' : 'vistorias'}${ultima ? ` · última em ${ultima}` : ''}</div>
              </div>
              <svg class="chevron-setor-vistoria" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="corpo-setor-vistoria oculto" id="corpo-${idGrupo}">
              ${grupo.itens.map((vistoria) => renderizarCardVistoria(vistoria, grupo.infoPorVistoria.get(vistoria.id).obs)).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  ` : '<p style="font-size:0.9rem;color:var(--texto-suave);text-align:center;padding:30px 0;">Nenhuma vistoria com checklist encontrada.</p>';

  lista.innerHTML = estado.subAbaRelatorio === 'avulsos' ? blocoAvulsas : blocoVistorias;

  $$('[data-abrir-grupo]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const id = botao.dataset.abrirGrupo;
      $(`#corpo-${id}`).classList.toggle('oculto');
      $(`#${id}`).classList.toggle('aberto');
    });
  });

  $$('[data-abrir-registro]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const corpo = $(`#corpo-registro-${botao.dataset.abrirRegistro}`);
      corpo.classList.toggle('oculto');
    });
  });

  $$('[data-resolver-obs]').forEach((botao) => {
    botao.addEventListener('click', () => abrirModalResolverObservacao(botao.dataset.resolverObs));
  });

  $$('[data-editar-obs]').forEach((botao) => {
    botao.addEventListener('click', () => abrirModalEditarObservacaoAvulsa(botao.dataset.editarObs));
  });

  $$('[data-vincular-vistoria]').forEach((botao) => {
    botao.addEventListener('click', () => abrirModalVincularVistoria(botao.dataset.vincularVistoria));
  });
}

// Registro avulso tem criadoPor. Observação de vistoria não tem,
// então o autor vem de quem fez a vistoria.
function autorDaObservacao(obs) {
  if (obs.criadoPor) return obs.criadoPor;
  const v = estado.vistorias.find((x) => x.id === obs.vistoriaId);
  return v ? textoFiscalizadores(v) : '';
}

function blocoFotosResolucaoHtml(obs) {
  const fotos = fotosDaResolucao(obs);
  if (!fotos.length) return '';
  return `
    <div class="bloco-fotos-resolucao">
      <div class="rotulo-fotos-resolucao">Comprovação da resolução</div>
      <div class="galeria-fotos">${fotos.map((f) => `
        <img class="foto-observacao" src="data:image/jpeg;base64,${f}" alt="Foto da resolução" />
      `).join('')}</div>
    </div>
  `;
}

function renderizarCardAvulso(obs) {
  const resolvida = obs.status === 'resolvida';
  const dataTx = obs.criadoEm ? formatarDataHora(obs.criadoEm).dataTexto : '';
  return `
    <div class="registro-avulso">
      <div class="cabecalho-avulso">
        <div>
          <div class="info-principal">${escaparHtml(limparNomeSetor(obs.setorNome) || 'Geral')}</div>
          <div class="meta-registro">${dataTx} · ${escaparHtml(autorDaObservacao(obs))}</div>
        </div>
        <span class="etiqueta-status ${resolvida ? 'resolvida' : 'aberta'}">${resolvida ? 'resolvida' : 'aberta'}</span>
      </div>
      <div class="corpo-avulso">
        <div style="display:flex;align-items:center;gap:7px;margin-bottom:9px;">
          ${obs.tipoRisco ? seloTipoRisco(obs.tipoRisco) : ''}
          <span class="etiqueta-urgencia ${obs.urgencia}">${obs.urgencia}</span>
        </div>
        <p class="texto-obs">${escaparHtml(obs.texto)}</p>
        ${galeriaFotosHtml(obs)}
        ${resolvida
          ? `<div class="resolucao-info">Resolvida por ${escaparHtml(obs.resolvidoPor)} em ${obs.dataResolucao ? formatarDataHora(obs.dataResolucao).dataTexto : ''}${obs.descricaoResolucao ? `<br/>${escaparHtml(obs.descricaoResolucao)}` : ''}</div>
             ${blocoFotosResolucaoHtml(obs)}`
          : `<div class="acoes-card-obs">
               <button type="button" class="botao-texto" data-resolver-obs="${obs.id}">Marcar como resolvida</button>
               <button type="button" class="botao-texto" data-editar-obs="${obs.id}">Editar</button>
             </div>`
        }
      </div>
    </div>
  `;
}

function renderizarCardObservacao(obs) {
  const resolvida = obs.status === 'resolvida';
  const dataResolucao = obs.dataResolucao ? formatarDataHora(obs.dataResolucao).dataTexto : null;
  const ehAvulsa = !obs.vistoriaId;
  return `
    <div class="card-observacao-relatorio">
      <div class="linha-topo-obs">
        <div style="display:flex;align-items:center;gap:7px;">
          ${obs.tipoRisco ? seloTipoRisco(obs.tipoRisco) : ''}
          <span class="etiqueta-urgencia ${obs.urgencia}">${obs.urgencia}</span>
        </div>
        <span class="etiqueta-status ${resolvida ? 'resolvida' : 'aberta'}">${resolvida ? 'resolvida' : 'aberta'}</span>
      </div>
      <p class="texto-obs">${escaparHtml(obs.texto)}</p>
      ${galeriaFotosHtml(obs)}
      ${resolvida
        ? `<div class="resolucao-info">Resolvida por ${escaparHtml(obs.resolvidoPor)} em ${dataResolucao}${obs.descricaoResolucao ? `<br/>${escaparHtml(obs.descricaoResolucao)}` : ''}</div>
           ${blocoFotosResolucaoHtml(obs)}`
        : `<div class="acoes-card-obs">
             <button type="button" class="botao-texto" data-resolver-obs="${obs.id}">Marcar como resolvida</button>
             ${ehAvulsa ? `<button type="button" class="botao-texto" data-editar-obs="${obs.id}">Editar</button>` : ''}
           </div>`
      }
    </div>
  `;
}

function abrirModalResolverObservacao(obsId) {
  abrirModal('Marcar como resolvida', `
    <div class="campo">
      <label for="modal-resolvido-por">Resolvido por</label>
      <input type="text" id="modal-resolvido-por" placeholder="Nome de quem resolveu (CIPA, gerência, RH...)" />
    </div>
    <div class="campo">
      <label for="modal-data-resolucao">Data da resolução</label>
      <input type="date" id="modal-data-resolucao" />
    </div>
    <div class="campo">
      <label for="modal-descricao-resolucao">Como foi resolvido (opcional)</label>
      <textarea id="modal-descricao-resolucao" placeholder="Ex.: Extintor recarregado e recolocado no suporte"></textarea>
    </div>
    <button type="button" class="botao-primario" id="modal-confirmar-resolucao">Confirmar</button>
  `);

  $('#modal-data-resolucao').valueAsDate = new Date();

  $('#modal-confirmar-resolucao').addEventListener('click', async () => {
    const resolvidoPor = $('#modal-resolvido-por').value.trim();
    const dataValor = $('#modal-data-resolucao').value;
    const descricaoResolucao = $('#modal-descricao-resolucao').value.trim();
    if (!resolvidoPor || !dataValor) return;

    await db.collection('observacoes').doc(obsId).update({
      status: 'resolvida',
      resolvidoPor,
      dataResolucao: firebase.firestore.Timestamp.fromDate(new Date(dataValor + 'T12:00:00')),
      descricaoResolucao: descricaoResolucao || null
    });
    fecharModal();
  });
}

function abrirModalEditarObservacaoAvulsa(obsId) {
  const obs = estado.observacoes.find((o) => o.id === obsId);
  if (!obs) return;

  const opcoesSetor = '<option value="">Geral (não é de um setor específico)</option>' +
    estado.setores.map((s) => `<option value="${s.id}" ${s.id === obs.setorId ? 'selected' : ''}>${escaparHtml(limparNomeSetor(s.nome))}</option>`).join('');

  const opcoesRisco = Object.entries(TIPOS_RISCO).map(([chave, tipo]) =>
    `<option value="${chave}" ${obs.tipoRisco === chave ? 'selected' : ''}>${tipo.nome}</option>`
  ).join('');

  abrirModal('Editar registro avulso', `
    <p class="aviso-topo">A data e o autor do registro não mudam ao editar.</p>
    <div class="campo">
      <label for="editar-obs-setor">Setor (opcional)</label>
      <select id="editar-obs-setor">${opcoesSetor}</select>
    </div>
    <div class="campo">
      <label for="editar-obs-risco">Tipo de risco (opcional)</label>
      <select id="editar-obs-risco">
        <option value="">Não se aplica</option>
        ${opcoesRisco}
      </select>
    </div>
    <div class="campo">
      <label for="editar-obs-texto">O que precisa ser resolvido?</label>
      <textarea id="editar-obs-texto">${escaparHtml(obs.texto)}</textarea>
    </div>
    <div class="campo">
      <label>Nível de urgência</label>
      <div class="seletor-urgencia" id="seletor-urgencia-editar-obs">
        <button type="button" class="opcao-urgencia baixa" data-urgencia="baixa">Baixa</button>
        <button type="button" class="opcao-urgencia media" data-urgencia="media">Média</button>
        <button type="button" class="opcao-urgencia alta" data-urgencia="alta">Alta</button>
      </div>
    </div>
    <div id="erro-editar-obs" class="erro-mensagem oculto"></div>
    <button type="button" class="botao-primario" id="editar-obs-salvar">Salvar alterações</button>
  `);

  let urgenciaSelecionada = obs.urgencia;
  const botoesUrgencia = $$('#seletor-urgencia-editar-obs .opcao-urgencia');
  function marcarUrgencia(valor) {
    urgenciaSelecionada = valor;
    botoesUrgencia.forEach((b) => b.classList.toggle('selecionada', b.dataset.urgencia === valor));
  }
  marcarUrgencia(obs.urgencia);
  botoesUrgencia.forEach((botao) => {
    botao.addEventListener('click', () => marcarUrgencia(botao.dataset.urgencia));
  });

  $('#editar-obs-salvar').addEventListener('click', async () => {
    const texto = $('#editar-obs-texto').value.trim();
    if (!texto) {
      $('#editar-obs-texto').focus();
      return;
    }
    const setorId = $('#editar-obs-setor').value || null;
    const setor = setorId ? estado.setores.find((s) => s.id === setorId) : null;
    const botao = $('#editar-obs-salvar');
    botao.disabled = true;
    botao.textContent = 'Salvando...';
    try {
      // Só os campos de conteúdo mudam. vistoriaId, criadoPor e criadoEm
      // nunca são tocados aqui, preservando quem lançou e quando.
      await db.collection('observacoes').doc(obsId).update({
        setorId,
        setorNome: setor ? limparNomeSetor(setor.nome) : 'Geral',
        tipoRisco: $('#editar-obs-risco').value || null,
        texto,
        urgencia: urgenciaSelecionada
      });
      fecharModal();
    } catch (erro) {
      mostrarErro($('#erro-editar-obs'), 'Não foi possível salvar agora. Tente novamente.');
      console.error(erro);
      botao.disabled = false;
      botao.textContent = 'Salvar alterações';
    }
  });
}

/* =========================================================
   EXPORTAR RELATÓRIO EM PDF
   ========================================================= */
function textoStatusObs(obs) {
  return obs.status === 'resolvida' ? 'resolvida' : 'aberta';
}

function corUrgenciaRgb(urgencia) {
  if (urgencia === 'alta') return [192, 57, 43];
  if (urgencia === 'media') return [217, 116, 15];
  return [43, 130, 50];
}

/* =========================================================
   ENCERRAR PERÍODO
   ========================================================= */
const FOTO_ARQUIVO_LADO_MAX = 520;
const FOTO_ARQUIVO_QUALIDADE = 0.45;

// Reduz uma foto já salva para o tamanho de arquivo morto. A imagem
// continua legível no PDF do histórico, ocupando bem menos espaço.
function recomprimirParaArquivo(base64) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const maior = Math.max(width, height);
      if (maior > FOTO_ARQUIVO_LADO_MAX) {
        const fator = FOTO_ARQUIVO_LADO_MAX / maior;
        width = Math.round(width * fator);
        height = Math.round(height * fator);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', FOTO_ARQUIVO_QUALIDADE).split(',')[1]);
    };
    // Se a foto não puder ser lida, mantém a original em vez de perder.
    img.onerror = () => resolve(base64);
    img.src = `data:image/jpeg;base64,${base64}`;
  });
}

function ouvirResolucoes() {
  db.collection('resolucoes').orderBy('dataResolucao', 'desc').limit(300).onSnapshot((snapshot) => {
    estado.resolucoes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderizarRelatorio();
  });
}

// Fotos que comprovam a resolução de uma observação, quando ela foi
// encerrada por um registro de solicitação resolvida.
function fotosDaResolucao(obs) {
  if (!obs.resolucaoId) return [];
  const r = estado.resolucoes.find((x) => x.id === obs.resolucaoId);
  return r ? fotosDe(r) : [];
}

function ouvirFechamentos() {
  db.collection('fechamentos').orderBy('fechadoEm', 'desc').limit(60).onSnapshot((snapshot) => {
    estado.fechamentos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderizarListaFechamentos();
  });
}

function abrirModalEncerrarPeriodo() {
  const exportado = estado.ultimoExportado;
  const { vistorias, avulsas } = obterDadosFiltradosRelatorio();
  const resolvidasNoPeriodo = avulsas.filter((o) => o.status === 'resolvida');
  const abertasNoPeriodo = avulsas.filter((o) => o.status !== 'resolvida');

  const formatarBR = (v) => v ? v.split('-').reverse().join('/') : '';

  abrirModal('Encerrar período', `
    <div class="aviso-topo">
      Período: ${formatarBR(exportado.inicio) || 'início'} até ${formatarBR(exportado.fim) || 'hoje'}
    </div>

    <p style="font-size:0.88rem;line-height:1.55;margin:0 0 14px;">
      Ao encerrar, estes registros saem das telas do dia a dia e passam a constar
      apenas no histórico de encerramentos:
    </p>

    <div class="resumo-fechamento">
      <div class="linha-resumo-fechamento"><span>${vistorias.length}</span> vistoria(s) do período</div>
      <div class="linha-resumo-fechamento"><span>${resolvidasNoPeriodo.length}</span> observação(ões) já resolvida(s)</div>
    </div>

    <p style="font-size:0.88rem;line-height:1.55;margin:14px 0;">
      ${abertasNoPeriodo.length
        ? `<strong>${abertasNoPeriodo.length} observação(ões) continuam em aberto</strong> e seguem aparecendo normalmente, porque ainda exigem ação.`
        : 'Não há observações em aberto neste período.'}
    </p>

    <p style="font-size:0.85rem;color:var(--texto-suave);line-height:1.5;margin:0 0 16px;">
      Nada é apagado. As fotos são mantidas, apenas reduzidas para ocupar menos espaço,
      e continuam aparecendo no PDF do histórico. Os registros ficam guardados por ${RETENCAO_MESES} meses.
    </p>

    <div class="campo">
      <label for="fech-observacao">Anotação da reunião (opcional)</label>
      <textarea id="fech-observacao" placeholder="Ex.: aprovado na reunião de 29/09"></textarea>
    </div>

    <div id="progresso-fechamento" class="oculto" style="font-size:0.85rem;color:var(--texto-suave);margin-bottom:12px;"></div>
    <div id="erro-fechamento" class="erro-mensagem oculto"></div>
    <button type="button" class="botao-primario" id="confirmar-fechamento">Encerrar período</button>
  `);

  $('#confirmar-fechamento').addEventListener('click', async () => {
    const botao = $('#confirmar-fechamento');
    const progresso = $('#progresso-fechamento');
    botao.disabled = true;
    mostrar(progresso);

    try {
      const fechamentoRef = await db.collection('fechamentos').add({
        dataInicio: exportado.inicio || null,
        dataFim: exportado.fim || null,
        setorId: exportado.setorId || null,
        anotacao: $('#fech-observacao').value.trim() || null,
        fechadoPor: estado.usuario.nome,
        fechadoPorId: estado.usuario.uid,
        fechadoEm: firebase.firestore.Timestamp.now(),
        totalVistorias: vistorias.length,
        totalObservacoesResolvidas: resolvidasNoPeriodo.length
      });

      const alvos = [
        ...vistorias.map((v) => ({ colecao: 'vistorias', doc: v })),
        ...resolvidasNoPeriodo.map((o) => ({ colecao: 'observacoes', doc: o }))
      ];

      let feitos = 0;
      for (const alvo of alvos) {
        const fotos = fotosDe(alvo.doc);
        const dados = { fechamentoId: fechamentoRef.id };
        if (fotos.length) {
          dados.fotos = await Promise.all(fotos.map(recomprimirParaArquivo));
          dados.foto = null; // consolida no formato novo
        }
        await db.collection(alvo.colecao).doc(alvo.doc.id).update(dados);
        feitos++;
        progresso.textContent = `Arquivando ${feitos} de ${alvos.length}...`;
      }

      fecharModal();
    } catch (erro) {
      console.error(erro);
      mostrarErro($('#erro-fechamento'), 'Não foi possível encerrar. Confira se as regras do Firestore foram atualizadas e se seu cargo é Presidente.');
      botao.disabled = false;
      esconder(progresso);
    }
  });
}

function renderizarListaFechamentos() {
  const lista = $('#lista-fechamentos');
  if (!lista) return;

  if (!estado.fechamentos.length) {
    lista.innerHTML = '<p style="font-size:0.86rem;color:var(--texto-suave);">Nenhum período encerrado ainda.</p>';
    return;
  }

  const formatarBR = (v) => v ? v.split('-').reverse().join('/') : '';
  const limiteRetencao = new Date();
  limiteRetencao.setMonth(limiteRetencao.getMonth() - RETENCAO_MESES);

  lista.innerHTML = estado.fechamentos.map((f) => {
    const quando = f.fechadoEm ? formatarDataHora(f.fechadoEm) : { dataTexto: '', horaTexto: '' };
    const vencido = f.fechadoEm && f.fechadoEm.toDate() < limiteRetencao;
    return `
      <div class="item-fechamento">
        <div class="corpo-fechamento">
          <div class="titulo-fechamento">${formatarBR(f.dataInicio) || 'início'} a ${formatarBR(f.dataFim) || 'hoje'}</div>
          <div class="meta-fechamento">
            Encerrado em ${quando.dataTexto} por ${escaparHtml(f.fechadoPor || '')} ·
            ${f.totalVistorias || 0} vistoria(s), ${f.totalObservacoesResolvidas || 0} resolvida(s)
          </div>
          ${f.anotacao ? `<div class="meta-fechamento">${escaparHtml(f.anotacao)}</div>` : ''}
          ${vencido ? `<div class="meta-fechamento" style="color:var(--alerta-media);font-weight:600;">Passou dos ${RETENCAO_MESES} meses de guarda</div>` : ''}
        </div>
        <div class="acoes-fechamento">
          <button type="button" class="botao-texto" data-pdf-fechamento="${f.id}">Gerar PDF</button>
          <button type="button" class="botao-texto" data-mural-fechamento="${f.id}">Resumo do mural</button>
        </div>
      </div>
    `;
  }).join('');

  $$('[data-pdf-fechamento]').forEach((botao) => {
    botao.addEventListener('click', () => exportarRelatorioPDF({ fechamentoId: botao.dataset.pdfFechamento }));
  });

  $$('[data-mural-fechamento]').forEach((botao) => {
    botao.addEventListener('click', () => abrirModalMural(botao.dataset.muralFechamento));
  });
}

/* =========================================================
   RESUMO PARA O QUADRO DE AVISO

   A NR-5, no item 5.6.3.2, pede que as deliberacoes e os
   encaminhamentos das reunioes cheguem a todos os empregados,
   em quadro de aviso ou por meio eletronico. A ata completa
   fica com a comissao; para a equipe vai o resumo.

   E uma folha so, em letra grande, para ser lida de pe e a
   um metro de distancia. Nao leva nome de ninguem: o mural e
   sobre o que foi corrigido, nunca sobre quem apontou.
   ========================================================= */
// O "como foi resolvido" costuma ser um relato longo, bom para o
// relatorio e ruim para a parede. Aqui ele e cortado no fim da ultima
// frase que couber, para nao terminar no meio de uma palavra.
function resumirParaMural(texto, limite = 220) {
  const limpo = String(texto || '').replace(/\s+/g, ' ').trim();
  if (limpo.length <= limite) return limpo;
  const pedaco = limpo.slice(0, limite);
  const fim = Math.max(pedaco.lastIndexOf('. '), pedaco.lastIndexOf('; '));
  if (fim > limite * 0.5) return pedaco.slice(0, fim + 1);
  const espaco = pedaco.lastIndexOf(' ');
  return (espaco > 0 ? pedaco.slice(0, espaco) : pedaco) + '...';
}

/* ---------------------------------------------------------
   ESCOLHA DO QUE VAI PARA O MURAL

   O mural nao e o relatorio. Ele precisa caber numa folha e ser
   lido de passagem, entao quem monta escolhe os itens. O que
   ficar de fora e coberto pela frase final, que convida a
   procurar um membro da CIPA.
   --------------------------------------------------------- */

// Estimativa grosseira de quanto cada item ocupa na folha, em mm.
// Serve so para avisar quando a selecao passa de uma pagina; o
// desenho de verdade e feito pelo jsPDF na hora de gerar.
function alturaEstimadaMural(o, resolvido) {
  const porLinha = 95; // caracteres que cabem numa linha do mural
  const linhas = (texto, cpl) => Math.max(1, Math.ceil(String(texto || '').length / cpl));
  let mm = 5.5; // nome do setor
  mm += linhas(o.texto, porLinha) * 6.6;
  if (resolvido) {
    if (o.descricaoResolucao) mm += linhas(resumirParaMural(o.descricaoResolucao), 105) * 6;
    if (o.resolvidoPor || o.dataResolucao) mm += 5.5;
  }
  return mm + 4.5;
}

// Folha util de 236mm, menos a linha do periodo, as duas faixas de
// secao e o bloco de encerramento com a chamada final. Sobra isto
// para os itens. Medido comparando a estimativa com o PDF gerado.
const ALTURA_UTIL_MURAL = 158;

function itensDoMural(fechamentoId) {
  const idsVistorias = new Set(
    estado.vistorias.filter((v) => v.fechamentoId === fechamentoId).map((v) => v.id)
  );
  const resolvidas = estado.observacoes.filter((o) =>
    o.status === 'resolvida' &&
    (o.fechamentoId === fechamentoId || idsVistorias.has(o.vistoriaId))
  );
  const abertas = estado.observacoes.filter((o) => o.status !== 'resolvida');
  return { resolvidas, abertas };
}

function abrirModalMural(fechamentoId) {
  const fechamento = estado.fechamentos.find((f) => f.id === fechamentoId);
  if (!fechamento) return;
  const { resolvidas, abertas } = itensDoMural(fechamentoId);

  if (!resolvidas.length && !abertas.length) {
    abrirModal('Resumo do mural', '<p class="descricao-tipo-risco">Não há itens para montar o resumo deste período.</p>');
    return;
  }

  // Comeca com os mais recentes marcados ate encher uma folha, para
  // quem so quer gerar e imprimir nao ter que marcar nada.
  const selecionadas = new Set();
  let acumulado = 0;
  resolvidas.forEach((o) => {
    const h = alturaEstimadaMural(o, true);
    if (acumulado + h <= ALTURA_UTIL_MURAL * 0.62) { selecionadas.add(o.id); acumulado += h; }
  });
  abertas.forEach((o) => {
    const h = alturaEstimadaMural(o, false);
    if (acumulado + h <= ALTURA_UTIL_MURAL) { selecionadas.add(o.id); acumulado += h; }
  });

  // A estimativa acima e so um chute rapido para nao comecar vazio.
  // Aqui o chute e conferido montando o PDF, e vao saindo itens do
  // fim ate a selecao caber mesmo em uma folha.
  const ordemRetirada = [...abertas].reverse().concat([...resolvidas].reverse());
  for (let i = 0; i < ordemRetirada.length && selecionadas.size > 1; i++) {
    if (paginasDoMural(fechamentoId, selecionadas) <= 1) break;
    selecionadas.delete(ordemRetirada[i].id);
  }

  function linhaItem(o, resolvido) {
    const marcada = selecionadas.has(o.id);
    return `
      <button type="button" class="item-peticao ${marcada ? 'selecionada' : ''}" data-mural-item="${o.id}">
        <span class="caixa-marcar ${marcada ? 'marcada' : ''}">
          ${marcada ? '<svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg>' : ''}
        </span>
        <span class="corpo-peticao">
          <span class="texto-peticao">${escaparHtml(o.texto || '')}</span>
          <span class="meta-peticao">${escaparHtml(limparNomeSetor(o.setorNome) || 'Geral')}${resolvido && o.resolvidoPor ? ` · resolvido por ${escaparHtml(o.resolvidoPor)}` : ''}</span>
        </span>
      </button>
    `;
  }

  abrirModal('Resumo do mural', `
    <p class="descricao-tipo-risco">
      Escolha o que vai para o quadro de aviso. O que ficar de fora não some:
      o resumo termina dizendo que houve outros itens e convida a procurar a CIPA.
    </p>
    <div class="aviso-pagina-mural" id="aviso-pagina-mural"></div>

    ${resolvidas.length ? `<p class="rotulo-mural">Resolvidos no período (${resolvidas.length})</p>${resolvidas.map((o) => linhaItem(o, true)).join('')}` : ''}
    ${abertas.length ? `<p class="rotulo-mural">Em acompanhamento (${abertas.length})</p>${abertas.map((o) => linhaItem(o, false)).join('')}` : ''}

    <button type="button" class="botao-primario" id="botao-gerar-mural" style="margin-top:14px;">Gerar PDF do mural</button>
  `);

  let temporizadorAviso = null;
  function atualizarAviso() {
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => {
      // Conta as folhas montando o PDF de verdade em memoria. Estimar
      // por numero de linhas errava, porque o cabecalho, as faixas e a
      // chamada final tambem ocupam espaco.
      const paginas = paginasDoMural(fechamentoId, selecionadas);
      const aviso = $('#aviso-pagina-mural');
      if (!aviso) return;
      aviso.className = `aviso-pagina-mural ${paginas > 1 ? 'passou' : 'cabe'}`;
      aviso.textContent = paginas > 1
        ? `${selecionadas.size} selecionados, ${paginas} folhas. Desmarque alguns para caber em uma.`
        : `${selecionadas.size} selecionados. Cabe em uma folha.`;
    }, 180);
  }

  atualizarAviso();

  $('#raiz-modais').addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-mural-item]');
    if (botao) {
      const id = botao.dataset.muralItem;
      if (selecionadas.has(id)) selecionadas.delete(id); else selecionadas.add(id);
      botao.classList.toggle('selecionada');
      const caixa = botao.querySelector('.caixa-marcar');
      caixa.classList.toggle('marcada');
      caixa.innerHTML = selecionadas.has(id)
        ? '<svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg>'
        : '';
      atualizarAviso();
      return;
    }
    if (evento.target.id === 'botao-gerar-mural') {
      if (!selecionadas.size) {
        alert('Escolha pelo menos um item para o resumo.');
        return;
      }
      exportarMuralPDF(fechamentoId, selecionadas);
      fecharModal();
    }
  });
}

// Monta o PDF e devolve o documento, sem salvar. Assim a mesma
// montagem serve para gerar o arquivo e para contar quantas folhas
// a selecao ocupa, sem precisar estimar nada.
function montarMuralPDF(fechamentoId, selecionadas) {
  const fechamento = estado.fechamentos.find((f) => f.id === fechamentoId);
  if (!fechamento) return null;

  // Resolvidas do periodo: as avulsas arquivadas e tambem as que
  // estavam dentro das vistorias daquele encerramento.
  const idsVistoriasDoPeriodo = new Set(
    estado.vistorias.filter((v) => v.fechamentoId === fechamentoId).map((v) => v.id)
  );
  const todasResolvidas = estado.observacoes.filter((o) =>
    o.status === 'resolvida' &&
    (o.fechamentoId === fechamentoId || idsVistoriasDoPeriodo.has(o.vistoriaId))
  );

  // Em acompanhamento: o que continua em aberto hoje, que e o que
  // interessa a equipe saber que ainda esta sendo cobrado.
  const todasAbertas = estado.observacoes.filter((o) => o.status !== 'resolvida');

  // Sem selecao, vai tudo. Com selecao, so o escolhido, e o que
  // ficou de fora e anunciado na frase final.
  const escolheu = selecionadas && selecionadas.size;
  const resolvidas = escolheu ? todasResolvidas.filter((o) => selecionadas.has(o.id)) : todasResolvidas;
  const abertas = escolheu ? todasAbertas.filter((o) => selecionadas.has(o.id)) : todasAbertas;
  const deixadosDeFora = (todasResolvidas.length - resolvidas.length) + (todasAbertas.length - abertas.length);

  const formatarBR = (v) => v ? v.split('-').reverse().join('/') : '';

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const margem = 16;
    const largura = 178;
    const rodapeY = 282;
    let y = 0;

    const verde = [2, 139, 34];
    const ink = [11, 46, 18];
    const suave = [78, 107, 63];

    function novaPagina() {
      doc.addPage();
      y = 24;
    }
    function garantirEspaco(altura) {
      if (y + altura > rodapeY) novaPagina();
    }
    function escrever(texto, opcoes = {}) {
      const { tamanho = 12, estilo = 'normal', cor = ink, indent = 0, depois = 2 } = opcoes;
      doc.setFont('helvetica', estilo);
      doc.setFontSize(tamanho);
      doc.setTextColor(cor[0], cor[1], cor[2]);
      const linhas = doc.splitTextToSize(String(texto), largura - indent);
      linhas.forEach((linha) => {
        garantirEspaco(tamanho / 2.1);
        doc.text(linha, margem + indent, y);
        y += tamanho / 2.1 + 1.2;
      });
      y += depois;
    }
    function faixa(texto, cor) {
      garantirEspaco(14);
      doc.setFillColor(cor[0], cor[1], cor[2]);
      doc.roundedRect(margem, y - 6, largura, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(texto, margem + 4, y + 1);
      y += 12;
    }

    // Cabecalho
    doc.setFillColor(verde[0], verde[1], verde[2]);
    doc.rect(0, 0, 210, 34, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.setTextColor(255, 255, 255);
    doc.text('O QUE A CIPA FEZ NO PERÍODO', margem, 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(209, 232, 161);
    doc.text('Pão & Tradição  ·  Comissão Interna de Prevenção de Acidentes e de Assédio', margem, 25);
    y = 46;

    escrever(
      `Período de ${formatarBR(fechamento.dataInicio) || 'início'} a ${formatarBR(fechamento.dataFim) || 'hoje'}`,
      { tamanho: 12, estilo: 'bold', cor: suave, depois: 6 }
    );

    // Resolvidos
    faixa(`RESOLVIDO NESTE PERÍODO  (${resolvidas.length})`, verde);
    if (!resolvidas.length) {
      escrever('Nenhum item foi concluído neste período.', { tamanho: 11, cor: suave, depois: 6 });
    } else {
      resolvidas.forEach((o) => {
        garantirEspaco(16);
        doc.setFillColor(verde[0], verde[1], verde[2]);
        doc.circle(margem + 2, y - 1.4, 1.6, 'F');
        escrever(limparNomeSetor(o.setorNome || 'Geral').toUpperCase(), { tamanho: 10, estilo: 'bold', cor: verde, indent: 7, depois: 0.4 });
        escrever(o.texto || '', { tamanho: 11.5, indent: 7, depois: 1 });
        // O "como foi resolvido" e o que a equipe quer ler: e a prova
        // de que apontar deu em alguma coisa. Sem ele o mural vira so
        // uma lista de problemas antigos.
        if (o.descricaoResolucao) {
          escrever(resumirParaMural(o.descricaoResolucao), { tamanho: 10.5, cor: suave, indent: 7, depois: 1 });
        }
        const partes = [];
        if (o.resolvidoPor) partes.push(`Resolvido por ${o.resolvidoPor}`);
        if (o.dataResolucao) partes.push(`em ${formatarBR(o.dataResolucao)}`);
        if (partes.length) {
          escrever(partes.join(' '), { tamanho: 9.5, estilo: 'bold', cor: verde, indent: 7, depois: 4.5 });
        } else {
          y += 3;
        }
      });
    }

    y += 3;

    // Em acompanhamento
    faixa(`EM ACOMPANHAMENTO  (${abertas.length})`, [217, 116, 15]);
    if (!abertas.length) {
      escrever('Nenhum item em aberto no momento.', { tamanho: 11, cor: suave, depois: 6 });
    } else {
      abertas.forEach((o) => {
        garantirEspaco(14);
        doc.setFillColor(217, 116, 15);
        doc.circle(margem + 2, y - 1.4, 1.6, 'F');
        escrever(limparNomeSetor(o.setorNome || 'Geral').toUpperCase(), { tamanho: 10, estilo: 'bold', cor: suave, indent: 7, depois: 0.4 });
        escrever(o.texto || '', { tamanho: 11.5, indent: 7, depois: 4 });
      });
    }

    // Chamada final
    garantirEspaco(36);
    y += 2;
    doc.setDrawColor(227, 239, 201);
    doc.setLineWidth(0.5);
    doc.line(margem, y, margem + largura, y);
    y += 8;
    if (deixadosDeFora > 0) {
      escrever(`Entre outros. Para saber de todos os itens do período, procure um membro da CIPA.`,
        { tamanho: 11, estilo: 'italic', cor: suave, depois: 5 });
    }
    escrever('Viu um risco? Fale com qualquer membro da CIPA.', { tamanho: 13, estilo: 'bold', depois: 1.5 });
    escrever('Situação que pode machucar alguém não precisa esperar reunião. Casos de assédio devem ir pela Ouvidoria Interna, que tem tratamento sigiloso.', { tamanho: 10.5, cor: suave, depois: 0 });

    // Rodape em todas as paginas
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(suave[0], suave[1], suave[2]);
      doc.text('Divulgação das deliberações da CIPA, conforme item 5.6.3.2 da NR-5', margem, 290);
      doc.text(`${i}/${total}`, margem + largura, 290, { align: 'right' });
    }

    return doc;
  } catch (erro) {
    console.error('Não foi possível montar o resumo do mural:', erro);
    return null;
  }
}

function paginasDoMural(fechamentoId, selecionadas) {
  const doc = montarMuralPDF(fechamentoId, selecionadas);
  return doc ? doc.internal.getNumberOfPages() : 1;
}

function exportarMuralPDF(fechamentoId, selecionadas) {
  const fechamento = estado.fechamentos.find((f) => f.id === fechamentoId);
  const doc = montarMuralPDF(fechamentoId, selecionadas);
  if (!doc) {
    alert('Não foi possível gerar o resumo. Tente novamente.');
    return;
  }
  doc.save(`mural-cipa-${(fechamento && fechamento.dataFim) || 'periodo'}.pdf`);
}

async function exportarRelatorioPDF(opcoes) {
  // Com fechamentoId, o PDF é remontado a partir dos registros
  // arquivados daquele encerramento, em vez dos filtros da tela.
  const fechamentoId = opcoes && opcoes.fechamentoId;
  const fechamento = fechamentoId ? estado.fechamentos.find((f) => f.id === fechamentoId) : null;

  const botao = $('#botao-exportar-pdf');
  const textoOriginal = botao ? botao.textContent : '';
  if (botao && !fechamentoId) {
    botao.disabled = true;
    botao.textContent = 'Gerando PDF...';
  }

  try {
    const { jsPDF } = window.jspdf;
    // Retrato (A4), explícito. Este relatório é sempre vertical.
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const margem = 15;
    const largura = 180;
    const alturaPagina = 297;
    const rodapeY = 290;
    let y = 20;

    const corVerdeEscuro = [2, 139, 34];
    const corTextoSuave = [78, 107, 63];
    const corLinha = [227, 239, 201];
    const corInk = [11, 46, 18];

    function novaPagina() {
      doc.addPage();
      y = 20;
    }

    function garantirEspaco(altura) {
      if (y + altura > rodapeY - 6) novaPagina();
    }

    function escrever(texto, opcoes = {}) {
      const { tamanho = 9.5, estilo = 'normal', cor = corInk, indent = 0, espacoDepois = 1.2 } = opcoes;
      doc.setFont('helvetica', estilo);
      doc.setFontSize(tamanho);
      doc.setTextColor(cor[0], cor[1], cor[2]);
      const linhas = doc.splitTextToSize(String(texto), largura - indent);
      linhas.forEach((linhaTexto) => {
        garantirEspaco(tamanho / 2.4);
        doc.text(linhaTexto, margem + indent, y);
        y += tamanho / 2.4 + 0.9;
      });
      y += espacoDepois;
    }

    // Título de seção com uma faixa clara atrás, separa bem os
    // blocos ("REGISTROS AVULSOS" e cada setor) de forma organizada.
    function tituloSecao(texto, corTexto) {
      garantirEspaco(9);
      doc.setFillColor(238, 238, 234);
      doc.roundedRect(margem, y - 4.3, largura, 6.6, 1.3, 1.3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(corInk[0], corInk[1], corInk[2]);
      doc.text(texto, margem + 3, y);
      y += 6.2;
    }

    function linhaSeparadora() {
      doc.setDrawColor(corLinha[0], corLinha[1], corLinha[2]);
      doc.line(margem, y, margem + largura, y);
      y += 4;
    }

    // Desenha as fotos lado a lado, quebrando para a linha de baixo
    // quando não couberem na largura útil da página.
    function desenharFotosPdf(fotos, indent) {
      if (!fotos.length) return;
      const larguraFoto = 40;
      const alturaFoto = 30;
      const espaco = 3;
      const disponivel = largura - indent;
      const porLinha = Math.max(1, Math.floor((disponivel + espaco) / (larguraFoto + espaco)));

      for (let i = 0; i < fotos.length; i += porLinha) {
        const linha = fotos.slice(i, i + porLinha);
        garantirEspaco(alturaFoto + espaco);
        linha.forEach((foto, j) => {
          const x = margem + indent + j * (larguraFoto + espaco);
          try {
            doc.addImage(`data:image/jpeg;base64,${foto}`, 'JPEG', x, y, larguraFoto, alturaFoto);
          } catch (erroImg) {
            console.warn('Não foi possível incluir a foto no PDF:', erroImg);
          }
        });
        y += alturaFoto + espaco;
      }
    }

    function blocoObservacao(obs, indent) {
      garantirEspaco(16);
      const riscoTx = obs.tipoRisco && TIPOS_RISCO[obs.tipoRisco] ? `  ·  Risco: ${TIPOS_RISCO[obs.tipoRisco].nome}` : '';
      // Só a urgência alta recebe cor. As demais ficam em cinza para o
      // documento não virar um arco-íris e o vermelho ter peso real.
      const ehAlta = obs.urgencia === 'alta';
      escrever(`Urgência: ${obs.urgencia.toUpperCase()}${riscoTx}  ·  Status: ${textoStatusObs(obs)}`, {
        tamanho: 8.2, estilo: 'bold', cor: ehAlta ? corUrgenciaRgb('alta') : corTextoSuave, indent, espacoDepois: 0.9
      });
      escrever(obs.texto, { tamanho: 8.8, indent, cor: corInk, espacoDepois: 0.9 });

      desenharFotosPdf(fotosDe(obs), indent);

      if (obs.status === 'resolvida') {
        const dataRes = obs.dataResolucao ? formatarDataHora(obs.dataResolucao).dataTexto : '';
        escrever(`Resolvida por ${obs.resolvidoPor || ''} em ${dataRes}`, { tamanho: 8.2, cor: corTextoSuave, indent, estilo: 'italic', espacoDepois: 0.4 });
        if (obs.descricaoResolucao) {
          escrever(`Como foi resolvido: ${obs.descricaoResolucao}`, { tamanho: 8.2, cor: corTextoSuave, indent, estilo: 'italic', espacoDepois: 0.4 });
        }
        const fotosRes = fotosDaResolucao(obs);
        if (fotosRes.length) {
          escrever('Comprovação da resolução:', { tamanho: 8.2, cor: corTextoSuave, indent, estilo: 'bold', espacoDepois: 0.6 });
          desenharFotosPdf(fotosRes, indent);
        }
      }
      y += 2;
    }

    // Distribui "chips" (etiquetas coloridas) em linhas, quebrando para a
    // linha seguinte quando não cabe mais, usado no resumo executivo.
    function layoutChips(chips, xInicio, larguraDisponivel) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      const linhas = [];
      let linhaAtual = [];
      let xAtual = xInicio;
      chips.forEach((chip) => {
        const larguraChip = doc.getTextWidth(chip.texto) + 7;
        if (xAtual + larguraChip > xInicio + larguraDisponivel && linhaAtual.length) {
          linhas.push(linhaAtual);
          linhaAtual = [];
          xAtual = xInicio;
        }
        linhaAtual.push({ ...chip, x: xAtual, largura: larguraChip });
        xAtual += larguraChip + 4;
      });
      if (linhaAtual.length) linhas.push(linhaAtual);
      return linhas;
    }

    function desenharChips(linhas, yInicial) {
      const alturaLinha = 5;
      let yAtual = yInicial;
      linhas.forEach((linha) => {
        linha.forEach((chip) => {
          doc.setFillColor(chip.cor[0], chip.cor[1], chip.cor[2]);
          doc.roundedRect(chip.x, yAtual - alturaLinha + 1.4, chip.largura, alturaLinha, 1.6, 1.6, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.6);
          doc.setTextColor(255, 255, 255);
          doc.text(chip.texto, chip.x + 3, yAtual);
        });
        yAtual += alturaLinha + 1.6;
      });
      return yAtual;
    }

    function desenharResumoExecutivo(resumo) {
      if (resumo.total === 0) return;

      const linhaUrgencia = ['alta', 'media', 'baixa']
        .filter((u) => resumo.porUrgencia[u])
        .map((u) => `${resumo.porUrgencia[u]} ${u}`)
        .join('   ·   ');
      const linhaRisco = Object.entries(resumo.porRisco)
        .map(([chave, qtd]) => `${TIPOS_RISCO[chave].nome} ${qtd}`)
        .join('   ·   ');

      const numLinhas = 1 + (linhaUrgencia ? 1 : 0) + (linhaRisco ? 1 : 0);
      const alturaTotal = 4 + numLinhas * 4.6;

      garantirEspaco(alturaTotal + 5);
      doc.setFillColor(242, 242, 238);
      doc.roundedRect(margem, y - 3.5, largura, alturaTotal, 1.5, 1.5, 'F');

      let yTexto = y + 1;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.6);
      doc.setTextColor(corInk[0], corInk[1], corInk[2]);
      doc.text(`Resumo: ${resumo.total} ${resumo.total === 1 ? 'ocorrência no período' : 'ocorrências no período'}`, margem + 4, yTexto);
      yTexto += 4.6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.4);
      doc.setTextColor(corTextoSuave[0], corTextoSuave[1], corTextoSuave[2]);
      if (linhaUrgencia) {
        doc.text(`Urgência:   ${linhaUrgencia}`, margem + 4, yTexto);
        yTexto += 4.6;
      }
      if (linhaRisco) {
        doc.text(`Risco:   ${linhaRisco}`, margem + 4, yTexto);
      }

      y += alturaTotal + 5;
    }

    // ---------- Cabeçalho ----------
    doc.setFillColor(2, 139, 34);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('Relatório de Vistorias | CIPA', margem, 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(209, 232, 161);
    doc.text('Pão & Tradição', margem, 20);
    doc.text('Cuidado e segurança', margem, 25.5);
    y = 40;

    const agora = new Date();
    escrever(`Gerado em ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, { tamanho: 8.5, cor: corTextoSuave, espacoDepois: 0.6 });

    let { vistorias, avulsas, filtroSetor, filtroStatus, dataInicioValor, dataFimValor } = obterDadosFiltradosRelatorio();
    if (fechamento) {
      vistorias = estado.vistorias.filter((v) => v.fechamentoId === fechamentoId && !v.vinculadaA);
      avulsas = estado.observacoes.filter((o) => !o.vistoriaId && o.fechamentoId === fechamentoId);
      filtroSetor = fechamento.setorId || '';
      filtroStatus = '';
      dataInicioValor = fechamento.dataInicio || '';
      dataFimValor = fechamento.dataFim || '';
    }
    const nomeSetorFiltro = filtroSetor ? (estado.setores.find((s) => s.id === filtroSetor)?.nome || '') : null;
    const nomeStatusFiltro = filtroStatus === 'aberta' ? 'Só observações abertas' : filtroStatus === 'resolvida' ? 'Só observações resolvidas' : null;
    const formatarDataBR = (valor) => valor.split('-').reverse().join('/');
    const periodoTexto = (dataInicioValor || dataFimValor)
      ? `Período: ${dataInicioValor ? formatarDataBR(dataInicioValor) : 'início'} até ${dataFimValor ? formatarDataBR(dataFimValor) : 'hoje'}`
      : null;
    const partesFiltro = [nomeSetorFiltro, nomeStatusFiltro, periodoTexto].filter(Boolean);
    if (partesFiltro.length) {
      escrever(`Filtro aplicado: ${partesFiltro.join('  ·  ')}`, { tamanho: 8.5, cor: corTextoSuave });
      y += 1;
    }
    linhaSeparadora();

    if (vistorias.length === 0 && avulsas.length === 0) {
      escrever('Nenhum registro encontrado para este filtro.', { tamanho: 10 });
    }

    const observacoesRelevantes = obterObservacoesRelevantes(vistorias, avulsas, filtroStatus);
    desenharResumoExecutivo(calcularResumoObservacoes(observacoesRelevantes));

    if (avulsas.length) {
      const pendentes = avulsas.filter((o) => o.status !== 'resolvida');
      const resolvidas = avulsas.filter((o) => o.status === 'resolvida');

      // Cabeçalho de cada registro: a data fica em destaque à esquerda
      // e quem registrou à direita, para localizar rápido na reunião.
      function cabecalhoRegistroAvulso(obs) {
        garantirEspaco(18);
        const dataTx = obs.criadoEm ? formatarDataHora(obs.criadoEm).dataTexto : '';
        doc.setFillColor(246, 246, 243);
        doc.roundedRect(margem, y - 3.9, largura, 7, 1.2, 1.2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.2);
        doc.setTextColor(corInk[0], corInk[1], corInk[2]);
        doc.text(dataTx, margem + 3, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(corTextoSuave[0], corTextoSuave[1], corTextoSuave[2]);
        doc.text(autorDaObservacao(obs), margem + largura - 3, y, { align: 'right' });
        y += 7.2;
      }

      function secaoAvulsos(titulo, lista) {
        if (!lista.length) return;
        tituloSecao(titulo, corInk);
        agruparAvulsasPorSetorData(lista).forEach((grupo) => {
          garantirEspaco(16);
          // Nome do setor em destaque, com uma linha abaixo separando.
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10.5);
          doc.setTextColor(corInk[0], corInk[1], corInk[2]);
          doc.text(grupo.nome.toUpperCase(), margem, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.3);
          doc.setTextColor(corTextoSuave[0], corTextoSuave[1], corTextoSuave[2]);
          doc.text(`${grupo.total} ${grupo.total === 1 ? 'registro' : 'registros'}`, margem + largura, y, { align: 'right' });
          y += 1.8;
          doc.setDrawColor(190, 190, 185);
          doc.line(margem, y, margem + largura, y);
          y += 4.5;

          grupo.itens.forEach((obs, indice) => {
            cabecalhoRegistroAvulso(obs);
            blocoObservacao(obs, 3);
            if (indice < grupo.itens.length - 1) y += 2;
          });
          y += 3.5;
        });
      }

      secaoAvulsos('REGISTROS AVULSOS PENDENTES', pendentes);
      secaoAvulsos('REGISTROS AVULSOS RESOLVIDOS', resolvidas);
      linhaSeparadora();
    }

    const gruposVistorias = organizarVistoriasPorSetor(vistorias, filtroStatus)
      .map((grupo) => ({ ...grupo, itens: grupo.itens.filter((v) => !filtroStatus || grupo.infoPorVistoria.get(v.id).obs.length > 0) }))
      .filter((grupo) => grupo.itens.length > 0);

    if (gruposVistorias.length) {
      tituloSecao('VISTORIAS REALIZADAS NO PERÍODO', corVerdeEscuro);
      gruposVistorias.forEach((grupo) => {
        garantirEspaco(14);
        escrever(`${grupo.nome}: ${grupo.total} ${grupo.total === 1 ? 'vistoria' : 'vistorias'}${grupo.altaCount ? `, ${grupo.altaCount} observações de alta urgência` : ''}`, {
          tamanho: 9.3, estilo: 'bold', cor: corInk, espacoDepois: 2.5
        });

        grupo.itens.forEach((vistoria) => {
          garantirEspaco(20);
          const { dataTexto, horaTexto } = vistoria.criadoEm ? formatarDataHora(vistoria.criadoEm) : { dataTexto: '', horaTexto: '' };
          const cargoTx = vistoria.colaboradorCargo ? ` (${vistoria.colaboradorCargo})` : '';

          // Cabeçalho da vistoria com faixa clara, destacando data e
          // quem fiscalizou, que é a informação de referência na reunião.
          doc.setFillColor(246, 246, 243);
          doc.roundedRect(margem, y - 4, largura, 7.4, 1.3, 1.3, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.4);
          doc.setTextColor(corInk[0], corInk[1], corInk[2]);
          doc.text(`${dataTexto} às ${horaTexto}`, margem + 3, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.8);
          doc.setTextColor(corTextoSuave[0], corTextoSuave[1], corTextoSuave[2]);
          const nomesFiscais = fiscalizadoresDaVistoria(vistoria);
          const textoFiscal = nomesFiscais.length > 1
            ? `Fiscalizadores: ${textoFiscalizadores(vistoria)}`
            : `Fiscalizador: ${vistoria.colaboradorNome}${cargoTx}`;
          doc.text(textoFiscal, margem + largura - 3, y, { align: 'right' });
          y += 7.5;

          const itens = vistoria.itens || [];
          const conformes = itens.filter((i) => i.checado).length;
          const naoConformes = itens.filter((i) => !i.checado);

          if (itens.length) {
            escrever(`Checklist: ${conformes} de ${itens.length} conforme${conformes === 1 ? '' : 's'}`, {
              tamanho: 8.5, estilo: 'bold', cor: naoConformes.length ? corUrgenciaRgb('alta') : corInk, indent: 2, espacoDepois: naoConformes.length ? 1 : 0.5
            });

            // Só os itens reprovados aparecem em detalhe. Listar também
            // os aprovados enchia páginas inteiras sem nada acionável,
            // e a contagem acima já informa quantos passaram.
            naoConformes.forEach((item) => {
              garantirEspaco(6);
              doc.setDrawColor(200, 200, 200);
              doc.setFillColor(255, 255, 255);
              doc.roundedRect(margem + 4, y - 2.9, 3.1, 3.1, 0.6, 0.6, 'D');
              const riscoTx = item.tipoRisco && TIPOS_RISCO[item.tipoRisco] ? `   (risco ${TIPOS_RISCO[item.tipoRisco].nome})` : '';
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(8.5);
              doc.setTextColor(corInk[0], corInk[1], corInk[2]);
              const linhasItem = doc.splitTextToSize(`${item.texto}${riscoTx}`, largura - 12);
              linhasItem.forEach((l, i) => doc.text(l, margem + 10, y + (i * 3.3)));
              y += Math.max(3.3 * linhasItem.length, 4);
            });
            y += 1;
          }

          const obsDaVistoria = grupo.infoPorVistoria.get(vistoria.id).obs;
          if (obsDaVistoria.length) {
            escrever('Observações', { tamanho: 8.5, estilo: 'bold', cor: corInk, indent: 2, espacoDepois: 0.8 });
            obsDaVistoria.forEach((obs) => blocoObservacao(obs, 4));
          }

          y += 3;
        });
        y += 1.5;
      });
    }

    // ---------- Acidentes investigados no período ----------
    const acidentesPeriodo = estado.acidentes.filter((ac) => {
      if (!ac.dataOcorrido) return false;
      if (filtroSetor && ac.setorId !== filtroSetor) return false;
      const data = ac.dataOcorrido.toDate();
      if (dataInicioValor && data < new Date(`${dataInicioValor}T00:00:00`)) return false;
      if (dataFimValor && data > new Date(`${dataFimValor}T23:59:59`)) return false;
      return true;
    });

    if (acidentesPeriodo.length) {
      linhaSeparadora();
      tituloSecao('ACIDENTES INVESTIGADOS NO PERÍODO', corInk);

      acidentesPeriodo.forEach((ac) => {
        garantirEspaco(30);
        const { dataTexto, horaTexto } = formatarDataHora(ac.dataOcorrido);

        doc.setFillColor(246, 246, 243);
        doc.roundedRect(margem, y - 4, largura, 7.4, 1.3, 1.3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.4);
        doc.setTextColor(corInk[0], corInk[1], corInk[2]);
        doc.text(`${limparNomeSetor(ac.setorNome) || 'Geral'}   ${dataTexto} às ${horaTexto}`, margem + 3, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(corTextoSuave[0], corTextoSuave[1], corTextoSuave[2]);
        doc.text(TIPOS_ACIDENTE[ac.tipo] || '', margem + largura - 3, y, { align: 'right' });
        y += 7.5;

        escrever(ac.descricao || '', { tamanho: 8.8, indent: 2, cor: corInk, espacoDepois: 1 });

        const detalhes = [];
        if (ac.parteCorpo) detalhes.push(`Parte atingida: ${ac.parteCorpo}`);
        if (ac.agente) detalhes.push(`Agente: ${ac.agente}`);
        detalhes.push(ac.comAfastamento ? `Com afastamento${ac.diasAfastamento ? ` de ${ac.diasAfastamento} dia(s)` : ''}` : 'Sem afastamento');
        if (ac.numeroCat) detalhes.push(`CAT ${ac.numeroCat}`);
        escrever(detalhes.join('   ·   '), { tamanho: 8.2, indent: 2, cor: corTextoSuave, espacoDepois: 1.5 });

        desenharFotosPdf(fotosDe(ac), 2);

        const porques = (ac.porques || []).filter(Boolean);
        if (porques.length) {
          escrever('Análise dos 5 porquês', { tamanho: 8.5, estilo: 'bold', indent: 2, cor: corInk, espacoDepois: 1 });
          porques.forEach((p, i) => {
            escrever(`${i + 1}. ${p}`, { tamanho: 8.4, indent: 5, cor: corInk, espacoDepois: 0.5 });
          });
          y += 1;
        }

        if (ac.causaRaiz) {
          escrever(`Causa raiz: ${ac.causaRaiz}`, { tamanho: 8.6, estilo: 'bold', indent: 2, cor: corInk, espacoDepois: 1.5 });
        }

        const acoes = ac.acoes || [];
        if (acoes.length) {
          escrever('Ações corretivas', { tamanho: 8.5, estilo: 'bold', indent: 2, cor: corInk, espacoDepois: 1 });
          acoes.forEach((acao) => {
            garantirEspaco(7);
            const concluida = !!acao.concluida;
            doc.setDrawColor(concluida ? 67 : 200, concluida ? 176 : 200, concluida ? 50 : 200);
            doc.setFillColor(concluida ? 67 : 255, concluida ? 176 : 255, concluida ? 50 : 255);
            doc.roundedRect(margem + 5, y - 2.9, 3.1, 3.1, 0.6, 0.6, concluida ? 'FD' : 'D');
            if (concluida) {
              doc.setDrawColor(255, 255, 255);
              doc.setLineWidth(0.5);
              doc.line(margem + 5.5, y - 1.4, margem + 6.1, y - 0.7);
              doc.line(margem + 6.1, y - 0.7, margem + 7.7, y - 2.4);
              doc.setLineWidth(0.2);
            }
            const partes = [acao.texto];
            if (acao.responsavel) partes.push(`Responsável: ${acao.responsavel}`);
            if (acao.prazo) partes.push(`Prazo: ${acao.prazo.split('-').reverse().join('/')}`);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.4);
            doc.setTextColor(corInk[0], corInk[1], corInk[2]);
            const linhasAcao = doc.splitTextToSize(partes.join('   ·   '), largura - 14);
            linhasAcao.forEach((l, i) => doc.text(l, margem + 11, y + (i * 3.3)));
            y += Math.max(3.3 * linhasAcao.length, 4.2);
          });
        }

        y += 4;
      });
    }

    // ---------- Rodapé com numeração de página em todas as páginas ----------
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setDrawColor(corLinha[0], corLinha[1], corLinha[2]);
      doc.line(margem, rodapeY, margem + largura, rodapeY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(corTextoSuave[0], corTextoSuave[1], corTextoSuave[2]);
      doc.text('CIPA Vistoria | Pão & Tradição', margem, rodapeY + 5);
      doc.text(`Página ${i} de ${totalPaginas}`, margem + largura, rodapeY + 5, { align: 'right' });
    }

    const sufixo = fechamento ? 'historico' : agora.toISOString().slice(0, 10);
    doc.save(`relatorio-cipa-${sufixo}.pdf`);

    // Guarda o período exportado para liberar o encerramento na tela.
    if (!fechamento) {
      estado.ultimoExportado = { inicio: dataInicioValor, fim: dataFimValor, setorId: filtroSetor };
      atualizarBotaoEncerrar();
    }
  } catch (erro) {
    console.error(erro);
    alert('Não foi possível gerar o PDF agora. Tente novamente.');
  } finally {
    if (botao && !fechamentoId) {
      botao.disabled = false;
      botao.textContent = textoOriginal;
    }
  }
}

$('#botao-exportar-pdf').addEventListener('click', () => exportarRelatorioPDF());

// O encerramento só aparece para o Presidente e só depois de o PDF
// daquele mesmo período ter sido exportado, para não encerrar nada
// que ainda não foi levado para a reunião.
function atualizarBotaoEncerrar() {
  const botao = $('#botao-encerrar-periodo');
  if (!botao) return;
  const exportado = estado.ultimoExportado;
  const mesmoFiltro = exportado
    && exportado.inicio === $('#filtro-data-inicio').value
    && exportado.fim === $('#filtro-data-fim').value
    && exportado.setorId === $('#filtro-setor-relatorio').value;
  botao.classList.toggle('oculto', !(ehPresidente() && mesmoFiltro));
}

$('#botao-encerrar-periodo').addEventListener('click', abrirModalEncerrarPeriodo);

/* =========================================================
   INSTALAR APP
   ========================================================= */
let promptInstalacaoAdiado = null;

function estaEmModoStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function ehIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function mostrarBotoesInstalar() {
  if (estaEmModoStandalone()) return;
  $$('.botao-instalar-app').forEach(mostrar);
}

function esconderBotoesInstalar() {
  $$('.botao-instalar-app').forEach(esconder);
}

window.addEventListener('beforeinstallprompt', (evento) => {
  evento.preventDefault();
  promptInstalacaoAdiado = evento;
  mostrarBotoesInstalar();
});

window.addEventListener('appinstalled', () => {
  promptInstalacaoAdiado = null;
  esconderBotoesInstalar();
});

// No iOS não existe evento de instalação automática; se o navegador é
// Safari/iOS e o app ainda não está instalado, mostramos o botão do
// mesmo jeito e explicamos o passo a passo ao tocar nele.
if (ehIOS() && !estaEmModoStandalone()) {
  mostrarBotoesInstalar();
}

async function clicarInstalarApp() {
  if (promptInstalacaoAdiado) {
    promptInstalacaoAdiado.prompt();
    const resultado = await promptInstalacaoAdiado.userChoice;
    if (resultado.outcome === 'accepted') esconderBotoesInstalar();
    promptInstalacaoAdiado = null;
    return;
  }

  if (ehIOS()) {
    abrirModal('Instalar o app', `
      <p style="font-size:0.92rem;line-height:1.6;">
        No Safari, toque no ícone de compartilhar
        <svg viewBox="0 0 24 24" width="16" height="16" style="display:inline;vertical-align:-3px;stroke:var(--verde-800);stroke-width:2;fill:none;"><path d="M12 3v13m-5-8l5-5 5 5M5 21h14"/></svg>
        na barra do navegador e escolha <strong>"Adicionar à Tela de Início"</strong>.
      </p>
    `);
    return;
  }

  abrirModal('Instalar o app', `
    <p style="font-size:0.92rem;line-height:1.6;">Abra o menu do navegador (geralmente os três pontinhos) e procure a opção <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</p>
  `);
}

$$('.botao-instalar-app').forEach((botao) => botao.addEventListener('click', clicarInstalarApp));

/* =========================================================
   INICIALIZAÇÃO DO SERVICE WORKER
   ========================================================= */
if ('serviceWorker' in navigator) {
  // Só é uma atualização de verdade se a aba já tinha um service worker
  // no controle antes. Na primeiríssima visita isso também dispara o
  // evento abaixo, mas não é uma atualização, é só o primeiro controle.
  const tinhaControladorAntes = !!navigator.serviceWorker.controller;

  window.addEventListener('load', () => {
    // updateViaCache 'none' impede que o PROPRIO service-worker.js venha
    // do cache do navegador. Sem isso ele podia ficar ate 10 minutos sem
    // sequer perceber que existe uma versao nova publicada.
    navigator.serviceWorker.register('service-worker.js', { updateViaCache: 'none' })
      .then((registro) => {
        registro.update();
        // Um app instalado pode ficar dias aberto sem nenhuma navegacao.
        // Toda vez que a pessoa volta para ele, perguntamos se ha versao
        // nova, em vez de esperar que o navegador resolva sozinho.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') registro.update();
        });
      })
      .catch((erro) => {
        console.warn('Não foi possível registrar o service worker:', erro);
      });
  });

  // Quando uma versão nova do app assume o controle (depois de eu
  // publicar uma atualização), a página recarrega sozinha em vez de
  // deixar a pessoa presa numa versão antiga sem saber por quê.
  //
  // A trava usa sessionStorage (não uma variável comum) porque uma
  // variável comum reseta a zero a cada recarregamento. Se algo fizer
  // o navegador trocar de "controlador" mais de uma vez em sequência
  // (rede instável, por exemplo), isso causaria um recarregamento atrás
  // do outro sem parar, travando a aba em "carregando" para sempre.
  // Com sessionStorage, no máximo um recarregamento acontece por sessão.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!tinhaControladorAntes) return;
    if (sessionStorage.getItem('cipaSwAtualizado')) return;
    sessionStorage.setItem('cipaSwAtualizado', '1');
    mostrarAvisoNovaVersao();
    setTimeout(() => window.location.reload(), 1200);
  });
}

function mostrarAvisoNovaVersao() {
  const aviso = document.createElement('div');
  aviso.className = 'aviso-nova-versao';
  aviso.textContent = 'Atualizando para a versão mais recente...';
  document.body.appendChild(aviso);
}
