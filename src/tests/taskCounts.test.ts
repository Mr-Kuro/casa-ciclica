import { describe, it, expect } from "vitest";
import { computeCounts } from "../hooks/useTaskCounts";
import { Recurrence } from "../types";
import { Task } from "../models/Task";

function makeTask(partial: Partial<Task>): Task {
  return {
    id: Math.random().toString(36).slice(2),
    titulo: "t",
    descricao: "",
    recorrencia: Recurrence.DIARIA,
    ativa: true,
    ultimaConclusao: undefined,
    proximaData: new Date().toISOString(),
    diaSemana: undefined,
    ...partial,
  };
}

describe("computeCounts", () => {
  it("conta diárias não concluídas hoje em HOJE", () => {
    const hoje = new Date();
    const dailyOpen = makeTask({
      recorrencia: Recurrence.DIARIA,
      ultimaConclusao: undefined,
    });
    const dailyClosed = makeTask({
      recorrencia: Recurrence.DIARIA,
      ultimaConclusao: hoje.toISOString(),
    });
    const counts = computeCounts([dailyOpen, dailyClosed]);
    expect(counts.HOJE).toBe(1);
  });
  it("conta semanais do dia correto", () => {
    const todayWeekday = new Date().getDay();
    const weeklyToday = makeTask({
      recorrencia: Recurrence.SEMANAL,
      diaSemana: todayWeekday,
    });
    const weeklyOther = makeTask({
      recorrencia: Recurrence.SEMANAL,
      diaSemana: (todayWeekday + 1) % 7,
    });
    const counts = computeCounts([weeklyToday, weeklyOther]);
    expect(counts.HOJE).toBe(1);
  });
  it("conta quinzenais apenas não concluídas dentro da quinzena", () => {
    // proximaData hoje para garantir dentro da quinzena atual
    const quinzenalOk = makeTask({
      recorrencia: Recurrence.QUINZENAL,
      proximaData: new Date().toISOString(),
    });
    const quinzenalDone = makeTask({
      recorrencia: Recurrence.QUINZENAL,
      proximaData: new Date().toISOString(),
      ultimaConclusao: new Date().toISOString(),
    });
    const counts = computeCounts([quinzenalOk, quinzenalDone]);
    expect(counts.QUINZENA).toBe(1);
  });
  it("conta mensais dentro do mês e não concluídas", () => {
    const mensal = makeTask({
      recorrencia: Recurrence.MENSAL,
      proximaData: new Date().toISOString(),
    });
    const mensalDone = makeTask({
      recorrencia: Recurrence.MENSAL,
      proximaData: new Date().toISOString(),
      ultimaConclusao: new Date().toISOString(),
    });
    const counts = computeCounts([mensal, mensalDone]);
    expect(counts.MES).toBe(1);
  });
});
