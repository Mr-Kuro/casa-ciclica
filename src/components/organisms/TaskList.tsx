import React, { useState, useMemo, useEffect } from "react";
import { taskController } from "@controllers/TaskController"; // usando alias @controllers
import { Task } from "@models/Task";
import {
  dentroDaQuinzenaAtual,
  dentroDoMesAtual,
  mesmoDiaSemanaHoje,
  naoConcluidaHoje,
} from "@utils/recurrence";
import { LABELS } from "@constants/strings";
import {
  semanalAtrasadaHoje,
  quinzenalAtrasadaAtual,
  mensalAtrasadaAtual,
  diasAtraso,
} from "@utils/overdue";
import { loadUIPrefs, saveUIPrefs } from "@utils/uiPrefs";
import { sortTasks, TaskSortKey } from "@utils/sort";
import { loadSortPrefs, saveSortPrefs } from "@utils/sortStorage";
import { useToast } from "@molecules/toast/ToastContext"; // alias após migração
import ResponsiveTable, {
  TableColumn,
  TableGroup,
} from "../molecules/ResponsiveTable";

interface GrupoSemana {
  titulo: string;
  tarefas: Task[];
}
interface Props {
  tarefas: Task[];
  onChange(): void;
  filtro?: "HOJE" | "SEMANA" | "QUINZENA" | "MES";
  loading?: boolean;
}

export const TaskList: React.FC<Props> = ({
  tarefas,
  onChange,
  filtro = "HOJE",
  loading = false,
}) => {
  const { push } = useToast();
  const [mostrarInativas, setMostrarInativas] = useState(false);
  const [sortKey, setSortKey] = useState<TaskSortKey>("titulo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setInitialLoading(false), 120);
    return () => clearTimeout(id);
  }, []);
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
        const nextDir: "asc" = "asc";
        setSortDir(nextDir);
        saveSortPrefs({ key, dir: nextDir });
        return key;
      }
    });
  }
  const [mostrarAtrasadas, setMostrarAtrasadas] = useState(false);
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);
  const hojeRef = useMemo(() => new Date(), []);
  useEffect(() => {
    const prefs = loadUIPrefs();
    if (typeof prefs.mostrarInativas === "boolean")
      setMostrarInativas(prefs.mostrarInativas);
    if (typeof prefs.mostrarAtrasadas === "boolean")
      setMostrarAtrasadas(prefs.mostrarAtrasadas);
    if (typeof prefs.mostrarConcluidas === "boolean")
      setMostrarConcluidas(prefs.mostrarConcluidas);
  }, []);
  useEffect(() => {
    saveUIPrefs({ mostrarInativas });
  }, [mostrarInativas]);
  useEffect(() => {
    saveUIPrefs({ mostrarAtrasadas });
  }, [mostrarAtrasadas]);
  useEffect(() => {
    saveUIPrefs({ mostrarConcluidas });
  }, [mostrarConcluidas]);
  const hojeMid = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const inicioMes = useMemo(
    () => new Date(hojeMid.getFullYear(), hojeMid.getMonth(), 1),
    [hojeMid]
  );
  const inicioQuinzena = useMemo(
    () =>
      hojeMid.getDate() <= 15
        ? new Date(hojeMid.getFullYear(), hojeMid.getMonth(), 1)
        : new Date(hojeMid.getFullYear(), hojeMid.getMonth(), 16),
    [hojeMid]
  );
  const atrasadasSemana = useMemo(
    () =>
      tarefas.filter(
        (t) =>
          t.recorrencia === "SEMANAL" &&
          !mesmoDiaSemanaHoje(t.diaSemana) &&
          semanalAtrasadaHoje(t, hojeRef) &&
          naoConcluidaHoje(t)
      ),
    [tarefas, hojeRef]
  );
  const atrasadasQuinzena = useMemo(
    () => tarefas.filter((t) => quinzenalAtrasadaAtual(t, hojeRef)),
    [tarefas, hojeRef]
  );
  const atrasadasMes = useMemo(
    () => tarefas.filter((t) => mensalAtrasadaAtual(t, hojeRef)),
    [tarefas, hojeRef]
  );
  const inactiveCount = useMemo(
    () =>
      tarefas.filter((t) => {
        if (t.ativa) return false;
        if (filtro === "HOJE") {
          if (t.recorrencia === "SEMANAL") {
            const mesmoDia = mesmoDiaSemanaHoje(t.diaSemana);
            const naoConcluida = naoConcluidaHoje(t);
            if (mesmoDia) return naoConcluida;
            return (
              mostrarAtrasadas &&
              semanalAtrasadaHoje(t, hojeRef) &&
              naoConcluida
            );
          }
          if (t.recorrencia === "DIARIA") return naoConcluidaHoje(t);
          return false;
        }
        if (filtro === "SEMANA") {
          if (t.recorrencia === "SEMANAL" || t.recorrencia === "DIARIA")
            return naoConcluidaHoje(t);
          return false;
        }
        if (filtro === "QUINZENA") {
          if (t.recorrencia !== "QUINZENAL") return false;
          if (!naoConcluidaHoje(t)) return false;
          if (mostrarAtrasadas) {
            if (dentroDaQuinzenaAtual(t.proximaData)) return true;
            if (t.proximaData) {
              const d = new Date(t.proximaData);
              d.setHours(0, 0, 0, 0);
              if (d < inicioQuinzena) return true;
            }
            return false;
          }
          return dentroDaQuinzenaAtual(t.proximaData);
        }
        if (filtro === "MES") {
          if (t.recorrencia !== "MENSAL") return false;
          if (!naoConcluidaHoje(t)) return false;
          if (mostrarAtrasadas) {
            if (dentroDoMesAtual(t.proximaData)) return true;
            if (t.proximaData) {
              const d = new Date(t.proximaData);
              d.setHours(0, 0, 0, 0);
              if (d < inicioMes) return true;
            }
            return false;
          }
          return dentroDoMesAtual(t.proximaData);
        }
        return true;
      }).length,
    [tarefas, filtro, mostrarAtrasadas, hojeRef, inicioQuinzena, inicioMes]
  );
  const filtradasBase = tarefas.filter((t) => {
    if (!mostrarInativas && !t.ativa) return false;
    const estaConcluida = !naoConcluidaHoje(t);
    if (!mostrarConcluidas && estaConcluida) return false;
    if (filtro === "HOJE") {
      if (t.recorrencia === "SEMANAL") {
        const mesmoDia = mesmoDiaSemanaHoje(t.diaSemana);
        const naoConcluida = naoConcluidaHoje(t);
        if (mesmoDia)
          return naoConcluida || (mostrarConcluidas && !naoConcluida);
        if (mostrarAtrasadas && semanalAtrasadaHoje(t, hojeRef) && naoConcluida)
          return true;
        return false;
      }
      if (t.recorrencia === "DIARIA") {
        const naoConcluida = naoConcluidaHoje(t);
        return naoConcluida || (mostrarConcluidas && !naoConcluida);
      }
      return false;
    }
    if (filtro === "SEMANA") {
      if (t.recorrencia === "SEMANAL" || t.recorrencia === "DIARIA") {
        const naoConcluida = naoConcluidaHoje(t);
        return naoConcluida || (mostrarConcluidas && !naoConcluida);
      }
      return false;
    }
    if (filtro === "QUINZENA") {
      if (t.recorrencia === "QUINZENAL") {
        const naoConcluida = naoConcluidaHoje(t);
        if (!naoConcluida && !mostrarConcluidas) return false;
        if (!naoConcluida && mostrarConcluidas) return true;
        if (mostrarAtrasadas) {
          if (dentroDaQuinzenaAtual(t.proximaData)) return true;
          if (t.proximaData) {
            const d = new Date(t.proximaData);
            d.setHours(0, 0, 0, 0);
            if (d < inicioQuinzena) return true;
          }
          return false;
        }
        return dentroDaQuinzenaAtual(t.proximaData);
      }
      return false;
    }
    if (filtro === "MES") {
      if (t.recorrencia === "MENSAL") {
        const naoConcluida = naoConcluidaHoje(t);
        if (!naoConcluida && !mostrarConcluidas) return false;
        if (!naoConcluida && mostrarConcluidas) return true;
        if (mostrarAtrasadas) {
          if (dentroDoMesAtual(t.proximaData)) return true;
          if (t.proximaData) {
            const d = new Date(t.proximaData);
            d.setHours(0, 0, 0, 0);
            if (d < inicioMes) return true;
          }
          return false;
        }
        return dentroDoMesAtual(t.proximaData);
      }
      return false;
    }
    return true;
  });
  const concluidasCount = useMemo(
    () =>
      tarefas.filter((t) => {
        const concluida = !naoConcluidaHoje(t);
        if (!concluida) return false;
        if (!mostrarInativas && !t.ativa) return false;
        if (filtro === "HOJE") {
          if (t.recorrencia === "SEMANAL")
            return mesmoDiaSemanaHoje(t.diaSemana);
          if (t.recorrencia === "DIARIA") return true;
          return false;
        }
        if (filtro === "SEMANA")
          return t.recorrencia === "SEMANAL" || t.recorrencia === "DIARIA";
        if (filtro === "QUINZENA") return t.recorrencia === "QUINZENAL";
        if (filtro === "MES") return t.recorrencia === "MENSAL";
        return false;
      }).length,
    [tarefas, filtro, mostrarInativas]
  );
  const ocultadas = !mostrarInativas ? inactiveCount : 0;
  const filtradas = useMemo(
    () =>
      filtro === "SEMANA"
        ? filtradasBase
        : sortTasks(filtradasBase, sortKey, sortDir),
    [filtradasBase, filtro, sortKey, sortDir]
  );
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
    const keyForGroup = sortKey;
    return resultado.map((g) => ({
      titulo: g.titulo,
      tarefas: sortTasks(g.tarefas, keyForGroup, sortDir),
    }));
  }, [filtradas, filtro, sortKey, sortDir]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const tabelaCarregando = loading || initialLoading;
  // Common action buttons header kept igual
  const header = (
    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMostrarInativas((v) => !v)}
          className="btn-invert px-2 py-1"
          aria-pressed={mostrarInativas}
          disabled={inactiveCount === 0}
          aria-label={
            mostrarInativas
              ? "Ocultar tarefas inativas"
              : `Mostrar tarefas inativas (${inactiveCount})`
          }
        >
          {mostrarInativas
            ? LABELS.feedback.ocultarInativas
            : LABELS.feedback.mostrarInativas}
          <span className="ml-1 text-[10px] opacity-70">({inactiveCount})</span>
        </button>
        {/* Botão atrasadas conforme filtro */}
        {filtro === "HOJE" && (
          <button
            type="button"
            onClick={() => setMostrarAtrasadas((v) => !v)}
            className="btn-invert px-2 py-1"
            aria-pressed={mostrarAtrasadas}
            disabled={atrasadasSemana.length === 0}
            aria-label={
              mostrarAtrasadas
                ? "Ocultar tarefas atrasadas"
                : `Mostrar tarefas atrasadas (${atrasadasSemana.length})`
            }
          >
            {mostrarAtrasadas
              ? LABELS.feedback.ocultarAtrasadas
              : LABELS.feedback.mostrarAtrasadas}
            <span className="ml-1 text-[10px] opacity-70">
              ({atrasadasSemana.length})
            </span>
          </button>
        )}
        {filtro === "SEMANA" && (
          <button
            type="button"
            onClick={() => setMostrarAtrasadas((v) => !v)}
            className="btn-invert px-2 py-1"
            aria-pressed={mostrarAtrasadas}
            disabled={atrasadasSemana.length === 0}
          >
            {mostrarAtrasadas
              ? LABELS.feedback.ocultarAtrasadas
              : LABELS.feedback.mostrarAtrasadas}
            <span className="ml-1 text-[10px] opacity-70">
              ({atrasadasSemana.length})
            </span>
          </button>
        )}
        {filtro === "QUINZENA" && (
          <button
            type="button"
            onClick={() => setMostrarAtrasadas((v) => !v)}
            className="btn-invert px-2 py-1"
            aria-pressed={mostrarAtrasadas}
            disabled={atrasadasQuinzena.length === 0}
          >
            {mostrarAtrasadas
              ? LABELS.feedback.ocultarAtrasadas
              : LABELS.feedback.mostrarAtrasadas}
            <span className="ml-1 text-[10px] opacity-70">
              ({atrasadasQuinzena.length})
            </span>
          </button>
        )}
        {filtro === "MES" && (
          <button
            type="button"
            onClick={() => setMostrarAtrasadas((v) => !v)}
            className="btn-invert px-2 py-1"
            aria-pressed={mostrarAtrasadas}
            disabled={atrasadasMes.length === 0}
          >
            {mostrarAtrasadas
              ? LABELS.feedback.ocultarAtrasadas
              : LABELS.feedback.mostrarAtrasadas}
            <span className="ml-1 text-[10px] opacity-70">
              ({atrasadasMes.length})
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setMostrarConcluidas((v) => !v)}
          className="btn-invert px-2 py-1"
          aria-pressed={mostrarConcluidas}
          disabled={concluidasCount === 0}
          aria-label={
            mostrarConcluidas
              ? "Ocultar tarefas já concluídas"
              : `Mostrar tarefas já concluídas (${concluidasCount})`
          }
        >
          {mostrarConcluidas
            ? LABELS.feedback.ocultarConcluidas
            : LABELS.feedback.mostrarConcluidas}
          <span className="ml-1 text-[10px] opacity-70">
            ({concluidasCount})
          </span>
        </button>
      </div>
    </div>
  );
  // Column definition for ResponsiveTable (both modes)
  const baseColumns: TableColumn<Task>[] = [
    {
      key: "titulo",
      header: LABELS.campos.titulo,
      sortable: true,
      render: (t: Task) => (
        <a href={`/tarefas/${t.id}`} className="hover:underline font-medium">
          {t.titulo}
        </a>
      ),
      className: "font-medium",
    },
    {
      key: "recorrencia",
      header: LABELS.campos.recorrencia,
      sortable: true,
      render: (t: Task) => t.recorrencia,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (t: Task) => {
        const concluida = !naoConcluidaHoje(t);
        const isAtrasada = (() => {
          if (!t.proximaData || concluida) return false;
          if (t.recorrencia === "SEMANAL")
            return semanalAtrasadaHoje(t, hojeRef);
          if (t.recorrencia === "DIARIA")
            return (
              new Date(t.proximaData).setHours(0, 0, 0, 0) < hojeMid.getTime()
            );
          if (t.recorrencia === "QUINZENAL")
            return quinzenalAtrasadaAtual(t, hojeRef);
          if (t.recorrencia === "MENSAL")
            return mensalAtrasadaAtual(t, hojeRef);
          return false;
        })();
        let label = "A concluir";
        let cls = "badge-status badge-pending";
        if (!t.ativa) {
          label = "Inativa";
          cls = "badge-status badge-inactive";
        } else if (concluida) {
          label = LABELS.estados.jaConcluida;
          cls = "badge-status badge-completed";
        } else if (isAtrasada) {
          label = LABELS.estados.atrasada;
          cls = "badge-status badge-overdue";
        }
        return (
          <span className={`${cls} inline-flex whitespace-nowrap`}>
            {label}
          </span>
        );
      },
      className: "whitespace-nowrap",
    },
  ];
  if (filtro === "SEMANA" || filtro === "HOJE") {
    baseColumns.push({
      key: "diaSemana",
      header: LABELS.campos.diaSemana,
      sortable: true,
      render: (t: Task) => {
        if (t.recorrencia === "SEMANAL" && typeof t.diaSemana === "number") {
          const dias = LABELS.diasSemanaCurto;
          return (
            <span className="text-xs text-gray-600">{dias[t.diaSemana]}</span>
          );
        }
        return <span className="text-xs text-gray-600">Diária</span>;
      },
      hideOnMobile: true,
    });
  }
  baseColumns.push(
    {
      key: "proximaData",
      header: LABELS.campos.proxima,
      sortable: true,
      sortKey: "proxima",
      render: (t: Task) => (
        <span className="text-xs">
          {t.proximaData ? new Date(t.proximaData).toLocaleDateString() : "—"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "ultimaConclusao",
      header: LABELS.campos.ultima,
      sortable: true,
      sortKey: "ultima",
      render: (t: Task) => (
        <span className="text-xs">
          {t.ultimaConclusao
            ? new Date(t.ultimaConclusao).toLocaleDateString()
            : "—"}
        </span>
      ),
      hideOnMobile: true,
    }
  );

  function rowClass(t: Task) {
    const concluida = !naoConcluidaHoje(t);
    if (concluida) return "task-row-completed";
    if (!t.ativa) return "task-row-inactive";
    return "";
  }
  function rowActions(t: Task) {
    const concluida = !naoConcluidaHoje(t);
    return (
      <div className="task-actions">
        <button
          type="button"
          onClick={() => {
            if (!t.ativa || concluida) return;
            taskController.concluirHoje(t.id);
            onChange();
            push({
              message: LABELS.feedback.toastTarefaConcluida,
              type: "success",
            });
          }}
          disabled={!t.ativa || concluida}
          className="btn-success btn px-2 py-1 text-[11px]"
          aria-disabled={!t.ativa || concluida}
          aria-label={
            concluida
              ? `Tarefa '${t.titulo}' já concluída hoje`
              : !t.ativa
              ? `Tarefa '${t.titulo}' desativada`
              : `Concluir tarefa '${t.titulo}'`
          }
          title={
            !t.ativa
              ? "Tarefa desativada"
              : concluida
              ? "Já concluída"
              : "Concluir tarefa"
          }
        >
          {LABELS.actions.concluir}
        </button>
        <button
          type="button"
          onClick={() => {
            if (concluida) return;
            taskController.alternarAtiva(t.id);
            onChange();
            push({
              message: t.ativa
                ? LABELS.feedback.toastTarefaReativada
                : LABELS.feedback.toastTarefaDesativada,
              type: t.ativa ? "warning" : "success",
            });
          }}
          disabled={concluida}
          className={`px-2 py-1 text-[11px] btn ${
            t.ativa ? "btn-warning" : "btn-success btn-reativar-emphasis"
          }`}
          aria-disabled={concluida}
          aria-label={
            concluida
              ? `Tarefa '${t.titulo}' já concluída`
              : t.ativa
              ? `Desativar tarefa '${t.titulo}'`
              : `Reativar tarefa '${t.titulo}'`
          }
          title={
            concluida ? "Já concluída" : t.ativa ? "Desativar" : "Reativar"
          }
        >
          {t.ativa ? LABELS.actions.desativar : LABELS.actions.reativar}
        </button>
        <button
          type="button"
          onClick={() => {
            if (concluida) return;
            if (confirm("Remover tarefa?")) {
              taskController.remover(t.id);
              onChange();
              push({
                message: LABELS.feedback.toastTarefaRemovida,
                type: "info",
              });
            }
          }}
          disabled={concluida}
          className="btn px-2 py-1 text-[11px] bg-red-600 hover:bg-red-700"
          aria-disabled={concluida}
          aria-label={
            concluida
              ? `Tarefa '${t.titulo}' já concluída`
              : `Remover tarefa '${t.titulo}'`
          }
          title={concluida ? "Já concluída" : "Remover"}
        >
          {LABELS.actions.remover}
        </button>
      </div>
    );
  }

  const groupsWeek: TableGroup<Task>[] = gruposSemana.map((g) => ({
    id: g.titulo,
    title: g.titulo,
    rows: g.tarefas,
  }));

  const tableElement =
    filtro === "SEMANA" ? (
      <ResponsiveTable
        columns={baseColumns}
        groups={groupsWeek}
        getRowKey={(t: Task) => t.id}
        collapsed={collapsed}
        onToggleGroup={(id: string) =>
          setCollapsed((c) => ({ ...c, [id]: !c[id] }))
        }
        getRowClassName={rowClass}
        renderActions={rowActions}
        currentSortKey={sortKey}
        currentSortDir={sortDir}
        onToggleSort={(k: string) => toggleSort(k as TaskSortKey)}
        loading={tabelaCarregando}
        loadingSkeletonRows={5}
        emptyMessage={<span>{LABELS.estados.nenhumaTarefa}</span>}
        mobileCards
        ariaLabel="Tabela semanal de tarefas"
      />
    ) : (
      <ResponsiveTable
        columns={baseColumns}
        rows={filtradas}
        getRowKey={(t: Task) => t.id}
        getRowClassName={rowClass}
        renderActions={rowActions}
        currentSortKey={sortKey}
        currentSortDir={sortDir}
        onToggleSort={(k: string) => toggleSort(k as TaskSortKey)}
        loading={tabelaCarregando}
        loadingSkeletonRows={6}
        emptyMessage={<span>{LABELS.estados.nenhumaTarefa}</span>}
        mobileCards
        ariaLabel="Tabela de tarefas"
      />
    );

  return (
    <div className="space-y-8">
      {header}
      {tableElement}
    </div>
  );
};
