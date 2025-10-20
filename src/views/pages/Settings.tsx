import React from "react";
import { LocalStorageService } from "../../services/storage/LocalStorageService";
import { Link } from "react-router-dom";
import { taskController } from "../../controllers/TaskController";

export const Settings: React.FC = () => {
  function limpar() {
    if (confirm("Limpar todas as tarefas?")) {
      LocalStorageService.limpar();
      alert("Dados apagados. Volte à página inicial para recriar.");
    }
  }

  function resetarSeeds() {
    if (confirm("Resetar seeds? Isto irá substituir as tarefas atuais.")) {
      taskController.resetSeeds();
      alert("Seeds recriadas. Vá para Início para ver as novas datas.");
    }
  }

  return (
    <div className="space-y-4 surface p-4 rounded">
      <Link to="/" className="btn-invert text-xs">
        Voltar
      </Link>
      <div className="surface-accent rounded p-4 space-y-2">
        <h2 className="font-semibold">Configurações</h2>
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
