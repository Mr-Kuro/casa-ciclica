import React, { useEffect, useState } from "react";
import { taskController } from "../../controllers/TaskController";
import { Task } from "../../models/Task";
import { TaskList } from "../components/TaskList";
import { Filters } from "../components/Filters";
import { Quote } from "../components/Quote";
import { useTaskCounts } from "../../hooks/useTaskCounts";

export const Home: React.FC = () => {
  const [tarefas, setTarefas] = useState<Task[]>(taskController.listar());
  const [filtro, setFiltro] = useState<"HOJE" | "QUINZENA" | "MES">("HOJE");

  function refresh() {
    setTarefas(taskController.listar());
  }

  useEffect(() => {
    // listeners para eventos globais
    window.addEventListener('tasks:reset', refresh);
    window.addEventListener('anchors:updated', refresh);
    return () => {
      window.removeEventListener('tasks:reset', refresh);
      window.removeEventListener('anchors:updated', refresh);
    };
  }, []);

  const counts = useTaskCounts(tarefas);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Tarefas da Casa</h2>
        <Quote />
      </div>
      <Filters value={filtro} onChange={setFiltro} counts={counts} />
      <TaskList tarefas={tarefas} filtro={filtro} onChange={refresh} />
    </div>
  );
};
