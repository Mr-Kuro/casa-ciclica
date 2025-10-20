import { Recurrence } from "../types";

export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  recorrencia: Recurrence;
  ativa: boolean;
  ultimaConclusao?: string; // ISO date
  proximaData?: string; // ISO date calculada
  diaSemana?: number; // 0=Domingo ... 6=Sabado (para tarefas semanais específicas)
}
