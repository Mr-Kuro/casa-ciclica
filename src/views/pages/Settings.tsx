import React from "react";
import { LocalStorageService } from "../../services/storage/LocalStorageService";
import { Link, useNavigate } from "react-router-dom";
import { taskController } from "@controllers/TaskController";
import { LABELS } from "../../constants/strings";
import { useToast } from "@molecules/toast/ToastContext";
// Removido reset de seeds por ser redundante com limpeza total

export const Settings: React.FC = () => {
  const { push } = useToast();
  const navigate = useNavigate();
  function limpar() {
    if (confirm(LABELS.confirm.limparTudo)) {
      LocalStorageService.limpar();
      taskController.resetSeeds();
      push({ message: LABELS.feedback.toastLimpeza, type: "info" });
      navigate("/", { replace: true });
    }
  }

  // resetarSeeds removido

  return (
    <div className="space-y-4 surface p-4 rounded">
      <Link to="/" className="btn-invert text-xs">
        {LABELS.navigation.voltar}
      </Link>
      <div className="surface-accent rounded p-4 space-y-2">
        <h2 className="font-semibold">{LABELS.campos.config}</h2>
        <div className="flex flex-col gap-3">
          <button onClick={limpar} className="btn btn-danger">
            DELETAR dados
          </button>
          <p className="text-xs text-subtle leading-snug max-w-prose">
            Ação irreversível: remove todas as tarefas salvas no navegador e
            recria automaticamente o conjunto inicial padrão (seeds) quando a
            aplicação iniciar novamente. Use somente se quiser começar do zero.
          </p>
        </div>
      </div>
    </div>
  );
};
