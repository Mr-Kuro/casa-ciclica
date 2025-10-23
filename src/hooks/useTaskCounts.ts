import { Task } from "../models/Task";
import {
  dentroDaQuinzenaAtual,
  dentroDoMesAtual,
  naoConcluidaHoje,
} from "../utils/recurrence";

export interface TaskCounts {
  HOJE: number;
  SEMANA: number; // novas abas agrupadas
  QUINZENA: number;
  MES: number;
}

export function computeCounts(
  tarefas: Task[],
  today: Date = new Date()
): TaskCounts {
  const ativos = tarefas.filter((t) => t.ativa);
  const countHoje = ativos.filter((t) => {
    if (t.recorrencia === "SEMANAL")
      return (
        t.diaSemana !== undefined &&
        t.diaSemana === today.getDay() &&
        naoConcluidaHoje(t as any)
      );
    if (t.recorrencia === "DIARIA") return naoConcluidaHoje(t as any);
    return false;
  }).length;
  // Semana: todas semanais (não concluidas hoje) + diárias não concluídas hoje
  const countSemana = ativos.filter((t) => {
    if (t.recorrencia === "SEMANAL") return naoConcluidaHoje(t as any);
    if (t.recorrencia === "DIARIA") return naoConcluidaHoje(t as any);
    return false;
  }).length;
  const countQuinzena = ativos.filter(
    (t) =>
      t.recorrencia === "QUINZENAL" &&
      dentroDaQuinzenaAtual(t.proximaData) &&
      naoConcluidaHoje(t as any)
  ).length;
  const countMes = ativos.filter(
    (t) =>
      t.recorrencia === "MENSAL" &&
      dentroDoMesAtual(t.proximaData) &&
      naoConcluidaHoje(t as any)
  ).length;
  return {
    HOJE: countHoje,
    SEMANA: countSemana,
    QUINZENA: countQuinzena,
    MES: countMes,
  };
}

import { useMemo } from "react";
export function useTaskCounts(tarefas: Task[]): TaskCounts {
  return useMemo(() => computeCounts(tarefas), [tarefas]);
}
