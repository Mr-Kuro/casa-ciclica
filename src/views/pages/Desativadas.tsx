import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { taskController } from "@controllers/TaskController";
import { Task } from "@models/Task";
import { LABELS } from "@constants/strings";
import { useToast } from "@molecules/toast/ToastContext";
import ResponsiveTable, {
  TableColumn,
  TableGroup,
} from "../../components/molecules/ResponsiveTable";

interface Grupo {
  titulo: string;
  tarefas: Task[];
}

const DIAS_LONGO = LABELS.diasSemanaLongo;
const DIAS_CURTO = LABELS.diasSemanaCurto;

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
        titulo: `Semanais - ${DIAS_LONGO[Number(key)]}`,
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

  const columns: TableColumn<Task>[] = [
    {
      key: "titulo",
      header: LABELS.campos.titulo,
      render: (t: Task) => (
        <Link to={`/tarefas/${t.id}`} className="hover:underline font-medium">
          {t.titulo}
        </Link>
      ),
      className: "font-medium",
    },
    {
      key: "recorrencia",
      header: LABELS.campos.recorrencia,
      render: (t: Task) => t.recorrencia,
    },
    {
      key: "diaSemana",
      header: LABELS.campos.diaSemana,
      render: (t: Task) => (
        <span className="text-muted">
          {t.recorrencia === "SEMANAL" && typeof t.diaSemana === "number"
            ? DIAS_CURTO[t.diaSemana]
            : t.recorrencia === "DIARIA"
            ? "Diária"
            : "—"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "proximaData",
      header: LABELS.campos.proxima,
      render: (t: Task) => (
        <span className="text-muted">
          {t.proximaData ? new Date(t.proximaData).toLocaleDateString() : "—"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "ultimaConclusao",
      header: LABELS.campos.ultimaConclusao,
      render: (t: Task) => (
        <span className="text-muted">
          {t.ultimaConclusao
            ? new Date(t.ultimaConclusao).toLocaleDateString()
            : "—"}
        </span>
      ),
      hideOnMobile: true,
    },
  ];

  const groupsTable: TableGroup<Task>[] = grupos.map((g) => ({
    id: g.titulo,
    title: g.titulo,
    rows: g.tarefas,
  }));

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
      <ResponsiveTable
        columns={columns}
        groups={groupsTable}
        getRowKey={(t: Task) => t.id}
        collapsed={collapsed}
        onToggleGroup={(id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }))}
        renderActions={(t: Task) => (
          <>
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
                    message: LABELS.feedback.toastTarefaRemovida,
                    type: "info",
                  });
                }
              }}
              className="btn btn-danger px-2 py-1 text-[11px]"
            >
              {LABELS.actions.remover}
            </button>
          </>
        )}
        emptyMessage={<span>{LABELS.estados.nenhumaDesativada}</span>}
        mobileCards
        ariaLabel="Tabela de tarefas desativadas"
      />
    </div>
  );
};
