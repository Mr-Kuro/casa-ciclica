import { describe, it, expect } from "vitest";
import { filtrarSemanaisAtrasadas } from "../utils/overdue";
import { Task } from "../models/Task";
import { Recurrence } from "../types";

describe("filtrarSemanaisAtrasadas", () => {
  it("identifica semanais de dias anteriores não concluídas", () => {
    const hoje = new Date();
    const ontem = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate() - 1
    );
    const anteontem = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate() - 2
    );
    const format = (d: Date) => d.toISOString();
    const diaSemanaHoje = hoje.getDay();
    const diaSemanaOntem = ontem.getDay();
    const diaSemanaAnteontem = anteontem.getDay();
    const tasks: Task[] = [
      {
        id: "t1",
        titulo: "Semanal hoje não concluída",
        recorrencia: Recurrence.SEMANAL,
        ativa: true,
        diaSemana: diaSemanaHoje,
        proximaData: format(hoje),
        criadaEm: format(hoje),
      },
      {
        id: "t2",
        titulo: "Semanal ontem não concluída (atrasada)",
        recorrencia: Recurrence.SEMANAL,
        ativa: true,
        diaSemana: diaSemanaOntem,
        proximaData: format(ontem),
        criadaEm: format(ontem),
      },
      {
        id: "t3",
        titulo: "Semanal anteontem concluída",
        recorrencia: Recurrence.SEMANAL,
        ativa: true,
        diaSemana: diaSemanaAnteontem,
        proximaData: format(anteontem),
        ultimaConclusao: format(hoje), // marcada hoje, portanto não atrasada
        criadaEm: format(anteontem),
      },
    ];
    const atrasadas = filtrarSemanaisAtrasadas(tasks, hoje);
    expect(atrasadas.map((t) => t.id)).toEqual(["t2"]);
  });
});
