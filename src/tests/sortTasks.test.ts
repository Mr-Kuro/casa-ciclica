import { describe, it, expect } from "vitest";
import { sortTasks } from "../utils/sort";
import { Task } from "../models/Task";
import { Recurrence } from "../types";

function t(titulo: string, patch: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    titulo,
    descricao: patch.descricao,
    recorrencia: patch.recorrencia || Recurrence.DIARIA,
    ativa: patch.ativa ?? true,
    ultimaConclusao: patch.ultimaConclusao,
    proximaData: patch.proximaData,
    diaSemana: patch.diaSemana,
  };
}

describe("sortTasks utility", () => {
  const base = [t("Banana"), t("abacate"), t("Cenoura")];
  it("sorts by titulo asc default case-insensitive", () => {
    const sorted = sortTasks(base, "titulo", "asc");
    expect(sorted.map((x) => x.titulo)).toEqual([
      "abacate",
      "Banana",
      "Cenoura",
    ]);
  });
  it("sorts by titulo desc", () => {
    const sorted = sortTasks(base, "titulo", "desc");
    expect(sorted.map((x) => x.titulo)).toEqual([
      "Cenoura",
      "Banana",
      "abacate",
    ]);
  });
  it("sorts by proxima asc (timestamps)", () => {
    const now = Date.now();
    const tasks = [
      t("A", { proximaData: new Date(now + 5000).toISOString() }),
      t("B", { proximaData: new Date(now + 1000).toISOString() }),
      t("C", { proximaData: new Date(now + 3000).toISOString() }),
    ];
    const sorted = sortTasks(tasks, "proxima", "asc");
    expect(sorted.map((x) => x.titulo)).toEqual(["B", "C", "A"]);
  });
  it("sorts by ultima desc (recent first)", () => {
    const now = Date.now();
    const tasks = [
      t("X", { ultimaConclusao: new Date(now - 2000).toISOString() }),
      t("Y", { ultimaConclusao: new Date(now - 1000).toISOString() }),
      t("Z", { ultimaConclusao: new Date(now - 3000).toISOString() }),
    ];
    const sorted = sortTasks(tasks, "ultima", "desc");
    expect(sorted.map((x) => x.titulo)).toEqual(["Y", "X", "Z"]);
  });
});
