import React from "react";
import ResponsiveTable, { TableColumn, TableGroup } from "./ResponsiveTable";
import { Task } from "@models/Task";
import { LABELS } from "@constants/strings";

interface TaskTableAdapterProps {
  modo: "SEMANA" | "FLAT"; // Semana (grupos) ou lista direta
  grupos?: { titulo: string; tarefas: Task[] }[]; // usado em modo SEMANA
  tarefas?: Task[]; // usado em modo FLAT
  collapsed: Record<string, boolean>;
  onToggleGroup: (id: string) => void;
  getRowClassName?: (t: Task) => string;
  renderActions: (t: Task) => React.ReactNode;
  mostrarColunaDia?: boolean; // condicional HOJE
  sortIndicators?: { key: string; dir: "asc" | "desc" } | null; // futuro
}

export const TaskTableAdapter: React.FC<TaskTableAdapterProps> = ({
  modo,
  grupos = [],
  tarefas = [],
  collapsed,
  onToggleGroup,
  getRowClassName,
  renderActions,
  mostrarColunaDia = true,
}) => {
  const columns: TableColumn<Task>[] = [
    {
      key: "titulo",
      header: LABELS.campos.titulo,
      render: (t) => (
        <a href={`/tarefas/${t.id}`} className="hover:underline font-medium">
          {t.titulo}
        </a>
      ),
      className: "font-medium",
    },
    {
      key: "recorrencia",
      header: LABELS.campos.recorrencia,
      render: (t) => t.recorrencia,
    },
  ];

  if (mostrarColunaDia) {
    columns.push({
      key: "diaSemana",
      header: LABELS.campos.diaSemana,
      render: (t) => {
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

  columns.push(
    {
      key: "proximaData",
      header: LABELS.campos.proxima,
      render: (t) => (
        <span className="text-xs">
          {t.proximaData ? new Date(t.proximaData).toLocaleDateString() : "—"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "ultimaConclusao",
      header: LABELS.campos.ultima,
      render: (t) => (
        <span className="text-xs">
          {t.ultimaConclusao
            ? new Date(t.ultimaConclusao).toLocaleDateString()
            : "—"}
        </span>
      ),
      hideOnMobile: true,
    }
  );

  const groups: TableGroup<Task>[] =
    modo === "SEMANA"
      ? grupos.map((g) => ({ id: g.titulo, title: g.titulo, rows: g.tarefas }))
      : [];

  return (
    <ResponsiveTable
      columns={columns}
      groups={modo === "SEMANA" ? groups : undefined}
      rows={modo === "FLAT" ? tarefas : undefined}
      getRowKey={(t) => t.id}
      collapsed={collapsed}
      onToggleGroup={onToggleGroup}
      getRowClassName={getRowClassName}
      renderActions={renderActions}
      mobileCards
      emptyMessage={
        <span className="text-gray-500 text-xs">
          {LABELS.estados.nenhumaTarefa}
        </span>
      }
      ariaLabel="Tabela de tarefas"
    />
  );
};

export default TaskTableAdapter;
