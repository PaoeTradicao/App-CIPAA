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

// Agrupa os registros avulsos por setor (ordem alfabética dos setores) e,
// dentro de cada setor, ordena por urgência (alta → média → baixa) e
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

function mostrar(elemento) { elemento.classList.remove('oculto'); }
function esconder(elemento) { elemento.classList.add('oculto'); }

function formatarDataHora(data) {
  const d = data instanceof Date ? data : data.toDate();
  const dataTexto = d.toLocaleDateString('pt-BR');
  const horaTexto = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return { dataTexto, horaTexto, d };
}

function iniciaisDoNome(nome) {
  const partes = nome.trim().split(/\s+/);
  const iniciais = partes.length > 1
    ? partes[0][0] + partes[partes.length - 1][0]
    : partes[0].slice(0, 2);
  return iniciais.toUpperCase();
}

function limparErro(elemento) {
  elemento.textContent = '';
  esconder(elemento);
}

function mostrarErro(elemento, mensagem) {
  elemento.textContent = mensagem;
  mostrar(elemento);
}

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
    container.title = 'Sem conexão — as vistorias são sincronizadas assim que a internet voltar.';
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
// sozinho via onAuthStateChanged — aqui só capturamos erros do processo.
auth.getRedirectResult().catch((erro) => {
  if (erro && erro.code && erro.code !== 'auth/no-auth-event') {
    console.error('Erro no retorno do login com Google:', erro);
    mostrarErro($('#erro-login'), 'Não foi possível concluir o login com o Google.');
  }
});

$('#botao-sair').addEventListener('click', () => auth.signOut());

$('#botao-tipos-risco').addEventListener('click', () => {
  const conteudo = Object.values(TIPOS_RISCO).map((tipo) => `
    <div class="cartao-tipo-risco">
      <div class="cabecalho-tipo-risco">
        <span class="selo-risco-grande" style="background:${tipo.cor}"></span>
        <span class="nome-tipo-risco">${tipo.nome}</span>
      </div>
      <p class="descricao-tipo-risco">${tipo.descricao}</p>
      <p class="exemplos-tipo-risco"><strong>Exemplos:</strong> ${tipo.exemplos}</p>
    </div>
  `).join('');
  abrirModal('Tipos de risco (mapa de risco)', conteudo);
});

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
  preencherPerfil();
  atualizarStatusConexao();
  ouvirSetores();
  ouvirRelatorio();
}

function sairDoApp() {
  esconder($('#topo-app'));
  esconder($('#app-principal'));
  esconder($('#nav-tabs'));
  mostrar($('#tela-auth'));
  $('#form-login').reset();
  $('#form-cadastro').reset();
  esconder($('#form-cadastro'));
  mostrar($('#form-login'));
}

function preencherPerfil() {
  $('#perfil-nome-completo').textContent = estado.usuario.nome;
  $('#perfil-cargo-atual').textContent = estado.usuario.cargo;
  $('#avatar-iniciais').textContent = iniciaisDoNome(estado.usuario.nome);
}

/* =========================================================
   NAVEGAÇÃO ENTRE ABAS
   ========================================================= */
const telas = {
  vistoriar: $('#tela-vistoriar'),
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

function fabSetores() {
  if (estado.telaAtual !== 'setores') return;
  abrirModalSetor(null);
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

/* Botão flutuante de "novo setor": criado dinamicamente só quando a aba está visível */
const observadorTelaSetores = new MutationObserver(() => {
  const existeFab = $('#fab-novo-setor');
  if (estado.telaAtual === 'setores' && !existeFab) {
    const fab = document.createElement('button');
    fab.id = 'fab-novo-setor';
    fab.className = 'fab';
    fab.setAttribute('aria-label', 'Novo setor');
    fab.textContent = '+';
    fab.addEventListener('click', fabSetores);
    document.body.appendChild(fab);
  } else if (estado.telaAtual !== 'setores' && existeFab) {
    existeFab.remove();
  }
});
observadorTelaSetores.observe($('#tela-setores'), { attributes: true, attributeFilter: ['class'] });

$$('.tab-item').forEach((botao) => {
  botao.addEventListener('click', () => {
    const existeFab = $('#fab-novo-setor');
    if (botao.dataset.tela === 'setores' && !existeFab) {
      const fab = document.createElement('button');
      fab.id = 'fab-novo-setor';
      fab.className = 'fab';
      fab.setAttribute('aria-label', 'Novo setor');
      fab.textContent = '+';
      fab.addEventListener('click', fabSetores);
      document.body.appendChild(fab);
    } else if (botao.dataset.tela !== 'setores' && existeFab) {
      existeFab.remove();
    }
  });
});

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
  // caso contrário, volta ao estado de espera — nunca escolhe um setor
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
    <button type="button" class="botao-primario" id="modal-salvar-observacao" style="margin-top:8px;">Adicionar observação</button>
  `);

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
    estado.vistoriaEmAndamento.observacoes.push({ texto, urgencia: urgenciaSelecionada, tipoRisco });
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

$('#botao-registro-rapido').addEventListener('click', abrirModalRegistroRapido);

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
    <button type="button" class="botao-primario" id="rapido-salvar">Registrar</button>
  `);

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
   RELATÓRIO
   ========================================================= */
function ouvirRelatorio() {
  db.collection('vistorias').orderBy('criadoEm', 'desc').limit(200).onSnapshot((snapshot) => {
    estado.vistorias = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderizarRelatorio();
  });
  db.collection('observacoes').orderBy('criadoEm', 'desc').limit(500).onSnapshot((snapshot) => {
    estado.observacoes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderizarRelatorio();
  });
}

function renderizarFiltroSetorRelatorio() {
  const select = $('#filtro-setor-relatorio');
  const valorAtual = select.value;
  select.innerHTML = '<option value="">Todos os setores</option>' +
    estado.setores.map((s) => `<option value="${s.id}">${escaparHtml(limparNomeSetor(s.nome))}</option>`).join('');
  select.value = valorAtual;
}

$('#filtro-setor-relatorio').addEventListener('change', renderizarRelatorio);
$('#filtro-status-relatorio').addEventListener('change', renderizarRelatorio);
$('#filtro-data-inicio').addEventListener('change', renderizarRelatorio);
$('#filtro-data-fim').addEventListener('change', renderizarRelatorio);
$('#botao-limpar-periodo').addEventListener('click', () => {
  $('#filtro-data-inicio').value = '';
  $('#filtro-data-fim').value = '';
  renderizarRelatorio();
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

  let vistorias = estado.vistorias.filter((v) => dentroDoPeriodo(v.criadoEm));
  if (filtroSetor) vistorias = vistorias.filter((v) => v.setorId === filtroSetor);

  let avulsas = estado.observacoes.filter((o) => !o.vistoriaId && dentroDoPeriodo(o.criadoEm));
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
  const { dataTexto, horaTexto } = vistoria.criadoEm ? formatarDataHora(vistoria.criadoEm) : { dataTexto: '—', horaTexto: '—' };
  const itens = vistoria.itens || [];
  const conformes = itens.filter((i) => i.checado).length;
  const naoConformes = itens.length - conformes;

  return `
    <div class="registro-vistoria">
      <button type="button" class="cabecalho-registro" data-abrir-registro="${vistoria.id}" style="width:100%;text-align:left;">
        <div>
          <div class="info-principal">${escaparHtml(limparNomeSetor(vistoria.setorNome))}</div>
          <div class="meta-registro">${dataTexto} ${horaTexto} · ${escaparHtml(vistoria.colaboradorNome)}</div>
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
      </div>
    </div>
  `;
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
      <p class="subtotal-setor">${escaparHtml(grupo.nome)} — ${grupo.total} ${grupo.total === 1 ? 'registro' : 'registros'}${grupo.altaCount ? `, sendo ${grupo.altaCount} de alta urgência` : ''}</p>
      ${grupo.itens.map((obs) => renderizarCardAvulso(obs)).join('')}
    </div>
  `).join('') : '<p style="font-size:0.9rem;color:var(--texto-suave);text-align:center;padding:30px 0;">Nenhum registro avulso encontrado.</p>';

  const blocoVistorias = gruposVistorias.length ? gruposVistorias.map((grupo) => `
    <div class="grupo-setor-relatorio">
      <p class="subtotal-setor">${escaparHtml(grupo.nome)} — ${grupo.total} ${grupo.total === 1 ? 'vistoria' : 'vistorias'}${grupo.altaCount ? `, ${grupo.altaCount} observações de alta urgência` : ''}</p>
      ${grupo.itens.map((vistoria) => renderizarCardVistoria(vistoria, grupo.infoPorVistoria.get(vistoria.id).obs)).join('')}
    </div>
  `).join('') : '<p style="font-size:0.9rem;color:var(--texto-suave);text-align:center;padding:30px 0;">Nenhuma vistoria com checklist encontrada.</p>';

  lista.innerHTML = estado.subAbaRelatorio === 'avulsos' ? blocoAvulsas : blocoVistorias;

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
}

function renderizarCardAvulso(obs) {
  const resolvida = obs.status === 'resolvida';
  const dataTx = obs.criadoEm ? formatarDataHora(obs.criadoEm).dataTexto : '—';
  return `
    <div class="registro-avulso">
      <div class="cabecalho-avulso">
        <div>
          <div class="info-principal">${escaparHtml(limparNomeSetor(obs.setorNome) || 'Geral')}</div>
          <div class="meta-registro">${dataTx} · ${escaparHtml(obs.criadoPor || '')}</div>
        </div>
        <span class="etiqueta-status ${resolvida ? 'resolvida' : 'aberta'}">${resolvida ? 'resolvida' : 'aberta'}</span>
      </div>
      <div class="corpo-avulso">
        <div style="display:flex;align-items:center;gap:7px;margin-bottom:9px;">
          ${obs.tipoRisco ? seloTipoRisco(obs.tipoRisco) : ''}
          <span class="etiqueta-urgencia ${obs.urgencia}">${obs.urgencia}</span>
        </div>
        <p class="texto-obs">${escaparHtml(obs.texto)}</p>
        ${resolvida
          ? `<div class="resolucao-info">Resolvida por ${escaparHtml(obs.resolvidoPor)} em ${obs.dataResolucao ? formatarDataHora(obs.dataResolucao).dataTexto : ''}${obs.descricaoResolucao ? `<br/>${escaparHtml(obs.descricaoResolucao)}` : ''}</div>`
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
      ${resolvida
        ? `<div class="resolucao-info">Resolvida por ${escaparHtml(obs.resolvidoPor)} em ${dataResolucao}${obs.descricaoResolucao ? `<br/>${escaparHtml(obs.descricaoResolucao)}` : ''}</div>`
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
      // Só os campos de conteúdo mudam — vistoriaId, criadoPor e criadoEm
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

async function exportarRelatorioPDF() {
  const botao = $('#botao-exportar-pdf');
  const textoOriginal = botao.textContent;
  botao.disabled = true;
  botao.textContent = 'Gerando PDF...';

  try {
    const { jsPDF } = window.jspdf;
    // Retrato (A4), explícito — este relatório é sempre vertical.
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

    // Título de seção com uma faixa clara atrás — separa bem os
    // blocos ("REGISTROS AVULSOS" e cada setor) de forma organizada.
    function tituloSecao(texto, corTexto) {
      garantirEspaco(9);
      doc.setFillColor(245, 250, 209);
      doc.roundedRect(margem, y - 4.3, largura, 6.6, 1.3, 1.3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
      doc.text(texto, margem + 3, y);
      y += 6.2;
    }

    function linhaSeparadora() {
      doc.setDrawColor(corLinha[0], corLinha[1], corLinha[2]);
      doc.line(margem, y, margem + largura, y);
      y += 4;
    }

    function blocoObservacao(obs, indent) {
      garantirEspaco(16);
      const riscoTx = obs.tipoRisco && TIPOS_RISCO[obs.tipoRisco] ? `  ·  Risco: ${TIPOS_RISCO[obs.tipoRisco].nome}` : '';
      escrever(`Urgência: ${obs.urgencia.toUpperCase()}${riscoTx}  ·  Status: ${textoStatusObs(obs)}`, {
        tamanho: 8.2, estilo: 'bold', cor: corUrgenciaRgb(obs.urgencia), indent, espacoDepois: 0.9
      });
      escrever(obs.texto, { tamanho: 8.8, indent, cor: corInk, espacoDepois: 0.9 });
      if (obs.status === 'resolvida') {
        const dataRes = obs.dataResolucao ? formatarDataHora(obs.dataResolucao).dataTexto : '';
        escrever(`Resolvida por ${obs.resolvidoPor || ''} em ${dataRes}`, { tamanho: 8.2, cor: corTextoSuave, indent, estilo: 'italic', espacoDepois: 0.4 });
        if (obs.descricaoResolucao) {
          escrever(`Como foi resolvido: ${obs.descricaoResolucao}`, { tamanho: 8.2, cor: corTextoSuave, indent, estilo: 'italic', espacoDepois: 0.4 });
        }
      }
      y += 2;
    }

    // Distribui "chips" (etiquetas coloridas) em linhas, quebrando para a
    // linha seguinte quando não cabe mais — usado no resumo executivo.
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
      const alturaLinha = 5.4;
      let yAtual = yInicial;
      linhas.forEach((linha) => {
        linha.forEach((chip) => {
          doc.setFillColor(chip.cor[0], chip.cor[1], chip.cor[2]);
          doc.roundedRect(chip.x, yAtual - alturaLinha + 1.5, chip.largura, alturaLinha, 1.8, 1.8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.8);
          doc.setTextColor(255, 255, 255);
          doc.text(chip.texto, chip.x + 3.2, yAtual);
        });
        yAtual += alturaLinha + 2.2;
      });
      return yAtual;
    }

    function desenharResumoExecutivo(resumo) {
      if (resumo.total === 0) return;
      const chipsUrgencia = ['alta', 'media', 'baixa']
        .filter((u) => resumo.porUrgencia[u])
        .map((u) => ({ texto: `${resumo.porUrgencia[u]} ${u}`, cor: corUrgenciaRgb(u) }));
      const chipsRisco = Object.entries(resumo.porRisco).map(([chave, qtd]) => ({
        texto: `${TIPOS_RISCO[chave].nome}: ${qtd}`, cor: hexParaRgb(TIPOS_RISCO[chave].cor)
      }));

      const larguraInterna = largura - 8;
      const linhasUrg = layoutChips(chipsUrgencia, margem + 4, larguraInterna);
      const linhasRisco = chipsRisco.length ? layoutChips(chipsRisco, margem + 4, larguraInterna) : [];
      const alturaTitulo = 9;
      const alturaChipsUrg = linhasUrg.length * 7.6;
      const alturaChipsRisco = linhasRisco.length ? linhasRisco.length * 7.6 : 0;
      const alturaTotal = alturaTitulo + alturaChipsUrg + alturaChipsRisco + 5;

      garantirEspaco(alturaTotal + 6);
      doc.setFillColor(245, 250, 209);
      doc.roundedRect(margem, y - 4, largura, alturaTotal, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(corInk[0], corInk[1], corInk[2]);
      doc.text(`Resumo: ${resumo.total} ${resumo.total === 1 ? 'ocorrência no período' : 'ocorrências no período'}`, margem + 4, y + 2);

      let yChips = y + 2 + alturaTitulo;
      yChips = desenharChips(linhasUrg, yChips);
      if (linhasRisco.length) yChips = desenharChips(linhasRisco, yChips);

      y += alturaTotal + 6;
    }

    // ---------- Cabeçalho ----------
    doc.setFillColor(2, 139, 34);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('Relatório de Vistorias — CIPA', margem, 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(209, 232, 161);
    doc.text('Pão & Tradição', margem, 20);
    doc.text('Cuidado e segurança', margem, 25.5);
    y = 40;

    const agora = new Date();
    escrever(`Gerado em ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, { tamanho: 8.5, cor: corTextoSuave, espacoDepois: 0.6 });

    const { vistorias, avulsas, filtroSetor, filtroStatus, dataInicioValor, dataFimValor } = obterDadosFiltradosRelatorio();
    const nomeSetorFiltro = filtroSetor ? (estado.setores.find((s) => s.id === filtroSetor)?.nome || '') : 'Todos os setores';
    const nomeStatusFiltro = filtroStatus === 'aberta' ? 'Só observações abertas' : filtroStatus === 'resolvida' ? 'Só observações resolvidas' : 'Todas as observações';
    const formatarDataBR = (valor) => valor.split('-').reverse().join('/');
    const periodoTexto = (dataInicioValor || dataFimValor)
      ? `Período: ${dataInicioValor ? formatarDataBR(dataInicioValor) : 'início'} até ${dataFimValor ? formatarDataBR(dataFimValor) : 'hoje'}`
      : null;
    escrever(`Filtro aplicado: ${nomeSetorFiltro}  ·  ${nomeStatusFiltro}${periodoTexto ? '  ·  ' + periodoTexto : ''}`, { tamanho: 8.5, cor: corTextoSuave });
    y += 1;
    linhaSeparadora();

    if (vistorias.length === 0 && avulsas.length === 0) {
      escrever('Nenhum registro encontrado para este filtro.', { tamanho: 10 });
    }

    const observacoesRelevantes = obterObservacoesRelevantes(vistorias, avulsas, filtroStatus);
    desenharResumoExecutivo(calcularResumoObservacoes(observacoesRelevantes));

    if (avulsas.length) {
      tituloSecao('REGISTROS AVULSOS', corVerdeEscuro);
      const gruposAvulsos = organizarAvulsasPorSetor(avulsas);
      gruposAvulsos.forEach((grupo) => {
        garantirEspaco(14);
        escrever(`${grupo.nome} — ${grupo.total} ${grupo.total === 1 ? 'registro' : 'registros'}${grupo.altaCount ? `, sendo ${grupo.altaCount} de alta urgência` : ''}`, {
          tamanho: 9.3, estilo: 'bold', cor: corVerdeEscuro, espacoDepois: 2
        });
        grupo.itens.forEach((obs, indice) => {
          garantirEspaco(20);
          const dataTx = obs.criadoEm ? formatarDataHora(obs.criadoEm).dataTexto : '—';
          escrever(`${dataTx}   ·   ${obs.criadoPor || ''}`, { tamanho: 8.8, estilo: 'bold', espacoDepois: 0.8 });
          blocoObservacao(obs, 3);
          if (indice < grupo.itens.length - 1) {
            y += 1.5;
            doc.setDrawColor(240, 240, 230);
            doc.line(margem, y, margem + largura, y);
            y += 4.5;
          }
        });
        y += 3;
      });
      linhaSeparadora();
    }

    const gruposVistorias = organizarVistoriasPorSetor(vistorias, filtroStatus)
      .map((grupo) => ({ ...grupo, itens: grupo.itens.filter((v) => !filtroStatus || grupo.infoPorVistoria.get(v.id).obs.length > 0) }))
      .filter((grupo) => grupo.itens.length > 0);

    if (gruposVistorias.length) {
      tituloSecao('VISTORIAS COM CHECKLIST', corVerdeEscuro);
      gruposVistorias.forEach((grupo) => {
        garantirEspaco(14);
        escrever(`${grupo.nome} — ${grupo.total} ${grupo.total === 1 ? 'vistoria' : 'vistorias'}${grupo.altaCount ? `, ${grupo.altaCount} observações de alta urgência` : ''}`, {
          tamanho: 9.3, estilo: 'bold', cor: corVerdeEscuro, espacoDepois: 2
        });

        grupo.itens.forEach((vistoria) => {
          garantirEspaco(24);
          const { dataTexto, horaTexto } = vistoria.criadoEm ? formatarDataHora(vistoria.criadoEm) : { dataTexto: '—', horaTexto: '—' };
          const cargoTx = vistoria.colaboradorCargo ? ` (${vistoria.colaboradorCargo})` : '';
          escrever(`${dataTexto} às ${horaTexto}   ·   ${vistoria.colaboradorNome}${cargoTx}`, { tamanho: 8.8, estilo: 'bold', espacoDepois: 0.6 });

          const itens = vistoria.itens || [];
          const conformes = itens.filter((i) => i.checado).length;
          const naoConformes = itens.length - conformes;
          if (itens.length) {
            escrever(`Checklist — ${conformes} conforme${conformes === 1 ? '' : 's'} · ${naoConformes} não conforme${naoConformes === 1 ? '' : 's'}`, {
              tamanho: 8.6, estilo: 'bold', cor: corInk, espacoDepois: 1
            });
            itens.forEach((item) => {
              garantirEspaco(6);
              const concluido = !!item.checado;
              doc.setDrawColor(concluido ? 67 : 200, concluido ? 176 : 200, concluido ? 50 : 200);
              doc.setFillColor(concluido ? 67 : 255, concluido ? 176 : 255, concluido ? 50 : 255);
              doc.roundedRect(margem + 2, y - 2.9, 3.1, 3.1, 0.6, 0.6, concluido ? 'FD' : 'D');
              if (concluido) {
                doc.setDrawColor(255, 255, 255);
                doc.setLineWidth(0.5);
                doc.line(margem + 2.5, y - 1.4, margem + 3.1, y - 0.7);
                doc.line(margem + 3.1, y - 0.7, margem + 4.7, y - 2.4);
                doc.setLineWidth(0.2);
              }
              const riscoTx = item.tipoRisco && TIPOS_RISCO[item.tipoRisco] ? `   (risco ${TIPOS_RISCO[item.tipoRisco].nome})` : '';
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(8.6);
              doc.setTextColor(corInk[0], corInk[1], corInk[2]);
              const linhasItem = doc.splitTextToSize(`${item.texto}${riscoTx}`, largura - 10);
              linhasItem.forEach((l, i) => doc.text(l, margem + 8, y + (i * 3.4)));
              y += Math.max(3.4 * linhasItem.length, 4.2);
            });
            y += 1.2;
          }

          const obsDaVistoria = grupo.infoPorVistoria.get(vistoria.id).obs;
          if (obsDaVistoria.length) {
            escrever('Observações', { tamanho: 8.6, estilo: 'bold', cor: corInk, espacoDepois: 0.8 });
            obsDaVistoria.forEach((obs) => blocoObservacao(obs, 3));
          }

          y += 1.5;
          doc.setDrawColor(240, 240, 230);
          doc.line(margem, y, margem + largura, y);
          y += 4.5;
        });
        y += 1;
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
      doc.text('CIPA Vistoria — Pão & Tradição', margem, rodapeY + 5);
      doc.text(`Página ${i} de ${totalPaginas}`, margem + largura, rodapeY + 5, { align: 'right' });
    }

    const nomeArquivo = `relatorio-cipa-${agora.toISOString().slice(0, 10)}.pdf`;
    doc.save(nomeArquivo);
  } catch (erro) {
    console.error(erro);
    alert('Não foi possível gerar o PDF agora. Tente novamente.');
  } finally {
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }
}

$('#botao-exportar-pdf').addEventListener('click', exportarRelatorioPDF);

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
  // evento abaixo, mas não é uma atualização — é só o primeiro controle.
  const tinhaControladorAntes = !!navigator.serviceWorker.controller;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch((erro) => {
      console.warn('Não foi possível registrar o service worker:', erro);
    });
  });

  // Quando uma versão nova do app assume o controle (depois de eu
  // publicar uma atualização), a página recarrega sozinha em vez de
  // deixar a pessoa presa numa versão antiga sem saber por quê.
  let jaRecarregouPorAtualizacao = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!tinhaControladorAntes || jaRecarregouPorAtualizacao) return;
    jaRecarregouPorAtualizacao = true;
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
