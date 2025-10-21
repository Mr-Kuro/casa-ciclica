import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { taskController } from "../../controllers/TaskController";
import { calcularProximaData } from "../../utils/recurrence";
import { Recurrence } from "../../types";
import { LABELS } from "../../constants/strings";
import {
  diasDesdeCriacao,
  diasDesdeUltimaConclusao,
  diasAteProxima,
  descricaoRecorrencia,
  statusRecorrencia,
} from "../../utils/analytics";

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

  const diasCriacao = diasDesdeCriacao(tarefa);
  const diasUltima = diasDesdeUltimaConclusao(tarefa);
  const diasProxima = diasAteProxima(tarefa);
  const descRec = descricaoRecorrencia(tarefa);
  const statusRec = statusRecorrencia(tarefa);

  return (
    <div className="space-y-6 surface p-4 rounded">
      <Link to="/" className="btn-invert text-xs">
        {LABELS.navigation.voltar}
      </Link>
      <div className="surface-accent rounded p-4 space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h2 className="font-semibold text-lg">{tarefa.titulo}</h2>
            {tarefa.descricao && (
              <p className="text-sm text-muted max-w-prose">
                {tarefa.descricao}
              </p>
            )}
            <div className="flex gap-2 flex-wrap text-[11px]">
              <span className="inline-flex items-center gap-1 rounded px-2 py-1 bg-gray-200 dark:bg-gray-700">
                {tarefa.recorrencia}
                {tarefa.recorrencia === Recurrence.SEMANAL && typeof tarefa.diaSemana === "number" && (
                  <span className="opacity-70">· {LABELS.diasSemanaCurto[tarefa.diaSemana]}</span>
                )}
              </span>
              <span className="inline-flex items-center gap-1 rounded px-2 py-1 bg-gray-200 dark:bg-gray-700">
                {descRec}
              </span>
              {tarefa.criadaEm && (
                <span className="inline-flex items-center gap-1 rounded px-2 py-1 bg-gray-100 dark:bg-gray-800">
                  Criada {new Date(tarefa.criadaEm).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
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
        <div className="grid md:grid-cols-3 gap-3 text-xs">
          <div className="p-2 rounded border bg-white/50 dark:bg-gray-900/30">
            <p className="font-medium">Próxima ocorrência</p>
            <p>
              {tarefa.proximaData
                ? new Date(tarefa.proximaData).toLocaleDateString()
                : "—"}
            </p>
            <p className="text-[11px] text-muted">{statusRec}</p>
          </div>
          <div className="p-2 rounded border bg-white/50 dark:bg-gray-900/30">
            <p className="font-medium">Última conclusão</p>
            <p>
              {tarefa.ultimaConclusao
                ? new Date(tarefa.ultimaConclusao).toLocaleDateString()
                : "—"}
            </p>
            <p className="text-[11px] text-muted">
              {diasUltima !== null
                ? diasUltima === 0
                  ? "Hoje"
                  : `${diasUltima} dia(s) atrás`
                : "Nunca concluída"}
            </p>
          </div>
            <div className="p-2 rounded border bg-white/50 dark:bg-gray-900/30">
              <p className="font-medium">Criada</p>
              <p>{tarefa.criadaEm ? new Date(tarefa.criadaEm).toLocaleDateString() : "—"}</p>
              <p className="text-[11px] text-muted">
                {diasCriacao !== null ? `${diasCriacao} dia(s) atrás` : "—"}
              </p>
            </div>
        </div>
        {tarefa.recorrencia !== Recurrence.DIARIA && (
          <div className="text-[11px] text-muted">
            {diasProxima !== null && diasProxima < 0 && (
              <span className="text-red-600">Atrasada {Math.abs(diasProxima)} dia(s).</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
