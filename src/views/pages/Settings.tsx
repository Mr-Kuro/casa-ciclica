import React from "react";
import { LocalStorageService } from "../../services/storage/LocalStorageService";
import { Link } from "react-router-dom";
import { LABELS } from "../../constants/strings";
import { taskController } from "../../controllers/TaskController";

export const Settings: React.FC = () => {
  function limpar() {
    if (confirm(LABELS.confirm.limparTudo)) {
      LocalStorageService.limpar();
      alert(LABELS.feedback.limparAviso);
    }
  }

  function resetarSeeds() {
    if (confirm(LABELS.confirm.resetSeeds)) {
      taskController.resetSeeds();
      alert(LABELS.feedback.seedsResetAviso);
    }
  }

  return (
    <div className="space-y-4 surface p-4 rounded">
      <Link to="/" className="btn-invert text-xs">
        {LABELS.navigation.voltar}
      </Link>
      <div className="surface-accent rounded p-4 space-y-2">
        <h2 className="font-semibold">{LABELS.campos.config}</h2>
        <div className="flex flex-col gap-2">
          <button onClick={limpar} className="btn btn-danger">
            Limpar LocalStorage
          </button>
          <button onClick={resetarSeeds} className="btn btn-primary">
            Resetar Seeds
          </button>
        </div>
      </div>
    </div>
  );
};
