import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  const [tarefa, setTarefa] = useState(() =>
    taskController.listar().find((t) => t.id === id)
  );
  // função util para sincronizar estado após update sem reload
  function refreshLocal() {
    setTarefa(taskController.listar().find((t) => t?.id === id));
  }

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
    // Se houver edição em andamento e campos modificados, pedir confirmação
    const editMudou =
      editando &&
      (tituloDraft !== tarefa.titulo ||
        descricaoDraft !== (tarefa.descricao || ""));
    if (editMudou) {
      const confirmar = confirm(
        "Você tem alterações não salvas. Trocar recorrência descarta essas mudanças. Continuar?"
      );
      if (!confirmar) return;
      cancelarEdicao(true); // descarta sem segundo prompt
    }
    taskController.atualizar(tarefa.id, {
      recorrencia: r,
      proximaData: calcularProximaData(r, new Date(), tarefa.diaSemana),
    });
    refreshLocal();
  }
  function alterarDiaSemana(dia: number) {
    if (!tarefa) return;
    const editMudou =
      editando &&
      (tituloDraft !== tarefa.titulo ||
        descricaoDraft !== (tarefa.descricao || ""));
    if (editMudou) {
      const confirmar = confirm(
        "Você tem alterações não salvas. Trocar o dia descarta essas mudanças. Continuar?"
      );
      if (!confirmar) return;
      cancelarEdicao(true);
    }
    // Atualiza diaSemana e recalcula próxima data para semanal
    taskController.atualizar(tarefa.id, {
      diaSemana: dia,
      proximaData: calcularProximaData(tarefa.recorrencia, new Date(), dia),
    });
    refreshLocal();
  }

  const diasCriacao = diasDesdeCriacao(tarefa);
  const diasUltima = diasDesdeUltimaConclusao(tarefa);
  const diasProxima = diasAteProxima(tarefa);
  const descRec = descricaoRecorrencia(tarefa);
  const statusRec = statusRecorrencia(tarefa);
  // Edit state
  const [editando, setEditando] = useState(false);
  const [tituloDraft, setTituloDraft] = useState(tarefa.titulo);
  const [descricaoDraft, setDescricaoDraft] = useState(tarefa.descricao || "");

  function iniciarEdicao() {
    if (!tarefa) return;
    setTituloDraft(tarefa.titulo);
    setDescricaoDraft(tarefa.descricao || "");
    setEditando(true);
  }
  function cancelarEdicao(skipPrompt?: boolean) {
    if (!skipPrompt) {
      const mudou =
        tituloDraft !== tarefa?.titulo ||
        descricaoDraft !== (tarefa?.descricao || "");
      if (mudou) {
        const confirma = confirm("Descartar alterações?");
        if (!confirma) return;
      }
    }
    setEditando(false);
    if (!tarefa) return;
    setTituloDraft(tarefa.titulo);
    setDescricaoDraft(tarefa.descricao || "");
  }
  function salvarEdicao() {
    if (!tarefa) return;
    const novoTitulo = tituloDraft.trim();
    const novaDescricao = descricaoDraft.trim();
    if (!novoTitulo) return; // evitar título vazio
    taskController.atualizar(tarefa.id, {
      titulo: novoTitulo,
      descricao: novaDescricao.length ? novaDescricao : undefined,
    });
    setEditando(false);
    refreshLocal();
  }

  return (
    <div className="space-y-6 surface p-4 rounded">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link
          to="/"
          className="btn-invert text-xs hover:no-underline"
          aria-label="Voltar para lista"
        >
          {LABELS.navigation.voltar}
        </Link>
        <div className="flex gap-2 flex-wrap">
          {Object.values(Recurrence).map((r) => (
            <button
              key={r}
              onClick={() => alterarRecorrencia(r)}
              className={`btn text-xs px-2 py-1 ${
                tarefa.recorrencia === r ? "ring-2 ring-offset-1" : ""
              }`}
              aria-pressed={tarefa.recorrencia === r}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="surface-accent rounded p-4 space-y-4">
        <header className="space-y-2">
          {!editando && (
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h2 className="font-semibold text-lg leading-tight flex items-center flex-wrap gap-2">
                {tarefa.titulo}
                {!tarefa.ativa && (
                  <span
                    className="badge-overdue opacity-80"
                    title="Tarefa desativada"
                  >
                    Inativa
                  </span>
                )}
                {tarefa.ultimaConclusao && diasUltima === 0 && (
                  <span className="badge-completed" title="Concluída hoje">
                    Concluída hoje
                  </span>
                )}
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={iniciarEdicao}
                  className="btn-invert text-[11px]"
                >
                  Editar
                </button>
              </div>
            </div>
          )}
          {editando && (
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium" htmlFor="tituloEdit">
                  Título
                </label>
                <input
                  id="tituloEdit"
                  value={tituloDraft}
                  onChange={(e) => setTituloDraft(e.target.value)}
                  className="input text-sm"
                  maxLength={140}
                  placeholder="Título da tarefa"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium" htmlFor="descricaoEdit">
                  Descrição (opcional)
                </label>
                <textarea
                  id="descricaoEdit"
                  value={descricaoDraft}
                  onChange={(e) => setDescricaoDraft(e.target.value)}
                  className="input text-sm min-h-[90px] resize-y"
                  placeholder="Detalhes, observações, passos..."
                />
              </div>
              <div className="flex gap-2 flex-wrap text-[11px]">
                <button
                  type="button"
                  onClick={salvarEdicao}
                  className="btn-success btn px-3 py-1"
                  disabled={!tituloDraft.trim()}
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => cancelarEdicao()}
                  className="btn-invert px-3 py-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {!editando && tarefa.descricao && (
            <p className="text-sm text-subtle max-w-prose leading-relaxed">
              {tarefa.descricao}
            </p>
          )}
          {!editando && !tarefa.descricao && (
            <p className="text-xs italic text-subtle">
              Nenhuma descrição. Clique em Editar para adicionar.
            </p>
          )}
          <div className="flex gap-2 flex-wrap text-[11px]">
            <span className="inline-flex items-center gap-1 rounded px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              {tarefa.recorrencia}
              {tarefa.recorrencia === Recurrence.SEMANAL &&
                typeof tarefa.diaSemana === "number" && (
                  <span className="opacity-70">
                    · {LABELS.diasSemanaCurto[tarefa.diaSemana]}
                  </span>
                )}
            </span>
            <span className="inline-flex items-center gap-1 rounded px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              {descRec}
            </span>
            {tarefa.criadaEm && (
              <span className="inline-flex items-center gap-1 rounded px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                Criada {new Date(tarefa.criadaEm).toLocaleDateString()}
              </span>
            )}
            {tarefa.proximaData && (
              <span className="inline-flex items-center gap-1 rounded px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                Próxima {new Date(tarefa.proximaData).toLocaleDateString()}
              </span>
            )}
          </div>
        </header>
        <section className="grid md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded border bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm">
            <p className="font-medium">Próxima ocorrência</p>
            <p className="text-sm">
              {tarefa.proximaData
                ? new Date(tarefa.proximaData).toLocaleDateString()
                : "—"}
            </p>
            <p className="text-[11px] text-muted">{statusRec}</p>
          </div>
          <div className="p-3 rounded border bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm">
            <p className="font-medium">Última conclusão</p>
            <p className="text-sm">
              {tarefa.ultimaConclusao
                ? new Date(tarefa.ultimaConclusao).toLocaleDateString()
                : "—"}
            </p>
            <p className="text-[11px] text-muted">
              {diasUltima !== null
                ? diasUltima === 0
                  ? "Hoje"
                  : `${LABELS.feedback.unidadeDia(diasUltima)} atrás`
                : "Nunca concluída"}
            </p>
          </div>
          <div className="p-3 rounded border bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm">
            <p className="font-medium">Criada</p>
            <p className="text-sm">
              {tarefa.criadaEm
                ? new Date(tarefa.criadaEm).toLocaleDateString()
                : "—"}
            </p>
            <p className="text-[11px] text-muted">
              {diasCriacao !== null
                ? `${LABELS.feedback.unidadeDia(diasCriacao)} atrás`
                : "—"}
            </p>
          </div>
        </section>
        {tarefa.recorrencia === Recurrence.SEMANAL && (
          <section className="space-y-2">
            <p className="text-xs font-medium">Alterar dia da semana</p>
            <div className="flex flex-wrap gap-2">
              {LABELS.diasSemanaCurto.map((diaLabel, idx) => (
                <button
                  key={idx}
                  onClick={() => alterarDiaSemana(idx)}
                  className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                    tarefa.diaSemana === idx
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  aria-pressed={tarefa.diaSemana === idx}
                  title={`Definir para ${diaLabel}`}
                >
                  {diaLabel}
                </button>
              ))}
            </div>
          </section>
        )}
        {tarefa.recorrencia !== Recurrence.DIARIA && (
          <div className="text-[11px] text-muted">
            {diasProxima !== null && diasProxima < 0 && (
              <span className="text-red-600 dark:text-red-400">
                Atrasada {LABELS.feedback.unidadeDia(Math.abs(diasProxima))}.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
