/* @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { TaskController } from "../controllers/TaskController";
import { Recurrence } from "../types";

describe("Weekly task creation", () => {
  it("stores diaSemana and computes next occurrence after today when same day chosen", () => {
    const controller = new TaskController();
    const today = new Date();
    const weekday = today.getDay();
    const task = controller.criar({
      titulo: "Teste semanal",
      descricao: "",
      recorrencia: Recurrence.SEMANAL,
      diaSemana: weekday,
    });
    expect(task.diaSemana).toBe(weekday);
    // nextWeeklyOccurrence ensures next week if same day selected today
    const next = new Date(task.proximaData!);
    const diffDays = Math.round(
      (next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(diffDays).toBeGreaterThanOrEqual(6); // at least 6-7 days (depending on time-of-day rounding)
  });
});
