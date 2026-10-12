/* =========================================================
   NR-5 CONSULTA
   Texto da Norma Regulamentadora n. 5, Comissão Interna de
   Prevenção de Acidentes e de Assédio, conforme a redação dada
   pela Portaria MTP n. 4.219, de 20 de dezembro de 2022.

   O texto aqui é literal. A busca nunca reescreve a norma:
   ela devolve o número do item e o texto como está publicado.
   ========================================================= */

const NR5_FONTE = {
  norma: 'NR-5 Comissão Interna de Prevenção de Acidentes e de Assédio',
  base: 'Portaria MTb n. 3.214/1978, com a redação da Portaria MTP n. 4.219, de 20 de dezembro de 2022',
  link: 'https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/norma-regulamentadora-no-5-nr-5'
};

/* ---------------------------------------------------------
   TEXTO DA NORMA
   --------------------------------------------------------- */
const NR5_ITENS = [
  /* ----- 5.1 Objetivo ----- */
  {
    item: '5.1.1',
    grupo: '5.1 Objetivo',
    texto: 'Esta norma regulamentadora NR estabelece dos parâmetros e os requisitos da Comissão Interna de Prevenção de Acidentes e de Assédio CIPA tendo por objetivo a prevenção de acidentes e doenças relacionadas ao trabalho, de modo a tornar compatível permanentemente o trabalho com a preservação da vida e promoção da saúde do trabalhador.',
    chaves: 'objetivo finalidade para que serve'
  },

  /* ----- 5.2 Campo de aplicação ----- */
  {
    item: '5.2.1',
    grupo: '5.2 Campo de aplicação',
    texto: 'As organizações e os órgãos públicos da administração direta e indireta, bem como os órgãos dos Poderes Legislativo, Judiciário e Ministério Público, que possuam empregados regidos pela Consolidação das Leis do Trabalho CLT, devem constituir e manter CIPA.',
    chaves: 'quem precisa ter cipa aplicacao obrigatoriedade clt'
  },
  {
    item: '5.2.2',
    grupo: '5.2 Campo de aplicação',
    texto: 'Nos termos previstos em lei, aplica-se o disposto nesta NR a outras relações jurídicas de trabalho.',
    chaves: 'outras relacoes de trabalho'
  },

  /* ----- 5.3 Atribuições ----- */
  {
    item: '5.3.1',
    grupo: '5.3 Atribuições',
    texto: 'A CIPA tem por atribuição:\na) acompanhar o processo de identificação de perigos e avaliação de riscos bem como a adoção de medidas de prevenção implementadas pela organização;\nb) registrar a percepção dos riscos dos trabalhadores, em conformidade com o subitem 1.5.3.3 da NR-01, por meio do mapa de risco ou outra técnica ou ferramenta apropriada à sua escolha, sem ordem de preferência, com assessoria do Serviço Especializado em Segurança e em Medicina do Trabalho SESMT, onde houver;\nc) verificar os ambientes e as condições de trabalho visando identificar situações que possam trazer riscos para a segurança e saúde dos trabalhadores;\nd) elaborar e acompanhar plano de trabalho que possibilite a ação preventiva em segurança e saúde no trabalho;\ne) participar no desenvolvimento e implementação de programas relacionados à segurança e saúde no trabalho;\nf) acompanhar a análise dos acidentes e doenças relacionadas ao trabalho, nos termos da NR-1 e propor, quando for o caso, medidas para a solução dos problemas identificados;\ng) requisitar à organização as informações sobre questões relacionadas à segurança e saúde dos trabalhadores, incluindo as Comunicações de Acidente de Trabalho CAT emitidas pela organização, resguardados o sigilo médico e as informações pessoais;\nh) propor ao SESMT, quando houver, ou à organização, a análise das condições ou situações de trabalho nas quais considere haver risco grave e iminente à segurança e saúde dos trabalhadores e, se for o caso, a interrupção das atividades até a adoção das medidas corretivas e de controle;\ni) promover, anualmente, em conjunto com o SESMT, onde houver, a Semana Interna de Prevenção de Acidentes do Trabalho SIPAT, conforme programação definida pela CIPA; e\nj) incluir temas referentes à prevenção e ao combate ao assédio sexual e a outras formas de violência no trabalho nas suas atividades e práticas.',
    chaves: 'atribuicoes competencias obrigacoes funcoes papel vistoria mapa de risco plano de trabalho sipat cat assedio inspecao risco grave e iminente'
  },
  {
    item: '5.3.2',
    grupo: '5.3 Atribuições',
    texto: 'Cabe à organização:\na) proporcionar aos membros da CIPA os meios necessários ao desempenho de suas atribuições, garantindo tempo suficiente para a realização das tarefas constantes no plano de trabalho;\nb) permitir a colaboração dos trabalhadores nas ações da CIPA; e\nc) fornecer à CIPA, quando requisitadas, as informações relacionadas às suas atribuições.',
    chaves: 'obrigacao da empresa organizacao empregador tempo meios'
  },
  {
    item: '5.3.3',
    grupo: '5.3 Atribuições',
    texto: 'Cabe aos trabalhadores indicar à CIPA, ao SESMT e à organização situações de riscos e apresentar sugestões para melhoria das condições de trabalho.',
    chaves: 'papel dos trabalhadores funcionarios sugestoes'
  },
  {
    item: '5.3.4',
    grupo: '5.3 Atribuições',
    texto: 'Cabe ao Presidente da CIPA:\na) convocar os membros para as reuniões; e\nb) coordenar as reuniões, encaminhando à organização e ao SESMT, quando houver, as decisões da comissão.',
    chaves: 'presidente convocar reuniao coordenar atribuicao do presidente'
  },
  {
    item: '5.3.5',
    grupo: '5.3 Atribuições',
    texto: 'Cabe ao Vice-Presidente substituir o Presidente nos seus impedimentos eventuais ou nos seus afastamentos temporários.',
    chaves: 'vice presidente substituir afastamento'
  },
  {
    item: '5.3.6',
    grupo: '5.3 Atribuições',
    texto: 'O Presidente e o Vice-Presidente da CIPA, em conjunto, terão as seguintes atribuições de:\na) coordenar e supervisionar as atividades da CIPA, zelando para que os objetivos propostos sejam alcançados; e\nb) divulgar as decisões da CIPA a todos os trabalhadores do estabelecimento.',
    chaves: 'presidente vice presidente divulgar decisoes'
  },

  /* ----- 5.4 Constituição e estruturação ----- */
  {
    item: '5.4.1',
    grupo: '5.4 Constituição e estruturação',
    texto: 'A CIPA será constituída por estabelecimento e composta de representantes da organização e dos empregados, de acordo com o dimensionamento previsto no Quadro I desta NR, ressalvadas as disposições para setores econômicos específicos.',
    chaves: 'dimensionamento quantos membros composicao quadro i representantes'
  },
  {
    item: '5.4.2',
    grupo: '5.4 Constituição e estruturação',
    texto: 'A CIPA das organizações que operem em regime sazonal devem ser dimensionadas tomando-se por base a média aritmética do número de trabalhadores do ano civil anterior e obedecido o Quadro I desta NR.',
    chaves: 'sazonal media aritmetica'
  },
  {
    item: '5.4.3',
    grupo: '5.4 Constituição e estruturação',
    texto: 'Os representantes da organização na CIPA, titulares e suplentes, serão por ela designados.',
    chaves: 'designados representantes da empresa indicacao'
  },
  {
    item: '5.4.4',
    grupo: '5.4 Constituição e estruturação',
    texto: 'Os representantes dos empregados, titulares e suplentes, serão eleitos em escrutínio secreto, do qual participem, independentemente de filiação sindical, exclusivamente os empregados interessados.',
    chaves: 'eleicao voto secreto escrutinio representantes dos empregados'
  },
  {
    item: '5.4.5',
    grupo: '5.4 Constituição e estruturação',
    texto: 'A organização designará dentre seus representantes o Presidente da CIPA, e os representantes eleitos dos empregados escolherão dentre os titulares o vice-presidente.',
    chaves: 'quem escolhe o presidente vice presidente designacao'
  },
  {
    item: '5.4.6',
    grupo: '5.4 Constituição e estruturação',
    texto: 'O mandato dos membros eleitos da CIPA terá a duração de um ano, permitida uma reeleição.',
    chaves: 'mandato duracao um ano reeleicao'
  },
  {
    item: '5.4.7',
    grupo: '5.4 Constituição e estruturação',
    texto: 'Os membros da CIPA, eleitos e designados serão empossados no primeiro dia útil após o término do mandato anterior.',
    chaves: 'posse empossados primeiro dia util'
  },
  {
    item: '5.4.8',
    grupo: '5.4 Constituição e estruturação',
    texto: 'A organização deve fornecer cópias das atas de eleição e posse aos membros titulares e suplentes da CIPA.',
    chaves: 'ata de eleicao ata de posse copias'
  },
  {
    item: '5.4.9',
    grupo: '5.4 Constituição e estruturação',
    texto: 'Quando solicitada, a organização encaminhará a documentação referente ao processo eleitoral da CIPA, podendo ser em meio eletrônico, ao sindicato dos trabalhadores da categoria preponderante, no prazo de até 10 (dez) dias.',
    chaves: 'sindicato documentacao eleitoral prazo dez dias'
  },
  {
    item: '5.4.10',
    grupo: '5.4 Constituição e estruturação',
    texto: 'A CIPA não poderá ter seu número de representantes reduzido, bem como não poderá ser desativada pela organização, antes do término do mandato de seus membros, ainda que haja redução do número de empregados, exceto no caso de encerramento das atividades do estabelecimento.',
    chaves: 'reduzir membros desativar cipa encerramento'
  },
  {
    item: '5.4.11',
    grupo: '5.4 Constituição e estruturação',
    texto: 'É vedada à organização, em relação ao integrante eleito da CIPA:\na) a alteração de suas atividades normais na organização que prejudique o exercício de suas atribuições; e\nb) a transferência para outro estabelecimento, sem a sua anuência, ressalvado o disposto nos parágrafos primeiro e segundo do art. 469 da CLT.',
    chaves: 'transferencia mudanca de funcao vedada garantia'
  },
  {
    item: '5.4.12',
    grupo: '5.4 Constituição e estruturação',
    texto: 'É vedada a dispensa arbitrária ou sem justa causa do empregado eleito para cargo de direção da CIPA desde o registro de sua candidatura até um ano após o final de seu mandato.',
    chaves: 'estabilidade demissao dispensa garantia de emprego candidatura'
  },
  {
    item: '5.4.12.1',
    grupo: '5.4 Constituição e estruturação',
    texto: 'O término do contrato de trabalho por prazo determinado não caracteriza dispensa arbitrária ou sem justa causa do empregado eleito para cargo de direção da CIPA.',
    chaves: 'contrato prazo determinado estabilidade'
  },
  {
    item: '5.4.13',
    grupo: '5.4 Constituição e estruturação',
    texto: 'Quando o estabelecimento não se enquadrar no Quadro I e não for atendido por SESMT, nos termos da Norma Regulamentadora n. 4 (NR-04), a organização nomeará um representante da organização dentre seus empregados para auxiliar na execução das ações de prevenção em segurança e saúde no trabalho, podendo ser adotados mecanismos de participação dos empregados, por meio de negociação coletiva.',
    chaves: 'representante da nr5 nao enquadrado sem cipa'
  },
  {
    item: '5.4.13.1',
    grupo: '5.4 Constituição e estruturação',
    texto: 'No caso de atendimento pelo SESMT, este deverá desempenhar as atribuições da CIPA.',
    chaves: 'sesmt atribuicoes'
  },
  {
    item: '5.4.13.2',
    grupo: '5.4 Constituição e estruturação',
    texto: 'O microempreendedor individual MEI está dispensado de nomear o representante da NR-05.',
    chaves: 'mei dispensado microempreendedor'
  },
  {
    item: '5.4.14',
    grupo: '5.4 Constituição e estruturação',
    texto: 'A nomeação de empregado como representante da NR-05 e sua forma de atuação devem ser formalizadas anualmente pela organização.',
    chaves: 'nomeacao representante formalizada anual'
  },
  {
    item: '5.4.15',
    grupo: '5.4 Constituição e estruturação',
    texto: 'A nomeação de empregado como representante da NR-05 não impede o seu ingresso na CIPA, quando da sua constituição, seja como representante do empregador ou como dos empregados.',
    chaves: 'representante nr5 ingresso na cipa'
  },

  /* ----- 5.5 Processo eleitoral ----- */
  {
    item: '5.5.1',
    grupo: '5.5 Processo eleitoral',
    texto: 'Compete ao empregador convocar eleições para escolha dos representantes dos empregados na CIPA, no prazo mínimo de 60 (sessenta) dias antes do término do mandato em curso.',
    chaves: 'convocar eleicao prazo sessenta dias quando comecar'
  },
  {
    item: '5.5.1.1',
    grupo: '5.5 Processo eleitoral',
    texto: 'A organização deve comunicar, com antecedência, podendo ser por meio eletrônico, com confirmação de entrega, o início do processo eleitoral ao sindicato da categoria preponderante.',
    chaves: 'comunicar sindicato inicio processo eleitoral'
  },
  {
    item: '5.5.2',
    grupo: '5.5 Processo eleitoral',
    texto: 'O Presidente e o Vice-Presidente da CIPA constituirão dentre seus membros a comissão eleitoral, que será a responsável pela organização e acompanhamento do processo eleitoral.',
    chaves: 'comissao eleitoral quem organiza a eleicao'
  },
  {
    item: '5.5.2.1',
    grupo: '5.5 Processo eleitoral',
    texto: 'Nos estabelecimentos onde não houver CIPA, a comissão eleitoral será constituída pela organização.',
    chaves: 'comissao eleitoral sem cipa'
  },
  {
    item: '5.5.3',
    grupo: '5.5 Processo eleitoral',
    texto: 'O processo eleitoral deve observar as seguintes condições:\na) publicação e divulgação de edital de convocação da eleição e abertura de prazos para inscrição de candidatos, em locais de fácil acesso e visualização, podendo ser em meio físico ou eletrônico;\nb) inscrição e eleição individual, sendo que o período mínimo para inscrição será de 15 (quinze) dias corridos;\nc) liberdade de inscrição para todos os empregados do estabelecimento, independentemente de setores ou locais de trabalho, com fornecimento de comprovante em meio físico ou eletrônico;\nd) garantia de emprego até a eleição para todos os empregados inscritos;\ne) publicação e divulgação da relação dos empregados inscritos, em locais de fácil acesso e visualização, podendo ser em meio físico ou eletrônico;\nf) realização da eleição no prazo mínimo de 30 (trinta) dias antes do término do mandato da CIPA, quando houver;\ng) realização de eleição em dia normal de trabalho, respeitando os horários de turnos e em horário que possibilite a participação da maioria dos empregados do estabelecimento;\nh) voto secreto;\ni) apuração dos votos, em horário normal de trabalho, com acompanhamento de representante da organização e dos empregados, em número a ser definido pela comissão eleitoral, facultado o acompanhamento dos candidatos; e\nj) organização da eleição por meio de processo que garanta tanto a segurança do sistema como a confidencialidade e a precisão do registro dos votos.',
    chaves: 'edital inscricao candidatos quinze dias apuracao voto secreto regras da eleicao'
  },
  {
    item: '5.5.4',
    grupo: '5.5 Processo eleitoral',
    texto: 'Havendo participação inferior a cinquenta por cento dos empregados na votação, não haverá a apuração dos votos e a comissão eleitoral deverá prorrogar o período de votação para o dia subsequente, computando-se os votos já registrados no dia anterior, a qual será considerada válida com a participação de, no mínimo, um terço dos empregados.',
    chaves: 'quorum participacao cinquenta por cento prorrogar votacao'
  },
  {
    item: '5.5.4.1',
    grupo: '5.5 Processo eleitoral',
    texto: 'Constatada a participação inferior a um terço dos empregados no segundo dia de votação, não haverá a apuração dos votos e a comissão eleitoral deverá prorrogar o período de votação para o dia subsequente, computando-se os votos já registrados nos dias anteriores, a qual será considerada válida com a participação de qualquer número de empregados.',
    chaves: 'quorum um terco terceiro dia votacao'
  },
  {
    item: '5.5.4.2',
    grupo: '5.5 Processo eleitoral',
    texto: 'A prorrogação referida nos subitens 5.5.4 e 5.5.4.1 deve ser comunicada ao sindicato da categoria profissional preponderante.',
    chaves: 'prorrogacao comunicar sindicato'
  },
  {
    item: '5.5.5',
    grupo: '5.5 Processo eleitoral',
    texto: 'As denúncias sobre o processo eleitoral deverão ser protocolizadas na unidade descentralizada de inspeção do trabalho, até 30 (trinta) dias após a data da divulgação do resultado da eleição da CIPA.',
    chaves: 'denuncia eleicao irregularidade prazo trinta dias'
  },
  {
    item: '5.5.5.1',
    grupo: '5.5 Processo eleitoral',
    texto: 'Compete à autoridade máxima regional em matéria de inspeção do trabalho, confirmadas irregularidades no processo eleitoral, determinar a sua correção ou proceder a anulação quando for o caso.',
    chaves: 'anulacao eleicao irregularidade autoridade'
  },
  {
    item: '5.5.5.2',
    grupo: '5.5 Processo eleitoral',
    texto: 'Em caso de anulação somente da votação, a organização convocará nova votação no prazo de 10 (dez) dias, a contar da data de ciência, garantidas as inscrições anteriores.',
    chaves: 'anulacao nova votacao dez dias'
  },
  {
    item: '5.5.5.3',
    grupo: '5.5 Processo eleitoral',
    texto: 'Nos demais casos, a decisão da autoridade máxima regional em matéria de inspeção do trabalho determinará os atos atingidos, as providências, e os prazos a serem adotados, atendidos os prazos previstos nesta NR.',
    chaves: 'decisao autoridade prazos'
  },
  {
    item: '5.5.5.4',
    grupo: '5.5 Processo eleitoral',
    texto: 'Quando a anulação se der antes da posse dos membros da CIPA, ficará assegurada a prorrogação do mandato anterior, quando houver, até a complementação do processo eleitoral.',
    chaves: 'anulacao antes da posse prorrogacao mandato'
  },
  {
    item: '5.5.6',
    grupo: '5.5 Processo eleitoral',
    texto: 'Assumirão a condição de membros titulares e suplentes os candidatos mais votados.',
    chaves: 'mais votados titulares suplentes resultado'
  },
  {
    item: '5.5.7',
    grupo: '5.5 Processo eleitoral',
    texto: 'Em caso de empate, assumirá aquele que tiver maior tempo de serviço no estabelecimento.',
    chaves: 'empate desempate tempo de servico'
  },
  {
    item: '5.5.8',
    grupo: '5.5 Processo eleitoral',
    texto: 'Os candidatos votados e não eleitos serão relacionados na ata de eleição e apuração, em ordem decrescente de votos, possibilitando nomeação posterior, em caso de vacância de suplentes.',
    chaves: 'nao eleitos ata vacancia nomeacao posterior'
  },

  /* ----- 5.6 Funcionamento ----- */
  {
    item: '5.6.1',
    grupo: '5.6 Funcionamento',
    texto: 'A CIPA terá reuniões ordinárias mensais, de acordo com o calendário preestabelecido.',
    chaves: 'reuniao mensal ordinaria calendario periodicidade de quanto em quanto tempo'
  },
  {
    item: '5.6.1.1',
    grupo: '5.6 Funcionamento',
    texto: 'A critério da CIPA, nas Microempresas ME e Empresas de Pequeno Porte EPP, graus de risco 1 e 2, as reuniões poderão ser bimestrais.',
    chaves: 'bimestral microempresa pequeno porte grau de risco 1 2'
  },
  {
    item: '5.6.2',
    grupo: '5.6 Funcionamento',
    texto: 'As reuniões ordinárias da CIPA serão realizadas na organização, preferencialmente de forma presencial, podendo a participação ocorrer de forma remota.',
    chaves: 'reuniao presencial remota online onde'
  },
  {
    item: '5.6.2.1',
    grupo: '5.6 Funcionamento',
    texto: 'A data e horário das reuniões serão acordadas entre os seus membros observando os turnos e as jornadas de trabalho.',
    chaves: 'data horario reuniao turnos jornada'
  },
  {
    item: '5.6.3',
    grupo: '5.6 Funcionamento',
    texto: 'As reuniões da CIPA terão atas assinadas pelos presentes.',
    chaves: 'ata assinatura presentes reuniao'
  },
  {
    item: '5.6.3.1',
    grupo: '5.6 Funcionamento',
    texto: 'As atas das reuniões devem ser disponibilizadas a todos os integrantes da CIPA, podendo ser por meio eletrônico.',
    chaves: 'ata disponibilizar integrantes eletronico'
  },
  {
    item: '5.6.3.2',
    grupo: '5.6 Funcionamento',
    texto: 'As deliberações e encaminhamentos das reuniões da CIPA devem ser disponibilizadas a todos os empregados em quadro de aviso ou por meio eletrônico.',
    chaves: 'deliberacoes quadro de aviso divulgar empregados mural'
  },
  {
    item: '5.6.4',
    grupo: '5.6 Funcionamento',
    texto: 'As reuniões extraordinárias devem ser realizadas quando:\na) ocorrer acidente do trabalho grave ou fatal; ou\nb) houver solicitação de uma das representações.',
    chaves: 'reuniao extraordinaria acidente grave fatal'
  },
  {
    item: '5.6.5',
    grupo: '5.6 Funcionamento',
    texto: 'Para cada reunião ordinária ou extraordinária, os membros da CIPA designarão o secretário responsável por redigir a ata.',
    chaves: 'secretario ata quem escreve'
  },
  {
    item: '5.6.6',
    grupo: '5.6 Funcionamento',
    texto: 'O membro titular perderá o mandato, sendo substituído por suplente, quando faltar a mais de quatro reuniões ordinárias sem justificativa.',
    chaves: 'falta faltas perder mandato quatro reunioes substituicao'
  },
  {
    item: '5.6.7',
    grupo: '5.6 Funcionamento',
    texto: 'A vacância definitiva de cargo, ocorrida durante o mandato, será suprida por suplente, obedecida a ordem de colocação decrescente que consta na ata de eleição, devendo os motivos ser registrados em ata de reunião.',
    chaves: 'vacancia saida de membro suplente substituicao'
  },
  {
    item: '5.6.7.1',
    grupo: '5.6 Funcionamento',
    texto: 'Caso não existam mais suplentes, durante os primeiros 6 (seis) meses do mandato, a organização deve realizar eleição extraordinária para suprir a vacância, que somente será considerada válida com a participação de, no mínimo, um terço dos trabalhadores.',
    chaves: 'eleicao extraordinaria sem suplentes seis meses'
  },
  {
    item: '5.6.7.1.1',
    grupo: '5.6 Funcionamento',
    texto: 'Os prazos da eleição extraordinária serão reduzidos à metade dos prazos previstos no processo eleitoral desta NR.',
    chaves: 'prazos eleicao extraordinaria metade'
  },
  {
    item: '5.6.7.1.2',
    grupo: '5.6 Funcionamento',
    texto: 'As demais exigências estabelecidas para o processo eleitoral devem ser atendidas.',
    chaves: 'exigencias processo eleitoral'
  },
  {
    item: '5.6.7.2',
    grupo: '5.6 Funcionamento',
    texto: 'No caso de afastamento definitivo do presidente, a organização indicará o substituto, em dois dias úteis, preferencialmente entre os membros da CIPA.',
    chaves: 'afastamento presidente substituto dois dias uteis'
  },
  {
    item: '5.6.7.3',
    grupo: '5.6 Funcionamento',
    texto: 'No caso de afastamento definitivo do vice-presidente, os membros titulares da representação dos empregados, escolherão o substituto, entre seus titulares, em dois dias úteis.',
    chaves: 'afastamento vice presidente substituto'
  },
  {
    item: '5.6.7.4',
    grupo: '5.6 Funcionamento',
    texto: 'O mandato do membro eleito em processo eleitoral extraordinário deve ser compatibilizado com o mandato dos demais membros da Comissão.',
    chaves: 'mandato eleicao extraordinaria compatibilizado'
  },
  {
    item: '5.6.7.5',
    grupo: '5.6 Funcionamento',
    texto: 'O treinamento de membro eleito em processo extraordinário deve ser realizado no prazo máximo de 30 (trinta) dias, contados a partir da data da posse.',
    chaves: 'treinamento eleicao extraordinaria trinta dias'
  },
  {
    item: '5.6.8',
    grupo: '5.6 Funcionamento',
    texto: 'As decisões da CIPA serão preferencialmente por consenso.',
    chaves: 'decisoes consenso como decidir'
  },
  {
    item: '5.6.8.1',
    grupo: '5.6 Funcionamento',
    texto: 'Não havendo consenso, a CIPA deve regular o procedimento de votação e o pedido de reconsideração da decisão.',
    chaves: 'votacao reconsideracao sem consenso'
  },

  /* ----- 5.7 Treinamento ----- */
  {
    item: '5.7.1',
    grupo: '5.7 Treinamento',
    texto: 'A organização deve promover treinamento para o representante nomeado da NR-5 e para os membros da CIPA, titulares e suplentes, antes da posse.',
    chaves: 'treinamento antes da posse curso capacitacao'
  },
  {
    item: '5.7.1.1',
    grupo: '5.7 Treinamento',
    texto: 'O treinamento de CIPA em primeiro mandato será realizado no prazo máximo de 30 (trinta) dias, contados a partir da data da posse.',
    chaves: 'primeiro mandato treinamento trinta dias'
  },
  {
    item: '5.7.2',
    grupo: '5.7 Treinamento',
    texto: 'O treinamento deve contemplar, no mínimo, os seguintes itens:\na) estudo do ambiente, das condições de trabalho, bem como dos riscos originados do processo produtivo;\nb) noções sobre acidentes e doenças relacionadas ao trabalho decorrentes das condições de trabalho e da exposição aos riscos existentes no estabelecimento e suas medidas de prevenção;\nc) metodologia de investigação e análise de acidentes e doenças relacionadas ao trabalho;\nd) princípios gerais de higiene do trabalho e de medidas de prevenção dos riscos;\ne) noções sobre as legislações trabalhista e previdenciária relativas à segurança e saúde no trabalho;\nf) noções sobre a inclusão de pessoas com deficiência e reabilitados nos processos de trabalho;\ng) organização da CIPA e outros assuntos necessários ao exercício das atribuições da Comissão; e\nh) prevenção e combate ao assédio sexual e a outras formas de violência no trabalho.',
    chaves: 'conteudo do treinamento programa assedio investigacao de acidentes higiene inclusao'
  },
  {
    item: '5.7.3',
    grupo: '5.7 Treinamento',
    texto: 'O treinamento realizado há menos de 2 (dois) anos contados da conclusão do curso pode ser aproveitado na mesma organização, observado o estabelecido na NR-1.',
    chaves: 'aproveitamento treinamento dois anos validade'
  },
  {
    item: '5.7.4',
    grupo: '5.7 Treinamento',
    texto: 'O treinamento deve ter carga horária mínima de:\na) 8 (oito) horas para estabelecimentos de grau de risco 1;\nb) 12 (doze) horas para estabelecimentos de grau de risco 2;\nc) 16 (dezesseis) horas para estabelecimentos de grau de risco 3; e\nd) 20 (vinte) horas para estabelecimentos de grau de risco 4.',
    chaves: 'carga horaria horas treinamento grau de risco quantas horas'
  },
  {
    item: '5.7.4.1',
    grupo: '5.7 Treinamento',
    texto: 'A carga horária do treinamento deve ser distribuída em no máximo 8 (oito) horas diárias.',
    chaves: 'carga horaria diaria oito horas'
  },
  {
    item: '5.7.4.2',
    grupo: '5.7 Treinamento',
    texto: 'Para a modalidade presencial deve ser observada a seguinte carga horária mínima do treinamento:\na) 4 (quatro) horas para estabelecimentos de grau de risco 2; e\nb) 8 (oito) horas para estabelecimentos de grau de risco 3 e 4.',
    chaves: 'presencial carga horaria minima'
  },
  {
    item: '5.7.4.3',
    grupo: '5.7 Treinamento',
    texto: 'A carga horária do treinamento dos estabelecimentos de grau de risco 1 e do representante nomeado da NR-05 podem ser realizadas integralmente na modalidade de ensino à distância ou semipresencial, nos termos da NR-01.',
    chaves: 'ead ensino a distancia semipresencial online'
  },
  {
    item: '5.7.4.4',
    grupo: '5.7 Treinamento',
    texto: 'O treinamento realizado integralmente na modalidade de ensino à distância deve contemplar os riscos específicos do estabelecimento nos termos do subitem 5.7.2.',
    chaves: 'ead riscos especificos'
  },
  {
    item: '5.7.4.5',
    grupo: '5.7 Treinamento',
    texto: 'O integrante do SESMT fica dispensado do treinamento da CIPA.',
    chaves: 'sesmt dispensado treinamento'
  },

  /* ----- 5.8 Organizações contratadas ----- */
  {
    item: '5.8.1',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'A organização de prestação de serviços deve constituir CIPA centralizada quando o número total de seus empregados na Unidade da Federação se enquadrar no Quadro I desta NR.',
    chaves: 'terceirizada prestadora cipa centralizada'
  },
  {
    item: '5.8.1.1',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'Quando a organização contratada para prestação de serviços a terceiros exercer suas atividades em estabelecimento de contratante enquadrado em grau de riscos 3 ou 4 e o número total de seus empregados no estabelecimento da contratante se enquadrar no Quadro I desta NR, deve constituir CIPA própria neste estabelecimento, considerando o grau de risco da contratante.',
    chaves: 'terceirizada cipa propria grau de risco 3 4'
  },
  {
    item: '5.8.1.1.1',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'A organização contratada está dispensada da constituição da CIPA própria no caso de prestação de serviços a terceiros com até 180 (cento e oitenta) dias de duração.',
    chaves: 'dispensa cento e oitenta dias contrato curto'
  },
  {
    item: '5.8.1.2',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'O número total de empregados da organização contratada para prestação de serviços, para efeito de dimensionamento da CIPA centralizada, deve desconsiderar os empregados alcançados por CIPA própria.',
    chaves: 'dimensionamento centralizada desconsiderar'
  },
  {
    item: '5.8.2',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'A organização contratada para prestação de serviços, quando desobrigada de constituir CIPA própria, deve nomear um representante da NR-5 para cumprir os objetivos desta NR se possuir 5 (cinco) ou mais empregados no estabelecimento da contratante.',
    chaves: 'representante nr5 cinco empregados terceirizada'
  },
  {
    item: '5.8.2.1',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'A nomeação de representante da NR-05 em estabelecimento onde há empregado membro de CIPA centralizada é dispensada.',
    chaves: 'dispensa representante cipa centralizada'
  },
  {
    item: '5.8.2.2',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'O estabelecido no subitem 5.8.2 não exclui o disposto no subitem 5.4.13 quanto ao estabelecimento sede da organização contratada para a prestação de serviços.',
    chaves: 'sede prestadora representante'
  },
  {
    item: '5.8.2.3',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'A nomeação do representante da organização contratada para a prestação de serviços deve ser feita entre os empregados que exercem suas atividades no estabelecimento.',
    chaves: 'nomeacao representante empregados do local'
  },
  {
    item: '5.8.3',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'A organização contratada para a prestação de serviços deve garantir que a CIPA centralizada mantenha interação entre os estabelecimentos nos quais possua empregados.',
    chaves: 'cipa centralizada interacao estabelecimentos'
  },
  {
    item: '5.8.3.1',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'A organização deve garantir a participação dos representantes nomeados da NR-05 nas reuniões da CIPA centralizada.',
    chaves: 'participacao representantes reunioes centralizada'
  },
  {
    item: '5.8.3.2',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'A organização deve dar condições aos integrantes da CIPA centralizada de atuarem nos estabelecimentos que não possuem representante nomeado da NR-05, atendido o disposto no subitem 5.6.2.',
    chaves: 'atuacao integrantes centralizada'
  },
  {
    item: '5.8.4',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'O representante nomeado da NR-05 das organizações contratadas para a prestação de serviço deve participar de treinamento de acordo com o grau de risco da contratante.',
    chaves: 'treinamento representante grau de risco contratante'
  },
  {
    item: '5.8.5',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'A CIPA da prestadora de serviços a terceiros constituída nos termos do subitem 5.8.1.1 será considerada encerrada, para todos os efeitos, quando encerradas as suas atividades no estabelecimento.',
    chaves: 'encerramento cipa prestadora'
  },
  {
    item: '5.8.6',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'A organização contratante deve exigir da organização prestadora de serviços a nomeação do representante da NR-05 prevista no subitem 5.8.2.',
    chaves: 'contratante exigir nomeacao representante'
  },
  {
    item: '5.8.7',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'A contratante deve convidar a contratada para participar da reunião da CIPA da contratante, com a finalidade de integrar as ações de prevenção, sempre que as organizações atuarem em um mesmo estabelecimento.',
    chaves: 'convidar contratada reuniao integrar prevencao'
  },
  {
    item: '5.8.7.1',
    grupo: '5.8 CIPA das organizações contratadas para prestação de serviços',
    texto: 'A contratada deve indicar um representante da CIPA ou o representante nomeado da NR-05 para participar da reunião da CIPA da contratante.',
    chaves: 'indicar representante reuniao contratante'
  },

  /* ----- 5.9 Disposições finais ----- */
  {
    item: '5.9.1',
    grupo: '5.9 Disposições finais',
    texto: 'A contratante adotará medidas para que as contratadas, suas CIPA, os representantes nomeados da NR-05 e os demais trabalhadores lotados naquele estabelecimento recebam informações sobre os riscos presentes nos ambientes de trabalho, bem como sobre as medidas de prevenção, em conformidade com o Programa de Gerenciamento de Riscos, previsto na NR-01.',
    chaves: 'informacao sobre riscos pgr programa de gerenciamento de riscos'
  },
  {
    item: '5.9.2',
    grupo: '5.9 Disposições finais',
    texto: 'Toda a documentação referente à CIPA deve ser mantida no estabelecimento à disposição da inspeção do trabalho pelo prazo mínimo de 5 (cinco) anos.',
    chaves: 'guardar documentos prazo cinco anos arquivo fiscalizacao inspecao atas'
  },
  {
    item: '5.9.3',
    grupo: '5.9 Disposições finais',
    texto: 'Em havendo alteração do grau de risco do estabelecimento, o redimensionamento da CIPA deve ser efetivado na próxima eleição.',
    chaves: 'alteracao grau de risco redimensionamento'
  }
];

/* ---------------------------------------------------------
   QUADRO I - DIMENSIONAMENTO DA CIPA

   As faixas são o número de empregados no estabelecimento.
   O grau de risco vem do Quadro I da NR-4, pela CNAE da
   atividade, e por isso quem consulta escolhe o grau.
   --------------------------------------------------------- */
const NR5_QUADRO_FAIXAS = [
  { rotulo: '0 a 19', min: 0, max: 19 },
  { rotulo: '20 a 29', min: 20, max: 29 },
  { rotulo: '30 a 50', min: 30, max: 50 },
  { rotulo: '51 a 80', min: 51, max: 80 },
  { rotulo: '81 a 100', min: 81, max: 100 },
  { rotulo: '101 a 120', min: 101, max: 120 },
  { rotulo: '121 a 140', min: 121, max: 140 },
  { rotulo: '141 a 300', min: 141, max: 300 },
  { rotulo: '301 a 500', min: 301, max: 500 },
  { rotulo: '501 a 1000', min: 501, max: 1000 },
  { rotulo: '1001 a 2500', min: 1001, max: 2500 },
  { rotulo: '2501 a 5000', min: 2501, max: 5000 },
  { rotulo: '5001 a 10.000', min: 5001, max: 10000 }
];

// null significa que a faixa não exige CIPA para aquele grau de risco.
// O último número de cada lista é o acréscimo por grupo de 2500
// empregados acima de 10.000.
const NR5_QUADRO_I = {
  1: {
    efetivos: [null, null, null, null, 1, 1, 1, 1, 2, 4, 5, 6, 8],
    suplentes: [null, null, null, null, 1, 1, 1, 1, 2, 3, 4, 5, 6],
    acrescimoEfetivos: 1,
    acrescimoSuplentes: 1
  },
  2: {
    efetivos: [null, null, null, 1, 1, 2, 2, 3, 4, 5, 6, 8, 10],
    suplentes: [null, null, null, 1, 1, 1, 1, 2, 3, 4, 5, 6, 8],
    acrescimoEfetivos: 1,
    acrescimoSuplentes: 1
  },
  3: {
    efetivos: [null, 1, 1, 2, 2, 2, 3, 4, 5, 6, 8, 10, 12],
    suplentes: [null, 1, 1, 1, 1, 1, 2, 2, 4, 4, 6, 8, 8],
    acrescimoEfetivos: 2,
    acrescimoSuplentes: 2
  },
  4: {
    efetivos: [null, 1, 2, 3, 3, 4, 4, 4, 5, 6, 9, 11, 13],
    suplentes: [null, 1, 1, 2, 2, 2, 2, 3, 4, 5, 7, 8, 10],
    acrescimoEfetivos: 2,
    acrescimoSuplentes: 2
  }
};

/* ---------------------------------------------------------
   LINKS DE APOIO
   Mostrados quando a busca não encontra nada.
   --------------------------------------------------------- */
const NR5_LINKS_APOIO = [
  {
    titulo: 'NR-5 completa no site do governo',
    descricao: 'Texto oficial e atualizado da norma, com o Anexo I e o Quadro I.',
    url: NR5_FONTE.link
  },
  {
    titulo: 'Todas as Normas Regulamentadoras vigentes',
    descricao: 'Quando a dúvida é de outra NR, como a NR-1 de gerenciamento de riscos ou a NR-4 do grau de risco.',
    url: 'https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes'
  },
  {
    titulo: 'Lei 14.457/2022',
    descricao: 'Lei que incluiu a prevenção ao assédio sexual e a outras formas de violência entre as atribuições da CIPA.',
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/L14457.htm'
  },
  {
    titulo: 'Consolidação das Leis do Trabalho',
    descricao: 'Para dúvidas de estabilidade, transferência e contrato de trabalho citadas pela norma.',
    url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm'
  }
];

/* =========================================================
   BUSCA

   A busca é por palavra, sem acento e sem diferenciar
   maiúscula de minúscula. Cada item recebe uma pontuação:
   número do item vale mais, depois as palavras-chave, depois
   o texto da norma. Assim quem digita "5.6.1" cai direto no
   item, e quem digita "de quanto em quanto tempo a cipa se
   reune" cai nas reuniões.
   ========================================================= */

function nr5Normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Palavras muito comuns não ajudam a encontrar nada e só
// atrapalhariam a pontuação.
const NR5_PALAVRAS_IGNORADAS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'em',
  'no', 'na', 'nos', 'nas', 'e', 'ou', 'que', 'se', 'por', 'para', 'com',
  'sem', 'ao', 'aos', 'as', 'pelo', 'pela', 'ser', 'sao', 'e', 'tem',
  'qual', 'quais', 'como', 'onde', 'quando', 'porque', 'pq', 'preciso',
  'posso', 'pode', 'deve', 'devemos', 'temos', 'isso', 'meu', 'minha',
  'nosso', 'nossa', 'sobre', 'the', 'eu', 'nos'
]);

// Sinônimos: a pessoa fala de um jeito, a norma escreve de outro.
const NR5_SINONIMOS = {
  empresa: ['organizacao', 'estabelecimento', 'empregador'],
  funcionario: ['empregado', 'trabalhador'],
  funcionarios: ['empregados', 'trabalhadores'],
  demissao: ['dispensa'],
  demitir: ['dispensa'],
  estabilidade: ['dispensa', 'vedada', 'candidatura'],
  curso: ['treinamento'],
  encontro: ['reuniao'],
  encontros: ['reunioes'],
  reune: ['reuniao', 'reunioes'],
  reunir: ['reuniao', 'reunioes'],
  reuniao: ['reunioes'],
  voto: ['votacao', 'escrutinio'],
  votar: ['votacao', 'eleicao'],
  chefe: ['presidente'],
  tempo: ['prazo'],
  papel: ['atribuicao', 'atribuicoes'],
  obrigacao: ['atribuicao', 'deve'],
  quantos: ['dimensionamento', 'numero'],
  assedio: ['assedio', 'violencia'],
  mural: ['quadro', 'aviso'],
  documento: ['documentacao'],
  documentos: ['documentacao'],
  guardar: ['mantida', 'documentacao'],
  faltar: ['faltar', 'mandato'],
  faltas: ['faltar', 'mandato'],
  sair: ['vacancia', 'afastamento'],
  saiu: ['vacancia', 'afastamento'],
  substituir: ['suplente', 'substituido'],
  acidente: ['acidente', 'acidentes'],
  mapa: ['mapa', 'risco']
};

function nr5TermosDaBusca(consulta) {
  const bruto = nr5Normalizar(consulta).split(' ').filter(Boolean);
  const termos = [];
  bruto.forEach((palavra) => {
    if (palavra.length < 2) return;
    // Números de item, como 5.6.1, sempre entram.
    const numero = /^[0-9]/.test(palavra);
    if (!numero && NR5_PALAVRAS_IGNORADAS.has(palavra)) return;
    termos.push(palavra);
    (NR5_SINONIMOS[palavra] || []).forEach((sinonimo) => termos.push(sinonimo));
  });
  return Array.from(new Set(termos));
}

/* Campo de busca: o texto normalizado fica entre espacos, para que
   a comparacao aconteca sempre no inicio de uma palavra. Sem isso,
   "ter" casava dentro de "terminar" e trazia resultado errado. */
function nr5Campo(texto) {
  return ` ${nr5Normalizar(texto)} `;
}

/* Palavra curta so vale quando e a palavra inteira. Palavra de cinco
   letras ou mais tambem vale como inicio de palavra, assim "reuni"
   encontra "reuniao" e "membro" encontra "membros". */
function nr5Casa(campo, termo) {
  if (campo.indexOf(` ${termo} `) !== -1) return true;
  if (termo.length >= 5 && campo.indexOf(` ${termo}`) !== -1) return true;
  return false;
}

/* Palavra que aparece em quase todos os registros nao diferencia
   nada. "cipa" esta em quase toda pergunta, e por isso nao deve
   pesar como "extintor" pesa. */
function nr5Peso(termo, campos) {
  if (/^[0-9]/.test(termo)) return 1;
  const quantos = campos.reduce((total, campo) => total + (nr5Casa(campo, termo) ? 1 : 0), 0);
  const proporcao = campos.length ? quantos / campos.length : 0;
  if (proporcao > 0.4) return 0;
  if (proporcao > 0.2) return 0.3;
  return 1;
}

// Guarda uma versão normalizada de cada item, feita uma só vez.
const NR5_INDICE = NR5_ITENS.map((registro) => ({
  registro,
  numero: nr5Normalizar(registro.item),
  chaves: nr5Campo(`${registro.chaves || ''} ${registro.grupo || ''}`),
  texto: nr5Campo(registro.texto)
}));

const NR5_CAMPOS_PESO = NR5_INDICE.map((entrada) => entrada.chaves + entrada.texto);

function nr5BuscarItens(consulta, limite) {
  const termos = nr5TermosDaBusca(consulta);
  if (!termos.length) return [];

  const pesos = {};
  termos.forEach((termo) => { pesos[termo] = nr5Peso(termo, NR5_CAMPOS_PESO); });

  const resultados = [];
  NR5_INDICE.forEach((entrada) => {
    let pontos = 0;
    termos.forEach((termo) => {
      const peso = pesos[termo];
      if (entrada.numero === termo) pontos += 40;
      else if (entrada.numero.indexOf(termo) === 0 && /^[0-9]/.test(termo)) pontos += 20;
      if (!peso) return;
      if (nr5Casa(entrada.chaves, termo)) pontos += 6 * peso;
      else if (nr5Casa(entrada.texto, termo)) pontos += 2 * peso;
    });
    if (pontos > 0) resultados.push({ registro: entrada.registro, pontos });
  });

  resultados.sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    return a.registro.item.localeCompare(b.registro.item, 'pt-BR', { numeric: true });
  });

  return resultados.slice(0, limite || 6).map((r) => r.registro);
}

// As perguntas da CIPA ficam em perguntas.js, que é carregado
// antes deste arquivo. O índice guarda uma versão normalizada
// de cada pergunta para a busca não refazer esse trabalho.
const CIPA_INDICE_PERGUNTAS = (typeof CIPA_PERGUNTAS !== 'undefined' ? CIPA_PERGUNTAS : []).map((faq) => ({
  faq,
  pergunta: nr5Campo(faq.pergunta),
  chaves: nr5Campo(`${faq.chaves || ''} ${faq.tema || ''}`),
  corpo: nr5Campo(`${faq.resposta || ''} ${faq.cipeiro || ''}`)
}));

const CIPA_CAMPOS_PESO = CIPA_INDICE_PERGUNTAS.map((entrada) => entrada.pergunta + entrada.chaves);

function nr5BuscarPerguntas(consulta, limite) {
  const termos = nr5TermosDaBusca(consulta);
  if (!termos.length) return [];

  const pesos = {};
  termos.forEach((termo) => { pesos[termo] = nr5Peso(termo, CIPA_CAMPOS_PESO); });

  const resultados = [];
  CIPA_INDICE_PERGUNTAS.forEach((entrada) => {
    // A palavra que aparece na propria pergunta vale mais do que a
    // que aparece nas palavras-chave, e muito mais do que a que
    // aparece no meio da resposta. Sem essa separacao, uma resposta
    // longa que cita a palavra de passagem passa na frente da
    // pergunta que trata exatamente do assunto.
    let titulo = 0;
    let corpo = 0;
    termos.forEach((termo) => {
      const peso = pesos[termo];
      if (!peso) return;
      if (nr5Casa(entrada.pergunta, termo)) titulo += 12 * peso;
      else if (nr5Casa(entrada.chaves, termo)) titulo += 7 * peso;
      else if (nr5Casa(entrada.corpo, termo)) corpo += 1 * peso;
    });
    if (titulo > 0 || corpo > 0) resultados.push({ faq: entrada.faq, titulo, corpo });
  });

  // Se alguma pergunta casou pelo titulo ou pelas palavras-chave,
  // as que casaram so pelo meio da resposta ficam de fora. Quando
  // nenhuma casou, a resposta ainda serve, mas exige pelo menos
  // duas palavras da busca para nao trazer coincidencia solta.
  const temTitulo = resultados.some((r) => r.titulo > 0);
  const filtrados = temTitulo
    ? resultados.filter((r) => r.titulo > 0)
    : resultados.filter((r) => r.corpo >= 3);

  filtrados.sort((a, b) => {
    if (b.titulo !== a.titulo) return b.titulo - a.titulo;
    if (b.corpo !== a.corpo) return b.corpo - a.corpo;
    return a.faq.n - b.faq.n;
  });
  return filtrados.slice(0, limite || 6).map((r) => r.faq);
}

function cipaPerguntaPorNumero(numero) {
  return (typeof CIPA_PERGUNTAS !== 'undefined' ? CIPA_PERGUNTAS : [])
    .find((faq) => faq.n === Number(numero)) || null;
}

function nr5ItemPorNumero(numero) {
  return NR5_ITENS.find((registro) => registro.item === numero) || null;
}

/* Dimensionamento: devolve quantos efetivos e suplentes o
   Quadro I prevê para um grau de risco e um número de
   empregados. Nunca estima nada: só lê a tabela. */
function nr5Dimensionar(grauRisco, numeroEmpregados) {
  const tabela = NR5_QUADRO_I[grauRisco];
  const total = Number(numeroEmpregados);
  if (!tabela || !Number.isFinite(total) || total < 0) return null;

  if (total > 10000) {
    const base = {
      efetivos: tabela.efetivos[NR5_QUADRO_FAIXAS.length - 1],
      suplentes: tabela.suplentes[NR5_QUADRO_FAIXAS.length - 1]
    };
    const gruposExtras = Math.ceil((total - 10000) / 2500);
    return {
      faixa: 'acima de 10.000',
      efetivos: base.efetivos + gruposExtras * tabela.acrescimoEfetivos,
      suplentes: base.suplentes + gruposExtras * tabela.acrescimoSuplentes,
      exigeCipa: true,
      observacao: `Acima de 10.000 empregados, o Quadro I acrescenta ${tabela.acrescimoEfetivos} efetivo e ${tabela.acrescimoSuplentes} suplente a cada grupo de 2500. Aqui foram contados ${gruposExtras} grupos.`
    };
  }

  const indice = NR5_QUADRO_FAIXAS.findIndex((faixa) => total >= faixa.min && total <= faixa.max);
  if (indice === -1) return null;

  const efetivos = tabela.efetivos[indice];
  const suplentes = tabela.suplentes[indice];

  if (efetivos === null) {
    return {
      faixa: NR5_QUADRO_FAIXAS[indice].rotulo,
      efetivos: 0,
      suplentes: 0,
      exigeCipa: false,
      observacao: 'Nessa faixa o Quadro I não prevê CIPA para este grau de risco. Pelo item 5.4.13, o estabelecimento que não se enquadra no Quadro I e não é atendido por SESMT deve nomear um representante da NR-5.'
    };
  }

  return {
    faixa: NR5_QUADRO_FAIXAS[indice].rotulo,
    efetivos,
    suplentes,
    exigeCipa: true,
    observacao: ''
  };
}
