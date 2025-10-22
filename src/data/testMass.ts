/**
 * Geração de massa de testes abrangendo cenários da aplicação.
 * Inclui:
 * - Tarefas DIARIAS (concluídas hoje, não concluídas, inativas)
 * - Tarefas SEMANAIS (de cada dia da semana, atrasadas, de hoje concluídas e não)
 * - Tarefas QUINZENAIS (dentro e fora da quinzena atual)
 * - Tarefas MENSAIS (dentro e fora do mês atual)
 * - Tarefas com proximaData faltando (testa hidratação do TaskController)
 * - Tarefas inativas e tarefas com ultimaConclusao passada
 * - Casos "edge": semanal sem diaSemana definido
 *
 * Uso rápido no console do app:
 *   import { injectTestMass } from './data/testMass';
 *   injectTestMass(); // Substitui LocalStorage e dispara evento para atualizar UI
 *
 * Ou gerar apenas:
 *   import { generateFullScenario } from './data/testMass';
 *   const data = generateFullScenario();
 */
import { Task } from "../models/Task";
import { Recurrence } from "../types";
import { LocalStorageService } from "../services/storage/LocalStorageService";

interface ScenarioOptions {
  today?: Date;
  dailyCount?: number; // extras não concluídas
  weeklyPerDay?: number; // semanais adicionais por dia
  includeInactive?: boolean;
}

function addDays(base: Date, delta: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + delta);
}

function iso(d: Date) {
  return d.toISOString();
}

function uuid() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

/** Determina se estamos na primeira quinzena */
function primeiraQuinzena(hoje: Date) {
  return hoje.getDate() <= 15;
}

/** Retorna um dia na quinzena oposta para criar fora-do-escopo */
function diaOutraQuinzena(hoje: Date) {
  if (primeiraQuinzena(hoje)) {
    // escolher dia 25
    return new Date(hoje.getFullYear(), hoje.getMonth(), 25);
  }
  // escolher dia 5
  return new Date(hoje.getFullYear(), hoje.getMonth(), 5);
}

/** Retorna uma data em outro mês para casos fora do mês atual */
function dataOutroMes(hoje: Date) {
  const proxMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 10);
  return proxMes;
}

/** Semana atrasada: define proximaData alguns dias atrás */
function weeklyPastDate(
  hoje: Date,
  dayOfWeek: number,
  offsetDays: number
): Date {
  // dia na semana passada
  const target = addDays(hoje, -offsetDays);
  // Ajustar diaSemana para coerência (pode não bater com target.getDay()) mas aqui simulamos atraso
  return target;
}

/** Cria tarefas diárias cobrindo múltiplos estados */
function buildDaily(
  hoje: Date,
  extra: number,
  includeInactive: boolean
): Task[] {
  const tasks: Task[] = [];
  // Concluída hoje
  tasks.push({
    id: uuid(),
    titulo: "Diária concluída hoje",
    recorrencia: Recurrence.DIARIA,
    ativa: true,
    ultimaConclusao: iso(hoje),
    proximaData: iso(addDays(hoje, 1)),
    criadaEm: iso(addDays(hoje, -5)),
  });
  // Não concluída (devida hoje)
  tasks.push({
    id: uuid(),
    titulo: "Diária devida hoje",
    recorrencia: Recurrence.DIARIA,
    ativa: true,
    proximaData: iso(hoje),
    criadaEm: iso(addDays(hoje, -2)),
  });
  // Atrasada (proximaData passada) - para HOJE não entra mas útil para lógica
  tasks.push({
    id: uuid(),
    titulo: "Diária atrasada (ontem)",
    recorrencia: Recurrence.DIARIA,
    ativa: true,
    proximaData: iso(addDays(hoje, -1)),
    criadaEm: iso(addDays(hoje, -3)),
  });
  if (includeInactive) {
    tasks.push({
      id: uuid(),
      titulo: "Diária inativa",
      recorrencia: Recurrence.DIARIA,
      ativa: false,
      proximaData: iso(hoje),
      criadaEm: iso(addDays(hoje, -7)),
    });
  }
  for (let i = 0; i < extra; i++) {
    tasks.push({
      id: uuid(),
      titulo: `Diária extra ${i + 1}`,
      recorrencia: Recurrence.DIARIA,
      ativa: true,
      proximaData: iso(hoje),
      criadaEm: iso(addDays(hoje, -i - 1)),
    });
  }
  return tasks;
}

/** Cria semanais distribuídas em todos os dias + atrasadas */
function buildWeekly(
  hoje: Date,
  perDay: number,
  includeInactive: boolean
): Task[] {
  const tasks: Task[] = [];
  const todayDow = hoje.getDay();
  for (let dow = 0; dow < 7; dow++) {
    // Uma semanal do dia atual (caso dow === todayDow) devida hoje não concluída
    const base: Task = {
      id: uuid(),
      titulo: `Semanal ${dow === todayDow ? "(hoje)" : ""} dia ${dow}`,
      recorrencia: Recurrence.SEMANAL,
      ativa: true,
      diaSemana: dow,
      proximaData: iso(hoje),
      criadaEm: iso(addDays(hoje, -10)),
    };
    // se não é o dia atual, marcar como concluída anteriormente
    if (dow !== todayDow) {
      // concluída há 2 dias
      base.ultimaConclusao = iso(addDays(hoje, -2));
      base.proximaData = iso(addDays(hoje, 7)); // próxima semana
    }
    tasks.push(base);
    // Semanal atrasada: proximaData há 3 dias
    if (dow !== todayDow) {
      tasks.push({
        id: uuid(),
        titulo: `Semanal atrasada dia ${dow}`,
        recorrencia: Recurrence.SEMANAL,
        ativa: true,
        diaSemana: dow,
        proximaData: iso(addDays(hoje, -3)),
        criadaEm: iso(addDays(hoje, -15)),
      });
    }
    // Extras por dia
    for (let x = 0; x < perDay; x++) {
      tasks.push({
        id: uuid(),
        titulo: `Semanal extra ${x + 1} dia ${dow}`,
        recorrencia: Recurrence.SEMANAL,
        ativa: true,
        diaSemana: dow,
        proximaData: iso(addDays(hoje, 7)),
        criadaEm: iso(addDays(hoje, -5 - x)),
      });
    }
  }
  // Edge: semanal sem diaSemana (deve ser ignorada em alguns lugares)
  tasks.push({
    id: uuid(),
    titulo: "Semanal sem diaSemana (edge)",
    recorrencia: Recurrence.SEMANAL,
    ativa: true,
    proximaData: iso(addDays(hoje, 7)),
    criadaEm: iso(addDays(hoje, -1)),
  });
  if (includeInactive) {
    tasks.push({
      id: uuid(),
      titulo: "Semanal inativa hoje",
      recorrencia: Recurrence.SEMANAL,
      ativa: false,
      diaSemana: todayDow,
      proximaData: iso(hoje),
      criadaEm: iso(addDays(hoje, -20)),
    });
  }
  return tasks;
}

/** Quinzenais: dentro e fora da quinzena */
function buildBiweekly(hoje: Date, includeInactive: boolean): Task[] {
  const tasks: Task[] = [];
  const dentroTitulo = "Quinzenal dentro da quinzena";
  const foraTitulo = "Quinzenal fora da quinzena";
  const dentro = hoje; // proximaData hoje -> dentro
  const fora = diaOutraQuinzena(hoje); // na outra quinzena
  tasks.push({
    id: uuid(),
    titulo: dentroTitulo,
    recorrencia: Recurrence.QUINZENAL,
    ativa: true,
    proximaData: iso(dentro),
    criadaEm: iso(addDays(hoje, -30)),
  });
  tasks.push({
    id: uuid(),
    titulo: foraTitulo,
    recorrencia: Recurrence.QUINZENAL,
    ativa: true,
    proximaData: iso(fora),
    criadaEm: iso(addDays(hoje, -25)),
  });
  // Atrasada (proximaData 5 dias atrás)
  tasks.push({
    id: uuid(),
    titulo: "Quinzenal atrasada",
    recorrencia: Recurrence.QUINZENAL,
    ativa: true,
    proximaData: iso(addDays(hoje, -5)),
    criadaEm: iso(addDays(hoje, -40)),
  });
  if (includeInactive) {
    tasks.push({
      id: uuid(),
      titulo: "Quinzenal inativa",
      recorrencia: Recurrence.QUINZENAL,
      ativa: false,
      proximaData: iso(dentro),
      criadaEm: iso(addDays(hoje, -10)),
    });
  }
  return tasks;
}

/** Mensais: dentro e fora do mês atual */
function buildMonthly(hoje: Date, includeInactive: boolean): Task[] {
  const tasks: Task[] = [];
  const dentro = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fora = dataOutroMes(hoje);
  tasks.push({
    id: uuid(),
    titulo: "Mensal dentro do mês",
    recorrencia: Recurrence.MENSAL,
    ativa: true,
    proximaData: iso(dentro),
    criadaEm: iso(addDays(hoje, -50)),
  });
  tasks.push({
    id: uuid(),
    titulo: "Mensal fora do mês",
    recorrencia: Recurrence.MENSAL,
    ativa: true,
    proximaData: iso(fora),
    criadaEm: iso(addDays(hoje, -45)),
  });
  // Atrasada (5 dias atrás)
  tasks.push({
    id: uuid(),
    titulo: "Mensal atrasada",
    recorrencia: Recurrence.MENSAL,
    ativa: true,
    proximaData: iso(addDays(hoje, -5)),
    criadaEm: iso(addDays(hoje, -60)),
  });
  if (includeInactive) {
    tasks.push({
      id: uuid(),
      titulo: "Mensal inativa",
      recorrencia: Recurrence.MENSAL,
      ativa: false,
      proximaData: iso(dentro),
      criadaEm: iso(addDays(hoje, -15)),
    });
  }
  return tasks;
}

/** Tarefas sem proximaData para testar hidratação */
function buildMissingNext(hoje: Date): Task[] {
  return [
    {
      id: uuid(),
      titulo: "Sem proximaData (diária)",
      recorrencia: Recurrence.DIARIA,
      ativa: true,
      criadaEm: iso(addDays(hoje, -3)),
    },
    {
      id: uuid(),
      titulo: "Sem proximaData (semanal)",
      recorrencia: Recurrence.SEMANAL,
      ativa: true,
      diaSemana: hoje.getDay(),
      criadaEm: iso(addDays(hoje, -6)),
    },
  ];
}

export function generateFullScenario(opts: ScenarioOptions = {}): Task[] {
  const {
    today = new Date(),
    dailyCount = 2,
    weeklyPerDay = 1,
    includeInactive = true,
  } = opts;
  const all: Task[] = [];
  all.push(
    ...buildDaily(today, dailyCount, includeInactive),
    ...buildWeekly(today, weeklyPerDay, includeInactive),
    ...buildBiweekly(today, includeInactive),
    ...buildMonthly(today, includeInactive),
    ...buildMissingNext(today)
  );
  return all;
}

/** Injeta massa gerada no LocalStorage substituindo tarefas existentes. */
export function injectTestMass(opts: ScenarioOptions = {}) {
  const data = generateFullScenario(opts);
  LocalStorageService.salvar(data);
  // Notificar UI para recarregar
  window.dispatchEvent(new Event("tasks:reset"));
  console.info(
    `[testMass] Injetadas ${data.length} tarefas de massa de testes.`
  );
  return data;
}

/** Atalho global (opcional). Chamar injectTestMassGlobal() no console. */
export function injectTestMassGlobal() {
  (window as any).injectTestMass = injectTestMass;
  console.info("Função injectTestMass disponível em window.injectTestMass()");
}

// Auto-registra para facilitar exploração manual
if (typeof window !== "undefined") {
  injectTestMassGlobal();
}
