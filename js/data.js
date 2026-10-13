// Fonte unica dos dados volateis (spec secao 4). Textos verbatim da linha de base.
// Valores monetarios aparecem so em "valores"; o resto usa {valores.x}.
window.DELTEC_DATA = {
  cronograma: {
    inicio: { hora: "08:00", texto: "Recepção com o RH" },
    encerramento: { hora: "16:30", texto: "Qualidade" },
    itens: [
      { horario: "08:00 – 08:15", titulo: "Recepção Facilities e TI" },
      { horario: "08:15 – 08:40", titulo: "Diretoria" },
      { horario: "08:40 – 12:00", titulo: "RH" },
      { horario: "12:00 – 13:00", titulo: "Almoço" },
      { horario: "13:00 – 14:30", titulo: "Segurança do Trabalho" },
      { horario: "14:30 – 15:00", titulo: "Tour pela Fábrica (com Segurança)" },
      { horario: "15:00 – 16:30", titulo: "Qualidade" }
    ],
    aviso: "Os horários podem mudar conforme o andamento da integração."
  },
  obra: {
    fases: [
      { nome: "Terraplanagem e Contenções", detalhe: "Preparação do terreno", prazo: "", status: "concluida" },
      { nome: "Nova Fábrica (Fase 1)", detalhe: "Expedição e Estacionamento", prazo: "Outubro/26", status: "andamento" },
      { nome: "Nova Fábrica (Fase 2) e Novos Espaços", detalhe: "", prazo: "Março/27", status: "proxima" },
      { nome: "Reforma Área Administrativa", detalhe: "", prazo: "Maio/27", status: "proxima" }
    ]
  },
  ampliacao: { galpaoExistente: 5000, novaFabrica: 4500, areaFabril: 9500, patio: 3000, terrenos: 24320 },
  valores: {
    va: "R$ 420,20", assiduidade: "R$ 150", mobilidade: "R$ 250,00", uniodonto: "R$ 23,50",
    farmacia: "R$ 300,00", samaritanoTeto: "R$ 260,00", indique: "R$ 300,00"
  },
  beneficios: {
    resumo: [
      { beneficio: "Vale-transporte", valor: "Conforme os dias trabalhados", quando: "1º turno: último dia útil · 2º turno: 1º dia útil", quem: "1º e 2º turno" },
      { beneficio: "Auxílio Mobilidade Noturna", valor: "{valores.mobilidade} por mês", quando: "Dia 15", quem: "2º turno" },
      { beneficio: "Vale-Alimentação", valor: "{valores.va}", quando: "Todo dia 1º", quem: "CLT e estágio" },
      { beneficio: "Programa de Assiduidade", valor: "{valores.assiduidade}", quando: "Todo dia 15", quem: "CLT que seguem as regras" },
      { beneficio: "Refeitório", valor: "Desconto conforme faixa salarial", quando: "Desconto em folha", quem: "CLT" },
      { beneficio: "Uniodonto", valor: "{valores.uniodonto}", quando: "Desconto em folha (PJ: na nota fiscal)", quem: "Colaborador e dependentes" },
      { beneficio: "Samaritano", valor: "Conforme salário e faixa etária", quando: "Desconto em folha", quem: "Colaborador, filhos e cônjuge" },
      { beneficio: "Bradesco Saúde", valor: "Conforme faixa etária", quando: "Desconto em folha", quem: "Colaborador, filhos e cônjuge (PJ: após 6 meses)" },
      { beneficio: "Farmácia", valor: "Até {valores.farmacia} (Farmahelp)", quando: "Desconto em folha", quem: "CLT e PJ (PJ: na nota fiscal)" },
      { beneficio: "TotalPass", valor: "Conforme o plano escolhido", quando: "Desconto em folha", quem: "Colaborador e dependentes" },
      { beneficio: "Universidades e idiomas", valor: "Descontos exclusivos", quando: "Direto com a instituição", quem: "Colaborador, cônjuge e filhos" }
    ],
    grupos: [[0, 4], [5, 8], [9, 10]]
  },
  planos: {
    samaritano: [
      { procedimento: "Consultas Urgência e Emergência", valor: "R$ 25,00" },
      { procedimento: "Consulta Eletiva / Ambulatorial", valor: "R$ 20,00" },
      { procedimento: "Exames Simples", valor: "R$ 5,00" },
      { procedimento: "Exames Complexos", valor: "R$ 20,00" },
      { procedimento: "Exames de Alta Complexidade", valor: "R$ 80,00" },
      { procedimento: "Internações", valor: "R$ 180,00" },
      { procedimento: "Teto mensal", valor: "{valores.samaritanoTeto}" }
    ],
    bradesco: {
      mensalidade: [
        { faixa: "0 a 18 anos", titular: "R$ 116,81", dependente: "R$ 186,89" },
        { faixa: "19 a 23 anos", titular: "R$ 137,84", dependente: "R$ 220,54" },
        { faixa: "24 a 28 anos", titular: "R$ 166,78", dependente: "R$ 266,85" },
        { faixa: "29 a 33 anos", titular: "R$ 200,14", dependente: "R$ 320,23" },
        { faixa: "34 a 38 anos", titular: "R$ 228,16", dependente: "R$ 365,05" },
        { faixa: "39 a 43 anos", titular: "R$ 235,00", dependente: "R$ 376,00" },
        { faixa: "44 a 48 anos", titular: "R$ 286,13", dependente: "R$ 457,81" },
        { faixa: "49 a 53 anos", titular: "R$ 336,55", dependente: "R$ 538,48" },
        { faixa: "54 a 58 anos", titular: "R$ 400,49", dependente: "R$ 640,79" },
        { faixa: "59 anos ou mais", titular: "R$ 700,83", dependente: "R$ 1121,32" }
      ],
      grupos: [[0, 4], [5, 9]],
      coparticipacao: [
        { procedimento: "Atendimento em Pronto-Socorro", valor: "R$ 130,00" },
        { procedimento: "Consulta Eletiva", valor: "R$ 70,00" },
        { procedimento: "Exames Especiais – Tipo B", valor: "R$ 160,00" },
        { procedimento: "Exames Simples – Tipo A", valor: "R$ 65,00" },
        { procedimento: "Procedimentos Ambulatoriais", valor: "R$ 180,00" },
        { procedimento: "Procedimentos Seriados", valor: "R$ 65,00" },
        { procedimento: "Internação", valor: "R$ 500,00" }
      ]
    }
  },
  ferias: {
    faltas: [
      { faltas: "Até 5 faltas", dias: "30 dias" },
      { faltas: "De 6 a 14 faltas", dias: "24 dias" },
      { faltas: "De 15 a 23 faltas", dias: "18 dias" },
      { faltas: "De 24 a 32 faltas", dias: "12 dias" },
      { faltas: "Mais de 32 faltas", dias: "Perda do direito às férias" }
    ]
  },
  refeitorio: [
    { turno: "1º TURNO", horario: "06:30h às 08:00h", refeicao: "Café da manhã" },
    { turno: "1º TURNO", horario: "11:00h às 13:00h", refeicao: "Almoço" },
    { turno: "2º TURNO", horario: "16:00h às 16:30h", refeicao: "Lanche da tarde" },
    { turno: "2º TURNO", horario: "21:00h às 22:00h", refeicao: "Jantar" }
  ],
  rh: {
    turnos: [
      { turno: "1º TURNO", horario: "08:00 às 10:00hs", dias: "Terça à Quinta-feira" },
      { turno: "2º TURNO", horario: "16:30 às 17:30hs", dias: "Terça à Quinta-feira" }
    ],
    whatsappRS: "(19) 99806-2029"
  },
  links: {
    estrutura: "https://www.youtube.com/watch?v=3xZ4-R6Ivqg",
    politicas: "https://deltecind.sharepoint.com/sites/IntranetDeltec/Polticas%20Deltec/Forms/AllItems.aspx",
    vibe: "https://deltec.vibe.gp/",
    assiduidade: "https://deltecind.sharepoint.com/sites/IntranetDeltec/Polticas%20Deltec/Forms/AllItems.aspx?id=%2Fsites%2FIntranetDeltec%2FPolticas%20Deltec%2FPrograma%20Assiduidade%2Epdf&parent=%2Fsites%2FIntranetDeltec%2FPolticas%20Deltec",
    whatsappRS: "https://wa.me/5519998062029"
  }
};
