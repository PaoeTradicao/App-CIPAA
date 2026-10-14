'use strict';

/* =========================================================
   BRIGADA DE INCÊNDIO
   Vistoria mensal de extintores.

   Mesmo projeto Firebase do app da CIPA, então o login é o
   mesmo: quem entrou lá chega aqui autenticado.

   Quem pode registrar vistoria e cadastrar extintor é quem
   estiver marcado como brigadista. Isso é verificado aqui na
   tela e também nas regras do Firestore, que é o que vale de
   verdade: esconder botão não protege nada.
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

db.enablePersistence({ synchronizeTabs: true }).catch((erro) => {
  console.warn('Persistência offline não disponível:', erro.code);
});

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const estado = {
  usuario: null,
  ehBrigadista: false,
  ehPresidente: false,
  extintores: [],
  vistorias: [],
  colaboradores: []
};

/* ---------------------------------------------------------
   CHECKLIST MENSAL

   Itens da inspeção visual que a brigada faz todo mês. Cada um
   traz uma dica curta, porque quem vistoria nem sempre é quem
   fez o treinamento mais recente.
   --------------------------------------------------------- */
const CHECKLIST_EXTINTOR = [
  { id: 'acesso', texto: 'Acesso livre e desobstruído', dica: 'Nada na frente nem embaixo: caixa, carrinho, pallet, mercadoria.' },
  { id: 'sinalizacao', texto: 'Sinalização visível', dica: 'Placa na parede e demarcação no piso, visíveis de longe.' },
  { id: 'lacre', texto: 'Lacre intacto', dica: 'Lacre rompido significa que o extintor pode ter sido usado ou descarregado.' },
  { id: 'manometro', texto: 'Manômetro na faixa verde', dica: 'Ponteiro fora do verde é recarga. Extintor de CO2 não tem manômetro.' },
  { id: 'mangueira', texto: 'Mangueira e difusor em bom estado', dica: 'Sem rachadura, ressecamento, entupimento ou ponta faltando.' },
  { id: 'cilindro', texto: 'Cilindro sem amassado, ferrugem ou vazamento', dica: 'Corrosão na base é o ponto que mais aparece em área úmida.' },
  { id: 'suporte', texto: 'Suporte firme e altura correta', dica: 'Bem fixo na parede ou no piso, e a parte de cima ao alcance.' },
  { id: 'validade', texto: 'Validade da carga em dia', dica: 'Confira o rótulo e a etiqueta de recarga.' },
  { id: 'hidrostatico', texto: 'Teste hidrostático em dia', dica: 'Vem gravado no casco ou na etiqueta da última manutenção.' },
  { id: 'rotulo', texto: 'Rótulo legível e identificação do tipo', dica: 'Quem chega correndo precisa ler a classe de fogo na hora.' }
];

const TIPOS_EXTINTOR = [
  'Pó químico ABC',
  'Pó químico BC',
  'Água pressurizada',
  'CO2',
  'Espuma mecânica',
  'Classe K',
  'Outro'
];

/* ---------------------------------------------------------
   AJUDAS
   --------------------------------------------------------- */
function escaparHtml(texto) {
  return String(texto === null || texto === undefined ? '' : texto)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function mostrar(el) { if (el) el.classList.remove('oculto'); }
function esconder(el) { if (el) el.classList.add('oculto'); }

// Aceita Timestamp do Firestore, Date ou texto 'aaaa-mm-dd'.
function dataCurta(valor) {
  if (!valor) return '';
  if (typeof valor === 'string') return valor.includes('-') ? valor.split('-').reverse().join('/') : valor;
  try {
    const d = valor instanceof Date ? valor : (valor.toDate ? valor.toDate() : null);
    return d ? d.toLocaleDateString('pt-BR') : '';
  } catch (erro) { return ''; }
}

function competenciaAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function nomeDoMes(competencia) {
  if (!competencia) return '';
  const [ano, mes] = competencia.split('-');
  const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${nomes[Number(mes) - 1] || ''} de ${ano}`;
}

// Vencida, ou vencendo nos próximos 30 dias, que é o prazo para
// conseguir agendar a recarga sem ficar sem o extintor.
function situacaoValidade(valor) {
  if (!valor) return null;
  const partes = String(valor).split('-');
  if (partes.length !== 3) return null;
  const data = new Date(`${valor}T12:00:00`);
  if (Number.isNaN(data.getTime())) return null;
  const hoje = new Date();
  const dias = Math.round((data - hoje) / 86400000);
  if (dias < 0) return { estado: 'vencida', dias };
  if (dias <= 30) return { estado: 'vencendo', dias };
  return { estado: 'ok', dias };
}

function abrirModal(titulo, conteudo) {
  $('#raiz-modais').innerHTML = `
    <div class="overlay" id="overlay">
      <div class="modal-wrap">
        <div class="modal">
          <button type="button" class="fechar" id="fechar-modal">Fechar</button>
          <h2>${titulo}</h2>
          ${conteudo}
        </div>
      </div>
    </div>`;
  $('#overlay').addEventListener('click', (e) => { if (e.target.id === 'overlay') fecharModal(); });
  $('#fechar-modal').addEventListener('click', fecharModal);
}
function fecharModal() { $('#raiz-modais').innerHTML = ''; }

/* ---------------------------------------------------------
   DADOS
   --------------------------------------------------------- */
function ouvirExtintores() {
  db.collection('extintores').orderBy('numero').onSnapshot((snap) => {
    estado.extintores = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((e) => e.ativo !== false);
    renderizarRonda();
    renderizarExtintores();
  }, (erro) => console.error('Erro ao ler extintores:', erro));
}

function ouvirVistorias() {
  db.collection('vistoriasExtintor').orderBy('criadoEm', 'desc').limit(600).onSnapshot((snap) => {
    estado.vistorias = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderizarRonda();
    renderizarPreviaRelatorio();
  }, (erro) => console.error('Erro ao ler vistorias:', erro));
}

function ouvirColaboradores() {
  db.collection('colaboradores').onSnapshot((snap) => {
    estado.colaboradores = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderizarBrigadistas();
  }, (erro) => console.error('Erro ao ler colaboradores:', erro));
}

function vistoriaDoMes(extintorId, competencia) {
  return estado.vistorias.find((v) => v.extintorId === extintorId && v.competencia === competencia) || null;
}

/* ---------------------------------------------------------
   RONDA DO MÊS
   --------------------------------------------------------- */
function situacaoDoExtintor(extintor, competencia) {
  const v = vistoriaDoMes(extintor.id, competencia);
  if (!v) return { classe: 'falta', texto: 'Falta vistoriar neste mês' };
  if (v.conforme) return { classe: 'ok', texto: `Conforme, vistoriado em ${dataCurta(v.criadoEm)}` };
  return { classe: 'pendencia', texto: `${v.naoConformes.length} item(ns) com pendência` };
}

function renderizarRonda() {
  const lista = $('#lista-ronda');
  if (!lista) return;
  const competencia = $('#mes-ronda').value || competenciaAtual();

  if (!estado.extintores.length) {
    lista.innerHTML = '';
    mostrar($('#vazio-ronda'));
    $('#n-ok').textContent = '0';
    $('#n-pendencia').textContent = '0';
    $('#n-falta').textContent = '0';
    return;
  }
  esconder($('#vazio-ronda'));

  let ok = 0, pend = 0, falta = 0;
  lista.innerHTML = estado.extintores.map((e) => {
    const s = situacaoDoExtintor(e, competencia);
    if (s.classe === 'ok') ok++; else if (s.classe === 'pendencia') pend++; else falta++;
    return `
      <button type="button" class="card-extintor" data-ronda="${e.id}">
        <span class="selo-status ${s.classe}"></span>
        <span class="corpo-extintor">
          <span class="numero-extintor">${escaparHtml(e.numero)} · ${escaparHtml(e.tipo || '')}</span>
          <span class="local-extintor">${escaparHtml(e.local || '')}</span>
          <span class="situacao-extintor ${s.classe}">${escaparHtml(s.texto)}</span>
        </span>
      </button>`;
  }).join('');

  $('#n-ok').textContent = String(ok);
  $('#n-pendencia').textContent = String(pend);
  $('#n-falta').textContent = String(falta);

  $$('[data-ronda]').forEach((b) => {
    b.addEventListener('click', () => abrirVistoria(b.dataset.ronda, competencia));
  });
}

function abrirVistoria(extintorId, competencia) {
  const extintor = estado.extintores.find((e) => e.id === extintorId);
  if (!extintor) return;
  const jaFeita = vistoriaDoMes(extintorId, competencia);

  // Sem permissão, ou já vistoriado no mês: a tela é de leitura.
  if (!estado.ehBrigadista || jaFeita) {
    const itens = jaFeita
      ? CHECKLIST_EXTINTOR.map((item) => {
          const falhou = jaFeita.naoConformes.includes(item.id);
          return `
            <div class="item-check">
              <span class="caixa ${falhou ? 'nao' : 'ok'}">
                <svg viewBox="0 0 24 24">${falhou ? '<path d="M6 6l12 12M18 6L6 18"/>' : '<polyline points="4 12 10 18 20 6"/>'}</svg>
              </span>
              <span class="texto-check">${escaparHtml(item.texto)}</span>
            </div>`;
        }).join('')
      : '<p class="vazio">Este extintor ainda não foi vistoriado neste mês.</p>';

    abrirModal(`${escaparHtml(extintor.numero)} · ${escaparHtml(extintor.local || '')}`, `
      ${!estado.ehBrigadista ? '<div class="aviso leitura">Você pode acompanhar as vistorias, mas só quem está marcado como brigadista registra.</div>' : ''}
      ${jaFeita ? `<div class="aviso ${jaFeita.conforme ? 'ok' : 'atencao'}">
        Vistoriado por ${escaparHtml(jaFeita.criadoPor)} em ${dataCurta(jaFeita.criadoEm)}.
        ${jaFeita.conforme ? 'Nenhuma pendência.' : `${jaFeita.naoConformes.length} item(ns) com pendência.`}
      </div>` : ''}
      ${itens}
      ${jaFeita && jaFeita.observacao ? `<div class="cartao" style="margin-top:12px;"><strong style="font-size:0.8rem;">Observação</strong><p style="margin:6px 0 0;font-size:0.88rem;line-height:1.5;">${escaparHtml(jaFeita.observacao)}</p></div>` : ''}
      ${estado.ehBrigadista && jaFeita ? '<button type="button" class="botao-secundario" id="refazer" style="margin-top:14px;">Refazer a vistoria deste mês</button>' : ''}
    `);

    const refazer = $('#refazer');
    if (refazer) refazer.addEventListener('click', () => formularioVistoria(extintor, competencia, jaFeita));
    return;
  }

  formularioVistoria(extintor, competencia, null);
}

function formularioVistoria(extintor, competencia, anterior) {
  // Começa tudo conforme: o normal é estar tudo certo, e quem
  // vistoria marca só o que encontrou errado.
  const naoConformes = new Set(anterior ? anterior.naoConformes : []);

  abrirModal(`${escaparHtml(extintor.numero)} · ${escaparHtml(extintor.local || '')}`, `
    <div class="aviso leitura">
      Toque no item que estiver <strong>errado</strong>. O que ficar verde está conforme.
    </div>
    <div id="itens-vistoria"></div>
    <div class="campo" style="margin-top:14px;">
      <label for="obs-vistoria">Observação (opcional)</label>
      <textarea id="obs-vistoria" placeholder="Detalhe o que encontrou, onde e o que já foi providenciado">${escaparHtml(anterior ? anterior.observacao || '' : '')}</textarea>
    </div>
    <div id="erro-vistoria" class="erro oculto"></div>
    <button type="button" class="botao-primario" id="salvar-vistoria">Salvar vistoria de ${escaparHtml(nomeDoMes(competencia))}</button>
  `);

  function desenharItens() {
    $('#itens-vistoria').innerHTML = CHECKLIST_EXTINTOR.map((item) => {
      const falhou = naoConformes.has(item.id);
      return `
        <button type="button" class="item-check" data-item="${item.id}">
          <span class="caixa ${falhou ? 'nao' : 'ok'}">
            <svg viewBox="0 0 24 24">${falhou ? '<path d="M6 6l12 12M18 6L6 18"/>' : '<polyline points="4 12 10 18 20 6"/>'}</svg>
          </span>
          <span class="texto-check">${escaparHtml(item.texto)}<span class="dica-check">${escaparHtml(item.dica)}</span></span>
        </button>`;
    }).join('');
    $$('[data-item]').forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.dataset.item;
        if (naoConformes.has(id)) naoConformes.delete(id); else naoConformes.add(id);
        desenharItens();
      });
    });
  }
  desenharItens();

  $('#salvar-vistoria').addEventListener('click', async () => {
    const botao = $('#salvar-vistoria');
    const erroEl = $('#erro-vistoria');
    esconder(erroEl);
    botao.disabled = true;
    botao.textContent = 'Salvando...';
    try {
      const dados = {
        extintorId: extintor.id,
        numero: extintor.numero,
        local: extintor.local || '',
        tipo: extintor.tipo || '',
        competencia,
        naoConformes: Array.from(naoConformes),
        conforme: naoConformes.size === 0,
        observacao: $('#obs-vistoria').value.trim(),
        criadoPor: estado.usuario.nome,
        criadoEm: firebase.firestore.Timestamp.now()
      };
      if (anterior) {
        await db.collection('vistoriasExtintor').doc(anterior.id).update(dados);
      } else {
        await db.collection('vistoriasExtintor').add(dados);
      }
      fecharModal();
    } catch (erro) {
      erroEl.textContent = `Não foi possível salvar. ${erro.code ? `[${erro.code}] ` : ''}${erro.message || erro}`;
      mostrar(erroEl);
      botao.disabled = false;
      botao.textContent = `Salvar vistoria de ${nomeDoMes(competencia)}`;
    }
  });
}

/* ---------------------------------------------------------
   CADASTRO DE EXTINTORES
   --------------------------------------------------------- */
function renderizarExtintores() {
  const lista = $('#lista-extintores');
  if (!lista) return;
  if (!estado.extintores.length) {
    lista.innerHTML = '';
    mostrar($('#vazio-extintores'));
    return;
  }
  esconder($('#vazio-extintores'));

  lista.innerHTML = estado.extintores.map((e) => {
    const carga = situacaoValidade(e.validadeCarga);
    const hidro = situacaoValidade(e.proximoHidrostatico);
    const alertas = [];
    if (carga && carga.estado === 'vencida') alertas.push('Carga vencida');
    else if (carga && carga.estado === 'vencendo') alertas.push(`Carga vence em ${carga.dias} dia(s)`);
    if (hidro && hidro.estado === 'vencida') alertas.push('Teste hidrostático vencido');
    else if (hidro && hidro.estado === 'vencendo') alertas.push(`Hidrostático vence em ${hidro.dias} dia(s)`);
    return `
      <button type="button" class="card-extintor" data-extintor="${e.id}">
        <span class="selo-status ${alertas.length ? 'pendencia' : 'ok'}"></span>
        <span class="corpo-extintor">
          <span class="numero-extintor">${escaparHtml(e.numero)} · ${escaparHtml(e.tipo || '')}</span>
          <span class="local-extintor">${escaparHtml(e.local || '')}${e.capacidade ? ` · ${escaparHtml(e.capacidade)}` : ''}</span>
          <span class="situacao-extintor ${alertas.length ? 'pendencia' : 'ok'}">${alertas.length ? escaparHtml(alertas.join(' · ')) : 'Validades em dia'}</span>
        </span>
      </button>`;
  }).join('');

  $$('[data-extintor]').forEach((b) => {
    b.addEventListener('click', () => abrirModalExtintor(b.dataset.extintor));
  });
}

function abrirModalExtintor(extintorId) {
  const e = extintorId ? estado.extintores.find((x) => x.id === extintorId) : null;

  if (!estado.ehBrigadista) {
    abrirModal('Extintor', `
      <div class="aviso leitura">Só quem está marcado como brigadista cadastra e edita extintores.</div>
      ${e ? `<div class="cartao">
        <div class="numero-extintor">${escaparHtml(e.numero)} · ${escaparHtml(e.tipo || '')}</div>
        <div class="local-extintor">${escaparHtml(e.local || '')}</div>
        <p style="font-size:0.85rem;margin:10px 0 0;line-height:1.5;">
          Capacidade: ${escaparHtml(e.capacidade || 'não informada')}<br/>
          Validade da carga: ${dataCurta(e.validadeCarga) || 'não informada'}<br/>
          Próximo teste hidrostático: ${dataCurta(e.proximoHidrostatico) || 'não informado'}
        </p>
      </div>` : ''}
    `);
    return;
  }

  abrirModal(e ? 'Editar extintor' : 'Cadastrar extintor', `
    <div class="linha-campos">
      <div class="campo">
        <label for="ex-numero">Número</label>
        <input type="text" id="ex-numero" placeholder="01" value="${escaparHtml(e ? e.numero : '')}" />
      </div>
      <div class="campo">
        <label for="ex-capacidade">Capacidade</label>
        <input type="text" id="ex-capacidade" placeholder="6 kg" value="${escaparHtml(e ? e.capacidade || '' : '')}" />
      </div>
    </div>
    <div class="campo">
      <label for="ex-local">Local</label>
      <input type="text" id="ex-local" placeholder="Produção, ao lado do forno" value="${escaparHtml(e ? e.local || '' : '')}" />
    </div>
    <div class="campo">
      <label for="ex-tipo">Tipo</label>
      <select id="ex-tipo">
        ${TIPOS_EXTINTOR.map((t) => `<option ${e && e.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}
      </select>
    </div>
    <div class="linha-campos">
      <div class="campo">
        <label for="ex-carga">Validade da carga</label>
        <input type="date" id="ex-carga" value="${escaparHtml(e ? e.validadeCarga || '' : '')}" />
      </div>
      <div class="campo">
        <label for="ex-hidro">Próximo hidrostático</label>
        <input type="date" id="ex-hidro" value="${escaparHtml(e ? e.proximoHidrostatico || '' : '')}" />
      </div>
    </div>
    <div id="erro-extintor" class="erro oculto"></div>
    <button type="button" class="botao-primario" id="salvar-extintor">${e ? 'Salvar alterações' : 'Cadastrar'}</button>
    ${e ? '<button type="button" class="botao-secundario" id="remover-extintor" style="margin-top:10px;">Retirar da lista</button>' : ''}
  `);

  $('#salvar-extintor').addEventListener('click', async () => {
    const erroEl = $('#erro-extintor');
    esconder(erroEl);
    const numero = $('#ex-numero').value.trim();
    const local = $('#ex-local').value.trim();
    if (!numero || !local) {
      erroEl.textContent = 'Informe pelo menos o número e o local.';
      mostrar(erroEl);
      return;
    }
    const botao = $('#salvar-extintor');
    botao.disabled = true;
    botao.textContent = 'Salvando...';
    try {
      const dados = {
        numero,
        local,
        tipo: $('#ex-tipo').value,
        capacidade: $('#ex-capacidade').value.trim(),
        validadeCarga: $('#ex-carga').value || null,
        proximoHidrostatico: $('#ex-hidro').value || null,
        ativo: true
      };
      if (e) {
        await db.collection('extintores').doc(e.id).update(dados);
      } else {
        dados.criadoPor = estado.usuario.nome;
        dados.criadoEm = firebase.firestore.Timestamp.now();
        await db.collection('extintores').add(dados);
      }
      fecharModal();
    } catch (erro) {
      erroEl.textContent = `Não foi possível salvar. ${erro.code ? `[${erro.code}] ` : ''}${erro.message || erro}`;
      mostrar(erroEl);
      botao.disabled = false;
      botao.textContent = e ? 'Salvar alterações' : 'Cadastrar';
    }
  });

  const remover = $('#remover-extintor');
  if (remover) {
    remover.addEventListener('click', async () => {
      // Não apaga: marca como inativo, para o histórico de vistorias
      // continuar fazendo sentido.
      if (!confirm('Retirar este extintor da lista? As vistorias antigas continuam guardadas.')) return;
      try {
        await db.collection('extintores').doc(e.id).update({ ativo: false });
        fecharModal();
      } catch (erro) {
        alert(`Não foi possível retirar. ${erro.message || erro}`);
      }
    });
  }
}

/* ---------------------------------------------------------
   BRIGADISTAS
   --------------------------------------------------------- */
function renderizarBrigadistas() {
  const lista = $('#lista-brigadistas');
  if (!lista) return;
  if (!estado.ehPresidente) {
    lista.innerHTML = '<p class="vazio">Só a presidência da CIPA altera esta lista.</p>';
    return;
  }
  if (!estado.colaboradores.length) {
    lista.innerHTML = '<p class="vazio">Nenhum colaborador cadastrado.</p>';
    return;
  }
  lista.innerHTML = estado.colaboradores
    .slice()
    .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'))
    .map((c) => `
      <div class="linha-pessoa">
        <div class="nome-pessoa">
          <strong>${escaparHtml(c.nome || '')}</strong>
          <span>${escaparHtml(c.cargo || '')}</span>
        </div>
        <button type="button" class="chave ${c.brigadista ? 'ligada' : ''}" data-brigadista="${c.id}" aria-label="Marcar como brigadista"></button>
      </div>`).join('');

  $$('[data-brigadista]').forEach((b) => {
    b.addEventListener('click', async () => {
      const id = b.dataset.brigadista;
      const pessoa = estado.colaboradores.find((c) => c.id === id);
      try {
        await db.collection('colaboradores').doc(id).update({ brigadista: !pessoa.brigadista });
      } catch (erro) {
        alert(`Não foi possível alterar. ${erro.code ? `[${erro.code}] ` : ''}${erro.message || erro}`);
      }
    });
  });
}

/* ---------------------------------------------------------
   RELATÓRIO MENSAL
   --------------------------------------------------------- */
function dadosDoMes(competencia) {
  const feitas = estado.vistorias.filter((v) => v.competencia === competencia);
  const vistoriados = new Set(feitas.map((v) => v.extintorId));
  const naoVistoriados = estado.extintores.filter((e) => !vistoriados.has(e.id));
  return {
    feitas: feitas.slice().sort((a, b) => String(a.numero).localeCompare(String(b.numero), 'pt-BR', { numeric: true })),
    comPendencia: feitas.filter((v) => !v.conforme),
    naoVistoriados
  };
}

function renderizarPreviaRelatorio() {
  const alvo = $('#previa-relatorio');
  if (!alvo) return;
  const competencia = $('#mes-relatorio').value || competenciaAtual();
  const { feitas, comPendencia, naoVistoriados } = dadosDoMes(competencia);
  alvo.innerHTML = `
    <div class="resumo-mes">
      <div><div class="resumo-valor">${feitas.length}</div><div class="resumo-rotulo">Vistoriados</div></div>
      <div><div class="resumo-valor">${comPendencia.length}</div><div class="resumo-rotulo">Com pendência</div></div>
      <div><div class="resumo-valor">${naoVistoriados.length}</div><div class="resumo-rotulo">Não vistoriados</div></div>
    </div>
    ${naoVistoriados.length ? `<div class="aviso atencao">
      ${naoVistoriados.length} extintor(es) sem vistoria em ${escaparHtml(nomeDoMes(competencia))}. Eles aparecem no relatório como pendentes.
    </div>` : ''}`;
}

function gerarPdfMensal() {
  const competencia = $('#mes-relatorio').value || competenciaAtual();
  const { feitas, comPendencia, naoVistoriados } = dadosDoMes(competencia);

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const margem = 15, largura = 180, rodapeY = 288;
    let y = 0;
    const vermelho = [192, 57, 43];
    const ink = [43, 21, 18];
    const suave = [107, 85, 81];

    function novaPagina() { doc.addPage(); y = 22; }
    function espaco(h) { if (y + h > rodapeY - 6) novaPagina(); }
    function escrever(texto, o = {}) {
      const { tamanho = 9.5, estilo = 'normal', cor = ink, indent = 0, depois = 1.2 } = o;
      doc.setFont('helvetica', estilo);
      doc.setFontSize(tamanho);
      doc.setTextColor(cor[0], cor[1], cor[2]);
      doc.splitTextToSize(String(texto), largura - indent).forEach((linha) => {
        espaco(tamanho / 2.3);
        doc.text(linha, margem + indent, y);
        y += tamanho / 2.3 + 1;
      });
      y += depois;
    }
    function faixa(texto, cor) {
      espaco(12);
      doc.setFillColor(cor[0], cor[1], cor[2]);
      doc.roundedRect(margem, y - 5, largura, 8.5, 1.8, 1.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(texto, margem + 3, y + 0.8);
      y += 11;
    }

    doc.setFillColor(vermelho[0], vermelho[1], vermelho[2]);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('VISTORIA MENSAL DE EXTINTORES', margem, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(250, 215, 211);
    doc.text('Brigada de Incêndio  ·  Pão & Tradição', margem, 22);
    y = 42;

    escrever(`Competência: ${nomeDoMes(competencia)}`, { tamanho: 12, estilo: 'bold', depois: 2 });
    const agora = new Date();
    escrever(`Gerado em ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      { tamanho: 8.5, cor: suave, depois: 5 });
    escrever(`${estado.extintores.length} extintor(es) cadastrados · ${feitas.length} vistoriado(s) · ${comPendencia.length} com pendência · ${naoVistoriados.length} sem vistoria`,
      { tamanho: 9.5, estilo: 'bold', depois: 6 });

    if (comPendencia.length) {
      faixa('PENDÊNCIAS ENCONTRADAS', vermelho);
      comPendencia.forEach((v) => {
        espaco(16);
        escrever(`${v.numero} · ${v.local}`, { tamanho: 10, estilo: 'bold', depois: 0.6 });
        v.naoConformes.forEach((id) => {
          const item = CHECKLIST_EXTINTOR.find((i) => i.id === id);
          escrever(`Não conforme: ${item ? item.texto : id}`, { tamanho: 9, cor: vermelho, indent: 4, depois: 0.4 });
        });
        if (v.observacao) escrever(v.observacao, { tamanho: 9, cor: suave, indent: 4, depois: 0.6 });
        escrever(`Vistoriado por ${v.criadoPor} em ${dataCurta(v.criadoEm)}`, { tamanho: 8.5, cor: suave, indent: 4, depois: 4 });
      });
    }

    if (naoVistoriados.length) {
      faixa('SEM VISTORIA NESTE MÊS', [217, 116, 15]);
      naoVistoriados.forEach((e) => {
        escrever(`${e.numero} · ${e.local}`, { tamanho: 9.5, depois: 1.6 });
      });
      y += 3;
    }

    faixa('TODOS OS EXTINTORES VISTORIADOS', [24, 158, 30]);
    if (!feitas.length) {
      escrever('Nenhuma vistoria registrada nesta competência.', { tamanho: 9.5, cor: suave, depois: 4 });
    } else {
      feitas.forEach((v) => {
        espaco(10);
        escrever(`${v.numero} · ${v.local} · ${v.tipo || ''}`, { tamanho: 9.5, estilo: 'bold', depois: 0.4 });
        escrever(v.conforme ? 'Conforme em todos os itens' : `${v.naoConformes.length} item(ns) não conforme(s)`,
          { tamanho: 8.8, cor: v.conforme ? [24, 158, 30] : vermelho, indent: 4, depois: 0.4 });
        escrever(`${v.criadoPor} · ${dataCurta(v.criadoEm)}`, { tamanho: 8.3, cor: suave, indent: 4, depois: 2.6 });
      });
    }

    espaco(26);
    y += 6;
    doc.setDrawColor(220, 214, 212);
    doc.line(margem, y, margem + largura, y);
    y += 12;
    escrever('Responsável pela brigada: ___________________________________', { tamanho: 9.5, depois: 8 });
    escrever('Data: ____ / ____ / ________', { tamanho: 9.5, depois: 0 });

    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(suave[0], suave[1], suave[2]);
      doc.text('Inspeção visual mensal de extintores, conforme NR-23 e normas locais de prevenção', margem, 294);
      doc.text(`${i}/${total}`, margem + largura, 294, { align: 'right' });
    }

    doc.save(`extintores-${competencia}.pdf`);
  } catch (erro) {
    console.error('Erro ao gerar o PDF:', erro);
    alert(`Não foi possível gerar o PDF. ${erro.message || erro}`);
  }
}

/* ---------------------------------------------------------
   NAVEGAÇÃO E INÍCIO
   --------------------------------------------------------- */
const TITULOS = {
  ronda: 'Ronda do mês',
  extintores: 'Extintores cadastrados',
  relatorio: 'Relatório mensal',
  brigadistas: 'Quem pode vistoriar'
};

$$('.aba').forEach((aba) => {
  aba.addEventListener('click', () => {
    $$('.aba').forEach((a) => a.classList.remove('ativa'));
    aba.classList.add('ativa');
    const alvo = aba.dataset.aba;
    $('#titulo-tela').textContent = TITULOS[alvo] || '';
    ['ronda', 'extintores', 'relatorio', 'brigadistas'].forEach((nome) => {
      const painel = $(`#painel-${nome}`);
      if (painel) painel.classList.toggle('oculto', nome !== alvo);
    });
  });
});

$('#mes-ronda').addEventListener('change', renderizarRonda);
$('#mes-relatorio').addEventListener('change', renderizarPreviaRelatorio);
$('#botao-pdf').addEventListener('click', gerarPdfMensal);
$('#botao-novo-extintor').addEventListener('click', () => abrirModalExtintor(null));

function aplicarPermissoes() {
  const aviso = $('#aviso-permissao');
  if (estado.ehBrigadista) {
    aviso.innerHTML = '';
  } else {
    aviso.innerHTML = `<div class="aviso leitura">
      Você está vendo as vistorias da brigada. Para registrar, é preciso estar
      marcado como brigadista pela presidência da CIPA.
    </div>`;
  }
  $('#botao-novo-extintor').classList.toggle('oculto', !estado.ehBrigadista);
  $('#aba-brigadistas').classList.toggle('oculto', !estado.ehPresidente);
}

auth.onAuthStateChanged(async (usuarioFirebase) => {
  if (!usuarioFirebase) {
    mostrar($('#tela-entrar'));
    esconder($('#tela-brigada'));
    return;
  }
  try {
    const doc = await db.collection('colaboradores').doc(usuarioFirebase.uid).get();
    const dados = doc.exists ? doc.data() : {};
    estado.usuario = { uid: usuarioFirebase.uid, nome: dados.nome || 'Colaborador', cargo: dados.cargo || '' };
    estado.ehBrigadista = dados.brigadista === true;
    estado.ehPresidente = dados.cargo === 'Presidente';
    // A presidência vistoria sem precisar se marcar, senão ela teria
    // que se adicionar para usar a própria ferramenta.
    if (estado.ehPresidente) estado.ehBrigadista = true;
  } catch (erro) {
    console.error('Erro ao ler o perfil:', erro);
  }

  esconder($('#tela-entrar'));
  mostrar($('#tela-brigada'));
  $('#mes-ronda').value = competenciaAtual();
  $('#mes-relatorio').value = competenciaAtual();
  aplicarPermissoes();
  ouvirExtintores();
  ouvirVistorias();
  if (estado.ehPresidente) ouvirColaboradores();
  renderizarPreviaRelatorio();
});
