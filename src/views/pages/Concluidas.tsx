import React, { useEffect, useState, useMemo } from "react";
import { taskController } from "../../controllers/TaskController";
import { Task } from "../../models/Task";
import { Link } from "react-router-dom";
import { naoConcluidaHoje } from "../../utils/recurrence";

interface Grupo {
  titulo: string;
  tarefas: Task[];
}

// Dias da semana para exibir sem depender de Date.getDay do navegador
const DIAS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
]; // 0..6

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
    return base.map((g) => ({
      titulo: g.titulo,
      tarefas: [...g.tarefas].sort((a, b) => {
        const da = a.ultimaConclusao
          ? new Date(a.ultimaConclusao).getTime()
          : 0;
        const db = b.ultimaConclusao
          ? new Date(b.ultimaConclusao).getTime()
          : 0;
        return db - da; // mais recente primeiro
      }),
    }));
  }, [concluidas]);

  return (
    <div className="space-y-6 surface p-4 rounded">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-semibold">Tarefas Concluídas</h2>
        <Link to="/" className="btn-invert text-xs">
          Voltar
        </Link>
      </div>
      {grupos.length === 0 && (
        <p className="text-sm text-gray-500">Nenhuma tarefa concluída ainda.</p>
      )}
      {grupos.length > 0 && (
        <div className="overflow-x-auto surface-alt rounded border p-2">
          <table className="min-w-full text-xs">
            <thead className="table-head uppercase text-[10px]">
              <tr>
                <th className="px-3 py-2 text-left">Título</th>
                <th className="px-3 py-2 text-left">Recorrência</th>
                <th className="px-3 py-2 text-left">Dia Semana</th>
                <th className="px-3 py-2 text-left">Próxima</th>
                <th className="px-3 py-2 text-left">Última Conclusão</th>
                <th className="px-3 py-2 text-left">Status Hoje</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {grupos.map((grupo) => (
                <React.Fragment key={grupo.titulo}>
                  <tr className="surface-accent select-none">
                    <td
                      colSpan={7}
                      className="px-3 py-2 font-semibold text-gray-700"
                    >
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
                              ? new Date(t.ultimaConclusao).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-3 py-1 text-[11px]">
                            {concluidaHoje
                              ? "Concluída hoje"
                              : "Concluída anteriormente"}
                          </td>
                          <td className="px-3 py-1 text-xs space-x-1">
                            <button
                              onClick={() => {
                                taskController.concluirHoje(t.id);
                                refresh();
                              }}
                              disabled={!t.ativa}
                              className="btn btn-success px-2 py-1 text-[11px]"
                            >
                              Re-concluir
                            </button>
                            <button
                              onClick={() => {
                                taskController.alternarAtiva(t.id);
                                refresh();
                              }}
                              className={`btn px-2 py-1 text-[11px] ${
                                t.ativa ? "btn-warning" : "btn-success"
                              }`}
                            >
                              {t.ativa ? "Desativar" : "Ativar"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {!collapsed[grupo.titulo] && grupo.tarefas.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-4 text-center text-subtle"
                      >
                        Nenhuma tarefa neste grupo.
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
