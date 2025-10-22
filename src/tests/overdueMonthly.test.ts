// Teste de atraso para tarefas mensais
import { describe, it, expect } from "vitest";
import { mensalAtrasadaAtual, diasAtraso } from "../utils/overdue";
import { Task } from "../models/Task";
import { Recurrence } from "../types";

function iso(d: Date) {
  return d.toISOString();
}

describe("mensalAtrasadaAtual", () => {
  it("marca tarefa de mês anterior como atrasada", () => {
    const hoje = new Date();
    const mesAnterior = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - 1,
      hoje.getDate()
    );
    const t: Task = {
      id: "m1",
      titulo: "Mensal mês anterior não concluída",
      recorrencia: Recurrence.MENSAL,
      ativa: true,
      proximaData: iso(mesAnterior),
      criadaEm: iso(mesAnterior),
    };
    expect(mensalAtrasadaAtual(t, hoje)).toBe(true);
    const dias = diasAtraso(t.proximaData, hoje);
    expect(dias).toBeGreaterThanOrEqual(1);
  });

  it("não marca tarefa do mês atual como atrasada", () => {
    const hoje = new Date();
    const t: Task = {
      id: "m2",
      titulo: "Mensal mês atual não concluída",
      recorrencia: Recurrence.MENSAL,
      ativa: true,
      proximaData: iso(hoje),
      criadaEm: iso(hoje),
    };
    expect(mensalAtrasadaAtual(t, hoje)).toBe(false);
  });
});
