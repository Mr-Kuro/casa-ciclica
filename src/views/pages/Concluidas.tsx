import React, { useEffect, useState, useMemo } from "react";
import { timeAgo } from "../../utils/timeAgo";
import { taskController } from "../../controllers/TaskController";
import { Task } from "../../models/Task";
import { Link } from "react-router-dom";
import { naoConcluidaHoje } from "../../utils/recurrence";
import { LABELS } from "../../constants/strings";

interface Grupo {
  titulo: string;
  tarefas: Task[];
}

// Dias da semana para exibir sem depender de Date.getDay do navegador
const DIAS = LABELS.diasSemanaLongo; // 0..6

export const Concluidas: React.FC = () => {
  const [tarefas, setTarefas] = useState<Task[]>(taskController.listar());
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function refresh() {
    setTarefas(taskController.listar());
  }

  useEffect(() => {
    window.addEventListener("tasks:reset", refresh);
    return () => window.removeEventListener("tasks:reset", refresh);
  }, []);

  // Filtrar somente tarefas que possuem ultimaConclusao
  const concluidas = useMemo(
    () => tarefas.filter((t) => !!t.ultimaConclusao),
    [tarefas]
  );

  const [ordenarPorTitulo, setOrdenarPorTitulo] = useState(false);
  const grupos: Grupo[] = useMemo(() => {
    const diaria = concluidas.filter((t) => t.recorrencia === "DIARIA");

    // Semanais: agrupar por diaSemana
    const semanaisPorDia: Record<number, Task[]> = {};
    concluidas
      .filter((t) => t.recorrencia === "SEMANAL")
      .forEach((t) => {
        if (typeof t.diaSemana === "number") {
          if (!semanaisPorDia[t.diaSemana]) semanaisPorDia[t.diaSemana] = [];
          semanaisPorDia[t.diaSemana].push(t);
        }
      });

    const semanaisGrupos: Grupo[] = Object.keys(semanaisPorDia)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => ({
        titulo: `Semanais - ${DIAS[Number(key)]}`,
        tarefas: semanaisPorDia[Number(key)],
      }));

    const quinzenais = concluidas.filter((t) => t.recorrencia === "QUINZENAL");
    const mensais = concluidas.filter((t) => t.recorrencia === "MENSAL");

    const base: Grupo[] = [];
    if (diaria.length) base.push({ titulo: "Diárias", tarefas: diaria });
    base.push(...semanaisGrupos);
    if (quinzenais.length)
      base.push({ titulo: "Quinzenais", tarefas: quinzenais });
    if (mensais.length) base.push({ titulo: "Mensais", tarefas: mensais });
    // Ordenar cada grupo internamente por ultimaConclusao desc
    return base.map((g) => {
      const tarefasOrdenadas = [...g.tarefas].sort((a, b) => {
        if (ordenarPorTitulo) {
          return a.titulo.localeCompare(b.titulo, "pt-BR", {
            sensitivity: "base",
          });
        }
        const da = a.ultimaConclusao
          ? new Date(a.ultimaConclusao).getTime()
          : 0;
        const db = b.ultimaConclusao
          ? new Date(b.ultimaConclusao).getTime()
          : 0;
        return db - da; // mais recente primeiro
      });
      return { titulo: g.titulo, tarefas: tarefasOrdenadas };
    });
  }, [concluidas, ordenarPorTitulo]);

  return (
    <div className="space-y-6 surface p-4 rounded">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-semibold">
          {LABELS.campos.tarefasConcluidas}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOrdenarPorTitulo((v) => !v)}
            className="btn-invert text-[10px] px-2 py-1"
            aria-pressed={ordenarPorTitulo}
          >
            {ordenarPorTitulo
              ? LABELS.feedback.ordenarPorData
              : LABELS.feedback.ordenarPorTitulo}
          </button>
          <Link to="/" className="btn-invert text-xs">
            {LABELS.navigation.voltar}
          </Link>
        </div>
      </div>
      {grupos.length === 0 && (
        <p className="text-sm text-gray-500">
          {LABELS.estados.nenhumaConcluida}
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
                <th className="px-3 py-2 text-left">
                  {LABELS.campos.statusHoje}
                </th>
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
                        aria-label={
                          collapsed[grupo.titulo]
                            ? "Expandir grupo"
                            : "Colapsar grupo"
                        }
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
                      const concluidaHoje = !naoConcluidaHoje(t);
                      return (
                        <tr
                          key={t.id}
                          className={`table-row table-row-zebra row-hover`}
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
                              ? `${new Date(
                                  t.ultimaConclusao
                                ).toLocaleDateString()} · ${timeAgo(
                                  t.ultimaConclusao
                                )}`
                              : "—"}
                          </td>
                          <td className="px-3 py-1 text-[11px]">
                            {concluidaHoje
                              ? LABELS.estados.concluidaHoje
                              : LABELS.estados.concluidaAnteriormente}
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
