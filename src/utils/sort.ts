import { Task } from "../models/Task";

export type TaskSortKey =
  | "titulo"
  | "recorrencia"
  | "diaSemana"
  | "proxima"
  | "ultima";

function valueFor(task: Task, key: TaskSortKey): number | string {
  switch (key) {
    case "titulo":
      return task.titulo.toLowerCase();
    case "recorrencia":
      return task.recorrencia.toLowerCase();
    case "diaSemana":
      // Semanal usa diaSemana; diária fica antes (-1); outras recorrências empurradas para fim (99)
      if (task.recorrencia === "DIARIA") return -1;
      if (task.recorrencia === "SEMANAL" && typeof task.diaSemana === "number")
        return task.diaSemana;
      return 99;
    case "proxima":
      return task.proximaData
        ? new Date(task.proximaData).getTime()
        : Number.POSITIVE_INFINITY;
    case "ultima":
      return task.ultimaConclusao
        ? new Date(task.ultimaConclusao).getTime()
        : 0;
    default:
      return "";
  }
}

export function sortTasks(
  tasks: Task[],
  key: TaskSortKey,
  dir: "asc" | "desc"
): Task[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...tasks].sort((a, b) => {
    const va = valueFor(a, key);
    const vb = valueFor(b, key);
    if (typeof va === "string" && typeof vb === "string") {
      return va.localeCompare(vb, "pt-BR", { sensitivity: "base" }) * mult;
    }
    if (typeof va === "number" && typeof vb === "number") {
      return (va - vb) * mult;
    }
    // fallback convert to string
    return String(va).localeCompare(String(vb)) * mult;
  });
}
