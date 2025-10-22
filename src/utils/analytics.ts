import { Task } from "../models/Task";
import { LABELS } from "../constants/strings";

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function diasDesdeCriacao(task: Task): number | null {
  if (!task.criadaEm) return null;
  return daysBetween(new Date(task.criadaEm), new Date());
}

export function diasDesdeUltimaConclusao(task: Task): number | null {
  if (!task.ultimaConclusao) return null;
  return daysBetween(new Date(task.ultimaConclusao), new Date());
}

export function diasAteProxima(task: Task): number | null {
  if (!task.proximaData) return null;
  return daysBetween(new Date(), new Date(task.proximaData));
}

export function descricaoRecorrencia(task: Task): string {
  switch (task.recorrencia) {
    case "DIARIA":
      return "Repetição diária";
    case "SEMANAL":
      if (typeof task.diaSemana === "number") {
        const diasLongo = [
          "Domingo",
          "Segunda",
          "Terça",
          "Quarta",
          "Quinta",
          "Sexta",
          "Sábado",
        ];
        return `Semanal às ${diasLongo[task.diaSemana]}`;
      }
      return "Semanal (dia não definido)";
    case "QUINZENAL":
      return "A cada 14 dias na quinzena vigente";
    case "MENSAL":
      return "Mensal (mantém dia ou último do mês)";
    default:
      return task.recorrencia;
  }
}

export function statusRecorrencia(task: Task): string {
  const dProx = task.proximaData ? new Date(task.proximaData) : null;
  if (!dProx) return "Sem próxima data";
  const hoje = new Date();
  const sameDay =
    dProx.getFullYear() === hoje.getFullYear() &&
    dProx.getMonth() === hoje.getMonth() &&
    dProx.getDate() === hoje.getDate();
  if (sameDay) return "Devida hoje";
  const diff = diasAteProxima(task);
  if (diff !== null) {
    if (diff < 0)
      return `Atrasada há ${LABELS.feedback.unidadeDia(Math.abs(diff))}`;
    if (diff === 1) return "Devida amanhã";
    return `Faltam ${LABELS.feedback.unidadeDia(diff)}`;
  }
  return "Status desconhecido";
}
