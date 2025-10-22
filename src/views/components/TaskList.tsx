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
import {
  semanalAtrasadaHoje,
  quinzenalAtrasadaAtual,
  mensalAtrasadaAtual,
  diasAtraso,
} from "../../utils/overdue";
import { loadUIPrefs, saveUIPrefs } from "../../utils/uiPrefs";
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
  /** Se verdadeiro, mostra skeleton da tabela enquanto dados externos chegam */
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
  // Carregamento inicial curto para evitar flash de layout enquanto calcula memos
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
        const nextKey = key;
        const nextDir: "asc" = "asc";
        setSortDir(nextDir);
        saveSortPrefs({ key: nextKey, dir: nextDir });
        return nextKey;
      }
    });
  }
  // Sem uso direto de Date aqui; filtros já baseados em helpers.
  const [mostrarAtrasadas, setMostrarAtrasadas] = useState(false);
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);
  const hojeRef = useMemo(() => new Date(), []);
  // Carregar preferências persistidas de UI
  useEffect(() => {
    const prefs = loadUIPrefs();
    if (typeof prefs.mostrarInativas === "boolean") {
      setMostrarInativas(prefs.mostrarInativas);
    }
    if (typeof prefs.mostrarAtrasadas === "boolean") {
      setMostrarAtrasadas(prefs.mostrarAtrasadas);
    }
    if (typeof prefs.mostrarConcluidas === "boolean") {
      setMostrarConcluidas(prefs.mostrarConcluidas);
    }
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
  // Datas normalizadas para comparação (início do dia / período)
  const hojeMid = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const inicioMes = useMemo(
    () => new Date(hojeMid.getFullYear(), hojeMid.getMonth(), 1),
    [hojeMid]
  );
  const inicioQuinzena = useMemo(() => {
    return hojeMid.getDate() <= 15
      ? new Date(hojeMid.getFullYear(), hojeMid.getMonth(), 1)
      : new Date(hojeMid.getFullYear(), hojeMid.getMonth(), 16);
  }, [hojeMid]);
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
  const inactiveCount = useMemo(() => {
    return tarefas.filter((t) => {
      if (t.ativa) return false;

      if (filtro === "HOJE") {
        if (t.recorrencia === "SEMANAL") {
          const mesmoDia = mesmoDiaSemanaHoje(t.diaSemana);
          const naoConcluida = naoConcluidaHoje(t);
          if (mesmoDia) return naoConcluida;
          return (
            mostrarAtrasadas && semanalAtrasadaHoje(t, hojeRef) && naoConcluida
          );
        }
        if (t.recorrencia === "DIARIA") {
          return naoConcluidaHoje(t);
        }
        return false;
      }

      if (filtro === "SEMANA") {
        if (t.recorrencia === "SEMANAL" || t.recorrencia === "DIARIA") {
          return naoConcluidaHoje(t);
        }
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
    }).length;
  }, [tarefas, filtro, mostrarAtrasadas, hojeRef, inicioQuinzena, inicioMes]);
  const filtradasBase = tarefas.filter((t) => {
    // Oculta tarefas inativas das listagens normais (a menos que toggle)
    if (!mostrarInativas && !t.ativa) return false;
    // Concluídas são mantidas somente se toggle ativo
    const estaConcluida = !naoConcluidaHoje(t);
    if (!mostrarConcluidas && estaConcluida) return false;
    if (filtro === "HOJE") {
      // Base: semanais do dia e diárias não concluídas hoje.
      // Extra: semanais atrasadas de dias anteriores quando toggle ativo.
      if (t.recorrencia === "SEMANAL") {
        const mesmoDia = mesmoDiaSemanaHoje(t.diaSemana);
        const naoConcluida = naoConcluidaHoje(t);
        if (mesmoDia) {
          return naoConcluida || (mostrarConcluidas && !naoConcluida);
        }
        if (
          mostrarAtrasadas &&
          semanalAtrasadaHoje(t, hojeRef) &&
          naoConcluida
        ) {
          return true;
        }
        return false;
      }
      if (t.recorrencia === "DIARIA") {
        const naoConcluida = naoConcluidaHoje(t);
        return naoConcluida || (mostrarConcluidas && !naoConcluida);
      }
      return false; // manter exclusão de outras recorrências
    }
    if (filtro === "SEMANA") {
      if (t.recorrencia === "SEMANAL" || t.recorrencia === "DIARIA") {
        const naoConcluida = naoConcluidaHoje(t);
        return naoConcluida || (mostrarConcluidas && !naoConcluida);
      }
      return false;
    }
    if (filtro === "QUINZENA") {
      // Somente tarefas quinzenais não concluídas desta quinzena
      if (t.recorrencia === "QUINZENAL") {
        const naoConcluida = naoConcluidaHoje(t);
        if (!naoConcluida && !mostrarConcluidas) return false;
        // Se estiver concluída hoje e toggle ativo, inclui independentemente da próxima data
        if (!naoConcluida && mostrarConcluidas) return true;
        // Se toggle ativo incluir também atrasadas de quinzenas anteriores
        if (mostrarAtrasadas) {
          if (dentroDaQuinzenaAtual(t.proximaData)) return true;
          if (t.proximaData) {
            const d = new Date(t.proximaData);
            d.setHours(0, 0, 0, 0);
            // atrasada se antes do início da quinzena atual
            if (d < inicioQuinzena) return true;
          }
          return false;
        }
        return dentroDaQuinzenaAtual(t.proximaData);
      }
      return false;
    }
    if (filtro === "MES") {
      // Somente tarefas mensais não concluídas deste mês
      if (t.recorrencia === "MENSAL") {
        const naoConcluida = naoConcluidaHoje(t);
        if (!naoConcluida && !mostrarConcluidas) return false;
        if (!naoConcluida && mostrarConcluidas) return true; // inclui concluída independente da próxima data
        if (mostrarAtrasadas) {
          if (dentroDoMesAtual(t.proximaData)) return true;
          if (t.proximaData) {
            const d = new Date(t.proximaData);
            d.setHours(0, 0, 0, 0);
            if (d < inicioMes) return true; // mês anterior pendente
          }
          return false;
        }
        return dentroDoMesAtual(t.proximaData);
      }
      return false;
    }
    return true; // fallback se filtros expandirem no futuro (ainda respeita ativa)
  });

  // Contagem contextual de tarefas concluídas hoje conforme filtro ativo e outros toggles.
  const concluidasCount = useMemo(() => {
    return tarefas.filter((t) => {
      const concluida = !naoConcluidaHoje(t);
      if (!concluida) return false;
      // Respeita ocultação de inativas se não estiver mostrando inativas
      if (!mostrarInativas && !t.ativa) return false;
      if (filtro === "HOJE") {
        if (t.recorrencia === "SEMANAL") return mesmoDiaSemanaHoje(t.diaSemana);
        if (t.recorrencia === "DIARIA") return true;
        return false;
      }
      if (filtro === "SEMANA") {
        return t.recorrencia === "SEMANAL" || t.recorrencia === "DIARIA";
      }
      if (filtro === "QUINZENA") {
        return t.recorrencia === "QUINZENAL";
      }
      if (filtro === "MES") {
        return t.recorrencia === "MENSAL";
      }
      return false;
    }).length;
  }, [tarefas, filtro, mostrarInativas]);

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

  const tabelaCarregando = loading || initialLoading;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMostrarInativas((v) => !v)}
            className="btn-invert px-2 py-1"
            aria-pressed={mostrarInativas}
            disabled={inactiveCount === 0}
          >
            {mostrarInativas
              ? LABELS.feedback.ocultarInativas
              : LABELS.feedback.mostrarInativas}
            <span className="ml-1 text-[10px] opacity-70">
              ({inactiveCount})
            </span>
          </button>
          {filtro === "HOJE" && (
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
          >
            {mostrarConcluidas
              ? LABELS.feedback.ocultarConcluidas
              : LABELS.feedback.mostrarConcluidas}
            <span className="ml-1 text-[10px] opacity-70">
              ({concluidasCount})
            </span>
          </button>
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
              {tabelaCarregando &&
                [...Array(5)].map((_, i) => (
                  <tr key={`sk-week-${i}`} className="task-row-fixed border-t">
                    <td className="px-3 py-3" colSpan={6}>
                      <div className="flex flex-col gap-2">
                        <div className="skeleton h-4 w-1/3" />
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="skeleton h-3 w-2/3 mb-1" />
                            <div className="skeleton h-3 w-1/2" />
                          </div>
                          <div className="flex-1">
                            <div className="skeleton h-3 w-1/2 mb-1" />
                            <div className="skeleton h-3 w-2/3" />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              {!tabelaCarregando &&
                gruposSemana.map((g) => (
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
                        const isAtrasadaSemana =
                          mostrarAtrasadas && semanalAtrasadaHoje(t, hojeRef);
                        const atrasoDias = isAtrasadaSemana
                          ? diasAtraso(t.proximaData, hojeRef)
                          : 0;
                        const concluida = !naoConcluidaHoje(t);
                        return (
                          <tr
                            key={t.id}
                            className={`border-t task-row-fixed ${
                              concluida
                                ? "task-row-completed"
                                : t.ativa
                                ? "row-hover"
                                : "task-row-inactive"
                            }`}
                          >
                            <td className="px-3 py-2 font-medium">
                              <a
                                href={`/tarefas/${t.id}`}
                                className="hover:underline"
                              >
                                {t.titulo}
                              </a>
                              {isAtrasadaSemana && (
                                <span
                                  className="badge-overdue ml-2 align-middle"
                                  title="Tarefa atrasada"
                                >
                                  {LABELS.estados.atrasada}
                                  {atrasoDias > 0 &&
                                    ` (${LABELS.feedback.unidadeDia(
                                      atrasoDias
                                    )})`}
                                </span>
                              )}
                              {concluida && (
                                <span
                                  className="badge-completed ml-2 align-middle"
                                  title="Tarefa concluída"
                                >
                                  {LABELS.estados.jaConcluida}
                                </span>
                              )}
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
                                ? new Date(
                                    t.ultimaConclusao
                                  ).toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="px-3 py-2 text-xs task-actions-col">
                              <div className="task-actions">
                                <button
                                  onClick={() => {
                                    if (!t.ativa || concluida) return;
                                    taskController.concluirHoje(t.id);
                                    onChange();
                                    push({
                                      message:
                                        LABELS.feedback.toastTarefaConcluida,
                                      type: "success",
                                    });
                                  }}
                                  disabled={!t.ativa || concluida}
                                  className="btn-success btn px-2 py-1 text-[11px]"
                                  aria-disabled={!t.ativa || concluida}
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
                                  onClick={() => {
                                    if (concluida) return;
                                    taskController.alternarAtiva(t.id);
                                    onChange();
                                    push({
                                      message: t.ativa
                                        ? LABELS.feedback.toastTarefaDesativada
                                        : LABELS.feedback.toastTarefaReativada,
                                      type: t.ativa ? "warning" : "success",
                                    });
                                  }}
                                  disabled={concluida}
                                  className={`px-2 py-1 text-[11px] btn ${
                                    t.ativa
                                      ? "btn-warning"
                                      : "btn-success btn-reativar-emphasis"
                                  }`}
                                  aria-disabled={concluida}
                                  title={
                                    concluida
                                      ? "Já concluída"
                                      : t.ativa
                                      ? "Desativar"
                                      : "Reativar"
                                  }
                                >
                                  {t.ativa
                                    ? LABELS.actions.desativar
                                    : LABELS.actions.reativar}
                                </button>
                                <button
                                  onClick={() => {
                                    if (concluida) return;
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
                                  disabled={concluida}
                                  className="btn px-2 py-1 text-[11px] bg-red-600 hover:bg-red-700"
                                  aria-disabled={concluida}
                                  title={concluida ? "Já concluída" : "Remover"}
                                >
                                  {LABELS.actions.remover}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {!collapsed[g.titulo] &&
                      g.tarefas.length === 0 &&
                      !tabelaCarregando && (
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
              {!tabelaCarregando && gruposSemana.length === 0 && (
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
              {tabelaCarregando &&
                [...Array(6)].map((_, i) => (
                  <tr key={`sk-flat-${i}`} className="task-row-fixed border-t">
                    <td className="px-3 py-3">
                      {" "}
                      <div className="skeleton h-4 w-2/3 mb-2" />
                      <div className="skeleton h-3 w-1/4" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="skeleton h-3 w-14" />
                    </td>
                    {filtro === "HOJE" && (
                      <td className="px-3 py-3">
                        <div className="skeleton h-3 w-10" />
                      </td>
                    )}
                    <td className="px-3 py-3">
                      <div className="skeleton h-3 w-16" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="skeleton h-3 w-16" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="skeleton h-6 w-20" />
                    </td>
                  </tr>
                ))}
              {!tabelaCarregando &&
                filtradas.map((t) => {
                  const dias = [
                    "Dom",
                    "Seg",
                    "Ter",
                    "Qua",
                    "Qui",
                    "Sex",
                    "Sáb",
                  ];
                  let isAtrasada = false;
                  let atrasoDias = 0;
                  const concluida = !naoConcluidaHoje(t);
                  if (
                    mostrarAtrasadas &&
                    t.proximaData &&
                    naoConcluidaHoje(t)
                  ) {
                    if (
                      filtro === "HOJE" &&
                      ((t.recorrencia === "SEMANAL" &&
                        semanalAtrasadaHoje(t, hojeRef)) ||
                        (t.recorrencia === "DIARIA" &&
                          new Date(t.proximaData).setHours(0, 0, 0, 0) <
                            hojeMid.getTime()))
                    ) {
                      isAtrasada = true;
                    } else if (
                      filtro === "QUINZENA" &&
                      quinzenalAtrasadaAtual(t, hojeRef)
                    ) {
                      isAtrasada = true;
                    } else if (
                      filtro === "MES" &&
                      mensalAtrasadaAtual(t, hojeRef)
                    ) {
                      isAtrasada = true;
                    }
                    if (isAtrasada)
                      atrasoDias = diasAtraso(t.proximaData, hojeRef);
                  }
                  return (
                    <tr
                      key={t.id}
                      className={`border-t task-row-fixed ${
                        concluida
                          ? "task-row-completed"
                          : t.ativa
                          ? "row-hover"
                          : "task-row-inactive"
                      }`}
                    >
                      <td className="px-3 py-2 font-medium">
                        <a
                          href={`/tarefas/${t.id}`}
                          className="hover:underline"
                        >
                          {t.titulo}
                        </a>
                        {isAtrasada && (
                          <span
                            className="badge-overdue ml-2 align-middle"
                            title="Tarefa atrasada"
                          >
                            {LABELS.estados.atrasada}
                            {atrasoDias > 0 &&
                              ` (${LABELS.feedback.unidadeDia(atrasoDias)})`}
                          </span>
                        )}
                        {concluida && (
                          <span
                            className="badge-completed ml-2 align-middle"
                            title="Tarefa concluída"
                          >
                            {LABELS.estados.jaConcluida}
                          </span>
                        )}
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
                            onClick={() => {
                              if (concluida) return;
                              taskController.alternarAtiva(t.id);
                              onChange();
                              push({
                                message: t.ativa
                                  ? LABELS.feedback.toastTarefaDesativada
                                  : LABELS.feedback.toastTarefaReativada,
                                type: t.ativa ? "warning" : "success",
                              });
                            }}
                            disabled={concluida}
                            className={`px-2 py-1 text-[11px] btn ${
                              t.ativa
                                ? "btn-warning"
                                : "btn-success btn-reativar-emphasis"
                            }`}
                            aria-disabled={concluida}
                            title={
                              concluida
                                ? "Já concluída"
                                : t.ativa
                                ? "Desativar"
                                : "Reativar"
                            }
                          >
                            {t.ativa
                              ? LABELS.actions.desativar
                              : LABELS.actions.reativar}
                          </button>
                          <button
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
                            title={concluida ? "Já concluída" : "Remover"}
                          >
                            {LABELS.actions.remover}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {!tabelaCarregando && filtradas.length === 0 && (
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
      {/* Lista secundária de concluídas removida: concluídas aparecem integradas */}
    </div>
  );
};
