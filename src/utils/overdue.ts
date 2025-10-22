import { Task } from "../models/Task";
import { naoConcluidaHoje, mesmoDiaSemanaHoje } from "./recurrence";

/**
 * Verifica se uma tarefa semanal está atrasada em relação ao dia de hoje.
 * Critérios:
 * - Recorrência semanal
 * - Não concluída hoje
 * - Dia da semana diferente do dia atual
 * - proximaData anterior à data atual (já deveria ter sido feita)
 */
export function semanalAtrasadaHoje(t: Task, hoje: Date = new Date()): boolean {
  if (t.recorrencia !== "SEMANAL") return false;
  if (!t.proximaData) return false;
  if (!naoConcluidaHoje(t)) return false;
  if (mesmoDiaSemanaHoje(t.diaSemana)) return false;
  const d = new Date(t.proximaData);
  // Normalizar sem tempo para garantir comparação robusta
  const dataHoje = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );
  const dataProx = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return dataProx < dataHoje; // devida em um dia anterior
}

/** Filtra semanais atrasadas entre uma lista genérica de tarefas. */
export function filtrarSemanaisAtrasadas(
  tarefas: Task[],
  hoje: Date = new Date()
): Task[] {
  return tarefas.filter((t) => semanalAtrasadaHoje(t, hoje));
}

// Início da quinzena atual (dia 1 ou 16)
function inicioQuinzenaAtual(hoje: Date): Date {
  if (hoje.getDate() <= 15) {
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  }
  return new Date(hoje.getFullYear(), hoje.getMonth(), 16);
}

/** Verifica se tarefa quinzenal está atrasada em relação à quinzena atual */
export function quinzenalAtrasadaAtual(
  t: Task,
  hoje: Date = new Date()
): boolean {
  if (t.recorrencia !== "QUINZENAL" || !t.proximaData) return false;
  if (!naoConcluidaHoje(t)) return false;
  const d = new Date(t.proximaData);
  d.setHours(0, 0, 0, 0);
  const inicio = inicioQuinzenaAtual(hoje);
  inicio.setHours(0, 0, 0, 0);
  return d < inicio; // anterior ao começo da quinzena atual
}

/** Verifica se tarefa mensal está atrasada em relação ao mês atual */
export function mensalAtrasadaAtual(t: Task, hoje: Date = new Date()): boolean {
  if (t.recorrencia !== "MENSAL" || !t.proximaData) return false;
  if (!naoConcluidaHoje(t)) return false;
  const d = new Date(t.proximaData);
  d.setHours(0, 0, 0, 0);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  inicioMes.setHours(0, 0, 0, 0);
  return d < inicioMes; // anterior ao começo do mês atual
}

/** Dias de atraso (>=1) considerando início do dia atual */
export function diasAtraso(
  proximaData?: string,
  hoje: Date = new Date()
): number {
  if (!proximaData) return 0;
  const base = new Date(proximaData);
  base.setHours(0, 0, 0, 0);
  const ref = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const diffMs = ref.getTime() - base.getTime();
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
