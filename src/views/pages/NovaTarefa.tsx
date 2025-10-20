import React from "react";
import { TaskForm } from "../components/TaskForm";
import { taskController } from "../../controllers/TaskController";

export const NovaTarefa: React.FC = () => {
  function handleCreate() {
    // após criação poderíamos redirecionar; simples refresh por enquanto
  }
  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-lg font-semibold">Nova Tarefa</h2>
      <TaskForm onCreate={handleCreate} />
    </div>
  );
};
