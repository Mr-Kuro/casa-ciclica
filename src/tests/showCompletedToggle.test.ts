import { describe, it, expect } from "vitest";
import { naoConcluidaHoje } from "../utils/recurrence";
import { Task } from "../models/Task";
import { Recurrence } from "../types";

// Este teste valida expectativa básica da função auxiliar naoConcluidaHoje e a lógica
// de exibição condicional de concluídas (simulada em nível de filtragem).

function filtrarHoje(tarefas: Task[], mostrarConcluidas: boolean) {
  // Simplificação da lógica de TaskList para HOJE: diárias + semanais de hoje
  const hoje = new Date().getDay();
  return tarefas.filter((t) => {
    const concluida = !naoConcluidaHoje(t);
    if (!mostrarConcluidas && concluida) return false;
    if (t.recorrencia === "DIARIA") return true; // inclui tanto concluídas quanto não se toggle ativo
    if (t.recorrencia === "SEMANAL" && typeof t.diaSemana === "number") {
      return t.diaSemana === hoje;
    }
    return false;
  });
}

describe("Toggle mostrarConcluidas", () => {
  it("oculta concluídas quando toggle desativado e mostra quando ativado", () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const ontem = new Date(hoje.getTime() - 86400000);

    const DIARIA = "DIARIA" as Recurrence;
    const tasks: Task[] = [
      {
        id: "d1",
        titulo: "Diária não concluída",
        recorrencia: DIARIA,
        ativa: true,
      },
      {
        id: "d2",
        titulo: "Diária concluída hoje",
        recorrencia: DIARIA,
        ativa: true,
        ultimaConclusao: hoje.toISOString(),
      },
      {
        id: "d3",
        titulo: "Diária concluída ontem",
        recorrencia: DIARIA,
        ativa: true,
        ultimaConclusao: ontem.toISOString(),
      },
    ];

    const semToggle = filtrarHoje(tasks, false).map((t) => t.id);
    expect(semToggle).toEqual(["d1", "d3"]); // d2 (concluída hoje) ocultada

    const comToggle = filtrarHoje(tasks, true)
      .map((t) => t.id)
      .sort();
    expect(comToggle).toEqual(["d1", "d2", "d3"]);
  });
});
