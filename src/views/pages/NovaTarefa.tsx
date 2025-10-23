import React from "react";
import { TaskForm } from "@organisms/TaskForm";
import { taskController } from "@controllers/TaskController";
import { Link } from "react-router-dom";
import { LABELS } from "@constants/strings";

export const NovaTarefa: React.FC = () => {
  function handleCreate() {
    // após criação poderíamos redirecionar; simples refresh por enquanto
  }
  return (
    <div className="space-y-6 w-full  mx-auto surface p-6 rounded">
      <Link to="/" className="btn-invert text-xs">
        {LABELS.navigation.voltar}
      </Link>
      <h2 className="text-lg font-semibold">{LABELS.campos.novaTarefa}</h2>
      <TaskForm onCreate={handleCreate} />
    </div>
  );
};
