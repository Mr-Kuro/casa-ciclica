// Centralização de strings e etiquetas repetidas para evitar divergências.
// Use estes exports para manter consistência semântica e facilitar i18n futura.

export const LABELS = {
  actions: {
    concluir: "Concluir",
    concluirHoje: "Concluir hoje",
    desativar: "Desativar",
    remover: "Remover",
    adicionar: "Adicionar",
    atualizarCitacao: "Atualizar",
    reativar: "Reativar",
    reconcluir: "Re-concluir",
  },
  confirm: {
    removerTarefa: "Remover tarefa?",
    limparTudo: "Limpar todas as tarefas?",
    resetSeeds: "Resetar seeds? Isto irá substituir as tarefas atuais.",
  },
  estados: {
    tarefaDesativada: "Tarefa desativada",
    jaConcluida: "Já concluída",
    nenhumaTarefa: "Nenhuma tarefa para este filtro.",
    nenhumaConcluida: "Nenhuma tarefa concluída ainda.",
    nenhumaDesativada: "Nenhuma tarefa desativada.",
    nenhumGrupo: "Nenhuma tarefa neste grupo.",
    concluidaHoje: "Concluída hoje",
    concluidaAnteriormente: "Concluída anteriormente",
  },
  campos: {
    titulo: "Título",
    descricao: "Descrição",
    recorrencia: "Recorrência",
    novaTarefa: "Nova Tarefa",
    concluidasHoje: "Concluídas hoje",
    ancora: "Âncora",
    proxima: "Próxima",
    ultima: "Última",
    diaSemana: "Dia Semana",
    tarefasCasa: "Tarefas da Casa",
    config: "Configurações",
    tarefasConcluidas: "Tarefas Concluídas",
    tarefasDesativadas: "Tarefas Desativadas",
    ultimaConclusao: "Última Conclusão",
    statusHoje: "Status Hoje",
    acoes: "Ações",
  },
  navigation: {
    inicio: "Início",
    nova: "Nova",
    novaTarefa: "Nova Tarefa",
    concluidas: "Concluídas",
    desativadas: "Desativadas",
    config: "Config",
    voltar: "Voltar",
    menu: "Menu",
    fechar: "Fechar",
  },
  feedback: {
    carregandoInspiracao: "Carregando inspiração...",
    tarefaNaoEncontrada: "Tarefa não encontrada.",
    atualizadoPrefixo: "Atualizado:",
    designNota: "Design utilitário com paleta personalizada CasaCíclica.",
    persistencia: "LocalStorage persistência",
    seedsDinamicos: "Seeds dinâmicos",
    filtrosResumo: "Filtros HOJE / QUINZENA / MÊS",
    limparAviso: "Dados apagados. Volte à página inicial para recriar.",
    seedsResetAviso: "Seeds recriadas. Vá para Início para ver as novas datas.",
  },
  diasSemanaLongo: [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ] as const,
  diasSemanaCurto: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const,
} as const;

export type LabelKeys = typeof LABELS;

// Função utilitária opcional para acesso seguro (pode evoluir para i18n)
export function t<K1 extends keyof LabelKeys, K2 extends keyof LabelKeys[K1]>(
  group: K1,
  key: K2
) {
  return LABELS[group][key];
}
