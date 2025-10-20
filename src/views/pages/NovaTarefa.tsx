import React from "react";
import { TaskForm } from "../components/TaskForm";
import { taskController } from "../../controllers/TaskController";
import { Link } from "react-router-dom";

export const NovaTarefa: React.FC = () => {
  function handleCreate() {
    // após criação poderíamos redirecionar; simples refresh por enquanto
  }
  return (
    <div className="space-y-6 max-w-xl surface p-4 rounded">
      <Link to="/" className="btn-invert text-xs">
        Voltar
      </Link>
      <h2 className="text-lg font-semibold">Nova Tarefa</h2>
      <TaskForm onCreate={handleCreate} />
    </div>
  );
};
