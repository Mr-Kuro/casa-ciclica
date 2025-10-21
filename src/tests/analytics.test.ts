import { describe, it, expect } from "vitest";
import { Task } from "../models/Task";
import { Recurrence } from "../types";
import {
  diasDesdeCriacao,
  diasDesdeUltimaConclusao,
  diasAteProxima,
  descricaoRecorrencia,
  statusRecorrencia,
} from "../utils/analytics";

function make(base: Partial<Task>): Task {
  return {
    id: base.id || crypto.randomUUID(),
    titulo: base.titulo || "T",
    descricao: base.descricao,
    recorrencia: base.recorrencia || Recurrence.DIARIA,
    ativa: base.ativa ?? true,
    ultimaConclusao: base.ultimaConclusao,
    proximaData: base.proximaData,
    diaSemana: base.diaSemana,
    criadaEm: base.criadaEm,
  };
}

describe("analytics helpers", () => {
  it("computes diasDesdeCriacao", () => {
    const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString();
    const task = make({ criadaEm: yesterday });
    const dias = diasDesdeCriacao(task);
    expect(dias === 0 || dias === 1).toBe(true); // tolerância para horário
  });
  it("descricaoRecorrencia semanal inclui dia", () => {
    const task = make({ recorrencia: Recurrence.SEMANAL, diaSemana: 3 });
    expect(descricaoRecorrencia(task)).toContain("Quarta");
  });
  it("statusRecorrencia returns Devida hoje when same day", () => {
    const nowIso = new Date().toISOString();
    const task = make({ proximaData: nowIso });
    expect(statusRecorrencia(task)).toBe("Devida hoje");
  });
  it("diasAteProxima negative when past date", () => {
    const pastIso = new Date(Date.now() - 2*24*60*60*1000).toISOString();
    const task = make({ proximaData: pastIso });
    const dias = diasAteProxima(task);
    expect(dias).toBeLessThan(0);
  });
});
