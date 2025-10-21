import { Task } from "../models/Task";
import { Recurrence } from "../types";
import { LocalStorageService } from "../services/storage/LocalStorageService";
import { calcularProximaData } from "../utils/recurrence";
import { gerarSeed } from "../data/seed";

export class TaskController {
  private tarefas: Task[] = [];

  constructor() {
    this.tarefas = LocalStorageService.listar();
    if (this.tarefas.length === 0) {
      this.tarefas = gerarSeed();
      this.persistir();
    }
    this.hidratar();
  }

  private hidratar() {
    // Recalcula proximaData se estiver ausente
    let alterado = false;
    this.tarefas = this.tarefas.map((t) => {
      if (!t.proximaData) {
        alterado = true;
        return {
          ...t,
          proximaData: calcularProximaData(
            t.recorrencia,
            new Date(),
            t.diaSemana
          ),
          criadaEm: t.criadaEm || new Date().toISOString(),
        };
      }
      return { ...t, criadaEm: t.criadaEm || new Date().toISOString() };
    });
    if (alterado) this.persistir();
  }

  private persistir() {
    LocalStorageService.salvar(this.tarefas);
  }

  listar(): Task[] {
    return [...this.tarefas];
  }

  criar(data: Omit<Task, "id" | "proximaData" | "ativa">) {
    const nova: Task = {
      id: crypto.randomUUID(),
      titulo: data.titulo,
      descricao: data.descricao,
      recorrencia: data.recorrencia,
      ativa: true,
      ultimaConclusao: undefined,
      diaSemana: data.diaSemana,
      proximaData: calcularProximaData(
        data.recorrencia,
        new Date(),
        data.diaSemana
      ),
      criadaEm: new Date().toISOString(),
    };
    this.tarefas.push(nova);
    this.persistir();
    return nova;
  }

  atualizar(id: string, patch: Partial<Omit<Task, "id">>): Task | undefined {
    const idx = this.tarefas.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    const atual = this.tarefas[idx];
    const atualizado: Task = { ...atual, ...patch };
    if (patch.recorrencia) {
      atualizado.proximaData = calcularProximaData(
        patch.recorrencia,
        new Date(),
        patch.diaSemana ?? atualizado.diaSemana
      );
    } else if (
      typeof patch.diaSemana === "number" &&
      atualizado.recorrencia === Recurrence.SEMANAL
    ) {
      atualizado.proximaData = calcularProximaData(
        atualizado.recorrencia,
        new Date(),
        patch.diaSemana
      );
    }
    this.tarefas[idx] = atualizado;
    this.persistir();
    return atualizado;
  }

  remover(id: string) {
    this.tarefas = this.tarefas.filter((t) => t.id !== id);
    this.persistir();
  }

  concluirHoje(id: string) {
    const t = this.tarefas.find((x) => x.id === id);
    if (!t) return;
    const agora = new Date();
    t.ultimaConclusao = agora.toISOString();
    t.proximaData = calcularProximaData(t.recorrencia, agora, t.diaSemana);
    this.persistir();
  }

  alternarAtiva(id: string) {
    const t = this.tarefas.find((x) => x.id === id);
    if (!t) return;
    t.ativa = !t.ativa;
    this.persistir();
  }
}

export const taskController = new TaskController();
