// Teste de atraso para tarefas quinzenais
import { describe, it, expect } from "vitest";
import { quinzenalAtrasadaAtual, diasAtraso } from "../utils/overdue";
import { Task } from "../models/Task";
import { Recurrence } from "../types";

function iso(d: Date) {
  return d.toISOString();
}

describe("quinzenalAtrasadaAtual", () => {
  it("marca tarefa da quinzena anterior como atrasada", () => {
    const hoje = new Date();
    // Forçar segunda quinzena para garantir cenário: se estivermos na primeira quinzena, simulamos data avançada
    if (hoje.getDate() <= 15) {
      hoje.setDate(20); // empurra para segunda quinzena
    }
    const inicioSegunda = new Date(hoje.getFullYear(), hoje.getMonth(), 16);
    const diaAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 10); // primeira quinzena
    const t: Task = {
      id: "q1",
      titulo: "Quinzenal anterior não concluída",
      recorrencia: Recurrence.QUINZENAL,
      ativa: true,
      proximaData: iso(diaAnterior),
      criadaEm: iso(diaAnterior),
    };
    expect(quinzenalAtrasadaAtual(t, hoje)).toBe(true);
    const dias = diasAtraso(t.proximaData, hoje);
    expect(dias).toBeGreaterThanOrEqual(1);
  });

  it("não marca tarefa da quinzena atual como atrasada", () => {
    const hoje = new Date();
    const diaAtual = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate()
    );
    const t: Task = {
      id: "q2",
      titulo: "Quinzenal atual não concluída",
      recorrencia: Recurrence.QUINZENAL,
      ativa: true,
      proximaData: iso(diaAtual),
      criadaEm: iso(diaAtual),
    };
    expect(quinzenalAtrasadaAtual(t, hoje)).toBe(false);
  });
});
