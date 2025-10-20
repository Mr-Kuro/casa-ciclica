import React from "react";
import { taskController } from "../../controllers/TaskController";
import { Task } from "../../models/Task";
import {
  devidoHoje,
  dentroDaQuinzenaAtual,
  dentroDoMesAtual,
  mesmoDiaSemanaHoje,
  naoConcluidaHoje,
} from "../../utils/recurrence";

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
  const hoje = new Date();
  const concluidasHoje: Task[] = [];
  const filtradas = tarefas.filter((t) => {
    if (filtro === "HOJE") {
      // Semântica: tarefas semanais do dia atual + tarefas diárias não concluídas hoje
      if (t.recorrencia === "SEMANAL") {
        return mesmoDiaSemanaHoje(t.diaSemana);
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
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Título</th>
              <th className="px-3 py-2 text-left">Recorrência</th>
              {filtro === "HOJE" && (
                <th className="px-3 py-2 text-left">Dia Semana</th>
              )}
              <th className="px-3 py-2 text-left">Âncora</th>
              <th className="px-3 py-2 text-left">Próxima</th>
              <th className="px-3 py-2 text-left">Última</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((t) => {
              const hoje = devidoHoje(t.proximaData);
              const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
              return (
                <tr key={t.id} className="border-t hover:bg-gray-50">
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
                    {t.recorrencia === 'QUINZENAL' || t.recorrencia === 'MENSAL'
                      ? (t.proximaData ? new Date(t.proximaData).getDate() : '—')
                      : '—'}
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
                  <td className="px-3 py-2 text-xs space-x-1">
                    <button
                      onClick={() => {
                        taskController.concluirHoje(t.id);
                        onChange();
                      }}
                      disabled={!hoje || !t.ativa}
                      className="btn px-2 py-1 text-[11px]"
                    >
                      Concluir
                    </button>
                    <button
                      onClick={() => {
                        taskController.alternarAtiva(t.id);
                        onChange();
                      }}
                      className="btn px-2 py-1 text-[11px] bg-yellow-600 hover:bg-yellow-700"
                    >
                      {t.ativa ? "Desativar" : "Ativar"}
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
                      Remover
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtradas.length === 0 && (
              <tr>
                <td
                  colSpan={filtro === "HOJE" ? 7 : 6}
                  className="px-3 py-6 text-center text-gray-500"
                >
                  Nenhuma tarefa para este filtro.
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
                <th className="px-3 py-1 text-left">Título</th>
                <th className="px-3 py-1 text-left">Recorrência</th>
                <th className="px-3 py-1 text-left">Dia Semana</th>
                <th className="px-3 py-1 text-left">Âncora</th>
                <th className="px-3 py-1 text-left">Próxima</th>
                <th className="px-3 py-1 text-left">Última</th>
                <th className="px-3 py-1" />
              </tr>
            </thead>
            <tbody>
              {concluidasHoje.map((t) => {
                const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
                return (
                  <tr key={t.id} className="border-t">
                    <td className="px-3 py-1 font-medium">{t.titulo}</td>
                    <td className="px-3 py-1">{t.recorrencia}</td>
                    <td className="px-3 py-1 text-gray-600">
                      {t.recorrencia === "SEMANAL" &&
                      typeof t.diaSemana === "number"
                        ? dias[t.diaSemana]
                        : "Diária"}
                    </td>
                    <td className="px-3 py-1 text-gray-600">
                      {t.recorrencia === 'QUINZENAL' || t.recorrencia === 'MENSAL'
                        ? (t.proximaData ? new Date(t.proximaData).getDate() : '—')
                        : '—'}
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
                      Já concluída
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
