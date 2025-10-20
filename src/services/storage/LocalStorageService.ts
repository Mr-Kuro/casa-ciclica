import { Task } from "../../models/Task";

const STORAGE_KEY = "tarefas";

export class LocalStorageService {
  static listar(): Task[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Task[];
    } catch {
      return [];
    }
  }

  static salvar(tarefas: Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
  }

  static limpar(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
