import React, { useState } from "react";
import { Recurrence } from "../../types";
import { taskController } from "../../controllers/TaskController";
import { Task } from "../../models/Task";
import { LABELS } from "../../constants/strings";
import { useToast } from "./toast/ToastContext";

interface Props {
  onCreate(task: Task): void;
}

export const TaskForm: React.FC<Props> = ({ onCreate }) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [recorrencia, setRecorrencia] = useState<Recurrence>(Recurrence.DIARIA);
  const { push } = useToast();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    const task = taskController.criar({ titulo, descricao, recorrencia });
    onCreate(task);
    setTitulo("");
    setDescricao("");
    setRecorrencia(Recurrence.DIARIA);
    push({ message: LABELS.feedback.toastTarefaCriada, type: "success" });
  }

  return (
    <form onSubmit={submit} className="space-y-3 card">
      <h2 className="font-semibold text-lg">{LABELS.campos.novaTarefa}</h2>
      <div>
        <label className="block text-sm mb-1">{LABELS.campos.titulo}</label>
        <input
          className="input max-w-[640px]"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">{LABELS.campos.descricao}</label>
        <textarea
          className="input"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">
          {LABELS.campos.recorrencia}
        </label>
        <select
          className="input max-w-[140px]"
          value={recorrencia}
          onChange={(e) => setRecorrencia(e.target.value as Recurrence)}
        >
          {Object.values(Recurrence).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn">
        {LABELS.actions.adicionar}
      </button>
    </form>
  );
};
