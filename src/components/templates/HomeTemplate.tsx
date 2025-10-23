import React, { useEffect, useState } from "react";
import { taskController } from "@controllers/TaskController";
import { Task } from "@models/Task";
import { TaskList } from "@organisms/TaskList";
import { Filters } from "@molecules/Filters";
import { LABELS } from "@constants/strings";
import { useTaskCounts } from "@hooks/useTaskCounts";
import { Link } from "react-router-dom";

export interface HomeTemplateProps {
  initialFiltro?: "HOJE" | "SEMANA" | "QUINZENA" | "MES";
}

export const HomeTemplate: React.FC<HomeTemplateProps> = ({
  initialFiltro = "HOJE",
}) => {
  const [tarefas, setTarefas] = useState<Task[]>(taskController.listar());
  const [filtro, setFiltro] = useState<"HOJE" | "SEMANA" | "QUINZENA" | "MES">(
    initialFiltro
  );

  function refresh() {
    setTarefas(taskController.listar());
  }

  useEffect(() => {
    window.addEventListener("tasks:reset", refresh);
    window.addEventListener("anchors:updated", refresh);
    return () => {
      window.removeEventListener("tasks:reset", refresh);
      window.removeEventListener("anchors:updated", refresh);
    };
  }, []);

  const counts = useTaskCounts(tarefas);

  return (
    <div className="space-y-6 surface p-4 rounded">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{LABELS.campos.tarefasCasa}</h2>
      </div>
      <Filters value={filtro} onChange={setFiltro} counts={counts} />
      <div className="flex justify-end">
        <Link to="/config" className="btn-link text-xs">
          {LABELS.campos.config}
        </Link>
      </div>
      <TaskList tarefas={tarefas} filtro={filtro} onChange={refresh} />
    </div>
  );
};
