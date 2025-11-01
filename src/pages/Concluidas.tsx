import React, { useEffect, useState, useMemo } from "react";
import { timeAgo } from "../utils/timeAgo";
import { taskController } from "../controllers/TaskController";
import { Task } from "../models/Task";
import { Link } from "react-router-dom";
import { naoConcluidaHoje } from "../utils/recurrence";
import { LABELS } from "../constants/strings";
import ResponsiveTable, {
  TableColumn,
  TableGroup,
} from "../components/molecules/ResponsiveTable";

interface Grupo {
  titulo: string;
  tarefas: Task[];
}

// Dias da semana para exibir sem depender de Date.getDay do navegador
const DIAS = LABELS.diasSemanaLongo; // 0..6

export const Concluidas: React.FC = () => {
  const [tarefas, setTarefas] = useState<Task[]>(taskController.listar());
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [ordenarPorTitulo, setOrdenarPorTitulo] = useState(false);

  function refresh() {
    setTarefas(taskController.listar());
  }

  useEffect(() => {
    window.addEventListener("tasks:reset", refresh);
    return () => window.removeEventListener("tasks:reset", refresh);
  }, []);

  const concluidas = useMemo(
    () => tarefas.filter((t) => !!t.ultimaConclusao),
    [tarefas]
  );

  const grupos: Grupo[] = useMemo(() => {
    const diaria = concluidas.filter((t) => t.recorrencia === "DIARIA");
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

  const columns: TableColumn<Task>[] = [
    {
      key: "titulo",
      header: LABELS.campos.titulo,
      mobileLabel: LABELS.campos.titulo,
      render: (t) => (
        <Link to={`/tarefas/${t.id}`} className="hover:underline font-medium">
          {t.titulo}
        </Link>
      ),
      className: "font-medium",
    },
    {
      key: "recorrencia",
      header: LABELS.campos.recorrencia,
      mobileLabel: LABELS.campos.recorrencia,
      render: (t) => t.recorrencia,
    },
    {
      key: "diaSemana",
      header: LABELS.campos.diaSemana,
      mobileLabel: LABELS.campos.diaSemana,
      render: (t) => {
        if (t.recorrencia === "SEMANAL" && typeof t.diaSemana === "number") {
          const diasCurto = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
          return <span className="text-muted">{diasCurto[t.diaSemana]}</span>;
        }
        return (
          <span className="text-muted">
            {t.recorrencia === "DIARIA" ? "Diária" : "—"}
          </span>
        );
      },
      hideOnMobile: true,
    },
    {
      key: "proximaData",
      header: LABELS.campos.proxima,
      mobileLabel: LABELS.campos.proxima,
      render: (t) => (
        <span className="text-muted">
          {t.proximaData ? new Date(t.proximaData).toLocaleDateString() : "—"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "ultimaConclusao",
      header: LABELS.campos.ultimaConclusao,
      mobileLabel: LABELS.campos.ultimaConclusao,
      render: (t) => (
        <span className="text-muted">
          {t.ultimaConclusao
            ? `${new Date(t.ultimaConclusao).toLocaleDateString()} · ${timeAgo(
                t.ultimaConclusao
              )}`
            : "—"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "statusHoje",
      header: LABELS.campos.statusHoje,
      mobileLabel: LABELS.campos.statusHoje,
      render: (t) => {
        const concluidaHoje = !naoConcluidaHoje(t);
        return (
          <span className="text-[11px]">
            {concluidaHoje
              ? LABELS.estados.concluidaHoje
              : LABELS.estados.concluidaAnteriormente}
          </span>
        );
      },
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
      <ResponsiveTable
        columns={columns}
        groups={groupsTable}
        getRowKey={(t) => t.id}
        collapsed={collapsed}
        onToggleGroup={(id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }))}
        emptyMessage={<span>{LABELS.estados.nenhumaConcluida}</span>}
        mobileCards
        ariaLabel="Tabela de tarefas concluídas"
      />
    </div>
  );
};
