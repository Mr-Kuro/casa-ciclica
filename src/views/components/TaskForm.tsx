import React, { useState } from "react";
import { Recurrence } from "../../types";
import { taskController } from "../../controllers/TaskController";
import { Task } from "../../models/Task";

interface Props {
  onCreate(task: Task): void;
}

export const TaskForm: React.FC<Props> = ({ onCreate }) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [recorrencia, setRecorrencia] = useState<Recurrence>(Recurrence.DIARIA);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    const task = taskController.criar({ titulo, descricao, recorrencia });
    onCreate(task);
    setTitulo("");
    setDescricao("");
    setRecorrencia(Recurrence.DIARIA);
  }

  return (
    <form onSubmit={submit} className="space-y-3 card">
      <h2 className="font-semibold text-lg">Nova Tarefa</h2>
      <div>
        <label className="block text-sm mb-1">Título</label>
        <input
          className="input"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Descrição</label>
        <textarea
          className="input"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Recorrência</label>
        <select
          className="input"
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
        Adicionar
      </button>
    </form>
  );
};
