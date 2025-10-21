import { describe, it, expect } from "vitest";
import { computeCounts } from "../hooks/useTaskCounts";
import { Task } from "../models/Task";
import { Recurrence } from "../types";

function makeTask(partial: Partial<Task>): Task {
  return {
    id: partial.id || crypto.randomUUID(),
    titulo: partial.titulo || "T",
    descricao: partial.descricao,
    recorrencia: partial.recorrencia || Recurrence.DIARIA,
    ativa: partial.ativa ?? true,
    ultimaConclusao: partial.ultimaConclusao,
    proximaData: partial.proximaData,
    diaSemana: partial.diaSemana,
  };
}

describe("SEMANA filter counts", () => {
  it("counts all non-concluded daily and weekly tasks for SEMANA", () => {
    const hoje = new Date();
    const dailyNotDone = makeTask({ recorrencia: Recurrence.DIARIA });
    const dailyDone = makeTask({
      recorrencia: Recurrence.DIARIA,
      ultimaConclusao: hoje.toISOString(),
    });
    const weeklyTodayNotDone = makeTask({
      recorrencia: Recurrence.SEMANAL,
      diaSemana: hoje.getDay(),
    });
    const weeklyOtherDay = makeTask({
      recorrencia: Recurrence.SEMANAL,
      diaSemana: (hoje.getDay() + 1) % 7,
      ultimaConclusao: hoje.toISOString(),
    });
    const quinzenal = makeTask({ recorrencia: Recurrence.QUINZENAL });
    const tasks = [
      dailyNotDone,
      dailyDone,
      weeklyTodayNotDone,
      weeklyOtherDay,
      quinzenal,
    ];
    const counts = computeCounts(tasks, hoje);
    // HOJE: daily not done + weekly today not done
    expect(counts.HOJE).toBe(2);
    // SEMANA: all weekly (regardless of day) not done today + daily not done; weeklyOtherDay is concluded today so excluded
    expect(counts.SEMANA).toBe(2);
  });
});
