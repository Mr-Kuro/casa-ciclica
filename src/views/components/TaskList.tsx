import React, { useState, useMemo, useEffect } from "react";
import { taskController } from "../../controllers/TaskController";
import { Task } from "../../models/Task";
import {
  dentroDaQuinzenaAtual,
  dentroDoMesAtual,
  mesmoDiaSemanaHoje,
  naoConcluidaHoje,
} from "../../utils/recurrence";
import { LABELS } from "../../constants/strings";
import { sortTasks, TaskSortKey } from "../../utils/sort";
import { loadSortPrefs, saveSortPrefs } from "../../utils/sortStorage";
import { useToast } from "./toast/ToastContext";

interface GrupoSemana {
  titulo: string;
  tarefas: Task[];
}

interface Props {
  tarefas: Task[];
  onChange(): void;
  filtro?: "HOJE" | "SEMANA" | "QUINZENA" | "MES";
}

export const TaskList: React.FC<Props> = ({
  tarefas,
  onChange,
  filtro = "HOJE",
}) => {
  const { push } = useToast();
  const [mostrarInativas, setMostrarInativas] = useState(false);
  const [sortKey, setSortKey] = useState<TaskSortKey>("titulo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const prefs = loadSortPrefs();
    if (prefs) {
      if (
        ["titulo", "recorrencia", "diaSemana", "proxima", "ultima"].includes(
          prefs.key
        )
      ) {
        setSortKey(prefs.key as TaskSortKey);
      }
      setSortDir(prefs.dir);
    }
  }, []);

  function toggleSort(key: TaskSortKey) {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => {
          const next = d === "asc" ? "desc" : "asc";
          saveSortPrefs({ key, dir: next });
          return next;
        });
        return prev;
      } else {
        const nextKey = key;
        const nextDir: "asc" = "asc";
        setSortDir(nextDir);
        saveSortPrefs({ key: nextKey, dir: nextDir });
        return nextKey;
      }
    });
  }
  // Sem uso direto de Date aqui; filtros já baseados em helpers.
  const concluidasHoje: Task[] = [];
  const inactiveCount = useMemo(
    () => tarefas.filter((t) => !t.ativa).length,
    [tarefas]
  );
  const filtradasBase = tarefas.filter((t) => {
    // Oculta tarefas inativas das listagens normais (a menos que toggle)
    if (!mostrarInativas && !t.ativa) return false;
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
    if (filtro === "SEMANA") {
      if (t.recorrencia === "SEMANAL" || t.recorrencia === "DIARIA") {
        return naoConcluidaHoje(t);
      }
      return false;
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
    return true; // fallback se filtros expandirem no futuro (ainda respeita ativa)
  });

  const ocultadas = !mostrarInativas ? inactiveCount : 0;

  // aplicar ordenação nas listagens não SEMANA (listagem plana)
  const filtradas = useMemo(() => {
    if (filtro === "SEMANA") return filtradasBase; // ordenação por grupo separada
    return sortTasks(filtradasBase, sortKey, sortDir);
  }, [filtradasBase, filtro, sortKey, sortDir]);

  // Agrupamento de semana (diárias + semanais por dia) quando filtro === SEMANA
  const gruposSemana: GrupoSemana[] = useMemo(() => {
    if (filtro !== "SEMANA") return [];
    const diarias = filtradas.filter((t) => t.recorrencia === "DIARIA");
    const semanaisPorDia: Record<number, Task[]> = {};
    filtradas
      .filter((t) => t.recorrencia === "SEMANAL")
      .forEach((t) => {
        if (typeof t.diaSemana === "number") {
          (semanaisPorDia[t.diaSemana] ||= []).push(t);
        }
      });
    const gruposDia = Object.keys(semanaisPorDia)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => ({
        titulo: LABELS.diasSemanaLongo[Number(key)],
        tarefas: semanaisPorDia[Number(key)],
      }));
    const resultado: GrupoSemana[] = [];
    if (diarias.length) resultado.push({ titulo: "Diárias", tarefas: diarias });
    resultado.push(...gruposDia);
    // Ordenação interna por título se toggle ativo
    // Ordenação interna dos grupos usando sortKey quando chave for aplicável
    const keyForGroup = sortKey;
    return resultado.map((g) => ({
      titulo: g.titulo,
      tarefas: sortTasks(g.tarefas, keyForGroup, sortDir),
    }));
    return resultado;
  }, [filtradas, filtro, sortKey, sortDir]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMostrarInativas((v) => !v)}
            className="btn-invert px-2 py-1"
            aria-pressed={mostrarInativas}
          >
            {mostrarInativas
              ? LABELS.feedback.ocultarInativas
              : LABELS.feedback.mostrarInativas}
          </button>
          {ocultadas > 0 && (
            <span className="text-subtle text-[11px]">
              {LABELS.feedback.ocultadasCount(ocultadas)}
            </span>
          )}
        </div>
        {/* Sem botão dedicado; ordenação agora por cabeçalhos */}
      </div>
      {filtro === "SEMANA" ? (
        <div className="overflow-x-auto border rounded shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600 task-row-fixed">
              <tr className="task-row-fixed">
                <th
                  className="px-3 py-2 text-left"
                  aria-sort={
                    sortKey === "titulo"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("titulo")}
                    className="sort-btn inline-flex items-center gap-1"
                  >
                    <span>{LABELS.campos.titulo}</span>
                    {sortKey === "titulo" && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                        className="opacity-70"
                      >
                        {sortDir === "asc" ? (
                          <path d="M5 2 L2 7 H8 Z" fill="currentColor" />
                        ) : (
                          <path d="M5 8 L2 3 H8 Z" fill="currentColor" />
                        )}
                      </svg>
                    )}
                  </button>
                </th>
                <th
                  className="px-3 py-2 text-left"
                  aria-sort={
                    sortKey === "recorrencia"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("recorrencia")}
                    className="sort-btn inline-flex items-center gap-1"
                  >
                    <span>{LABELS.campos.recorrencia}</span>
                    {sortKey === "recorrencia" && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                        className="opacity-70"
                      >
                        {sortDir === "asc" ? (
                          <path d="M5 2 L2 7 H8 Z" fill="currentColor" />
                        ) : (
                          <path d="M5 8 L2 3 H8 Z" fill="currentColor" />
                        )}
                      </svg>
                    )}
                  </button>
                </th>
                <th
                  className="px-3 py-2 text-left"
                  aria-sort={
                    sortKey === "diaSemana"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("diaSemana")}
                    className="sort-btn inline-flex items-center gap-1"
                  >
                    <span>{LABELS.campos.diaSemana}</span>
                    {sortKey === "diaSemana" && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                        className="opacity-70"
                      >
                        {sortDir === "asc" ? (
                          <path d="M5 2 L2 7 H8 Z" fill="currentColor" />
                        ) : (
                          <path d="M5 8 L2 3 H8 Z" fill="currentColor" />
                        )}
                      </svg>
                    )}
                  </button>
                </th>
                <th
                  className="px-3 py-2 text-left"
                  aria-sort={
                    sortKey === "proxima"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("proxima")}
                    className="sort-btn inline-flex items-center gap-1"
                  >
                    <span>{LABELS.campos.proxima}</span>
                    {sortKey === "proxima" && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                        className="opacity-70"
                      >
                        {sortDir === "asc" ? (
                          <path d="M5 2 L2 7 H8 Z" fill="currentColor" />
                        ) : (
                          <path d="M5 8 L2 3 H8 Z" fill="currentColor" />
                        )}
                      </svg>
                    )}
                  </button>
                </th>
                <th
                  className="px-3 py-2 text-left"
                  aria-sort={
                    sortKey === "ultima"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("ultima")}
                    className="sort-btn inline-flex items-center gap-1"
                  >
                    <span>{LABELS.campos.ultima}</span>
                    {sortKey === "ultima" && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                        className="opacity-70"
                      >
                        {sortDir === "asc" ? (
                          <path d="M5 2 L2 7 H8 Z" fill="currentColor" />
                        ) : (
                          <path d="M5 8 L2 3 H8 Z" fill="currentColor" />
                        )}
                      </svg>
                    )}
                  </button>
                </th>
                <th className="px-3 py-2 task-actions-col">
                  {LABELS.actions.concluir}
                </th>
              </tr>
            </thead>
            <tbody>
              {gruposSemana.map((g) => (
                <React.Fragment key={g.titulo}>
                  <tr className="surface-accent select-none">
                    <td colSpan={6} className="px-3 py-2 subtitle">
                      <button
                        onClick={() =>
                          setCollapsed((c) => ({
                            ...c,
                            [g.titulo]: !c[g.titulo],
                          }))
                        }
                        className="mr-2 inline-flex items-center justify-center rounded border px-2 py-0.5 text-[10px] btn-invert"
                        aria-label={
                          collapsed[g.titulo]
                            ? "Expandir grupo"
                            : "Colapsar grupo"
                        }
                      >
                        {collapsed[g.titulo] ? "+" : "−"}
                      </button>
                      {g.titulo}{" "}
                      <span className="ml-2 text-[10px] text-subtle">
                        {g.tarefas.length} itens
                      </span>
                    </td>
                  </tr>
                  {!collapsed[g.titulo] &&
                    g.tarefas.map((t) => {
                      const dias = LABELS.diasSemanaCurto;
                      return (
                        <tr
                          key={t.id}
                          className={`border-t task-row-fixed ${
                            t.ativa ? "row-hover" : "task-row-inactive"
                          }`}
                        >
                          <td className="px-3 py-2 font-medium">
                            <a
                              href={`/tarefas/${t.id}`}
                              className="hover:underline"
                            >
                              {t.titulo}
                            </a>
                          </td>
                          <td className="px-3 py-2">{t.recorrencia}</td>
                          <td className="px-3 py-2 text-xs text-gray-600">
                            {t.recorrencia === "SEMANAL" &&
                            typeof t.diaSemana === "number"
                              ? dias[t.diaSemana]
                              : "Diária"}
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
                                  push({
                                    message:
                                      LABELS.feedback.toastTarefaConcluida,
                                    type: "success",
                                  });
                                }}
                                disabled={!t.ativa}
                                className="btn-success btn px-2 py-1 text-[11px]"
                                aria-disabled={!t.ativa}
                                title={
                                  t.ativa
                                    ? "Concluir tarefa"
                                    : "Tarefa desativada"
                                }
                              >
                                {LABELS.actions.concluir}
                              </button>
                              <button
                                onClick={() => {
                                  taskController.alternarAtiva(t.id);
                                  onChange();
                                  push({
                                    message: t.ativa
                                      ? LABELS.feedback.toastTarefaReativada
                                      : LABELS.feedback.toastTarefaDesativada,
                                    type: t.ativa ? "warning" : "success",
                                  });
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
                                    push({
                                      message:
                                        LABELS.feedback.toastTarefaRemovida,
                                      type: "info",
                                    });
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
                  {!collapsed[g.titulo] && g.tarefas.length === 0 && (
                    <tr className="task-row-fixed">
                      <td
                        colSpan={6}
                        className="px-3 py-6 text-center text-gray-500"
                      >
                        {LABELS.estados.nenhumaTarefa}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {gruposSemana.length === 0 && (
                <tr className="task-row-fixed">
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    {LABELS.estados.nenhumaTarefa}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600 task-row-fixed">
              <tr className="task-row-fixed">
                <th
                  className="px-3 py-2 text-left"
                  aria-sort={
                    sortKey === "titulo"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("titulo")}
                    className="sort-btn inline-flex items-center gap-1"
                  >
                    <span>{LABELS.campos.titulo}</span>
                    {sortKey === "titulo" && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                        className="opacity-70"
                      >
                        {sortDir === "asc" ? (
                          <path d="M5 2 L2 7 H8 Z" fill="currentColor" />
                        ) : (
                          <path d="M5 8 L2 3 H8 Z" fill="currentColor" />
                        )}
                      </svg>
                    )}
                  </button>
                </th>
                <th
                  className="px-3 py-2 text-left"
                  aria-sort={
                    sortKey === "recorrencia"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("recorrencia")}
                    className="sort-btn inline-flex items-center gap-1"
                  >
                    <span>{LABELS.campos.recorrencia}</span>
                    {sortKey === "recorrencia" && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                        className="opacity-70"
                      >
                        {sortDir === "asc" ? (
                          <path d="M5 2 L2 7 H8 Z" fill="currentColor" />
                        ) : (
                          <path d="M5 8 L2 3 H8 Z" fill="currentColor" />
                        )}
                      </svg>
                    )}
                  </button>
                </th>
                {filtro === "HOJE" && (
                  <th
                    className="px-3 py-2 text-left"
                    aria-sort={
                      sortKey === "diaSemana"
                        ? sortDir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort("diaSemana")}
                      className="sort-btn inline-flex items-center gap-1"
                    >
                      <span>{LABELS.campos.diaSemana}</span>
                      {sortKey === "diaSemana" && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          aria-hidden="true"
                          className="opacity-70"
                        >
                          {sortDir === "asc" ? (
                            <path d="M5 2 L2 7 H8 Z" fill="currentColor" />
                          ) : (
                            <path d="M5 8 L2 3 H8 Z" fill="currentColor" />
                          )}
                        </svg>
                      )}
                    </button>
                  </th>
                )}
                <th
                  className="px-3 py-2 text-left"
                  aria-sort={
                    sortKey === "proxima"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("proxima")}
                    className="sort-btn inline-flex items-center gap-1"
                  >
                    <span>{LABELS.campos.proxima}</span>
                    {sortKey === "proxima" && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                        className="opacity-70"
                      >
                        {sortDir === "asc" ? (
                          <path d="M5 2 L2 7 H8 Z" fill="currentColor" />
                        ) : (
                          <path d="M5 8 L2 3 H8 Z" fill="currentColor" />
                        )}
                      </svg>
                    )}
                  </button>
                </th>
                <th
                  className="px-3 py-2 text-left"
                  aria-sort={
                    sortKey === "ultima"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggleSort("ultima")}
                    className="sort-btn inline-flex items-center gap-1"
                  >
                    <span>{LABELS.campos.ultima}</span>
                    {sortKey === "ultima" && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                        className="opacity-70"
                      >
                        {sortDir === "asc" ? (
                          <path d="M5 2 L2 7 H8 Z" fill="currentColor" />
                        ) : (
                          <path d="M5 8 L2 3 H8 Z" fill="currentColor" />
                        )}
                      </svg>
                    )}
                  </button>
                </th>
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
                            push({
                              message: LABELS.feedback.toastTarefaConcluida,
                              type: "success",
                            });
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
                            push({
                              message: t.ativa
                                ? LABELS.feedback.toastTarefaReativada
                                : LABELS.feedback.toastTarefaDesativada,
                              type: t.ativa ? "warning" : "success",
                            });
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
                              push({
                                message: LABELS.feedback.toastTarefaRemovida,
                                type: "info",
                              });
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
                    colSpan={filtro === "HOJE" ? 6 : 5}
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    {LABELS.estados.nenhumaTarefa}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
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
