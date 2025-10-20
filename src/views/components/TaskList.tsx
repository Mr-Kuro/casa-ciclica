import React from "react";
import { taskController } from "../../controllers/TaskController";
import { Task } from "../../models/Task";
import {
  dentroDaQuinzenaAtual,
  dentroDoMesAtual,
  mesmoDiaSemanaHoje,
  naoConcluidaHoje,
} from "../../utils/recurrence";
import { LABELS } from "../../constants/strings";

interface Props {
  tarefas: Task[];
  onChange(): void;
  filtro?: "HOJE" | "QUINZENA" | "MES";
}

export const TaskList: React.FC<Props> = ({
  tarefas,
  onChange,
  filtro = "HOJE",
}) => {
  // Sem uso direto de Date aqui; filtros já baseados em helpers.
  const concluidasHoje: Task[] = [];
  const filtradas = tarefas.filter((t) => {
    if (filtro === "HOJE") {
      // Semântica: tarefas semanais do dia atual + tarefas diárias não concluídas hoje
      if (t.recorrencia === "SEMANAL") {
        const mesmoDia = mesmoDiaSemanaHoje(t.diaSemana);
        if (!mesmoDia) return false; // só interessa as semanais do dia
        const naoConcluida = naoConcluidaHoje(t);
        if (!naoConcluida) concluidasHoje.push(t);
        return naoConcluida;
      }
      if (t.recorrencia === "DIARIA") {
        const naoConcluida = naoConcluidaHoje(t);
        if (!naoConcluida) concluidasHoje.push(t);
        return naoConcluida;
      }
      return false; // excluir outras recorrências em HOJE
    }
    if (filtro === "QUINZENA") {
      // Somente tarefas quinzenais não concluídas desta quinzena
      if (t.recorrencia === "QUINZENAL") {
        return dentroDaQuinzenaAtual(t.proximaData) && naoConcluidaHoje(t);
      }
      return false;
    }
    if (filtro === "MES") {
      // Somente tarefas mensais não concluídas deste mês
      if (t.recorrencia === "MENSAL") {
        return dentroDoMesAtual(t.proximaData) && naoConcluidaHoje(t);
      }
      return false;
    }
    return true; // fallback se filtros expandirem no futuro
  });

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto border rounded shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600 task-row-fixed">
            <tr className="task-row-fixed">
              <th className="px-3 py-2 text-left">{LABELS.campos.titulo}</th>
              <th className="px-3 py-2 text-left">
                {LABELS.campos.recorrencia}
              </th>
              {filtro === "HOJE" && (
                <th className="px-3 py-2 text-left">
                  {LABELS.campos.diaSemana}
                </th>
              )}
              <th className="px-3 py-2 text-left">{LABELS.campos.ancora}</th>
              <th className="px-3 py-2 text-left">{LABELS.campos.proxima}</th>
              <th className="px-3 py-2 text-left">{LABELS.campos.ultima}</th>
              <th className="px-3 py-2 task-actions-col">
                {LABELS.actions.concluir}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((t) => {
              const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
              return (
                <tr
                  key={t.id}
                  className={`border-t task-row-fixed ${
                    t.ativa ? "row-hover" : "task-row-inactive"
                  }`}
                >
                  <td className="px-3 py-2 font-medium">
                    <a href={`/tarefas/${t.id}`} className="hover:underline">
                      {t.titulo}
                    </a>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1">
                      {t.recorrencia}
                    </span>
                  </td>
                  {filtro === "HOJE" && (
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {t.recorrencia === "SEMANAL" &&
                      typeof t.diaSemana === "number"
                        ? dias[t.diaSemana]
                        : t.recorrencia === "DIARIA"
                        ? "Diária"
                        : "—"}
                    </td>
                  )}
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {t.recorrencia === "QUINZENAL" || t.recorrencia === "MENSAL"
                      ? t.proximaData
                        ? new Date(t.proximaData).getDate()
                        : "—"
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {t.proximaData
                      ? new Date(t.proximaData).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {t.ultimaConclusao
                      ? new Date(t.ultimaConclusao).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs task-actions-col">
                    <div className="task-actions">
                      <button
                        onClick={() => {
                          if (!t.ativa) return;
                          taskController.concluirHoje(t.id);
                          onChange();
                        }}
                        disabled={!t.ativa}
                        className="btn-success btn px-2 py-1 text-[11px]"
                        aria-disabled={!t.ativa}
                        title={
                          t.ativa ? "Concluir tarefa" : "Tarefa desativada"
                        }
                      >
                        {LABELS.actions.concluir}
                      </button>
                      <button
                        onClick={() => {
                          taskController.alternarAtiva(t.id);
                          onChange();
                        }}
                        className={`px-2 py-1 text-[11px] btn ${
                          t.ativa
                            ? "btn-warning"
                            : "btn-success btn-reativar-emphasis"
                        }`}
                      >
                        {t.ativa
                          ? LABELS.actions.desativar
                          : LABELS.actions.reativar}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Remover tarefa?")) {
                            taskController.remover(t.id);
                            onChange();
                          }
                        }}
                        className="btn px-2 py-1 text-[11px] bg-red-600 hover:bg-red-700"
                      >
                        {LABELS.actions.remover}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtradas.length === 0 && (
              <tr className="task-row-fixed">
                <td
                  colSpan={filtro === "HOJE" ? 7 : 6}
                  className="px-3 py-6 text-center text-gray-500"
                >
                  {LABELS.estados.nenhumaTarefa}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filtro === "HOJE" && concluidasHoje.length > 0 && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-xs opacity-70">
            <thead className="bg-gray-50 uppercase text-[10px] text-gray-600">
              <tr>
                <th
                  colSpan={filtro === "HOJE" ? 7 : 6}
                  className="px-3 py-2 text-left"
                >
                  Concluídas hoje
                </th>
              </tr>
              <tr>
                <th className="px-3 py-1 text-left">{LABELS.campos.titulo}</th>
                <th className="px-3 py-1 text-left">
                  {LABELS.campos.recorrencia}
                </th>
                <th className="px-3 py-1 text-left">
                  {LABELS.campos.diaSemana}
                </th>
                <th className="px-3 py-1 text-left">{LABELS.campos.ancora}</th>
                <th className="px-3 py-1 text-left">{LABELS.campos.proxima}</th>
                <th className="px-3 py-1 text-left">{LABELS.campos.ultima}</th>
                <th className="px-3 py-1" />
              </tr>
            </thead>
            <tbody>
              {concluidasHoje.map((t) => {
                const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
                return (
                  <tr key={t.id} className="border-t task-row-fixed">
                    <td className="px-3 py-1 font-medium">{t.titulo}</td>
                    <td className="px-3 py-1">{t.recorrencia}</td>
                    <td className="px-3 py-1 text-gray-600">
                      {t.recorrencia === "SEMANAL" &&
                      typeof t.diaSemana === "number"
                        ? dias[t.diaSemana]
                        : "Diária"}
                    </td>
                    <td className="px-3 py-1 text-gray-600">
                      {t.recorrencia === "QUINZENAL" ||
                      t.recorrencia === "MENSAL"
                        ? t.proximaData
                          ? new Date(t.proximaData).getDate()
                          : "—"
                        : "—"}
                    </td>
                    <td className="px-3 py-1">
                      {t.proximaData
                        ? new Date(t.proximaData).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-3 py-1">
                      {t.ultimaConclusao
                        ? new Date(t.ultimaConclusao).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-3 py-1 text-[10px] text-gray-400">
                      {LABELS.estados.jaConcluida}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
