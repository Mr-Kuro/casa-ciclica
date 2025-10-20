import React from "react";
import { Task } from "../../models/Task";
import { Link } from "react-router-dom";
import { taskController } from "../../controllers/TaskController";
import { devidoHoje } from "../../utils/recurrence";
import { LABELS } from "../../constants/strings";

interface Props {
  task: Task;
  onChange(): void;
}

export const TaskItem: React.FC<Props> = ({ task, onChange }) => {
  function concluir() {
    taskController.concluirHoje(task.id);
    onChange();
  }
  function alternar() {
    taskController.alternarAtiva(task.id);
    onChange();
  }
  function remover() {
    if (confirm("Remover tarefa?")) {
      taskController.remover(task.id);
      onChange();
    }
  }

  const hoje = devidoHoje(task.proximaData);

  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return (
    <div className="card flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm">
          <Link to={`/tarefas/${task.id}`} className="hover:underline">
            {task.titulo}
          </Link>
        </h3>
        <span className="text-xs px-2 py-1 rounded bg-gray-100 flex gap-1 items-center">
          <span>{task.recorrencia}</span>
          {typeof task.diaSemana === "number" &&
            task.recorrencia === "SEMANAL" && (
              <span className="text-[10px] text-gray-600">
                ({dias[task.diaSemana]})
              </span>
            )}
        </span>
      </div>
      {task.descricao && (
        <p className="text-xs text-gray-600">{task.descricao}</p>
      )}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={concluir}
          disabled={!hoje || !task.ativa}
          className="btn text-xs"
        >
          {LABELS.actions.concluirHoje}
        </button>
        <button
          onClick={alternar}
          className={`btn text-xs bg-yellow-600 hover:bg-yellow-700 ${
            !task.ativa ? "btn-reativar-emphasis" : ""
          }`}
        >
          {task.ativa ? LABELS.actions.desativar : LABELS.actions.reativar}
        </button>
        <button
          onClick={remover}
          className="btn text-xs bg-red-600 hover:bg-red-700"
        >
          {LABELS.actions.remover}
        </button>
      </div>
      <div className="text-[10px] text-gray-500 flex justify-between">
        <span>
          Próx:{" "}
          {task.proximaData
            ? new Date(task.proximaData).toLocaleDateString()
            : "—"}
        </span>
        <span>
          Última:{" "}
          {task.ultimaConclusao
            ? new Date(task.ultimaConclusao).toLocaleDateString()
            : "—"}
        </span>
      </div>
    </div>
  );
};
