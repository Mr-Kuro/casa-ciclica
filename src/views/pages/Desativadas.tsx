import React, { useEffect, useState, useMemo } from "react";
import { taskController } from "../../controllers/TaskController";
import { Task } from "../../models/Task";
import { Link } from "react-router-dom";
import { LABELS } from "../../constants/strings";
import { useToast } from "../components/toast/ToastContext";

interface Grupo {
  titulo: string;
  tarefas: Task[];
}

const DIAS = LABELS.diasSemanaLongo;

export const Desativadas: React.FC = () => {
  const [tarefas, setTarefas] = useState<Task[]>(taskController.listar());
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { push } = useToast();

  function refresh() {
    setTarefas(taskController.listar());
  }

  useEffect(() => {
    window.addEventListener("tasks:reset", refresh);
    return () => window.removeEventListener("tasks:reset", refresh);
  }, []);

  const inativas = useMemo(() => tarefas.filter((t) => !t.ativa), [tarefas]);

  const grupos: Grupo[] = useMemo(() => {
    const diarias = inativas.filter((t) => t.recorrencia === "DIARIA");
    const semanaisPorDia: Record<number, Task[]> = {};
    inativas
      .filter((t) => t.recorrencia === "SEMANAL")
      .forEach((t) => {
        if (typeof t.diaSemana === "number") {
          (semanaisPorDia[t.diaSemana] ||= []).push(t);
        }
      });
    const semanaisGrupos: Grupo[] = Object.keys(semanaisPorDia)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => ({
        titulo: `Semanais - ${DIAS[Number(key)]}`,
        tarefas: semanaisPorDia[Number(key)],
      }));
    const quinzenais = inativas.filter((t) => t.recorrencia === "QUINZENAL");
    const mensais = inativas.filter((t) => t.recorrencia === "MENSAL");
    const base: Grupo[] = [];
    if (diarias.length) base.push({ titulo: "Diárias", tarefas: diarias });
    base.push(...semanaisGrupos);
    if (quinzenais.length)
      base.push({ titulo: "Quinzenais", tarefas: quinzenais });
    if (mensais.length) base.push({ titulo: "Mensais", tarefas: mensais });
    return base;
  }, [inativas]);

  return (
    <div className="space-y-6 surface p-4 rounded">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-semibold">
          {LABELS.campos.tarefasDesativadas}
        </h2>
        <Link to="/" className="btn-invert text-xs">
          {LABELS.navigation.voltar}
        </Link>
      </div>
      {grupos.length === 0 && (
        <p className="text-sm text-gray-500">
          {LABELS.estados.nenhumaDesativada}
        </p>
      )}
      {grupos.length > 0 && (
        <div className="overflow-x-auto surface-alt rounded border p-2">
          <table className="min-w-full text-xs">
            <thead className="table-head uppercase text-[10px]">
              <tr>
                <th className="px-3 py-2 text-left">{LABELS.campos.titulo}</th>
                <th className="px-3 py-2 text-left">
                  {LABELS.campos.recorrencia}
                </th>
                <th className="px-3 py-2 text-left">
                  {LABELS.campos.diaSemana}
                </th>
                <th className="px-3 py-2 text-left">{LABELS.campos.proxima}</th>
                <th className="px-3 py-2 text-left">
                  {LABELS.campos.ultimaConclusao}
                </th>
                <th className="px-3 py-2">{LABELS.campos.acoes}</th>
              </tr>
            </thead>
            <tbody>
              {grupos.map((grupo) => (
                <React.Fragment key={grupo.titulo}>
                  <tr className="surface-accent select-none">
                    <td colSpan={6} className="px-3 py-2 subtitle">
                      <button
                        onClick={() =>
                          setCollapsed((c) => ({
                            ...c,
                            [grupo.titulo]: !c[grupo.titulo],
                          }))
                        }
                        className="mr-2 inline-flex items-center justify-center rounded border px-2 py-0.5 text-[10px] btn-invert"
                      >
                        {collapsed[grupo.titulo] ? "+" : "−"}
                      </button>
                      {grupo.titulo}{" "}
                      <span className="ml-2 text-[10px] text-subtle">
                        {grupo.tarefas.length} itens
                      </span>
                    </td>
                  </tr>
                  {!collapsed[grupo.titulo] &&
                    grupo.tarefas.map((t, idx) => {
                      const dias = [
                        "Dom",
                        "Seg",
                        "Ter",
                        "Qua",
                        "Qui",
                        "Sex",
                        "Sáb",
                      ];
                      return (
                        <tr
                          key={t.id}
                          className="table-row table-row-zebra row-hover"
                        >
                          <td className="px-3 py-1 font-medium">
                            <Link
                              to={`/tarefas/${t.id}`}
                              className="hover:underline"
                            >
                              {t.titulo}
                            </Link>
                          </td>
                          <td className="px-3 py-1">{t.recorrencia}</td>
                          <td className="px-3 py-1 text-muted">
                            {t.recorrencia === "SEMANAL" &&
                            typeof t.diaSemana === "number"
                              ? dias[t.diaSemana]
                              : t.recorrencia === "DIARIA"
                              ? "Diária"
                              : "—"}
                          </td>
                          <td className="px-3 py-1 text-muted">
                            {t.proximaData
                              ? new Date(t.proximaData).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-3 py-1 text-muted">
                            {t.ultimaConclusao
                              ? new Date(t.ultimaConclusao).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-3 py-1 text-xs space-x-1">
                            <button
                              onClick={() => {
                                taskController.alternarAtiva(t.id);
                                refresh();
                                push({
                                  message: LABELS.feedback.toastTarefaReativada,
                                  type: "success",
                                });
                              }}
                              className="btn btn-success px-2 py-1 text-[11px]"
                            >
                              {LABELS.actions.reativar}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Remover tarefa?")) {
                                  taskController.remover(t.id);
                                  refresh();
                                  push({
                                    message:
                                      LABELS.feedback.toastTarefaRemovida,
                                    type: "info",
                                  });
                                }
                              }}
                              className="btn btn-danger px-2 py-1 text-[11px]"
                            >
                              {LABELS.actions.remover}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {!collapsed[grupo.titulo] && grupo.tarefas.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-4 text-center text-subtle"
                      >
                        {LABELS.estados.nenhumGrupo}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
