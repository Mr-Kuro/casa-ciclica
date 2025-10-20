import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { taskController } from "../../controllers/TaskController";
import { calcularProximaData } from "../../utils/recurrence";
import { Recurrence } from "../../types";
import { LABELS } from "../../constants/strings";

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tarefa = taskController.listar().find((t) => t.id === id);

  if (!tarefa) {
    return (
      <div className="card">
        <p className="text-sm mb-4">{LABELS.feedback.tarefaNaoEncontrada}</p>
        <Link to="/" className="btn text-xs">
          {LABELS.navigation.voltar}
        </Link>
      </div>
    );
  }

  function alterarRecorrencia(r: Recurrence) {
    if (!tarefa) return;
    taskController.atualizar(tarefa.id, {
      recorrencia: r,
      proximaData: calcularProximaData(r, new Date(), tarefa.diaSemana),
    });
    navigate(0); // reload
  }

  return (
    <div className="space-y-4 surface p-4 rounded">
      <Link to="/" className="btn-invert text-xs">
        {LABELS.navigation.voltar}
      </Link>
      <div className="surface-accent rounded p-4 space-y-2">
        <h2 className="font-semibold">{tarefa.titulo}</h2>
        {tarefa.descricao && (
          <p className="text-sm text-muted">{tarefa.descricao}</p>
        )}
        <p className="text-xs">
          {LABELS.campos.recorrencia}: {tarefa.recorrencia}
        </p>
        <p className="text-xs">
          {LABELS.campos.proxima} data:{" "}
          {tarefa.proximaData
            ? new Date(tarefa.proximaData).toLocaleDateString()
            : "—"}
        </p>
        <p className="text-xs">
          {LABELS.campos.ultimaConclusao.toLowerCase()}:{" "}
          {tarefa.ultimaConclusao
            ? new Date(tarefa.ultimaConclusao).toLocaleDateString()
            : "—"}
        </p>
        <div className="flex gap-2 flex-wrap">
          {Object.values(Recurrence).map((r) => (
            <button
              key={r}
              onClick={() => alterarRecorrencia(r)}
              className="btn btn-primary text-xs"
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
