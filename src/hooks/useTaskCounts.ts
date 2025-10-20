import { Task } from "../models/Task";
import {
  dentroDaQuinzenaAtual,
  dentroDoMesAtual,
  naoConcluidaHoje,
} from "../utils/recurrence";

export interface TaskCounts {
  HOJE: number;
  QUINZENA: number;
  MES: number;
}

export function computeCounts(
  tarefas: Task[],
  today: Date = new Date()
): TaskCounts {
  const countHoje = tarefas.filter((t) => {
    if (t.recorrencia === "SEMANAL")
      return t.diaSemana !== undefined && t.diaSemana === today.getDay();
    if (t.recorrencia === "DIARIA") return naoConcluidaHoje(t as any);
    return false;
  }).length;
  const countQuinzena = tarefas.filter(
    (t) =>
      t.recorrencia === "QUINZENAL" &&
      dentroDaQuinzenaAtual(t.proximaData) &&
      naoConcluidaHoje(t as any)
  ).length;
  const countMes = tarefas.filter(
    (t) =>
      t.recorrencia === "MENSAL" &&
      dentroDoMesAtual(t.proximaData) &&
      naoConcluidaHoje(t as any)
  ).length;
  return { HOJE: countHoje, QUINZENA: countQuinzena, MES: countMes };
}

import { useMemo } from "react";
export function useTaskCounts(tarefas: Task[]): TaskCounts {
  return useMemo(() => computeCounts(tarefas), [tarefas]);
}
