import React, { useState } from "react";
import { Recurrence } from "../../types"; // usar caminho relativo até definirmos alias @types
import { taskController } from "@controllers/TaskController";
import { Task } from "@models/Task";
import { LABELS } from "@constants/strings";
import { useToast } from "@molecules/toast/ToastContext"; // migrado para moléculas

interface Props {
  onCreate(task: Task): void;
}

export const TaskForm: React.FC<Props> = ({ onCreate }) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [recorrencia, setRecorrencia] = useState<Recurrence>(Recurrence.DIARIA);
  const [diaSemana, setDiaSemana] = useState<number | undefined>(undefined);
  const { push } = useToast();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    if (recorrencia === Recurrence.SEMANAL && typeof diaSemana !== "number") {
      push({ message: "Selecione o dia da semana.", type: "warning" });
      return;
    }
    const task = taskController.criar({
      titulo,
      descricao,
      recorrencia,
      diaSemana: recorrencia === Recurrence.SEMANAL ? diaSemana : undefined,
    });
    onCreate(task);
    setTitulo("");
    setDescricao("");
    setRecorrencia(Recurrence.DIARIA);
    setDiaSemana(undefined);
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
          {(Object.values(Recurrence) as Recurrence[]).map((r: Recurrence) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      {recorrencia === Recurrence.SEMANAL && (
        <div>
          <label className="block text-sm mb-1">
            {LABELS.campos.diaSemana}
          </label>
          <select
            className="input max-w-[200px]"
            value={diaSemana === undefined ? "" : diaSemana}
            onChange={(e) =>
              setDiaSemana(
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
          >
            <option value="">Selecione...</option>
            {LABELS.diasSemanaLongo.map((d, idx) => (
              <option key={idx} value={idx}>
                {d}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        type="submit"
        className="btn"
        disabled={recorrencia === Recurrence.SEMANAL && diaSemana === undefined}
        aria-disabled={
          recorrencia === Recurrence.SEMANAL && diaSemana === undefined
        }
      >
        {LABELS.actions.adicionar}
      </button>
    </form>
  );
};
