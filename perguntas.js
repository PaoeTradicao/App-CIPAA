/* =========================================================
   PERGUNTAS E RESPOSTAS DA CIPA

   Cada registro tem:
     n            numero da pergunta
     tema         grupo em que ela aparece
     pergunta     a duvida como ela e falada
     resposta     a orientacao, em texto corrido
     cipeiro      o que cabe ao cipeiro naquele caso
     encaminhar   quem pode agir sobre o problema
     base         itens da NR-5 que sustentam a resposta,
                  mostrados com o texto oficial
     normas       outras normas citadas, sem transcricao
     chaves       palavras extras para a busca encontrar

   Principio que atravessa todas as respostas: o cipeiro nao
   precisa saber resolver tudo sozinho. Ele precisa reconhecer
   o risco, orientar dentro da sua competencia, registrar,
   encaminhar a situacao a quem pode agir e acompanhar a
   providencia.
   ========================================================= */

const CIPA_PRINCIPIO = 'O cipeiro não precisa saber resolver tudo sozinho. O que cabe a ele é reconhecer o risco, orientar dentro da sua competência, registrar, encaminhar a situação a quem pode agir e acompanhar a providência.';

const CIPA_TEMAS = [
  'Papel do cipeiro e funcionamento da CIPA',
  'Acidentes de trabalho e quase acidentes',
  'Máquinas, equipamentos e ferramentas',
  'EPIs e proteção individual',
  'Segurança na cozinha, produção e confeitaria',
  'Quedas, organização e circulação',
  'Produtos químicos, limpeza e higiene ocupacional',
  'Saúde física, ergonomia e esforço repetitivo',
  'Saúde mental, comportamento e relações de trabalho',
  'Prevenção, emergências e responsabilidades legais'
];

const CIPA_PERGUNTAS = [

  /* ===================================================
     TEMA 1 - PAPEL DO CIPEIRO E FUNCIONAMENTO DA CIPA
     =================================================== */
  {
    n: 1,
    tema: CIPA_TEMAS[0],
    pergunta: 'Qual é exatamente a função de um cipeiro dentro da empresa?',
    resposta: 'O cipeiro é um representante que olha o ambiente de trabalho com olhos de prevenção. A NR-5 lista o que a comissão faz: acompanhar a identificação de perigos e a avaliação de riscos, registrar a percepção de risco dos trabalhadores, verificar os ambientes e as condições de trabalho, elaborar e acompanhar o plano de trabalho, participar dos programas de segurança e saúde, acompanhar a análise dos acidentes, requisitar informações à empresa, propor a análise de situações de risco grave e iminente, promover a SIPAT anualmente e tratar da prevenção ao assédio e à violência no trabalho. Nada nessa lista é executar a correção: é identificar, propor, acompanhar e cobrar.',
    cipeiro: 'Ser o canal entre quem vive o risco no dia a dia e quem tem poder de decidir e de pagar a correção.',
    encaminhar: 'Gerência, SESMT quando houver, e a própria reunião da CIPA',
    base: ['5.3.1', '5.3.6'],
    chaves: 'funcao do cipeiro papel atribuicao o que faz um cipeiro'
  },
  {
    n: 2,
    tema: CIPA_TEMAS[0],
    pergunta: 'O cipeiro é responsável pela segurança de todos os colaboradores?',
    resposta: 'Não. A responsabilidade legal pela segurança e saúde no trabalho é da empresa, que deve gerenciar os riscos e fornecer os meios de prevenção. O cipeiro não responde por acidente que aconteça, nem é obrigado a resolver o problema com as próprias mãos. O que a norma cobra dele é atuação: ter visto, ter registrado, ter levado a quem decide e ter acompanhado. Um risco identificado e registrado que a empresa não corrigiu é responsabilidade da empresa. Um risco visto e silenciado é omissão do cipeiro.',
    cipeiro: 'Responder pela atuação preventiva, não pelo resultado. Registrar é o que protege o trabalhador e também o cipeiro.',
    encaminhar: 'Gerência e SESMT quando houver',
    base: ['5.3.1', '5.3.2'],
    normas: 'NR-1, que atribui à organização o gerenciamento dos riscos ocupacionais',
    chaves: 'responsabilidade do cipeiro culpa responsavel pela seguranca'
  },
  {
    n: 3,
    tema: CIPA_TEMAS[0],
    pergunta: 'Qual é a diferença entre ser cipeiro e ser técnico de segurança do trabalho?',
    resposta: 'O técnico de segurança é profissional contratado, com formação técnica na área, e integra o SESMT quando a empresa é obrigada a tê-lo. Ele faz o trabalho técnico: avalia riscos, elabora documentos, define medidas de controle, orienta tecnicamente. O cipeiro é representante, eleito pelos empregados ou designado pela empresa, exerce a função junto com o cargo que já tem e tem mandato de um ano. O cipeiro não precisa de formação em segurança e não assina responsabilidade técnica. Quando a empresa tem SESMT, a CIPA trabalha com ele, pedindo assessoria e levando o que observou.',
    cipeiro: 'Trazer o olhar de quem está na operação. O técnico traz o conhecimento técnico. Os dois se somam.',
    encaminhar: 'SESMT quando houver, ou profissional de segurança contratado pela empresa',
    base: ['5.3.1', '5.4.6'],
    normas: 'NR-4, que trata da composição e do dimensionamento do SESMT',
    chaves: 'diferenca cipeiro tecnico de seguranca sesmt tst'
  },
  {
    n: 4,
    tema: CIPA_TEMAS[0],
    pergunta: 'O que devo fazer quando identificar uma situação de risco?',
    resposta: 'A sequência é sempre a mesma. Primeiro, avalie se o risco é imediato: se alguém pode se machucar nos próximos minutos, alerte na hora quem está exposto e chame o responsável do setor. Segundo, registre no app com setor, descrição do que viu, nível de urgência e foto quando possível. Terceiro, comunique a quem pode corrigir, que depende do caso: manutenção para equipamento, gerência para compra ou mudança de processo, RH para questão de pessoas. Quarto, leve o registro para a reunião da CIPA, porque o que está em ata ganha força. Quinto, acompanhe até a resolução e registre quem resolveu e quando.',
    cipeiro: 'Não tente consertar o que não é da sua competência técnica. Reconhecer, orientar, registrar, encaminhar e acompanhar já é o trabalho completo.',
    encaminhar: 'Responsável do setor de imediato, depois manutenção, gerência, RH ou SESMT conforme o caso',
    base: ['5.3.1', '5.6.3.2'],
    chaves: 'identifiquei risco o que fazer primeiro passo procedimento'
  },
  {
    n: 5,
    tema: CIPA_TEMAS[0],
    pergunta: 'Posso cobrar da empresa a correção de um problema de segurança?',
    resposta: 'Sim, e a norma dá o caminho formal para isso. A CIPA pode requisitar à empresa informações sobre segurança e saúde dos trabalhadores e pode propor ao SESMT ou à empresa a análise de condições de trabalho que considere de risco grave e iminente, inclusive a interrupção da atividade até que seja corrigida. A cobrança ganha força quando é coletiva e documentada: registro no app, deliberação levada à reunião, ata assinada pelos presentes e encaminhamento à empresa. Cobrança informal de corredor não deixa rastro e costuma se perder.',
    cipeiro: 'Cobrar pela via da comissão, por escrito e em ata, e não como queixa individual.',
    encaminhar: 'Gerência por escrito, com cópia da deliberação da reunião',
    base: ['5.3.1', '5.3.2', '5.6.3', '5.6.3.2'],
    chaves: 'cobrar empresa exigir correcao requisitar pressionar'
  },
  {
    n: 6,
    tema: CIPA_TEMAS[0],
    pergunta: 'O que acontece se eu identificar um risco e ninguém tomar providências?',
    resposta: 'O registro continua valendo e é ele que mostra que a CIPA cumpriu a parte dela. Quando o encaminhamento não anda, o caminho é escalar dentro da empresa: repetir o item na reunião seguinte, pedir que a falta de resposta fique em ata, levar à gerência por escrito e, se o risco for grave e iminente, propor formalmente a análise da situação e a interrupção da atividade. Em último caso, a documentação da CIPA fica à disposição da inspeção do trabalho, que pode ser acionada. O que não pode acontecer é o risco sair do radar porque ninguém respondeu.',
    cipeiro: 'Insistir com registro, repetição em ata e escalonamento. A persistência documentada é a ferramenta do cipeiro.',
    encaminhar: 'Gerência, diretoria e, persistindo o risco grave, a inspeção do trabalho',
    base: ['5.3.1', '5.6.3', '5.9.2'],
    chaves: 'ninguem resolve nao fizeram nada sem providencia cobrar de novo'
  },
  {
    n: 7,
    tema: CIPA_TEMAS[0],
    pergunta: 'Posso registrar uma situação perigosa mesmo que nenhum acidente tenha acontecido?',
    resposta: 'Pode e deve. É exatamente esse o trabalho da CIPA: verificar os ambientes e as condições de trabalho para identificar situações que possam trazer risco, antes de alguém se machucar. Registro de situação perigosa e de quase acidente é o material mais valioso da prevenção, porque mostra onde o acidente vai acontecer se nada mudar, sem o custo de alguém se ferir. No app, esse registro pode ser feito como observação dentro da vistoria do setor ou como registro avulso, quando você viu algo fora de uma vistoria programada.',
    cipeiro: 'Registrar o que quase aconteceu com a mesma seriedade do que aconteceu.',
    encaminhar: 'Responsável do setor e reunião da CIPA',
    base: ['5.3.1'],
    chaves: 'registrar sem acidente situacao perigosa quase acidente preventivo'
  },
  {
    n: 8,
    tema: CIPA_TEMAS[0],
    pergunta: 'Preciso comunicar à CIPA todos os problemas que encontrar?',
    resposta: 'Tudo que envolve risco à segurança e à saúde das pessoas, sim. O que se resolve na hora, por organização simples, pode ser orientado no momento e registrado de forma breve, para ficar o histórico. O que depende de compra, de reparo, de mudança de processo ou que se repete precisa ir para a reunião, porque é lá que vira deliberação e encaminhamento formal. Há uma exceção importante: relato de assédio não deve ser registrado como observação de vistoria, porque o registro fica visível para a comissão com setor e data e pode identificar a pessoa. Esse caso vai pelo canal sigiloso.',
    cipeiro: 'Registrar sempre, e escolher o canal certo. Risco físico vai para a vistoria. Relato de assédio vai para a Ouvidoria.',
    encaminhar: 'Reunião da CIPA, e Ouvidoria Interna nos casos de assédio',
    base: ['5.3.1', '5.6.3.2'],
    normas: 'Lei 14.457/2022, que trata dos canais de recebimento de denúncia',
    chaves: 'comunicar tudo todos os problemas o que levar para a reuniao'
  },
  {
    n: 9,
    tema: CIPA_TEMAS[0],
    pergunta: 'Como saber quais assuntos devem ser discutidos nas reuniões da CIPA?',
    resposta: 'A pauta sai do próprio trabalho da comissão. Entram as vistorias feitas no período e as observações em aberto, os itens que se repetem no mesmo setor, os acidentes e quase acidentes investigados, o andamento do plano de trabalho, o que foi encaminhado e não voltou, as sugestões trazidas pelos trabalhadores, a preparação da SIPAT e os temas de prevenção ao assédio e à violência no trabalho. O relatório do app serve de pauta pronta: ele traz o que está em aberto, separado por setor, e o que foi resolvido no período.',
    cipeiro: 'Chegar na reunião com o relatório do período em mãos, não com assuntos de memória.',
    encaminhar: 'Presidente, que convoca e coordena a reunião',
    base: ['5.3.1', '5.3.4', '5.6.1', '5.6.5'],
    chaves: 'pauta reuniao assuntos o que discutir ordem do dia'
  },
  {
    n: 10,
    tema: CIPA_TEMAS[0],
    pergunta: 'O que fazer quando os próprios colegas não levam as orientações de segurança a sério?',
    resposta: 'Resistência quase sempre tem causa, e vale descobrir qual antes de insistir na regra. Costuma ser uma destas: a pessoa não entende o motivo da orientação, o equipamento incomoda ou atrapalha a tarefa, o ritmo de trabalho não permite cumprir, ou ninguém nunca explicou direito. Converse em particular, pergunte o que atrapalha, explique o risco concreto com exemplo do próprio setor e não em termos abstratos. Se o obstáculo for real, como EPI que não serve ou meta que não cabe no tempo seguro, isso deixa de ser desinteresse e passa a ser um problema para registrar e encaminhar. Cobrança disciplinar não é papel do cipeiro: é da chefia.',
    cipeiro: 'Orientar e explicar o risco. Quando a resistência tem causa concreta, registrar a causa. A disciplina é da chefia.',
    encaminhar: 'Chefia do setor, e gerência quando o obstáculo é de processo ou de equipamento',
    base: ['5.3.1', '5.3.3'],
    chaves: 'colegas nao obedecem resistencia nao usam nao levam a serio conscientizar'
  },

  /* ===================================================
     TEMA 2 - ACIDENTES DE TRABALHO E QUASE ACIDENTES
     =================================================== */
  {
    n: 11,
    tema: CIPA_TEMAS[1],
    pergunta: 'O que realmente caracteriza um acidente de trabalho?',
    resposta: 'É o acidente que ocorre pelo exercício do trabalho e provoca lesão corporal ou perturbação funcional que cause morte, perda ou redução, permanente ou temporária, da capacidade para o trabalho. A lei equipara a acidente de trabalho a doença profissional e a doença do trabalho, e também situações como agressão sofrida no serviço, acidente em viagem a serviço e o acidente no trajeto entre a casa e o trabalho. Não é preciso afastamento para ser acidente de trabalho: corte que precisou de atendimento e queimadura tratada no ambulatório também são.',
    cipeiro: 'Não decidir sozinho se o caso se enquadra. Registrar o ocorrido com detalhe e deixar o enquadramento legal para o RH e o médico.',
    encaminhar: 'RH para emissão da CAT, e SESMT quando houver',
    base: ['5.3.1', '5.6.4'],
    normas: 'Lei 8.213/1991, artigos 19 a 21, que definem e equiparam o acidente do trabalho',
    chaves: 'o que e acidente de trabalho caracteriza definicao conceito'
  },
  {
    n: 12,
    tema: CIPA_TEMAS[1],
    pergunta: 'Se o colaborador se machucar levemente, precisa comunicar o ocorrido?',
    resposta: 'Sim. Lesão leve comunicada é a informação mais barata que a prevenção pode ter. O corte pequeno de hoje mostra a faca sem proteção, a bancada apertada ou a pressa que amanhã produz o corte profundo. A comunicação interna deve acontecer sempre, independentemente de gravidade e de afastamento. A decisão sobre emitir CAT é da empresa, com orientação médica, mas ela só consegue decidir se soube do caso. Nunca trate lesão leve com a frase de que não foi nada.',
    cipeiro: 'Registrar toda lesão, por pequena que seja, e insistir para que os colegas comuniquem em vez de resolver no esparadrapo.',
    encaminhar: 'Responsável do setor, RH e SESMT quando houver',
    base: ['5.3.1'],
    normas: 'NR-1, que exige a análise dos acidentes e das doenças relacionadas ao trabalho',
    chaves: 'machucado leve corte pequeno precisa comunicar lesao sem afastamento cortou queimou arranhao machucou pouco nao foi nada'
  },
  {
    n: 13,
    tema: CIPA_TEMAS[1],
    pergunta: 'Se alguém quase sofrer um acidente, mas sair ileso, isso também deve ser registrado?',
    resposta: 'Deve, e é um dos registros mais úteis que existem. O quase acidente mostra a mesma falha do acidente, com a diferença de que ninguém se feriu. A bandeja que escorregou e não caiu em cima de ninguém, o fio que provocou tropeço sem queda, a lâmina que passou perto da mão: todos indicam onde intervir. Registre o que aconteceu, o que poderia ter acontecido e por que não aconteceu, porque muitas vezes o que impediu a lesão foi sorte, e sorte não é medida de controle. No app, esses casos entram na área de acidentes marcados como quase acidente.',
    cipeiro: 'Tratar o quase acidente como aviso. Registrar com a mesma seriedade do acidente e levar à reunião.',
    encaminhar: 'Responsável do setor e reunião da CIPA',
    base: ['5.3.1'],
    chaves: 'quase acidente ileso nao se machucou near miss registrar'
  },
  {
    n: 14,
    tema: CIPA_TEMAS[1],
    pergunta: 'Qual é a diferença entre acidente de trabalho, incidente e quase acidente?',
    resposta: 'Acidente de trabalho é o evento que causou lesão à pessoa ou doença relacionada ao trabalho. Incidente é o evento indesejado que gerou dano material ou interrupção do processo sem ferir ninguém, como a máquina que quebrou ou o produto que se perdeu. Quase acidente é o evento que não gerou lesão nem dano, mas que em outras circunstâncias teria gerado. Os três têm a mesma origem: uma falha de condição ou de organização do trabalho. Por isso a CIPA se interessa pelos três, e não só pelo que já machucou.',
    cipeiro: 'Não gastar tempo discutindo o rótulo. Registrar o fato, descrever o que poderia ter acontecido e investigar a causa.',
    encaminhar: 'Reunião da CIPA, e SESMT quando houver',
    base: ['5.3.1'],
    chaves: 'diferenca acidente incidente quase acidente conceitos'
  },
  {
    n: 15,
    tema: CIPA_TEMAS[1],
    pergunta: 'O que fazer imediatamente quando um colega sofre um acidente?',
    resposta: 'A ordem é esta. Garanta que o local está seguro, para não haver uma segunda vítima, desligando equipamento ou isolando a área quando for o caso. Cuide da pessoa: chame quem tem treinamento em primeiros socorros, acione o serviço de emergência se for grave e não movimente a vítima sem necessidade. Comunique a chefia e o RH. Preserve o local e o equipamento como estavam, e fotografe antes que alguém organize a cena, porque essa é a prova de como o acidente aconteceu. Depois disso, com a pessoa cuidada, comece a investigação. Em acidente grave ou fatal, a CIPA deve se reunir extraordinariamente.',
    cipeiro: 'Primeiro a pessoa, depois a cena preservada e fotografada, depois o registro. A investigação vem em seguida, nunca antes do atendimento.',
    encaminhar: 'Serviço de emergência, chefia, RH e SESMT quando houver',
    base: ['5.3.1', '5.6.4'],
    normas: 'NR-7, que exige material de primeiros socorros aos cuidados de pessoa treinada',
    chaves: 'acidente agora o que fazer primeiros socorros emergencia preservar local acidentado caiu queda escorregou tropecou cortou queimou machucou feriu torceu bateu desmaiou vitima socorrer colega funcionario colaborador alguem se machucou'
  },
  {
    n: 16,
    tema: CIPA_TEMAS[1],
    pergunta: 'Quem deve investigar um acidente ocorrido dentro da empresa?',
    resposta: 'A análise do acidente é obrigação da empresa, e a CIPA tem a atribuição de acompanhar essa análise e propor medidas para resolver os problemas identificados. Na prática, a investigação funciona melhor em conjunto: quem conhece a tarefa, a chefia do setor, o SESMT quando houver e os membros da CIPA. Na nossa CIPA, qualquer membro pode registrar e investigar o acidente no app, porque o que importa é não perder o caso. O que a CIPA não faz é apurar culpa de pessoa: isso é assunto de RH e não produz prevenção.',
    cipeiro: 'Participar da investigação, acompanhar a análise feita pela empresa e cobrar que as medidas propostas saiam do papel.',
    encaminhar: 'SESMT quando houver, chefia do setor e gerência',
    base: ['5.3.1'],
    normas: 'NR-1, que atribui à organização a análise dos acidentes e doenças relacionadas ao trabalho',
    chaves: 'quem investiga acidente analise responsavel pela investigacao'
  },
  {
    n: 17,
    tema: CIPA_TEMAS[1],
    pergunta: 'Como investigar um acidente sem simplesmente culpar quem se machucou?',
    resposta: 'Trocando a pergunta. Em vez de perguntar quem errou, pergunte por que foi possível errar. Use a cadeia de por quês: a cada resposta, pergunte o motivo dela, até chegar a algo que a empresa possa mudar. Quando a resposta para no comportamento da pessoa, como falta de atenção ou pressa, a investigação parou cedo: continue perguntando por que havia pressa, por que a tarefa permitia o descuido, por que não havia proteção que impedisse o contato. Causa que serve para prevenção é sempre algo que se pode corrigir: proteção ausente, procedimento inexistente, treinamento que não houve, ritmo mal dimensionado, ferramenta inadequada. Culpar a vítima encerra o caso e deixa o risco de pé.',
    cipeiro: 'Perguntar por que, não quem. No app, a investigação registra apenas setor e descrição, sem o nome de quem se machucou, justamente para manter o foco na causa.',
    encaminhar: 'Reunião da CIPA, com as medidas propostas à gerência',
    base: ['5.3.1'],
    chaves: 'investigar sem culpar porques causa raiz 5 porques culpa da vitima'
  },
  {
    n: 18,
    tema: CIPA_TEMAS[1],
    pergunta: 'Quando um acidente precisa ser comunicado ao INSS por meio da CAT?',
    resposta: 'A empresa deve comunicar o acidente do trabalho ao INSS até o primeiro dia útil seguinte ao da ocorrência, e de imediato em caso de morte. A obrigação existe mesmo sem afastamento do trabalhador. Também se emite CAT para doença relacionada ao trabalho e para o acidente de trajeto. Quem emite é a empresa, mas, se ela não o fizer, a lei permite que a comunicação seja feita pelo próprio acidentado, por seus dependentes, pelo sindicato, pelo médico que o assistiu ou por autoridade pública. A CIPA tem direito de requisitar à empresa as CAT emitidas.',
    cipeiro: 'Não emitir a CAT, mas verificar se foi emitida e pedir cópia. CAT não emitida é falha para registrar e levar à reunião.',
    encaminhar: 'RH, que emite a CAT',
    base: ['5.3.1'],
    normas: 'Lei 8.213/1991, artigo 22, que fixa o prazo e os legitimados para a comunicação',
    chaves: 'cat comunicacao de acidente inss prazo primeiro dia util quem emite'
  },
  {
    n: 19,
    tema: CIPA_TEMAS[1],
    pergunta: 'Se o colaborador se machucar durante o trajeto entre casa e trabalho, como proceder?',
    resposta: 'O acidente sofrido no percurso entre a residência e o local de trabalho, qualquer que seja o meio de locomoção, é equiparado a acidente do trabalho pela lei previdenciária. Na prática: a pessoa comunica a empresa o quanto antes, o RH emite a CAT, e é importante guardar o que comprove o percurso e o horário, como boletim de ocorrência e atendimento médico. A CIPA registra o caso no histórico e, embora o trajeto esteja fora dos muros da empresa, vale olhar o que está sob influência da empresa, como horário de turno que obriga deslocamento em horário de risco ou falta de iluminação no acesso.',
    cipeiro: 'Registrar o caso, verificar se a CAT foi emitida e olhar o que no trajeto depende da empresa, como acesso e iluminação.',
    encaminhar: 'RH para a CAT, e gerência quanto às condições de acesso',
    base: ['5.3.1'],
    normas: 'Lei 8.213/1991, artigo 21, que equipara o acidente de trajeto',
    chaves: 'acidente de trajeto caminho de casa percurso equiparado cat'
  },
  {
    n: 20,
    tema: CIPA_TEMAS[1],
    pergunta: 'Como descobrir a causa de um acidente para evitar que ele aconteça novamente?',
    resposta: 'Comece reconstruindo o fato antes de interpretá-lo: o que a pessoa estava fazendo, com qual equipamento, em que condição estava o local, que horário era, havia pressa, era tarefa de rotina ou excepcional. Com o fato descrito, aplique a cadeia de por quês até chegar a uma causa que a empresa controle. Em seguida, verifique o histórico: o app mostra itens reprovados várias vezes no mesmo setor, e essa reincidência costuma apontar a causa antes de qualquer análise. Por último, a medida proposta precisa ser verificável, com responsável e prazo, porque medida genérica como orientar a equipe não muda a condição que produziu o acidente.',
    cipeiro: 'Descrever o fato, perguntar por que até chegar ao que a empresa pode mudar e propor medida com responsável e prazo.',
    encaminhar: 'Reunião da CIPA, com encaminhamento à gerência e ao SESMT quando houver',
    base: ['5.3.1'],
    chaves: 'causa do acidente evitar repeticao reincidencia analise causa raiz'
  },

  /* ===================================================
     TEMA 3 - MAQUINAS, EQUIPAMENTOS E FERRAMENTAS
     =================================================== */
  {
    n: 21,
    tema: CIPA_TEMAS[2],
    pergunta: 'O que devo fazer se encontrar uma máquina sem proteção adequada?',
    resposta: 'Máquina sem a proteção que deveria ter é risco grave, porque a proteção existe exatamente para impedir o contato com a parte que corta, prensa ou gira. Oriente para que o equipamento não seja usado naquela condição, comunique imediatamente o responsável do setor e a manutenção, e registre com foto. Se a proteção foi retirada e guardada, isso precisa ser dito no registro, porque mostra que existe e que foi removida por alguém. Quando o risco é de lesão imediata, a CIPA pode propor formalmente a interrupção da atividade até a correção.',
    cipeiro: 'Orientar a não usar, registrar com foto e encaminhar à manutenção. Recolocar proteção não é tarefa do cipeiro.',
    encaminhar: 'Manutenção e gerência, com registro na reunião da CIPA',
    base: ['5.3.1'],
    normas: 'NR-12, que exige proteções nas zonas de perigo das máquinas e equipamentos',
    chaves: 'maquina sem protecao protecao removida grade zona de perigo'
  },
  {
    n: 22,
    tema: CIPA_TEMAS[2],
    pergunta: 'Posso continuar trabalhando em um equipamento que apresenta defeito?',
    resposta: 'Não, enquanto o defeito não for avaliado. Equipamento com defeito pode falhar de forma inesperada justamente no momento de maior exposição da pessoa. A conduta é parar o uso, sinalizar que o equipamento está fora de operação para que ninguém o ligue por engano, comunicar a manutenção e registrar. Defeito em dispositivo de segurança, como botão de emergência, proteção, sensor ou chave, é motivo para retirada imediata de uso, e não para uso com cuidado redobrado. Quem libera o retorno à operação é quem fez o reparo, não quem opera.',
    cipeiro: 'Parar o uso, sinalizar, registrar e encaminhar. Avaliar se o defeito é grave é da manutenção.',
    encaminhar: 'Manutenção, com comunicação à chefia do setor',
    base: ['5.3.1'],
    normas: 'NR-12, quanto à manutenção e à segurança dos sistemas de comando',
    chaves: 'equipamento com defeito quebrado pode usar parar maquina'
  },
  {
    n: 23,
    tema: CIPA_TEMAS[2],
    pergunta: 'Quem pode retirar, instalar ou ajustar a proteção de uma máquina?',
    resposta: 'Somente pessoa autorizada e capacitada para isso, em geral a manutenção, e apenas quando a tarefa exigir, com a máquina parada e a energia bloqueada. Terminada a intervenção, a proteção tem de voltar antes de a máquina ser liberada. É proibido burlar, anular ou neutralizar dispositivo de segurança para ganhar tempo ou facilitar a tarefa, e isso inclui amarrar sensor, travar botão e trabalhar com a porta de proteção aberta. Operador não remove proteção por conta própria.',
    cipeiro: 'Registrar e encaminhar qualquer proteção removida ou burlada. É uma das falhas mais graves de se encontrar em vistoria.',
    encaminhar: 'Manutenção e gerência',
    base: ['5.3.1'],
    normas: 'NR-12, que veda a neutralização de dispositivos de segurança e exige bloqueio de energia para intervenções',
    chaves: 'quem pode tirar protecao burlar dispositivo seguranca bloqueio'
  },
  {
    n: 24,
    tema: CIPA_TEMAS[2],
    pergunta: 'É seguro limpar uma máquina enquanto ela está ligada?',
    resposta: 'Não. Limpeza, lubrificação, ajuste e manutenção devem ser feitos com a máquina parada e com a fonte de energia isolada e bloqueada, de modo que ninguém consiga ligá-la enquanto alguém tem a mão em área de risco. É nessa situação que acontecem as amputações mais comuns em padaria: a mão entra para tirar resto de massa ou farinha com o equipamento energizado, e um acionamento acidental ou um movimento residual basta. Desligar no botão não é o mesmo que bloquear a energia: a máquina continua energizada e pode ser religada por outra pessoa.',
    cipeiro: 'Orientar que limpeza é com máquina parada e energia bloqueada, e registrar sempre que vir limpeza com equipamento ligado.',
    encaminhar: 'Chefia do setor e manutenção, para definir o procedimento de bloqueio',
    base: ['5.3.1'],
    normas: 'NR-12, quanto a procedimentos de limpeza e manutenção com bloqueio de energia',
    chaves: 'limpar maquina ligada desligada bloqueio energia lubrificacao'
  },
  {
    n: 25,
    tema: CIPA_TEMAS[2],
    pergunta: 'O que fazer quando um equipamento apresenta barulho, vibração ou aquecimento fora do normal?',
    resposta: 'São sinais de que algo mudou dentro do equipamento, e normalmente aparecem antes da quebra. Barulho novo pode ser rolamento, folga ou peça solta. Vibração pode ser desbalanceamento ou fixação frouxa. Aquecimento pode ser atrito, sobrecarga ou problema elétrico, e vem junto com risco de queimadura e de incêndio. Cheiro de queimado é caso de parada imediata. A conduta é parar o uso, comunicar a manutenção, descrever o sinal percebido e desde quando aparece, e registrar. Não espere a quebra para registrar, porque o valor desse relato está em ser antecipado.',
    cipeiro: 'Descrever o sinal com precisão, desde quando aparece e em que momento da operação. Esse detalhe orienta a manutenção.',
    encaminhar: 'Manutenção, com comunicação à chefia do setor',
    base: ['5.3.1'],
    normas: 'NR-12, quanto à manutenção preventiva e à retirada de operação de equipamento com indício de falha',
    chaves: 'barulho vibracao aquecimento cheiro de queimado sinal de defeito'
  },
  {
    n: 26,
    tema: CIPA_TEMAS[2],
    pergunta: 'Como agir se perceber que um botão de emergência não está funcionando?',
    resposta: 'Trate como parada imediata do equipamento. O botão de emergência é o último recurso quando alguma coisa dá errado, e uma máquina cujo dispositivo de parada não responde está sem a proteção que a norma exige. Não deixe o equipamento em uso com a observação de que basta tomar cuidado. Sinalize que está fora de operação, comunique a manutenção e registre com urgência alta. O mesmo vale para proteção que não interrompe o funcionamento ao ser aberta e para sensor que deveria parar o movimento e não para.',
    cipeiro: 'Classificar como urgência alta, registrar e insistir até a correção. Dispositivo de segurança inoperante não admite espera.',
    encaminhar: 'Manutenção de imediato, e gerência se não houver atendimento',
    base: ['5.3.1'],
    normas: 'NR-12, quanto aos dispositivos de parada de emergência',
    chaves: 'botao de emergencia nao funciona parada de emergencia dispositivo'
  },
  {
    n: 27,
    tema: CIPA_TEMAS[2],
    pergunta: 'Quem pode operar máquinas para as quais não recebeu treinamento?',
    resposta: 'Ninguém. A operação de máquinas e equipamentos é restrita a trabalhador capacitado, qualificado ou habilitado conforme o caso, e autorizado pela empresa para aquela função. Quem não recebeu a capacitação não deve assumir o equipamento nem em substituição eventual, cobrindo falta de colega ou em pico de produção, que é quando o improviso costuma acontecer. Se a escala obriga alguém a operar sem treinamento, o problema não é da pessoa: é de dimensionamento e de capacitação, e isso precisa ser registrado e levado à gerência.',
    cipeiro: 'Registrar a situação, não a pessoa. Operação sem treinamento é falha de organização do trabalho.',
    encaminhar: 'Chefia do setor, RH quanto à capacitação, e gerência',
    base: ['5.3.1', '5.3.2'],
    normas: 'NR-12, que restringe a operação a trabalhadores capacitados e autorizados',
    chaves: 'operar sem treinamento capacitacao autorizado substituir colega'
  },
  {
    n: 28,
    tema: CIPA_TEMAS[2],
    pergunta: 'O que fazer se um colega improvisar uma ferramenta para terminar o serviço mais rápido?',
    resposta: 'O improviso é um sintoma, e vale enxergar os dois lados. De um lado é risco direto: ferramenta improvisada não tem o dimensionamento, o isolamento nem a proteção da ferramenta correta, e falha justamente sob esforço. De outro, o improviso indica que falta ferramenta adequada, ou que ela existe e está longe, quebrada ou em número insuficiente. Oriente a interromper o improviso na hora, registre o caso e registre também a carência que o gerou. Resolver só o improviso sem resolver a falta de ferramenta faz o improviso voltar na semana seguinte.',
    cipeiro: 'Orientar a parar, registrar o improviso e registrar a falta que o motivou. A segunda parte é a que evita a repetição.',
    encaminhar: 'Chefia do setor e gerência, para provisão da ferramenta correta',
    base: ['5.3.1'],
    normas: 'NR-12, quanto à adequação de ferramentas e dispositivos de trabalho',
    chaves: 'improviso ferramenta improvisada gambiarra jeitinho pressa'
  },
  {
    n: 29,
    tema: CIPA_TEMAS[2],
    pergunta: 'Quais cuidados devem ser tomados ao utilizar fatiadores, amassadeiras, cilindros e outros equipamentos de uma padaria?',
    resposta: 'São os equipamentos que mais amputam e cortam no ramo, e os cuidados se repetem. Opere apenas com as proteções no lugar, nunca com grade, tampa ou cesto removidos. Nunca empurre produto com a mão onde existe empurrador, pá ou dispositivo próprio. Não introduza a mão no equipamento em funcionamento, inclusive para corrigir massa ou tirar resíduo. Para limpar, parar e bloquear a energia, e lembrar que lâmina de fatiador corta igual parada. Mantenha o entorno seco e desobstruído, porque escorregão perto de equipamento com lâmina transforma queda em corte. E somente pessoa treinada e autorizada deve operar. A NR-12 tem anexo específico sobre máquinas para panificação e confeitaria, que detalha as proteções exigidas nesses equipamentos.',
    cipeiro: 'Na vistoria desses equipamentos, olhar proteção no lugar, empurrador disponível, procedimento de limpeza com bloqueio e operador treinado.',
    encaminhar: 'Manutenção para as proteções, chefia e RH para a capacitação',
    base: ['5.3.1'],
    normas: 'NR-12 e seu anexo sobre máquinas para panificação e confeitaria',
    chaves: 'fatiador amassadeira cilindro modeladora padaria panificacao laminas'
  },
  {
    n: 30,
    tema: CIPA_TEMAS[2],
    pergunta: 'Quando um equipamento deve ser retirado de uso por apresentar risco?',
    resposta: 'Sempre que a falha atinge o que impede a lesão ou quando o comportamento do equipamento deixou de ser previsível. Na prática: proteção ausente, removida ou burlada; parada de emergência que não responde; sensor ou chave de segurança inoperante; fiação exposta, choque ou cheiro de queimado; vazamento de gás; peça com trinca ou folga em parte que gira ou corta; e qualquer equipamento que já provocou acidente ou quase acidente e ainda não foi avaliado. Retirar de uso significa parar, sinalizar que está fora de operação e impedir que seja religado, não apenas pedir atenção a quem opera. A liberação é de quem reparou.',
    cipeiro: 'Propor a retirada de uso e registrar como urgência alta. Em risco grave e iminente, a CIPA pode propor formalmente a interrupção da atividade.',
    encaminhar: 'Manutenção e gerência, com registro na reunião da CIPA',
    base: ['5.3.1'],
    normas: 'NR-12, quanto à interrupção de uso de equipamento que ofereça risco',
    chaves: 'retirar de uso parar equipamento interditar risco grave iminente'
  },

  /* ===================================================
     TEMA 4 - EPIS E PROTECAO INDIVIDUAL
     =================================================== */
  {
    n: 31,
    tema: CIPA_TEMAS[3],
    pergunta: 'Quais equipamentos de proteção individual são necessários em cada setor?',
    resposta: 'Quem define é o inventário de riscos da empresa, dentro do PGR, com base nos riscos reais de cada atividade, e não o costume do setor. O EPI entra quando não é possível eliminar o risco na fonte nem controlá-lo por medida coletiva, por isso a lista certa sai do documento e não da opinião. No nosso ramo, os grupos mais comuns são: proteção das mãos contra corte e contra calor na produção e na confeitaria, proteção contra produtos químicos na limpeza, calçado com solado antiderrapante nas áreas de piso úmido, e proteção respiratória ou de vias aéreas onde há pó de farinha em suspensão. A CIPA não arbitra qual EPI usar: ela aponta a exposição que viu e pede a definição técnica.',
    cipeiro: 'Registrar a exposição observada e pedir à empresa a definição técnica do EPI, em vez de indicar o equipamento por conta própria.',
    encaminhar: 'SESMT quando houver, ou o responsável técnico pelo PGR, e gerência para a compra',
    base: ['5.3.1'],
    normas: 'NR-6, quanto ao EPI adequado ao risco, e NR-1, quanto ao inventário de riscos do PGR',
    chaves: 'qual epi cada setor lista de epi definir equipamento de protecao'
  },
  {
    n: 32,
    tema: CIPA_TEMAS[3],
    pergunta: 'A empresa é obrigada a fornecer EPI gratuitamente?',
    resposta: 'Sim. A empresa é obrigada a fornecer ao empregado, gratuitamente, o EPI adequado ao risco, em perfeito estado de conservação e funcionamento, e o equipamento deve ter Certificado de Aprovação. A obrigação não se encerra na entrega: a empresa também deve orientar e treinar sobre o uso, a guarda e a conservação, substituir imediatamente quando danificado ou extraviado, higienizar e manter a manutenção periódica, e registrar o fornecimento. Cobrar do trabalhador o valor do EPI ou exigir que ele compre o próprio não é admitido.',
    cipeiro: 'Registrar e encaminhar qualquer caso de EPI não fornecido, cobrado do trabalhador ou entregue em más condições.',
    encaminhar: 'Gerência e RH',
    base: ['5.3.1', '5.3.2'],
    normas: 'NR-6, quanto ao fornecimento gratuito de EPI adequado e com Certificado de Aprovação',
    chaves: 'epi gratuito empresa obrigada comprar epi pagar descontar ca'
  },
  {
    n: 33,
    tema: CIPA_TEMAS[3],
    pergunta: 'O que fazer quando o EPI fornecido está danificado ou não serve corretamente?',
    resposta: 'EPI danificado ou de tamanho errado não protege e muitas vezes cria risco novo: luva grande engancha, calçado folgado faz tropeçar, óculos que escorrega é retirado no pior momento. A empresa deve substituir imediatamente o equipamento danificado ou extraviado, e o equipamento precisa ser adequado à pessoa, não apenas ao risco. A conduta é comunicar a chefia na hora, solicitar a substituição e registrar se a troca não acontecer. Enquanto não houver o EPI adequado, a tarefa que exige aquele EPI não deve ser executada.',
    cipeiro: 'Registrar a falta ou a inadequação, e insistir na troca. EPI que não serve é tão problema quanto EPI ausente.',
    encaminhar: 'Chefia do setor e RH, para substituição',
    base: ['5.3.1'],
    normas: 'NR-6, quanto à substituição imediata do EPI danificado ou extraviado',
    chaves: 'epi danificado rasgado tamanho errado nao serve substituir trocar'
  },
  {
    n: 34,
    tema: CIPA_TEMAS[3],
    pergunta: 'Quem é responsável por fiscalizar o uso dos EPIs?',
    resposta: 'A exigência do uso é da empresa, por meio da chefia imediata, que responde pela supervisão da tarefa. O trabalhador é obrigado a usar o equipamento apenas para a finalidade a que se destina, a guardar e conservar, a comunicar qualquer alteração que o torne impróprio e a cumprir as determinações sobre o uso adequado. A CIPA não é órgão fiscalizador e não aplica sanção: ela verifica, orienta, registra o que encontrou e leva o padrão observado à reunião. Quando o não uso é generalizado em um setor, isso deixa de ser questão individual e passa a ser indicador de que algo no EPI, no treinamento ou no ritmo de trabalho está errado.',
    cipeiro: 'Verificar e orientar, nunca punir. Não uso generalizado é problema de causa, e a causa é o que a CIPA deve registrar.',
    encaminhar: 'Chefia do setor para a exigência, gerência quando a causa é do equipamento ou do processo',
    base: ['5.3.1'],
    normas: 'NR-6, quanto às obrigações da organização e do empregado sobre o uso do EPI',
    chaves: 'fiscalizar epi quem cobra uso obrigacao do empregado punir'
  },
  {
    n: 35,
    tema: CIPA_TEMAS[3],
    pergunta: 'O que acontece se um colaborador se recusar a usar o equipamento de proteção?',
    resposta: 'O uso do EPI fornecido é obrigação do empregado, e a CLT considera ato faltoso a recusa injustificada ao uso dos equipamentos de proteção fornecidos pela empresa, o que pode levar a medida disciplinar. Mas antes de chegar a esse ponto, vale separar recusa de impedimento. Se o EPI machuca, não serve, embaça, atrapalha a tarefa ou não existe em número suficiente, não há recusa: há um problema do equipamento, que precisa ser registrado e corrigido. Se o equipamento está correto e a pessoa simplesmente não usa, o caminho é orientação da chefia e, persistindo, a medida disciplinar que cabe a ela aplicar.',
    cipeiro: 'Investigar o motivo antes de tratar como recusa. A medida disciplinar é da chefia, nunca da CIPA.',
    encaminhar: 'Chefia do setor, e RH quando houver medida disciplinar',
    base: ['5.3.1', '5.3.3'],
    normas: 'CLT, artigo 158, quanto ao ato faltoso na recusa injustificada, e NR-6',
    chaves: 'recusa usar epi nao quer usar ato faltoso advertencia punicao'
  },
  {
    n: 36,
    tema: CIPA_TEMAS[3],
    pergunta: 'Como saber se uma luva é adequada para trabalhar com alimentos quentes, objetos cortantes ou produtos químicos?',
    resposta: 'Luva não é item genérico: cada tipo protege contra um risco e falha nos outros. Luva térmica protege contra calor por contato, mas corta com facilidade. Luva de malha de aço ou com resistência ao corte protege a mão da lâmina, e não isola calor. Luva de borracha para produto químico depende do produto: o material e a espessura precisam ser compatíveis com a substância, informação que está na Ficha com Dados de Segurança e na orientação do fabricante da luva. Luva descartável de manipulação de alimento não é EPI contra calor, corte nem químico. Dois pontos práticos: luva térmica úmida deixa de proteger, porque a água conduz o calor, e nenhuma luva substitui a proteção do equipamento.',
    cipeiro: 'Registrar a tarefa e o risco observado e pedir a definição técnica do tipo de luva, com a FDS do produto quando for químico.',
    encaminhar: 'SESMT quando houver, ou o responsável técnico pelo PGR, e gerência para a compra',
    base: ['5.3.1'],
    normas: 'NR-6, quanto à adequação do EPI ao risco, e NR-26, quanto à FDS dos produtos químicos',
    chaves: 'luva termica corte quimico qual luva usar adequada calor'
  },
  {
    n: 37,
    tema: CIPA_TEMAS[3],
    pergunta: 'Luvas descartáveis substituem a lavagem das mãos?',
    resposta: 'Não substituem em nenhuma hipótese. A luva descartável é barreira para a manipulação do alimento, e contamina igual a mão quando é usada por muito tempo, quando se toca em superfícies sujas, dinheiro, celular ou lixo com ela, e quando é reutilizada. As mãos devem ser lavadas antes de calçar a luva e depois de retirá-la, e a luva deve ser trocada a cada mudança de atividade, sempre que se danificar e sempre que houver interrupção da tarefa. Também é preciso lembrar que luva descartável não protege o trabalhador: ela protege o alimento. Para corte, calor ou produto químico, o EPI é outro.',
    cipeiro: 'Orientar sobre a troca e a lavagem, e não confundir barreira sanitária do alimento com proteção do trabalhador.',
    encaminhar: 'Chefia do setor e responsável pelas boas práticas',
    base: ['5.3.1'],
    normas: 'Boas práticas de manipulação de alimentos, e NR-6 quanto ao EPI de proteção do trabalhador',
    chaves: 'luva descartavel lavar as maos higiene substitui manipulacao'
  },
  {
    n: 38,
    tema: CIPA_TEMAS[3],
    pergunta: 'Quando um EPI precisa ser substituído?',
    resposta: 'Sempre que deixa de proteger, e isso acontece antes de o equipamento parecer destruído. Troque quando houver dano visível, como rasgo, furo, corte, trinca ou costura aberta; quando estiver deformado, endurecido, derretido ou com o material alterado pelo calor ou pelo produto químico; quando a vedação, o ajuste ou o solado perderem a função; quando o prazo de validade ou a vida útil indicada pelo fabricante vencer; quando for exposto a produto incompatível; e quando se perder ou for extraviado. A substituição por equipamento danificado é imediata, e cabe à empresa. Luva de borracha que endureceu e calçado com solado liso são os casos mais comuns de EPI mantido em uso sem proteger.',
    cipeiro: 'Na vistoria, olhar o estado do EPI em uso, não só a existência dele. EPI gasto é falha para registrar.',
    encaminhar: 'Chefia do setor e RH, para substituição',
    base: ['5.3.1'],
    normas: 'NR-6, quanto à substituição e à manutenção periódica do EPI',
    chaves: 'trocar epi validade vida util quando substituir desgastado'
  },
  {
    n: 39,
    tema: CIPA_TEMAS[3],
    pergunta: 'O que fazer quando o EPI atrapalha a execução da tarefa ou parece aumentar o risco?',
    resposta: 'Isso precisa ser levado a sério, e não tratado como desculpa. EPI que atrapalha costuma indicar escolha errada do equipamento ou tarefa mal organizada: luva grossa que impede sentir a peça, óculos que embaça junto ao forno, luva que pode ser puxada por parte girando de máquina. Em alguns casos o próprio EPI cria risco novo, e aí a solução não é insistir nele, é rever a medida de proteção. A conduta é registrar com detalhe qual tarefa, qual EPI e o que exatamente atrapalha, e encaminhar para avaliação técnica. Enquanto a avaliação não sai, a tarefa não deve ser feita sem proteção alguma: o caminho é rever a forma de executar com a chefia.',
    cipeiro: 'Registrar a incompatibilidade entre EPI e tarefa com detalhe, e encaminhar para avaliação técnica em vez de decidir sozinho.',
    encaminhar: 'SESMT quando houver, ou o responsável técnico pelo PGR, e chefia do setor',
    base: ['5.3.1'],
    normas: 'NR-6, quanto à adequação do EPI, e NR-12, quanto ao risco de agarramento por partes móveis',
    chaves: 'epi atrapalha incomoda aumenta risco embaça nao da para trabalhar'
  },
  {
    n: 40,
    tema: CIPA_TEMAS[3],
    pergunta: 'Como orientar um colega sobre o uso correto do EPI sem criar conflitos?',
    resposta: 'Converse em particular, nunca diante da equipe, porque correção em público vira defesa de orgulho e não muda comportamento. Comece perguntando em vez de afirmando: pergunte se o equipamento está incomodando, se o tamanho está certo, se atrapalha a tarefa. Em seguida, explique o risco concreto daquele posto, com um caso real do setor, e não com a regra abstrata. Fale como colega que também trabalha ali, não como fiscal, porque o cipeiro não é fiscal. Se aparecer um obstáculo real, registre e encaminhe, e volte depois para dizer o que foi feito, porque isso constrói a confiança que sustenta a próxima conversa. E se a resistência persistir sem motivo, a cobrança é da chefia.',
    cipeiro: 'Orientar em particular, perguntar antes de afirmar, resolver o obstáculo real e devolver a resposta. A cobrança disciplinar é da chefia.',
    encaminhar: 'Chefia do setor quando a resistência persiste sem causa concreta',
    base: ['5.3.1', '5.3.3'],
    chaves: 'orientar colega sem conflito conversar abordar uso correto epi'
  },

  /* ===================================================
     TEMA 5 - SEGURANCA NA COZINHA, PRODUCAO E CONFEITARIA
     =================================================== */
  {
    n: 41,
    tema: CIPA_TEMAS[4],
    pergunta: 'Quais são os maiores riscos de acidentes em uma cozinha industrial de padaria?',
    resposta: 'Seis grupos concentram quase tudo. Queimadura, por contato com forno, assadeira, estufa, fritadeira, vapor e água quente. Corte e amputação, em facas, fatiadores, cilindros, amassadeiras e lâminas em geral, principalmente na limpeza. Queda, por piso molhado ou engordurado, que é o acidente mais frequente do ramo. Esforço e postura, por levantamento de sacos de farinha, caixas e trabalho em pé por longos períodos. Choque elétrico e incêndio, por equipamento com fiação comprometida, gás e gordura acumulada. E risco químico, nos produtos de limpeza, agravado quando são diluídos ou misturados sem orientação. A esses se soma o ritmo: pressa e horário de pico multiplicam todos os anteriores.',
    cipeiro: 'Usar esses seis grupos como roteiro de vistoria da cozinha, para não olhar só o que está mais visível no dia.',
    encaminhar: 'Reunião da CIPA, para compor o plano de trabalho por setor',
    base: ['5.3.1'],
    normas: 'NR-1 quanto ao inventário de riscos, NR-12, NR-17 e NR-23',
    chaves: 'riscos cozinha padaria producao maiores riscos quais sao'
  },
  {
    n: 42,
    tema: CIPA_TEMAS[4],
    pergunta: 'Como evitar queimaduras ao trabalhar com fornos, assadeiras, fritadeiras e estufas?',
    resposta: 'Use sempre luva térmica seca e em bom estado, porque luva úmida conduz o calor e queima mais do que a mão nua. Abra a porta do forno e saia da linha do vapor antes de olhar para dentro, já que o jato de vapor queima à distância. Não carregue assadeira quente com pano de prato, que escorrega e se solta. Avise em voz alta quando passar com algo quente, e combine no setor um aviso padrão. Nunca coloque assadeira quente em bancada de passagem sem sinalizar. Na fritadeira, não adicione alimento úmido ou congelado em óleo quente, por causa da projeção, e nunca movimente o óleo quente: espere esfriar para filtrar ou descartar. Mantenha a via de circulação livre para não precisar desviar com peça quente nas mãos.',
    cipeiro: 'Na vistoria, olhar luva térmica seca e íntegra, apoio definido para peça quente e circulação livre no entorno do forno.',
    encaminhar: 'Chefia do setor, e gerência para provisão de luva e de apoio adequado',
    base: ['5.3.1'],
    normas: 'NR-6 quanto à luva térmica adequada, e NR-1 quanto às medidas de controle',
    chaves: 'queimadura forno assadeira fritadeira estufa vapor calor luva termica'
  },
  {
    n: 43,
    tema: CIPA_TEMAS[4],
    pergunta: 'Qual é a forma mais segura de transportar panelas, bandejas e recipientes quentes?',
    resposta: 'Antes de pegar, defina para onde vai e confirme que o apoio de destino está livre, porque quase todo acidente desse tipo acontece com a peça já na mão e sem lugar para colocar. Confira o caminho: piso seco, passagem desobstruída e porta que não vá abrir na sua frente. Use luva térmica seca, segure com as duas mãos, mantenha a peça abaixo da linha do peito e longe do corpo, e nunca acima da altura dos ombros. Avise quem está no caminho. Panela com líquido quente não deve ser enchida acima de dois terços, e, quando é pesada, a conduta correta é esvaziar em etapas com recipiente menor, ou pedir ajuda, em vez de carregar cheia. Distância longa com peça quente pede carro de transporte.',
    cipeiro: 'Orientar a confirmar o destino e o caminho antes de pegar a peça quente, e registrar a falta de apoio ou de carro de transporte.',
    encaminhar: 'Chefia do setor, e gerência para provisão de carro e de bancada de apoio',
    base: ['5.3.1'],
    normas: 'NR-17, quanto ao transporte manual de cargas',
    chaves: 'transportar panela quente bandeja recipiente caldeirao carregar'
  },
  {
    n: 44,
    tema: CIPA_TEMAS[4],
    pergunta: 'O que fazer quando o óleo da fritadeira começa a pegar fogo?',
    resposta: 'Nunca jogue água, em nenhuma quantidade: a água vira vapor instantaneamente dentro do óleo e lança uma bola de fogo. Também não use pano molhado nem tente carregar o recipiente em chamas. A conduta correta é cortar a energia ou o gás do equipamento, se o painel estiver acessível com segurança, e abafar, cobrindo a superfície com a tampa própria ou com uma tampa metálica, deixando-a no lugar até esfriar completamente. O extintor indicado para óleo e gordura de cozinha é o de classe K.\n\nAtenção à nossa situação hoje: não temos tampa de abafamento junto da fritadeira nem extintor de classe K na produção. Enquanto isso não for providenciado, a conduta aqui é outra, e precisa estar clara para a equipe: corte a energia ou o gás se o comando estiver acessível, não tente combater o fogo, retire todos da área, feche a porta ao sair e acione o Corpo de Bombeiros pelo 193. Não use o extintor de água em hipótese alguma sobre óleo. O extintor de CO2 não é o agente próprio para fritadeira e, aplicado de perto ou com jato direto, pode espalhar o óleo em chamas, então ele não deve ser usado como solução para esse caso.',
    cipeiro: 'Levar como pendência prioritária a compra da tampa de abafamento e do extintor de classe K, e orientar a equipe de que, até lá, a conduta é evacuar e chamar o 193, nunca combater.',
    encaminhar: 'Gerência, com urgência, e brigada de incêndio. Registrar na reunião da CIPA até ser resolvido',
    base: ['5.3.1'],
    normas: 'NR-23, quanto à proteção contra incêndios e aos equipamentos de combate',
    chaves: 'fogo no oleo fritadeira incendio gordura agua extintor classe k'
  },
  {
    n: 45,
    tema: CIPA_TEMAS[4],
    pergunta: 'Como evitar cortes durante o preparo de alimentos?',
    resposta: 'Faca afiada corta menos gente do que faca cega, porque a cega exige força e escapa. Corte sempre sobre tábua estável, com o alimento apoiado, nunca na mão. Mantenha os dedos recolhidos, com a ponta para dentro, usando os nós como guia. Direcione o corte para longe do corpo. Nunca tente aparar faca que cai: deixe cair e afaste o pé. Não deixe faca dentro da pia com água, submersa e invisível, que é uma das causas clássicas de corte. Lave e guarde uma a uma, em suporte próprio, nunca soltas em gaveta. Não use faca para abrir embalagem nem como alavanca. E pare de cortar quando for falar com alguém, porque conversa divide a atenção.',
    cipeiro: 'Na vistoria, olhar estado de afiação, tábua estável, suporte de guarda das facas e o hábito de deixar faca na pia.',
    encaminhar: 'Chefia do setor, e gerência para provisão de suporte e de tábua adequada',
    base: ['5.3.1'],
    normas: 'NR-6 quanto à luva de resistência ao corte, quando indicada pelo PGR',
    chaves: 'corte faca cortar alimento prevenir corte tabua afiada pia'
  },
  {
    n: 46,
    tema: CIPA_TEMAS[4],
    pergunta: 'Qual é a maneira segura de limpar equipamentos que possuem lâminas?',
    resposta: 'A regra central é uma: equipamento parado e energia bloqueada, de forma que ninguém consiga ligá-lo com a mão de alguém na área da lâmina. Desligar no botão não basta, porque outra pessoa pode religar. No fatiador, recolha o regulador de espessura à posição zero antes de limpar, use escova ou pano com apoio em vez de passar o dedo na lâmina, e limpe a lâmina sempre no sentido do fio e de dentro para fora. Retire o carro e as peças removíveis e lave-os separadamente, longe do equipamento. Não use jato de água em equipamento elétrico. Lâmina parada corta igual, e a maioria dos acidentes nesses equipamentos acontece na limpeza, não na operação.',
    cipeiro: 'Verificar se existe procedimento escrito de limpeza com bloqueio de energia e se quem limpa foi treinado nele.',
    encaminhar: 'Manutenção e chefia do setor, para o procedimento de bloqueio, e RH para a capacitação',
    base: ['5.3.1'],
    normas: 'NR-12, quanto à limpeza com máquina parada e energia bloqueada',
    chaves: 'limpar fatiador lamina seguranca limpeza bloqueio energia faca da maquina'
  },
  {
    n: 47,
    tema: CIPA_TEMAS[4],
    pergunta: 'Como prevenir acidentes ao manusear água quente, vapor e superfícies aquecidas?',
    resposta: 'Vapor queima mais do que água fervente, porque libera muito mais calor ao condensar na pele, e queima sem que a pessoa toque em nada. Por isso, nunca fique na linha de saída do vapor: abra tampa, porta de forno ou panela de pressão com o rosto e os braços fora do caminho, inclinando a tampa para longe. Desligue antes de abrir, quando o equipamento permitir. Nunca abra panela de pressão com pressão interna. Para água quente, transporte em recipiente fechado, não encha acima de dois terços e nunca passe com ela em piso molhado. Considere quente toda superfície próxima de fonte de calor até confirmar o contrário, porque metal aquecido não muda de aparência. Vazamento de vapor em tubulação é caso de parada e manutenção.',
    cipeiro: 'Na vistoria, olhar isolamento de tubulação e de superfície quente, sinalização e o hábito de abrir equipamento fora da linha do vapor.',
    encaminhar: 'Manutenção para isolamento e vazamento, chefia do setor para o procedimento',
    base: ['5.3.1'],
    normas: 'NR-13 quanto a equipamentos sob pressão, e NR-1 quanto às medidas de controle',
    chaves: 'vapor agua quente superficie aquecida queimadura panela de pressao'
  },
  {
    n: 48,
    tema: CIPA_TEMAS[4],
    pergunta: 'O que fazer quando o piso da cozinha fica molhado ou engordurado?',
    resposta: 'A conduta imediata é sinalizar e limpar, nessa ordem, porque sinalizar primeiro protege quem passa enquanto a limpeza acontece. Quem percebe é quem sinaliza, sem esperar pela equipe de limpeza. Gordura exige produto desengraxante: pano seco apenas espalha a película e deixa o piso mais escorregadio do que estava. Depois de lavar, seque, porque piso molhado limpo escorrega igual. Se o acúmulo se repete sempre no mesmo ponto, isso não é falta de limpeza: é vazamento, condensação, respingo de fritura ou ausência de ralo, e aí o registro deve apontar a causa e não o episódio. Calçado com solado antiderrapante em bom estado é parte da solução, nunca a solução inteira.',
    cipeiro: 'Registrar o ponto que molha sempre, não o molhado do dia. Causa que se repete é o que a CIPA leva à reunião.',
    encaminhar: 'Limpeza e chefia do setor de imediato, manutenção e gerência para a causa',
    base: ['5.3.1'],
    normas: 'NR-8 quanto ao piso, e NR-26 quanto à sinalização de segurança',
    chaves: 'piso molhado gordura escorregadio sinalizar limpar queda cozinha'
  },
  {
    n: 49,
    tema: CIPA_TEMAS[4],
    pergunta: 'Como evitar lesões ao levantar sacos de farinha, caixas e outros materiais pesados?',
    resposta: 'A norma de ergonomia determina que não se exija nem admita transporte manual de carga que, pelo peso, possa comprometer a saúde do trabalhador, e que o transporte manual regular seja feito com meios técnicos apropriados. Então a primeira pergunta não é como levantar, é se é preciso levantar: carro, carrinho, paleteira ou transporte em etapas resolvem a maior parte dos casos. Quando o levantamento manual é inevitável, avalie o peso antes, aproxime-se da carga, afaste os pés, flexione os joelhos mantendo as costas retas, segure firme, levante com a força das pernas e mantenha a carga junto ao corpo. Nunca gire o tronco com a carga erguida: mova os pés. Peça ajuda sem hesitar, e combine o movimento quando houver duas pessoas. Empilhar saco de farinha acima da altura dos ombros é risco que a CIPA deve registrar.',
    cipeiro: 'Registrar a tarefa que exige levantamento repetido ou pesado e pedir meio técnico de transporte, em vez de ensinar apenas a técnica.',
    encaminhar: 'Gerência para provisão de carro ou paleteira, e SESMT quando houver para a avaliação ergonômica',
    base: ['5.3.1'],
    normas: 'NR-17, quanto ao levantamento, transporte e descarga individual de materiais',
    chaves: 'levantar peso saco de farinha caixa carga coluna postura carrinho'
  },
  {
    n: 50,
    tema: CIPA_TEMAS[4],
    pergunta: 'Quais cuidados devem ser tomados ao movimentar bandejas e assadeiras em locais apertados?',
    resposta: 'Em espaço apertado, o problema raro é a força e o comum é a visão e o encontro de duas pessoas. Carregue a bandeja na altura da cintura, nunca na frente do rosto, para manter o piso à vista. Avise em voz alta ao entrar em passagem estreita ou ao virar esquina cega, e combine um sentido único de circulação quando o fluxo é intenso. Nunca empilhe assadeiras além do que permite ver por cima. Em carro de assadeiras, empurre em vez de puxar, mantenha as mãos nas alças e não nas laterais, e confira a travagem das rodas antes de carregar. Antes de entrar na passagem, verifique se há onde apoiar no destino. Se o aperto é permanente, a solução é layout, e não habilidade: registre e encaminhe.',
    cipeiro: 'Registrar o aperto permanente como problema de layout e circulação, e não insistir apenas na destreza de quem carrega.',
    encaminhar: 'Chefia do setor de imediato, gerência para o layout e o carro de transporte',
    base: ['5.3.1'],
    normas: 'NR-8 e NR-17, quanto à circulação e à movimentação de materiais',
    chaves: 'bandeja assadeira local apertado circulacao carro empilhar visao'
  },

  /* ===================================================
     TEMA 6 - QUEDAS, ORGANIZACAO E CIRCULACAO
     =================================================== */
  {
    n: 51,
    tema: CIPA_TEMAS[5],
    pergunta: 'Por que um piso aparentemente limpo ainda pode representar risco de queda?',
    resposta: 'Porque o que faz escorregar quase sempre é invisível. Película fina de gordura, resíduo de produto de limpeza mal enxaguado, farinha ou açúcar em pó espalhado, condensação de câmara fria, e piso que simplesmente perdeu a rugosidade com o uso: nenhum deles aparece como sujeira. Há ainda o piso correto para área seca instalado em área que vive úmida, caso em que o problema é o material e não a limpeza. Desnível pequeno, soleira, tapete solto e piso solto ou trincado completam a lista. Por isso a vistoria de piso não pode ser visual apenas: vale observar como as pessoas andam ali, porque passo curto e apoio na bancada indicam que quem trabalha no setor já sabe que escorrega.',
    cipeiro: 'Observar o comportamento de quem circula, não só a aparência do piso, e registrar o ponto que todos desviam.',
    encaminhar: 'Limpeza quanto ao enxágue, manutenção e gerência quanto ao piso',
    base: ['5.3.1'],
    normas: 'NR-8, quanto a piso que ofereça resistência e não seja escorregadio',
    chaves: 'piso limpo escorrega invisivel pelicula gordura queda rugosidade'
  },
  {
    n: 52,
    tema: CIPA_TEMAS[5],
    pergunta: 'O que fazer ao encontrar um corredor obstruído por caixas ou mercadorias?',
    resposta: 'Desobstrua na hora, se for coisa de poucos minutos e você tiver condição de mover, e comunique quem deixou ali. Corredor é via de circulação e também rota de fuga: obstrução vira tragédia em emergência, quando todos saem ao mesmo tempo, no escuro ou com fumaça. Atenção especial para o que bloqueia acesso a extintor, a quadro elétrico e a porta de saída, que é caso de urgência alta. Se a obstrução se repete sempre no mesmo lugar, a causa não é desleixo: é falta de espaço de estoque, recebimento sem local definido ou prateleira insuficiente. Registre a causa, porque é ela que vai resolver. Enquanto não há espaço, o combinado de onde descarregar precisa estar definido com a chefia.',
    cipeiro: 'Desobstruir o que puder, registrar a repetição e apontar a falta de espaço como causa. Bloqueio de extintor ou de saída é urgência alta.',
    encaminhar: 'Chefia do setor de imediato, gerência para espaço de estoque',
    base: ['5.3.1'],
    normas: 'NR-8 quanto à circulação, e NR-23 quanto à desobstrução das saídas e rotas de fuga',
    chaves: 'corredor obstruido caixas passagem bloqueada rota de fuga extintor'
  },
  {
    n: 53,
    tema: CIPA_TEMAS[5],
    pergunta: 'É seguro subir em cadeiras, caixas ou bancos para alcançar produtos?',
    resposta: 'Não. Cadeira, caixa, banco, engradado e bancada não são feitos para servir de apoio para subir: não têm base estável, não têm apoio para as mãos, giram, afundam, escorregam e podem ceder sob o peso. Queda de altura pequena produz fratura com frequência, porque a pessoa cai sem tempo de se proteger e geralmente em piso duro ou sobre equipamento. A alternativa correta é escada adequada, em bom estado, aberta e travada, apoiada em piso firme e nivelado, usada de frente, com as duas mãos livres para subir e descer e sem ultrapassar o último degrau. Se falta escada no setor, isso é registro e encaminhamento, não é motivo para improvisar. Vale também revisar a altura de armazenagem: o que é usado todo dia não deveria estar onde precisa de escada.',
    cipeiro: 'Orientar a parar o improviso, registrar a falta de escada e questionar a altura de armazenagem dos itens de uso diário.',
    encaminhar: 'Chefia do setor e gerência, para provisão de escada e revisão da armazenagem',
    base: ['5.3.1'],
    normas: 'NR-18 e NR-35 quanto a escadas e trabalho em altura, e NR-8 quanto à segurança nas edificações',
    chaves: 'subir em cadeira caixa banco escada alcancar prateleira alta queda'
  },
  {
    n: 54,
    tema: CIPA_TEMAS[5],
    pergunta: 'Como devem ser armazenados os materiais nas prateleiras para evitar quedas?',
    resposta: 'A lógica é peso embaixo e leve em cima, sempre. Itens pesados e de uso frequente ficam entre a altura dos joelhos e dos ombros, que é a faixa em que se pega sem esforço e sem precisar de escada. Nada deve ultrapassar a borda da prateleira nem ficar com parte do apoio no vazio. Empilhamento tem de ser estável, intercalado, com o item maior na base, e dentro da altura que a prateleira suporta. Respeite a capacidade de carga da estante e verifique se está fixada ou travada contra tombamento, porque estante alta e carregada só em cima tomba quando alguém se apoia nela. Mantenha corredor livre entre as estantes e nunca bloqueie sprinkler, luminária ou quadro elétrico. Vidro e líquido não ficam acima da linha da cabeça.',
    cipeiro: 'Na vistoria, olhar peso em cima, item saindo da borda, estante sem fixação e capacidade de carga ultrapassada.',
    encaminhar: 'Chefia do setor, e manutenção e gerência para fixação e prateleira adequada',
    base: ['5.3.1'],
    normas: 'NR-11 quanto ao armazenamento de materiais, e NR-8',
    chaves: 'prateleira armazenar empilhar estante tombamento peso em cima'
  },
  {
    n: 55,
    tema: CIPA_TEMAS[5],
    pergunta: 'Quem deve sinalizar um piso molhado?',
    resposta: 'Quem molhou ou quem percebeu primeiro, imediatamente, sem esperar a equipe de limpeza. A sinalização não é cortesia: é medida de proteção, e quem sabe do risco e não avisa transfere o risco para quem não sabe. Em termos de obrigação formal, a empresa deve manter a sinalização de segurança e disponibilizar os meios para isso, o que significa ter cones ou placas disponíveis em cada área e não em um armário trancado. Na prática, a regra do setor deve ser clara: molhou, sinalizou. A placa fica até o piso estar seco, não até acabar a limpeza, e depois precisa ser recolhida, porque placa esquecida no corredor deixa de ser aviso e passa a ser obstáculo que ninguém mais vê.',
    cipeiro: 'Verificar se há cone ou placa disponível na própria área, e registrar a falta. Sem o meio, a regra não se cumpre.',
    encaminhar: 'Chefia do setor, e gerência para provisão de sinalização',
    base: ['5.3.1', '5.3.2'],
    normas: 'NR-26, quanto à sinalização de segurança',
    chaves: 'sinalizar piso molhado quem sinaliza cone placa aviso'
  },
  {
    n: 56,
    tema: CIPA_TEMAS[5],
    pergunta: 'Como prevenir acidentes em escadas e áreas com desníveis?',
    resposta: 'Em escada fixa, o essencial é corrimão firme em bom estado, degraus de altura e profundidade uniformes, piso antiderrapante ou fita antiderrapante na borda, iluminação suficiente e nada armazenado em degrau nem em patamar. Oriente a subir e descer sempre com uma das mãos livre para o corrimão, o que significa não carregar caixa que ocupe as duas mãos nem que impeça ver os degraus: nesses casos, o material sobe em etapas ou por outro meio. Desnível é mais perigoso que escada, porque não é esperado: soleira, rampa curta e mudança de piso precisam de sinalização de contraste e, quando possível, de rampa. Degrau quebrado, corrimão solto, fita antiderrapante gasta e lâmpada queimada em escada são itens de urgência alta.',
    cipeiro: 'Na vistoria, testar o corrimão, olhar a borda dos degraus e a iluminação, e tratar degrau danificado como urgência alta.',
    encaminhar: 'Manutenção para reparo e iluminação, gerência para sinalização de contraste',
    base: ['5.3.1'],
    normas: 'NR-8, quanto a escadas, rampas, corrimão e circulação, e NR-26 quanto à sinalização',
    chaves: 'escada desnivel corrimao degrau rampa soleira tropecar iluminacao'
  },
  {
    n: 57,
    tema: CIPA_TEMAS[5],
    pergunta: 'O que fazer quando um fio elétrico atravessa uma área de passagem?',
    resposta: 'São dois riscos ao mesmo tempo: tropeço e choque, porque cabo pisado tem o isolamento rompido com o tempo. A conduta imediata é sinalizar e, se possível, desligar e remover o cabo. Depois, olhar a causa, que quase sempre é falta de tomada no ponto de uso, e é isso que precisa ser registrado: extensão permanente atravessando piso é instalação provisória usada como definitiva. A solução correta é tomada no local, feita por eletricista. Até lá, não resolva com fita adesiva nem com tapete por cima, que esconde o cabo sem proteger. Cabo com emenda, isolamento danificado ou aquecimento, benjamim com vários aparelhos e extensão em área úmida são casos de urgência alta e de retirada imediata de uso.',
    cipeiro: 'Registrar a extensão permanente como falta de tomada, não como desorganização, e encaminhar para instalação por eletricista.',
    encaminhar: 'Manutenção e eletricista, com registro na reunião da CIPA',
    base: ['5.3.1'],
    normas: 'NR-10, quanto às instalações elétricas, e NR-8 quanto à circulação',
    chaves: 'fio no chao extensao cabo passagem tropeco choque tomada benjamim'
  },
  {
    n: 58,
    tema: CIPA_TEMAS[5],
    pergunta: 'Como transportar caixas sem comprometer a visão e o equilíbrio?',
    resposta: 'A regra prática é simples: se a carga impede ver o piso à frente, ela não deve ser carregada daquele jeito. Mantenha a caixa na altura da cintura, junto ao corpo, nunca na frente do rosto e nunca acima dos ombros. Não empilhe além do que permite ver por cima. Antes de pegar, confira o caminho e o destino: piso seco, passagem livre, porta que não vá abrir na sua frente, e lugar vago para apoiar. Carga volumosa ou pesada vai em carrinho, em duas viagens ou com ajuda de outra pessoa, com o movimento combinado em voz alta. Em escada, uma das mãos tem de ficar livre para o corrimão. Se o volume faz parte da rotina, o caminho é meio de transporte, e a falta dele é registro.',
    cipeiro: 'Orientar a dividir a carga ou pedir carro, e registrar a falta de meio de transporte quando o volume é rotineiro.',
    encaminhar: 'Chefia do setor, e gerência para provisão de carro de transporte',
    base: ['5.3.1'],
    normas: 'NR-17, quanto ao transporte manual de cargas',
    chaves: 'carregar caixa visao equilibrio empilhada transporte manual'
  },
  {
    n: 59,
    tema: CIPA_TEMAS[5],
    pergunta: 'Por que a pressa durante o atendimento pode aumentar o risco de acidentes?',
    resposta: 'Porque a pressa não muda apenas a velocidade: ela muda o que a pessoa deixa de fazer. Com pressa, deixa-se de sinalizar o piso molhado, de usar o empurrador, de esperar a máquina parar, de pegar a luva térmica que está longe, de olhar o caminho antes de pegar algo quente. Pressa também encurta a atenção, e a pessoa executa de memória em vez de olhar. Em horário de pico, tudo isso coincide com corredor mais cheio, bancada mais carregada e piso mais molhado. Por isso a pressa não é falha de caráter de quem corre: é fator de risco organizacional, ligado a dimensionamento de equipe, layout e metas de tempo. Quando um acidente é explicado por pressa, a investigação precisa continuar e perguntar por que havia pressa.',
    cipeiro: 'Tratar pressa como causa a investigar, não como explicação final, e registrar o que no horário de pico produz o risco.',
    encaminhar: 'Reunião da CIPA, com encaminhamento à gerência sobre escala, layout e ritmo',
    base: ['5.3.1'],
    normas: 'NR-17 e NR-1, quanto à organização do trabalho e ao ritmo como fator de risco',
    chaves: 'pressa correria horario de pico ritmo risco atendimento meta'
  },
  {
    n: 60,
    tema: CIPA_TEMAS[5],
    pergunta: 'O que fazer quando a falta de espaço dificulta a circulação dos colaboradores?',
    resposta: 'Espaço é condição de trabalho, e falta de espaço é um risco a registrar como qualquer outro, com a diferença de que a solução é de layout e por isso demora: mais razão para registrar logo e acompanhar. Comece separando o que é falta real de espaço do que é ocupação indevida dele: na maioria dos casos, parte do corredor está tomada por material sem lugar definido, equipamento fora de uso, embalagem vazia ou estoque que deveria estar em outro lugar. Essa parte se resolve rápido. Para o que sobra, registre com medida e foto, descreva o conflito concreto, como duas pessoas que não se cruzam entre a bancada e o forno, e leve à reunião, porque mudança de layout exige decisão da gerência. Enquanto isso, combine sentido de circulação e aviso em passagem cega.',
    cipeiro: 'Separar ocupação indevida de falta real de espaço, registrar o conflito com foto e levar à reunião, porque layout é decisão da gerência.',
    encaminhar: 'Chefia do setor para desocupar, gerência para o layout',
    base: ['5.3.1'],
    normas: 'NR-8 quanto à circulação, e NR-17 quanto ao posto de trabalho',
    chaves: 'falta de espaco circulacao apertado layout corredor estreito'
  },

  /* ===================================================
     TEMA 7 - PRODUTOS QUIMICOS, LIMPEZA E HIGIENE OCUPACIONAL
     =================================================== */
  {
    n: 61,
    tema: CIPA_TEMAS[6],
    pergunta: 'Quais riscos os produtos de limpeza podem oferecer aos colaboradores?',
    resposta: 'Mais do que costumam parecer, porque são produtos de uso diário e isso cria a sensação de que são inofensivos. Os riscos são: queimadura química na pele e principalmente nos olhos, com os alcalinos fortes, como desengraxantes e desincrustantes, sendo os mais agressivos; irritação e lesão das vias respiratórias pela inalação de vapores, agravada em área fechada e sem ventilação; dermatite nas mãos pelo contato repetido, que é o problema ocupacional mais comum da limpeza; e intoxicação por ingestão acidental quando o produto está em recipiente não identificado. Há ainda o risco de reação entre produtos incompatíveis, que pode liberar gás tóxico. A exposição que adoece raramente é o acidente único: é o contato diário sem proteção.',
    cipeiro: 'Olhar a exposição de rotina e não só o acidente. Mão com pele irritada na equipe de limpeza é sinal a registrar.',
    encaminhar: 'SESMT quando houver, e gerência para EPI e produto adequado',
    base: ['5.3.1'],
    normas: 'NR-26 quanto à rotulagem e à FDS, NR-6 quanto ao EPI, e NR-1 quanto ao inventário de riscos',
    chaves: 'produto de limpeza risco quimico dermatite inalacao queimadura'
  },
  {
    n: 62,
    tema: CIPA_TEMAS[6],
    pergunta: 'Por que nunca devemos misturar produtos químicos sem conhecer sua composição e compatibilidade?',
    resposta: 'Porque a mistura pode gerar uma substância diferente e perigosa em segundos, dentro de um ambiente fechado, com a pessoa debruçada sobre o balde. O caso mais conhecido é água sanitária com produto ácido, que libera gás cloro, irritante grave das vias respiratórias; e água sanitária com amônia ou com produto que contenha amônia, que libera cloraminas. Há ainda misturas que provocam reação com liberação de calor e projeção do líquido. E existe o problema mais banal: misturar dois produtos pode anular o efeito de ambos, levando a pessoa a usar mais produto e se expor mais sem limpar melhor. A regra é usar cada produto conforme o rótulo e a Ficha com Dados de Segurança, um por vez, enxaguando entre etapas, e nunca criar receita própria.',
    cipeiro: 'Orientar a nunca misturar, verificar se a FDS está acessível e registrar quando encontrar mistura em uso no setor.',
    encaminhar: 'Chefia do setor de imediato, e gerência para orientação e treinamento',
    base: ['5.3.1'],
    normas: 'NR-26, quanto às informações de segurança dos produtos químicos',
    chaves: 'misturar produtos quimicos agua sanitaria cloro amonia reacao'
  },
  {
    n: 63,
    tema: CIPA_TEMAS[6],
    pergunta: 'O que fazer se um produto químico atingir os olhos ou a pele?',
    resposta: 'Lavar com água corrente em abundância, imediatamente e por tempo prolongado, é a medida que decide o resultado. Nos olhos, lave por pelo menos quinze minutos, mantendo a pálpebra aberta, com água corrente em temperatura ambiente e baixa pressão, do canto interno para o externo, para não contaminar o outro olho; retire lente de contato se houver. Na pele, remova de imediato a roupa contaminada enquanto lava, porque o tecido mantém o produto em contato. Nunca tente neutralizar o produto com outro produto, nem aplicar pomada, creme ou qualquer substância, porque a reação de neutralização gera calor e piora a lesão. Depois de lavar, procure atendimento médico levando o rótulo ou a FDS do produto, que é a informação de que o serviço de saúde precisa. Todo caso desses é para comunicar e registrar, mesmo quando parece leve.',
    cipeiro: 'Garantir que a FDS esteja acessível e que haja ponto de água corrente próximo. Depois do atendimento, registrar o caso e investigar a causa.',
    encaminhar: 'Atendimento médico de imediato, depois RH para a CAT e reunião da CIPA',
    base: ['5.3.1'],
    normas: 'NR-26 quanto à FDS, e NR-7 quanto aos primeiros socorros',
    chaves: 'produto no olho na pele quimico lavar agua neutralizar socorro'
  },
  {
    n: 64,
    tema: CIPA_TEMAS[6],
    pergunta: 'Como saber se um produto de limpeza precisa de luvas, óculos ou outro tipo de proteção?',
    resposta: 'Essa informação não é de opinião nem de costume: está no rótulo e, com mais detalhe, na Ficha com Dados de Segurança do produto, que o fornecedor é obrigado a disponibilizar. A FDS traz os perigos, as medidas de controle e a proteção individual recomendada, inclusive o tipo de material da luva. O rótulo traz os pictogramas de perigo e as frases de precaução, e vale ler sempre, mesmo em produto usado há anos, porque a formulação muda. Produto concentrado quase sempre exige mais proteção que o diluído, e a diluição é o momento de maior exposição. Como regra prática do nosso ramo: desengraxante, desincrustante e qualquer produto que libere vapor forte pedem luva adequada e proteção dos olhos, e área ventilada.',
    cipeiro: 'Verificar se a FDS de cada produto está disponível no setor e se o rótulo original está legível. Sem FDS, não há como definir o EPI.',
    encaminhar: 'Gerência para obter a FDS do fornecedor, e SESMT quando houver para a definição do EPI',
    base: ['5.3.1'],
    normas: 'NR-26, quanto à rotulagem preventiva e à Ficha com Dados de Segurança, e NR-6',
    chaves: 'qual epi produto de limpeza luva oculos fds rotulo proteger'
  },
  {
    n: 65,
    tema: CIPA_TEMAS[6],
    pergunta: 'É seguro armazenar produtos de limpeza em garrafas de bebidas ou recipientes sem identificação?',
    resposta: 'Não, e esta é uma das práticas mais perigosas que existem em cozinha. Produto de limpeza em garrafa de refrigerante ou de água já causou intoxicação grave e morte, porque alguém bebeu acreditando ser bebida, e o risco é ainda maior em ambiente onde se trabalha com alimento e bebida lado a lado. A exigência é que o produto permaneça em sua embalagem original com o rótulo legível; quando precisar ser transferido, o recipiente deve ser próprio para o produto e identificado com o nome, a diluição e os perigos. Recipiente sem identificação também impede saber o que fazer em caso de acidente, porque ninguém sabe informar ao médico o que a pessoa tocou ou ingeriu. Encontrar isso em vistoria é urgência alta, e a conduta é retirar de uso na hora.',
    cipeiro: 'Tratar como urgência alta e retirar de uso no momento. Registrar e cobrar frasco próprio identificado para a diluição.',
    encaminhar: 'Chefia do setor de imediato, e gerência para provisão de frascos identificados',
    base: ['5.3.1'],
    normas: 'NR-26, quanto à rotulagem e à identificação dos produtos químicos',
    chaves: 'garrafa de refrigerante produto sem rotulo identificacao frasco transferir'
  },
  {
    n: 66,
    tema: CIPA_TEMAS[6],
    pergunta: 'Como devem ser armazenados os produtos químicos utilizados na limpeza?',
    resposta: 'Em local próprio, separado da área de manipulação e de armazenagem de alimentos, ventilado, fechado e com acesso restrito a quem usa. Os produtos ficam nas embalagens originais, com rótulo legível, apoiados em prateleira baixa quando são embalagens grandes ou líquidas, para que não precisem ser erguidas acima da cabeça e para que um vazamento não atinja ninguém. Produtos incompatíveis devem ficar afastados entre si, especialmente ácidos e produtos à base de cloro. Mantenha a embalagem fechada, nunca armazene em corredor nem embaixo de pia junto com utensílio de alimento, e deixe a FDS acessível no local. Vazamento, embalagem estufada ou corroída e rótulo ilegível são motivo para retirada imediata.',
    cipeiro: 'Na vistoria, olhar separação dos alimentos, ventilação, rótulo legível, altura da prateleira e afastamento entre incompatíveis.',
    encaminhar: 'Chefia do setor e gerência, para local adequado de armazenagem',
    base: ['5.3.1'],
    normas: 'NR-26 quanto à identificação, e boas práticas de armazenagem de produtos de limpeza',
    chaves: 'armazenar produto quimico limpeza deposito separado alimento prateleira'
  },
  {
    n: 67,
    tema: CIPA_TEMAS[6],
    pergunta: 'O que fazer quando o cheiro de um produto provoca irritação, tontura ou mal-estar?',
    resposta: 'Interrompa a tarefa e saia do ambiente para uma área ventilada imediatamente, levando quem mais estiver no local. Não insista para terminar o serviço: tontura por inalação indica que a concentração no ar já está alta, e continuar aumenta o risco de desmaio junto de equipamento, piso molhado ou escada. Abra portas e janelas, acione a exaustão se houver, e não retorne enquanto o odor persistir. Procure atendimento médico se o sintoma não ceder rapidamente ou se houver falta de ar, tosse persistente ou irritação intensa dos olhos e da garganta, levando o rótulo ou a FDS do produto. Depois, registre, porque esse é um caso de exposição que precisa ser investigado: pode ser produto inadequado para o ambiente, diluição errada, mistura, falta de ventilação ou ausência de proteção respiratória definida.',
    cipeiro: 'Registrar o episódio como exposição, não como mal-estar passageiro, e investigar a causa: produto, diluição, mistura ou ventilação.',
    encaminhar: 'Atendimento médico se o sintoma persistir, depois SESMT quando houver e gerência',
    base: ['5.3.1'],
    normas: 'NR-9 quanto à avaliação da exposição a agentes químicos, e NR-26',
    chaves: 'cheiro forte tontura mal estar inalacao vapor ventilacao irritacao'
  },
  {
    n: 68,
    tema: CIPA_TEMAS[6],
    pergunta: 'Quais cuidados devem ser tomados ao diluir produtos concentrados?',
    resposta: 'A diluição é o momento de maior exposição de toda a rotina de limpeza, porque se manipula o produto puro. Siga exatamente a diluição indicada pelo fabricante, usando copo ou dosador graduado e nunca medida de olho, porque mais produto não limpa mais e aumenta o risco e o custo. Use a proteção indicada na FDS, no mínimo luva adequada e proteção dos olhos. Faça em área ventilada, com a pia na altura correta, e nunca com o rosto sobre o recipiente. Coloque a água primeiro e o produto depois, para evitar respingo e reação, salvo se o fabricante orientar o contrário. Não dilua produto diferente no mesmo recipiente sem lavar antes, e identifique o frasco da solução pronta com nome e diluição. Nunca dilua em garrafa de bebida, e nunca prove, cheire diretamente nem tente identificar produto pelo odor.',
    cipeiro: 'Verificar se há dosador no setor e se a diluição indicada está afixada. Diluição de olho é falha para registrar.',
    encaminhar: 'Chefia do setor, e gerência para provisão de dosador e de EPI',
    base: ['5.3.1'],
    normas: 'NR-26 quanto à FDS, e NR-6 quanto ao EPI na manipulação',
    chaves: 'diluir produto concentrado dosagem dosador medida agua primeiro'
  },
  {
    n: 69,
    tema: CIPA_TEMAS[6],
    pergunta: 'Como consultar a Ficha com Dados de Segurança (FDS) de um produto?',
    resposta: 'A FDS tem de ser fornecida pelo fabricante ou pelo importador e disponibilizada pela empresa a quem usa o produto, em local de fácil acesso no próprio setor, em papel ou em meio eletrônico. Se não estiver no setor, peça à gerência ou ao responsável pela compra: ela também pode ser obtida no site do fabricante ou solicitada ao fornecedor, e o número do lote e o nome exato do produto, que estão no rótulo, são o que se precisa para pedir. Ao consultar, vá direto ao que resolve a dúvida do dia a dia: os perigos do produto, as medidas de primeiros socorros, a proteção individual recomendada, as condições de armazenamento, as incompatibilidades e o que fazer em caso de derramamento. FDS que existe mas fica trancada na administração não cumpre a função, porque ela precisa estar onde o acidente acontece.',
    cipeiro: 'Cobrar a FDS de cada produto no próprio setor, em pasta de acesso livre. A falta dela é item para registrar na vistoria.',
    encaminhar: 'Gerência e responsável pela compra, para obter a ficha do fornecedor',
    base: ['5.3.1'],
    normas: 'NR-26, quanto à obrigação de disponibilizar a Ficha com Dados de Segurança',
    chaves: 'fds ficha de seguranca fispq consultar onde encontrar produto'
  },
  {
    n: 70,
    tema: CIPA_TEMAS[6],
    pergunta: 'O que fazer quando um produto químico é derramado no chão?',
    resposta: 'Isole e sinalize a área primeiro, para que ninguém entre nem escorregue, e retire as pessoas que não estão envolvidas na limpeza. Identifique o produto pelo rótulo e consulte a FDS, que traz exatamente o procedimento para derramamento. Use a proteção indicada: no mínimo luva adequada, proteção dos olhos e calçado fechado, e proteção respiratória quando a ficha indicar. Ventile o ambiente. Para volume pequeno, contenha com material absorvente, recolha do centro para as bordas, e só então lave a área com água em abundância. Nunca jogue água direto em grande volume derramado, nem use outro produto para neutralizar, e não use pano seco em produto que libera vapor. Derramamento de grande volume, produto desconhecido ou em local sem ventilação é caso de evacuar a área e acionar a gerência e a emergência. Depois, registre, porque derramamento repetido indica embalagem inadequada, transporte sem carrinho ou armazenagem em local errado.',
    cipeiro: 'Isolar, sinalizar e consultar a FDS antes de limpar. Depois registrar e investigar por que derramou.',
    encaminhar: 'Chefia do setor de imediato, gerência e reunião da CIPA para a causa',
    base: ['5.3.1'],
    normas: 'NR-26, quanto às informações de segurança e aos procedimentos em caso de derramamento',
    chaves: 'derramou produto no chao vazamento quimico limpar isolar absorvente'
  },

  /* ===================================================
     TEMA 8 - SAUDE FISICA, ERGONOMIA E ESFORCO REPETITIVO
     =================================================== */
  {
    n: 71,
    tema: CIPA_TEMAS[7],
    pergunta: 'Como saber se uma dor nas costas pode estar relacionada ao trabalho?',
    resposta: 'Quem estabelece o nexo entre a dor e o trabalho é o médico, e nem a CIPA nem a chefia fazem esse julgamento. O que a CIPA pode fazer é observar os indícios que justificam encaminhar: dor que aparece ou piora durante a jornada e melhora nos dias de folga; dor que começou depois de mudança de tarefa, de equipamento ou de ritmo; dor que surge sempre do mesmo lado em quem faz movimento sempre para o mesmo lado; e, o indício mais forte de todos, várias pessoas do mesmo setor com a mesma queixa. A conduta é orientar a pessoa a procurar o serviço de saúde e informar o trabalho que faz, e registrar a condição da tarefa que pode estar produzindo a dor, sem registrar o nome nem a queixa de saúde de ninguém.',
    cipeiro: 'Encaminhar a pessoa ao serviço de saúde e registrar a condição da tarefa, nunca o diagnóstico nem a queixa individual.',
    encaminhar: 'Serviço de saúde ocupacional e RH, e SESMT quando houver para a avaliação da tarefa',
    base: ['5.3.1'],
    normas: 'NR-17 quanto à adequação do trabalho, e NR-7 quanto ao acompanhamento da saúde',
    chaves: 'dor nas costas relacionada ao trabalho nexo lombar coluna'
  },
  {
    n: 72,
    tema: CIPA_TEMAS[7],
    pergunta: 'Quais são os riscos de permanecer muitas horas em pé?',
    resposta: 'Trabalho prolongado em pé e parado sobrecarrega as pernas, os pés e a coluna lombar, prejudica o retorno do sangue das pernas e provoca dor, cansaço, inchaço nos tornozelos e, com os anos, problemas de circulação. A norma de ergonomia determina que, nas atividades em que o trabalho deva ser realizado em pé, devem ser colocados assentos para descanso em locais em que possam ser utilizados nas pausas. Vale notar o que torna o problema pior: ficar parado no mesmo lugar é mais nocivo do que caminhar, e piso duro sem tapete de alívio, calçado inadequado e falta de espaço para mudar a posição dos pés agravam tudo. As medidas úteis são alternar a postura, revezar tarefas, ter assento para as pausas, apoio para apoiar um pé alternadamente e calçado adequado.',
    cipeiro: 'Na vistoria, olhar se existe assento para as pausas e se a tarefa permite alternar a postura. A falta de assento é item para registrar.',
    encaminhar: 'Gerência para provisão de assento e tapete, e SESMT quando houver',
    base: ['5.3.1'],
    normas: 'NR-17, quanto aos assentos para descanso no trabalho em pé',
    chaves: 'em pe muitas horas cansaco pernas assento banco postura circulacao'
  },
  {
    n: 73,
    tema: CIPA_TEMAS[7],
    pergunta: 'Como prevenir dores nos ombros, punhos e braços em tarefas repetitivas?',
    resposta: 'O que adoece em tarefa repetitiva é a soma de três coisas: repetir o mesmo movimento muitas vezes, fazer força, e manter a articulação em posição forçada. Mexer em qualquer uma delas já reduz o risco. As medidas que funcionam são: revezar as pessoas entre tarefas diferentes dentro da jornada, para que o mesmo grupo de músculos não trabalhe o dia inteiro; ajustar a altura da bancada para que o trabalho fique na altura dos cotovelos, com os ombros relaxados e os punhos retos; aproximar o material para que não seja preciso esticar o braço nem girar o tronco a cada peça; usar a ferramenta correta, com cabo adequado, porque ferramenta ruim exige força extra; e manter pausas curtas e distribuídas, que são mais eficazes que uma pausa longa no fim. Trabalho com o braço acima do ombro é o que mais lesiona e deve ser evitado por organização do posto.',
    cipeiro: 'Registrar as três condições observadas: repetição, força e postura forçada. Isso é o que orienta a avaliação ergonômica.',
    encaminhar: 'SESMT quando houver, chefia para o revezamento, gerência para ajuste do posto',
    base: ['5.3.1'],
    normas: 'NR-17, quanto à organização do trabalho, às pausas e ao posto de trabalho',
    chaves: 'dor no ombro punho braco repetitivo ler dort tendinite pausa revezamento'
  },
  {
    n: 74,
    tema: CIPA_TEMAS[7],
    pergunta: 'Qual é a maneira correta de levantar e transportar cargas?',
    resposta: 'A primeira pergunta é se precisa ser manual: a norma determina que o transporte manual regular de cargas seja feito com meios técnicos apropriados, e que não se exija nem admita carga que, pelo peso, possa comprometer a saúde. Então carro, carrinho, paleteira ou divisão em etapas vêm antes da técnica. Quando o levantamento manual é inevitável: avalie o peso testando antes de erguer; verifique o caminho e o destino; aproxime-se da carga, de frente; afaste os pés para ter base; flexione os joelhos e os quadris mantendo as costas retas; segure firme com as duas mãos; levante com a força das pernas, sem puxão; mantenha a carga junto ao corpo e entre a cintura e o peito; e nunca gire o tronco com a carga erguida, movendo os pés para mudar de direção. Para descer, flexione os joelhos de novo. Peça ajuda sem hesitar e combine o movimento em voz alta quando forem duas pessoas.',
    cipeiro: 'Pedir o meio técnico antes de ensinar a técnica. Treinar postura sem resolver o peso transfere o problema para o trabalhador.',
    encaminhar: 'Gerência para provisão de meio de transporte, e SESMT quando houver',
    base: ['5.3.1'],
    normas: 'NR-17, quanto ao levantamento, transporte e descarga individual de materiais',
    chaves: 'levantar carga postura correta transportar peso tecnica coluna'
  },
  {
    n: 75,
    tema: CIPA_TEMAS[7],
    pergunta: 'O que fazer quando uma bancada ou mesa de trabalho está em uma altura inadequada?',
    resposta: 'Registre e encaminhe, porque altura de bancada é condição do posto de trabalho e a norma exige que o mobiliário seja adequado às características do trabalhador e à natureza da tarefa. Bancada alta força os ombros erguidos o dia inteiro e produz dor cervical e de ombro. Bancada baixa força a coluna curvada e produz dor lombar. A referência prática é trabalhar na altura dos cotovelos, com os ombros relaxados: tarefa que exige força, como sovar massa, pede bancada um pouco mais baixa; tarefa de precisão, como decorar, pede um pouco mais alta. Como a mesma bancada atende pessoas de alturas diferentes, as soluções úteis são tablado ou plataforma para quem é mais baixo, apoio para os pés, e ajuste da altura do recipiente em vez da bancada. Improviso de caixote como apoio não resolve e cria risco de queda.',
    cipeiro: 'Medir e fotografar a situação, descrever a tarefa e a queixa observada, e encaminhar para avaliação ergonômica.',
    encaminhar: 'SESMT quando houver, e gerência para adequação do mobiliário',
    base: ['5.3.1'],
    normas: 'NR-17, quanto ao mobiliário dos postos de trabalho',
    chaves: 'bancada alta baixa altura mesa posto de trabalho mobiliario ombro'
  },
  {
    n: 76,
    tema: CIPA_TEMAS[7],
    pergunta: 'Como organizar o trabalho para reduzir movimentos repetitivos?',
    resposta: 'A medida mais eficaz é o revezamento entre tarefas diferentes ao longo da jornada, para que a mesma pessoa não passe o turno inteiro no mesmo movimento. Em seguida vêm: distribuir as pausas em intervalos curtos e frequentes em vez de uma pausa longa no final; alternar na escala as tarefas mais exigentes com as menos exigentes; organizar o posto para que o material fique ao alcance, sem esticar o braço nem girar o tronco a cada peça; preparar lotes em vez de repetir ciclo completo peça por peça, quando o processo permitir; e evitar que o ritmo seja ditado por pico sem reforço de equipe. Vale lembrar que mudar a organização do trabalho exige decisão de quem faz a escala e o processo, e por isso é um encaminhamento de gerência, não uma orientação de corredor.',
    cipeiro: 'Levar a proposta de revezamento e de pausas à reunião, com o registro das tarefas mais repetitivas que foram observadas.',
    encaminhar: 'Chefia para a escala e o revezamento, gerência para o processo',
    base: ['5.3.1'],
    normas: 'NR-17, quanto à organização do trabalho, ao ritmo e às pausas',
    chaves: 'reduzir movimento repetitivo revezamento rodizio pausas organizacao do trabalho'
  },
  {
    n: 77,
    tema: CIPA_TEMAS[7],
    pergunta: 'Trabalhar com pressa e sem pausas pode aumentar o risco de adoecimento?',
    resposta: 'Sim, e por dois caminhos ao mesmo tempo. No corpo, a falta de pausa impede a recuperação do músculo e do tendão entre os esforços, e é justamente essa recuperação que evita a lesão por esforço repetitivo. Sem ela, a sobrecarga acumula e a dor se instala. Na mente, o ritmo imposto sem possibilidade de controle é um dos fatores psicossociais mais associados a estresse, exaustão e adoecimento mental. E há a consequência imediata: com pressa, as medidas de segurança são as primeiras a cair, e o acidente aparece. A norma de ergonomia trata o ritmo, as pausas e as exigências de tempo como parte da organização do trabalho, que precisa ser adequada. Por isso pressa crônica não é um traço da equipe: é condição de trabalho a registrar e encaminhar.',
    cipeiro: 'Registrar pressa e ausência de pausas como condição de trabalho, com o setor e o horário em que acontece, e levar à reunião.',
    encaminhar: 'Reunião da CIPA, com encaminhamento à gerência sobre escala, ritmo e pausas',
    base: ['5.3.1'],
    normas: 'NR-17 quanto à organização do trabalho, e NR-1 quanto aos fatores de risco psicossociais',
    chaves: 'pressa sem pausa adoecimento estresse ritmo sobrecarga exaustao'
  },
  {
    n: 78,
    tema: CIPA_TEMAS[7],
    pergunta: 'O que fazer quando uma cadeira de escritório provoca desconforto ou dor?',
    resposta: 'Primeiro verifique se é a cadeira ou o ajuste dela, porque boa parte do desconforto vem de cadeira correta usada sem regulagem. A referência é: pés totalmente apoiados no chão ou em apoio para os pés, joelhos em ângulo próximo de noventa graus, coxas apoiadas sem pressão na parte de trás, encosto apoiando a região lombar, e braços chegando à mesa com os ombros relaxados e os cotovelos próximos ao corpo. Se a cadeira não permite esses ajustes, ou se perdeu a regulagem, o estofamento, o apoio lombar ou a estabilidade, ela precisa ser trocada: a norma exige assento com altura ajustável, características de pouca conformação na base, borda frontal arredondada e encosto adaptado ao corpo. Cadeira com rodízio travado, pistão que baixa sozinho ou base rachada também é risco de queda. Registre e encaminhe.',
    cipeiro: 'Checar o ajuste antes de pedir a troca, e registrar quando a cadeira não permite os ajustes ou perdeu a estabilidade.',
    encaminhar: 'Gerência para ajuste ou substituição, e SESMT quando houver',
    base: ['5.3.1'],
    normas: 'NR-17, quanto ao assento e ao mobiliário do posto de trabalho',
    chaves: 'cadeira desconforto dor escritorio ajuste regulagem apoio lombar'
  },
  {
    n: 79,
    tema: CIPA_TEMAS[7],
    pergunta: 'Como identificar riscos ergonômicos antes que causem afastamentos?',
    resposta: 'Observando a tarefa sendo executada de verdade, e não como ela está descrita. Os sinais que antecedem o afastamento são visíveis: posto adaptado por conta própria, com caixote de apoio, papelão sob o pé, pano enrolado no cabo da ferramenta, bancada improvisada; postura forçada mantida, como braço acima do ombro, tronco girado, agachamento repetido; alongamento espontâneo e massagem no ombro durante a jornada; queixas repetidas de cansaço no mesmo setor; revezamento informal que a equipe criou sozinha para suportar a tarefa; e aumento de erro e retrabalho no fim do turno. O indício mais forte é mais de uma pessoa do mesmo setor com a mesma queixa. Nada disso exige formação técnica para ver: exige olhar a tarefa no horário em que ela é mais pesada, e não no momento mais calmo do dia.',
    cipeiro: 'Vistoriar a tarefa no horário de maior exigência e registrar as adaptações improvisadas, que são o aviso que antecede o afastamento.',
    encaminhar: 'SESMT quando houver, para avaliação ergonômica, e gerência',
    base: ['5.3.1'],
    normas: 'NR-17 e NR-1, quanto à identificação dos perigos e à avaliação dos riscos',
    chaves: 'identificar risco ergonomico antes afastamento sinais improviso postura'
  },
  {
    n: 80,
    tema: CIPA_TEMAS[7],
    pergunta: 'Qual é o papel da CIPA quando vários colaboradores começam a relatar a mesma dor ou desconforto?',
    resposta: 'Esse é o momento em que a CIPA tem mais valor, porque queixa repetida no mesmo setor deixa de ser caso individual e passa a ser indicador de que a tarefa está adoecendo quem a executa. O papel é: reconhecer o padrão, registrando a tarefa, o setor e a condição observada, sem registrar nome, diagnóstico nem queixa de saúde de ninguém, já que isso é informação pessoal e sigilosa; levar o padrão à reunião e pedir formalmente a avaliação ergonômica da atividade ao SESMT ou à empresa; propor as medidas que já se enxergam, como revezamento, pausas e ajuste de altura; e acompanhar até a avaliação acontecer e as medidas serem implantadas. A CIPA não diagnostica e não conclui que existe doença ocupacional: ela aponta a condição de trabalho e cobra a análise técnica.',
    cipeiro: 'Registrar o padrão da tarefa, nunca a saúde das pessoas, e cobrar a avaliação ergonômica formal com prazo definido.',
    encaminhar: 'SESMT quando houver e gerência, com a solicitação registrada em ata',
    base: ['5.3.1', '5.6.3.2'],
    normas: 'NR-17 quanto à avaliação ergonômica, e NR-7 quanto ao sigilo das informações de saúde',
    chaves: 'varios colaboradores mesma dor padrao queixa repetida avaliacao ergonomica'
  },

  /* ===================================================
     TEMA 9 - SAUDE MENTAL, COMPORTAMENTO E RELACOES DE TRABALHO
     =================================================== */
  {
    n: 81,
    tema: CIPA_TEMAS[8],
    pergunta: 'O estresse causado pelo trabalho também pode ser um risco ocupacional?',
    resposta: 'Sim. Os fatores de risco psicossociais integram o gerenciamento de riscos ocupacionais e devem ser considerados na identificação de perigos, ao lado dos riscos físicos, químicos, biológicos, ergonômicos e de acidentes. São condições de organização e de relação no trabalho que podem adoecer: sobrecarga e ritmo excessivo, jornada e escala imprevisíveis, falta de autonomia, cobrança por metas sem meios para cumpri-las, assédio e violência, insegurança, falta de reconhecimento e conflito constante. No nosso app, o risco psicossocial aparece como tipo de risco próprio, em roxo, com a observação de que ele não tem cor definida no mapa de risco oficial: as cinco cores tradicionais vêm da Portaria 25/1994 e ele entrou depois, com a atualização da NR-1. O importante é que ele pode e deve ser registrado como qualquer outro risco.',
    cipeiro: 'Registrar a condição organizacional que gera o estresse, com setor e horário, e nunca o estado emocional de uma pessoa identificada.',
    encaminhar: 'Reunião da CIPA, com encaminhamento à gerência e ao RH',
    base: ['5.3.1'],
    normas: 'NR-1, quanto aos fatores de risco psicossociais no gerenciamento de riscos, e NR-17',
    chaves: 'estresse risco psicossocial saude mental ocupacional sobrecarga'
  },
  {
    n: 82,
    tema: CIPA_TEMAS[8],
    pergunta: 'Como identificar situações de sobrecarga que podem prejudicar a saúde dos colaboradores?',
    resposta: 'Sobrecarga aparece na organização do trabalho antes de aparecer nas pessoas. Os sinais objetivos são: volume de tarefa que não cabe na jornada, levando a hora extra habitual; setor operando permanentemente com menos pessoas do que a escala prevê; acúmulo de função sem redistribuição; pausas e refeições que não acontecem; quem está de folga sendo chamado com frequência; duas tarefas incompatíveis atribuídas ao mesmo posto, como atender o balcão e cuidar do forno ao mesmo tempo. Os sinais na equipe são: aumento de faltas e de atestados no mesmo setor, rotatividade alta, aumento de erro e retrabalho no fim do turno, irritação e conflito que não existiam antes, e queixa coletiva de cansaço. A CIPA registra os sinais objetivos, que são condição de trabalho, e não a situação de saúde de pessoas identificadas.',
    cipeiro: 'Registrar o que é verificável na organização do trabalho, com setor e horário, deixando de fora dados de saúde e nomes.',
    encaminhar: 'Gerência e RH, com o registro levado à reunião da CIPA',
    base: ['5.3.1'],
    normas: 'NR-1 quanto aos fatores psicossociais, e NR-17 quanto à organização do trabalho',
    chaves: 'sobrecarga identificar sinais falta de gente escala hora extra cansaco'
  },
  {
    n: 83,
    tema: CIPA_TEMAS[8],
    pergunta: 'O que fazer quando um colega relata humilhações ou constrangimentos no trabalho?',
    resposta: 'Ouça sem julgar, sem minimizar e sem interrogar. Não peça detalhes que a pessoa não quer dar, não prometa resolver o caso sozinho e não garanta um resultado que não depende de você. Diga com clareza qual é o canal: a Ouvidoria Interna, que tem tratamento sigiloso, e explique que o relato precisa ir por lá justamente para proteger quem relata. Ofereça acompanhar a pessoa até o canal, se ela quiser. Não registre o caso como observação de vistoria em nenhuma hipótese: o registro do app fica visível para toda a comissão com setor e data, e isso pode identificar a pessoa e expô-la. Não comente com outros membros, nem para pedir conselho. E não procure o suposto agressor: isso compromete a apuração e aumenta o risco de retaliação.',
    cipeiro: 'Acolher, orientar o canal sigiloso e guardar sigilo absoluto. Não registrar, não apurar e não confrontar ninguém.',
    encaminhar: 'Ouvidoria Interna, que é o canal com tratamento sigiloso',
    base: ['5.3.1'],
    normas: 'Lei 14.457/2022, quanto aos canais de denúncia e à prevenção do assédio',
    chaves: 'colega relatou humilhacao constrangimento assedio moral o que fazer sigilo'
  },
  {
    n: 84,
    tema: CIPA_TEMAS[8],
    pergunta: 'Qual é a diferença entre uma cobrança profissional e uma situação de assédio moral?',
    resposta: 'Cobrança legítima trata do trabalho; assédio trata da pessoa. A cobrança profissional é dirigida ao resultado ou ao comportamento específico, é feita de forma respeitosa, costuma ser reservada, vem com o que é esperado e com os meios para cumprir, e se aplica a todos da mesma forma. O assédio moral é conduta abusiva e repetida que expõe a pessoa a situação humilhante e constrangedora: humilhação diante dos colegas, apelido e ironia pessoal, grito, isolamento proposital, retirada injustificada de funções, meta impossível usada como punição, vigilância excessiva dirigida a uma pessoa só, ameaça constante. Três marcas ajudam a distinguir: a repetição, o direcionamento a uma pessoa ou a um grupo específico, e o ataque à dignidade em vez de ao trabalho. Quem avalia e apura o caso concreto é a Ouvidoria e o RH, não a CIPA.',
    cipeiro: 'Saber distinguir para orientar o canal correto, sem julgar o caso. A apuração é da Ouvidoria e do RH.',
    encaminhar: 'Ouvidoria Interna e RH',
    base: ['5.3.1'],
    normas: 'Lei 14.457/2022, quanto à prevenção do assédio no trabalho',
    chaves: 'diferenca cobranca assedio moral chefe exigente humilhacao limite'
  },
  {
    n: 85,
    tema: CIPA_TEMAS[8],
    pergunta: 'Como a CIPA deve agir diante de relatos de violência ou assédio no ambiente de trabalho?',
    resposta: 'A NR-5 inclui entre as atribuições da comissão incluir temas de prevenção e combate ao assédio sexual e a outras formas de violência no trabalho nas suas atividades e práticas, e a Lei 14.457/2022 coloca essa prevenção entre as medidas da CIPA. Note o que isso significa e o que não significa: o papel da CIPA é de prevenção, não de apuração. O que cabe à comissão é promover ações de informação e capacitação sobre o tema, divulgar com clareza qual é o canal de denúncia e como ele funciona, contribuir para que as regras de conduta sejam conhecidas, e tratar do assunto de forma coletiva nas atividades e na SIPAT. O caso individual vai para a Ouvidoria, com sigilo, e não entra em ata, em registro de vistoria nem em conversa entre membros. Investigar denúncia, ouvir testemunha ou confrontar envolvido não é papel da CIPA e prejudica a apuração.',
    cipeiro: 'Fazer prevenção coletiva e divulgar o canal. Caso individual não se apura na CIPA e não vai para a ata.',
    encaminhar: 'Ouvidoria Interna para o caso individual, RH para as ações de capacitação',
    base: ['5.3.1', '5.7.2'],
    normas: 'Lei 14.457/2022, quanto às medidas de prevenção do assédio atribuídas à CIPA',
    chaves: 'cipa assedio violencia como agir prevencao denuncia papel da comissao'
  },
  {
    n: 86,
    tema: CIPA_TEMAS[8],
    pergunta: 'O que fazer quando um colaborador tem medo de comunicar um risco por receio de represálias?',
    resposta: 'O medo de comunicar é, ele mesmo, um risco a tratar, porque risco silenciado continua existindo. A resposta prática é oferecer o canal da CIPA como intermediário: o cipeiro registra a condição observada no app, descrevendo o risco pelo que ele é, sem mencionar quem contou. Registro de condição de trabalho não precisa de nome nenhum para ser válido, e nunca se deve registrar a identidade de quem relatou. Vale também lembrar à pessoa que a norma prevê que cabe aos trabalhadores indicar situações de risco e apresentar sugestões, e que a lei protege o integrante eleito da CIPA justamente para que ele possa falar sem perder o emprego. Se o medo se repete em um setor, isso em si é um indicador a levar à reunião, porque aponta um ambiente onde a prevenção não funciona.',
    cipeiro: 'Ser o canal: registrar a condição sem identificar quem relatou, e levar à reunião o fato de haver medo de falar no setor.',
    encaminhar: 'Reunião da CIPA, e RH quando houver indício de retaliação',
    base: ['5.3.1', '5.3.3', '5.4.12'],
    normas: 'Lei 14.457/2022, quanto à garantia de canais seguros de comunicação',
    chaves: 'medo de falar represalia retaliacao denunciar risco anonimo'
  },
  {
    n: 87,
    tema: CIPA_TEMAS[8],
    pergunta: 'Como abordar um colega que trabalha de maneira insegura sem gerar uma discussão?',
    resposta: 'Se há risco imediato, interrompa na hora, sem rodeio e sem plateia: segurança vem antes de delicadeza, e depois se conversa. Fora do risco imediato, aborde em particular. Comece pelo que você viu, descrevendo o fato e não o caráter: diga que notou a limpeza acontecendo com a máquina ligada, em vez de dizer que a pessoa é descuidada. Pergunte como ela costuma fazer e por quê, porque muitas vezes a resposta revela que ninguém a treinou, que o procedimento correto demora e não cabe no ritmo, ou que a ferramenta certa não existe. Explique o risco concreto com um caso real, de preferência do próprio ramo. Fale de você como colega que trabalha ali e também quer chegar em casa inteiro, não como alguém que fiscaliza. Se aparecer obstáculo real, registre e encaminhe, e volte depois para contar o que foi feito.',
    cipeiro: 'Interromper o risco imediato na hora e conversar em particular depois. Descrever o fato, nunca a pessoa, e devolver a resposta do encaminhamento.',
    encaminhar: 'Chefia do setor quando há obstáculo de processo, ferramenta ou treinamento',
    base: ['5.3.1', '5.3.3'],
    chaves: 'abordar colega trabalho insegura conversa sem discussao orientar'
  },
  {
    n: 88,
    tema: CIPA_TEMAS[8],
    pergunta: 'A pressão para cumprir metas ou atender rapidamente pode contribuir para acidentes?',
    resposta: 'Sim, e de forma direta. Quando o tempo aperta, as medidas de segurança são as primeiras a serem abandonadas, porque são justamente as que acrescentam segundos à tarefa: esperar a máquina parar, bloquear a energia antes de limpar, buscar a luva térmica que está longe, sinalizar o piso molhado, pedir ajuda para erguer. Além disso, a pressão reduz a atenção disponível e faz a pessoa executar de memória. Em um ramo como o nosso, o horário de pico concentra pressão, corredor cheio, bancada carregada e piso molhado ao mesmo tempo. Por isso a meta ou o tempo de atendimento mal dimensionado é fator de risco organizacional, e precisa ser registrado como condição de trabalho. Quando a investigação de um acidente para na pressa, ela está incompleta: é preciso perguntar por que havia pressa.',
    cipeiro: 'Registrar a pressão de tempo como condição de trabalho, com setor e horário, e levar à reunião junto com os acidentes do período.',
    encaminhar: 'Reunião da CIPA, com encaminhamento à gerência sobre metas, escala e dimensionamento',
    base: ['5.3.1'],
    normas: 'NR-1 quanto aos fatores psicossociais, e NR-17 quanto ao ritmo e às exigências de tempo',
    chaves: 'meta pressao tempo atendimento rapido acidente ritmo pico'
  },
  {
    n: 89,
    tema: CIPA_TEMAS[8],
    pergunta: 'Como agir quando os conflitos entre colegas começam a prejudicar a segurança?',
    resposta: 'Conflito prejudica a segurança de formas concretas: as pessoas param de se avisar ao passar com algo quente, deixam de informar que o piso está molhado, não repassam o que ficou pendente na troca de turno, evitam pedir ajuda para erguer peso, e param de comunicar risco por não querer falar com quem está do outro lado. A CIPA não medeia conflito interpessoal, e não deve tentar: isso é da chefia e do RH. O que cabe ao cipeiro é tratar a consequência de segurança, que é o que está no seu campo: registrar objetivamente a falha de comunicação observada, por exemplo que a passagem de turno não está ocorrendo ou que avisos de piso molhado deixaram de ser dados, encaminhar essa falha à chefia, e relatar à reunião que existe um problema de relação no setor afetando a prevenção, sem narrar o conflito nem nomear pessoas.',
    cipeiro: 'Registrar a falha de segurança que o conflito produz, não o conflito. A mediação é da chefia e do RH.',
    encaminhar: 'Chefia do setor e RH',
    base: ['5.3.1'],
    normas: 'NR-1 quanto aos fatores psicossociais, e Lei 14.457/2022 quando houver indício de assédio',
    chaves: 'conflito entre colegas briga clima prejudica seguranca comunicacao turno'
  },
  {
    n: 90,
    tema: CIPA_TEMAS[8],
    pergunta: 'Qual é a responsabilidade da CIPA na prevenção do assédio sexual e de outras formas de violência no trabalho?',
    resposta: 'A NR-5 traz como atribuição da comissão incluir temas referentes à prevenção e ao combate ao assédio sexual e a outras formas de violência no trabalho nas suas atividades e práticas, e o treinamento de CIPA deve contemplar esse tema. A Lei 14.457/2022 detalha as medidas: incluir regras de conduta sobre assédio sexual nas normas internas, com ampla divulgação aos empregados; fixar procedimentos para receber e acompanhar denúncias, apurar os fatos e aplicar sanções, garantindo o anonimato de quem denuncia; incluir temas de prevenção à violência nas atividades e práticas da CIPA; e realizar ações de capacitação e sensibilização dos empregados em todos os níveis sobre o tema. A responsabilidade é, portanto, de prevenção, divulgação e capacitação. A apuração de caso concreto corre pelo canal de denúncia, com sigilo, e não pela comissão.',
    cipeiro: 'Garantir que o canal seja conhecido por todos e que o tema entre nas ações e na SIPAT. O caso individual não se apura na CIPA.',
    encaminhar: 'RH para as ações de capacitação e as regras de conduta, Ouvidoria para os casos',
    base: ['5.3.1', '5.7.2'],
    normas: 'Lei 14.457/2022, que lista as medidas de prevenção ao assédio atribuídas à CIPA',
    chaves: 'assedio sexual responsabilidade da cipa lei 14457 prevencao capacitacao'
  },

  /* ===================================================
     TEMA 10 - PREVENCAO, EMERGENCIAS E RESPONSABILIDADES LEGAIS
     =================================================== */
  {
    n: 91,
    tema: CIPA_TEMAS[9],
    pergunta: 'O que fazer ao identificar um risco grave e iminente de acidente?',
    resposta: 'Risco grave e iminente é a situação que pode causar lesão grave agora, e por isso tem procedimento próprio. Primeiro, retire as pessoas da exposição e impeça o acesso: afaste quem está no local, pare o equipamento se puder fazê-lo com segurança, isole e sinalize a área. Segundo, comunique imediatamente o responsável do setor e a gerência, por telefone ou pessoalmente, e não apenas por registro no app, porque registro não interrompe exposição. Terceiro, registre em seguida, com urgência alta e foto. Quarto, a CIPA pode propor formalmente ao SESMT ou à empresa a análise da situação e, se for o caso, a interrupção das atividades até que as medidas corretivas e de controle sejam adotadas: é uma atribuição expressa da norma e deve ser usada por escrito. Quinto, acompanhe até a correção e não deixe o caso sair da reunião seguinte.',
    cipeiro: 'Interromper a exposição e avisar por voz primeiro, registrar depois. A proposta formal de interrupção da atividade é atribuição da CIPA.',
    encaminhar: 'Responsável do setor e gerência de imediato, SESMT quando houver, e inspeção do trabalho se persistir',
    base: ['5.3.1', '5.6.4'],
    normas: 'NR-1, quanto ao risco grave e iminente',
    chaves: 'risco grave e iminente urgente interromper atividade isolar perigo imediato'
  },
  {
    n: 92,
    tema: CIPA_TEMAS[9],
    pergunta: 'Quando um colaborador pode interromper uma atividade por considerar que existe risco grave e iminente?',
    resposta: 'A NR-1 assegura ao trabalhador o direito de interromper suas atividades quando constatar uma situação de trabalho que, a seu julgamento, envolva risco grave e iminente para sua vida e sua saúde, devendo comunicar imediatamente o fato ao superior hierárquico. Três pontos importam na prática. Primeiro, o critério é o julgamento do próprio trabalhador no momento, e não uma avaliação técnica prévia. Segundo, a interrupção tem de ser comunicada de imediato à chefia, não é abandono de posto. Terceiro, o exercício desse direito não deve gerar punição: se houver constrangimento ou represália por ter parado diante de risco grave, isso é questão para registrar e levar ao RH e à reunião da CIPA. A atividade só volta depois que a situação for avaliada e corrigida, e quem libera o retorno é a empresa, com o SESMT quando houver.',
    cipeiro: 'Informar à equipe que esse direito existe e como exercê-lo, e registrar qualquer caso de represália por alguém ter parado diante de risco grave.',
    encaminhar: 'Chefia do setor de imediato, RH e reunião da CIPA se houver represália',
    base: ['5.3.1', '5.3.3'],
    normas: 'NR-1, quanto ao direito de interrupção da atividade em risco grave e iminente',
    chaves: 'direito de recusa parar o trabalho interromper atividade risco grave'
  },
  {
    n: 93,
    tema: CIPA_TEMAS[9],
    pergunta: 'Onde ficam os extintores e como saber qual é adequado para cada tipo de incêndio?',
    resposta: 'Os extintores devem ficar em local de fácil acesso e visualização, sinalizados, desobstruídos, com a via de acesso livre e dentro do prazo de validade da carga e da inspeção, e todos devem conhecer a posição dos que servem a sua área. Conferir isso é item de vistoria. Quanto ao tipo, as classes são: classe A para materiais sólidos que deixam resíduo, como papel, madeira e tecido, e o agente indicado é a água; classe B para líquidos e gases inflamáveis, como álcool, solvente e gás, com espuma, pó químico ou dióxido de carbono; classe C para equipamentos elétricos energizados, em que não se usa água, e o indicado é dióxido de carbono ou pó químico; classe D para metais pirofóricos, com agente específico; e classe K para óleos e gorduras de cozinha, situação em que água provoca projeção em chamas. O extintor de pó ABC atende as três primeiras classes, mas não substitui o de classe K na fritadeira. Usar extintor exige treinamento, e esse é um ponto que a CIPA deve cobrar.\n\nNa nossa produção hoje há extintor de CO2 ou de água perto da fritadeira e dos fornos, e não há extintor de classe K. Isso é uma lacuna a resolver: água sobre óleo em chamas provoca projeção e agrava o incêndio, e o CO2 não é o agente próprio para esse risco. Até a compra do classe K, a orientação à equipe é evacuar e acionar o 193, e não tentar combater fogo em fritadeira.',
    cipeiro: 'Na vistoria, checar acesso livre, sinalização e validade. A falta do extintor de classe K na produção já está identificada e deve permanecer em aberto na reunião até ser resolvida.',
    encaminhar: 'Gerência e brigada de incêndio, com registro na reunião da CIPA',
    base: ['5.3.1'],
    normas: 'NR-23, quanto à proteção contra incêndios, aos extintores e à sinalização',
    chaves: 'extintor classes abc classe k onde fica validade incendio tipo'
  },
  {
    n: 94,
    tema: CIPA_TEMAS[9],
    pergunta: 'O que fazer se houver um princípio de incêndio na cozinha ou na área de produção?',
    resposta: 'Dê o alarme primeiro, em voz alta e pelos meios disponíveis, para que as pessoas comecem a sair enquanto o fogo ainda é pequeno. Corte a energia do equipamento envolvido e feche o registro de gás, se os comandos estiverem acessíveis com segurança. Só tente combater se for princípio de incêndio, se você tiver treinamento, se tiver o extintor adequado em mãos e se tiver rota de saída livre às suas costas: combater fogo com a saída pelas costas bloqueadas é o erro que mata. Em fogo de óleo ou gordura, nunca use água: abafe com tampa ou use extintor de classe K. Se o fogo não ceder nos primeiros segundos, abandone o combate, retire todos, feche as portas ao sair para retardar a propagação e acione o Corpo de Bombeiros pelo 193, informando o endereço, o que está queimando e se há pessoas no local. Nunca volte para buscar objeto.\n\nAqui temos brigada treinada em todos os turnos, então a primeira pessoa a ser chamada é o brigadista do turno. O que falta é o extintor de classe K na produção, e por isso, em fogo de fritadeira, a conduta hoje é evacuar e chamar o 193.',
    cipeiro: 'Cobrar o extintor adequado por área e a rota livre. Na emergência, alarme e evacuação vêm antes de qualquer combate.',
    encaminhar: 'Corpo de Bombeiros pelo 193, gerência e brigada de incêndio',
    base: ['5.3.1', '5.6.4'],
    normas: 'NR-23, quanto a alarme, saídas, combate ao fogo e abandono do local',
    chaves: 'incendio cozinha principio de incendio fogo bombeiro 193 extintor evacuar'
  },
  {
    n: 95,
    tema: CIPA_TEMAS[9],
    pergunta: 'Como deve funcionar a evacuação da empresa em uma emergência?',
    resposta: 'A norma exige que todos tenham conhecimento de como proceder em caso de emergência e que as saídas, as rotas e os meios de abandono sejam adequados, sinalizados e desobstruídos. Na prática, uma evacuação funciona quando quatro coisas existem antes da emergência: rota de fuga conhecida e livre, com sinalização visível; ponto de encontro definido, fora da edificação e longe da fachada; alguém responsável por conferir se todos saíram, por área, e por conduzir visitantes e prestadores; e exercício de abandono feito periodicamente, porque ninguém aprende rota lendo um cartaz. Durante a saída: dar o alarme, sair sem correr e sem voltar, não usar elevador, fechar as portas atrás de si, ajudar quem tem mobilidade reduzida conforme combinado, e permanecer no ponto de encontro para a conferência. Rota obstruída ou porta de saída trancada durante o expediente é urgência alta em qualquer vistoria.',
    cipeiro: 'Verificar em cada vistoria se a rota está livre, a saída destrancada e a sinalização visível, e cobrar o exercício de abandono.',
    encaminhar: 'Gerência e brigada de incêndio, com registro na reunião da CIPA',
    base: ['5.3.1'],
    normas: 'NR-23, quanto às saídas, rotas de fuga e procedimentos de abandono',
    chaves: 'evacuacao abandono rota de fuga ponto de encontro simulado saida emergencia'
  },
  {
    n: 96,
    tema: CIPA_TEMAS[9],
    pergunta: 'Quem pode prestar primeiros socorros e o que os demais colaboradores devem fazer enquanto aguardam ajuda?',
    resposta: 'Primeiros socorros devem ser prestados por pessoa treinada para isso, e a norma exige que a empresa mantenha material de primeiros socorros adequado à atividade, guardado em local apropriado e aos cuidados de pessoa treinada. Quem não tem treinamento não deve executar manobra, mas tem papel essencial: garantir a segurança do local, desligando equipamento ou isolando a área para não haver uma segunda vítima; chamar imediatamente quem tem treinamento e acionar o serviço de emergência pelo 192, informando endereço, o que aconteceu e o estado da pessoa; manter a vítima calma e não movimentá-la, salvo risco maior onde ela está; afastar curiosos e abrir caminho para o socorro; e buscar informação útil, como o rótulo ou a FDS do produto envolvido, quando for caso químico. O que não fazer: dar água ou alimento, aplicar qualquer substância em queimadura ou ferimento, remover objeto encravado, e transportar a vítima em carro particular em caso grave.\n\nAqui temos pessoas treinadas em todos os turnos, então todos precisam saber quem é o treinado do seu turno. O que a CIPA verifica em vistoria é se o material de primeiros socorros está completo, dentro da validade e em local conhecido e acessível.',
    cipeiro: 'Verificar em vistoria o material de primeiros socorros e se a equipe sabe quem é a pessoa treinada do turno.',
    encaminhar: 'Serviço de emergência pelo 192, RH e gerência para treinamento e material',
    base: ['5.3.1'],
    normas: 'NR-7, quanto ao material de primeiros socorros aos cuidados de pessoa treinada',
    chaves: 'primeiros socorros quem pode prestar 192 socorro aguardar ajuda'
  },
  {
    n: 97,
    tema: CIPA_TEMAS[9],
    pergunta: 'Qual é a diferença entre a CIPA e o SESMT?',
    resposta: 'O SESMT é o serviço técnico da empresa, formado por profissionais contratados e habilitados, como técnico de segurança, engenheiro de segurança, médico do trabalho, enfermeiro e auxiliar de enfermagem do trabalho, dimensionado pela NR-4 conforme o grau de risco da atividade e o número de empregados. Ele faz o trabalho técnico: avalia riscos, elabora e conduz os programas, define medidas de controle, acompanha a saúde. A CIPA é comissão de representação, composta por representantes da empresa, designados, e dos empregados, eleitos, com mandato de um ano, que exercem a função junto com o cargo que já têm e não precisam de formação técnica. Ela identifica, propõe, acompanha e cobra. Os dois são complementares: a norma prevê que a CIPA atue com assessoria do SESMT, onde houver, e que possa propor a ele a análise de situações de risco. Quando a empresa não é obrigada a ter SESMT e também não se enquadra no Quadro I, ela nomeia um representante da NR-5.',
    cipeiro: 'Pedir assessoria técnica ao SESMT quando houver, em vez de tentar produzir avaliação técnica por conta própria.',
    encaminhar: 'SESMT quando houver, ou o profissional de segurança contratado pela empresa',
    base: ['5.3.1', '5.4.1', '5.4.13', '5.4.13.1'],
    normas: 'NR-4, quanto à composição e ao dimensionamento do SESMT',
    chaves: 'diferenca cipa sesmt o que e sesmt servico especializado tecnico'
  },
  {
    n: 98,
    tema: CIPA_TEMAS[9],
    pergunta: 'O que é o mapa de riscos e qual é sua utilidade na prevenção de acidentes?',
    resposta: 'É a representação visual dos riscos existentes em cada área, desenhada sobre a planta do local, com círculos coloridos por tipo de risco e tamanho proporcional à gravidade. As cores tradicionais vêm da Portaria 25/1994: verde para risco biológico, vermelho para químico, marrom para físico, amarelo para ergonômico e azul para risco de acidentes. A NR-5 atribui à CIPA registrar a percepção dos riscos dos trabalhadores, e permite fazê-lo por meio do mapa de risco ou de outra técnica ou ferramenta apropriada à sua escolha, sem ordem de preferência, com assessoria do SESMT onde houver. A utilidade está menos no cartaz e mais no processo: o mapa é construído com quem trabalha na área, e é nessa conversa que aparecem riscos que não estão em documento nenhum. Depois pronto, serve para orientar quem chega, para dirigir a vistoria e para comparar com o inventário de riscos do PGR. Mapa feito sem a equipe e nunca atualizado não serve.',
    cipeiro: 'Construir o mapa com as pessoas do setor, não para elas, e usá-lo como roteiro de vistoria. A percepção de risco dos trabalhadores é atribuição expressa da CIPA.',
    encaminhar: 'SESMT quando houver, para assessoria, e reunião da CIPA',
    base: ['5.3.1'],
    normas: 'Portaria 25/1994 quanto às cores do mapa, e NR-1 quanto à percepção de riscos dos trabalhadores',
    chaves: 'mapa de risco cores utilidade como fazer percepcao de risco'
  },
  {
    n: 99,
    tema: CIPA_TEMAS[9],
    pergunta: 'O que é o PGR e como o cipeiro pode contribuir para identificar os riscos ocupacionais?',
    resposta: 'O PGR, Programa de Gerenciamento de Riscos, é o programa exigido pela NR-1 em que a empresa gerencia os riscos ocupacionais. Ele tem dois documentos centrais: o inventário de riscos, que levanta os perigos e avalia os riscos de cada atividade, e o plano de ação, que registra as medidas de prevenção com responsável e prazo. A NR-5 atribui à CIPA acompanhar o processo de identificação de perigos e de avaliação de riscos e a adoção das medidas de prevenção implementadas pela empresa, e registrar a percepção de risco dos trabalhadores. A contribuição do cipeiro é justamente a que falta no documento: ele vê a tarefa como ela é feita, e não como foi descrita. Na prática, isso significa levar ao SESMT e à empresa os riscos que não estão no inventário, as medidas previstas no plano de ação que não aconteceram no setor, as tarefas que mudaram desde o último levantamento, e a reincidência registrada nas vistorias, que é evidência de medida que não funcionou.',
    cipeiro: 'Pedir acesso ao inventário de riscos e ao plano de ação, comparar com o que a vistoria mostra e levar as diferenças à reunião.',
    encaminhar: 'SESMT quando houver, ou responsável técnico pelo PGR, e gerência',
    base: ['5.3.1', '5.9.1'],
    normas: 'NR-1, quanto ao PGR, ao inventário de riscos e ao plano de ação',
    chaves: 'pgr programa de gerenciamento de riscos inventario plano de acao contribuir'
  },
  {
    n: 100,
    tema: CIPA_TEMAS[9],
    pergunta: 'Como saber se uma ação da CIPA realmente reduziu os riscos, em vez de apenas cumprir uma formalidade?',
    resposta: 'Olhando resultado, e não atividade realizada. Quatro verificações dão a resposta. A primeira é a reincidência: se o mesmo item volta a ser reprovado no mesmo setor, a medida não funcionou, ainda que tenha sido executada, e o app mostra essa repetição. A segunda é o tempo de resolução: itens que permanecem em aberto por muitos meses indicam encaminhamento que não anda, não prevenção. A terceira é a natureza da medida adotada: medida que depende de a pessoa se lembrar, como orientar a equipe e redobrar a atenção, é a mais fraca que existe, e protege por pouco tempo; medida que elimina o risco na fonte ou que impede o contato por proteção física protege sempre. A quarta é o perfil dos acidentes e quase acidentes: se continuam acontecendo pelas mesmas causas, as causas não foram tocadas. Como rotina, vale fechar cada período comparando o que foi registrado, o que foi resolvido, o que reincidiu e quanto tempo levou, que é exatamente o que o relatório do app entrega para a reunião.',
    cipeiro: 'Medir reincidência, tempo de resolução e força da medida adotada. Ação registrada não é o mesmo que risco reduzido.',
    encaminhar: 'Reunião da CIPA, para revisão do plano de trabalho',
    base: ['5.3.1', '5.6.3.2'],
    normas: 'NR-1, quanto à hierarquia das medidas de prevenção e ao acompanhamento do plano de ação',
    chaves: 'eficacia avaliar acao da cipa formalidade reincidencia indicador resultado'
  }
];
