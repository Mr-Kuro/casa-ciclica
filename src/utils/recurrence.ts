import { Recurrence } from "../types";

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function nextWeeklyOccurrence(
  targetWeekday: number,
  base: Date = new Date()
): Date {
  // targetWeekday: 0=Dom ... 6=Sáb (Date.getDay padrão)
  const current = base.getDay();
  let delta = targetWeekday - current;
  if (delta <= 0) delta += 7; // se hoje já passou ou é hoje, agenda próxima semana
  const copy = new Date(base.getTime());
  copy.setDate(copy.getDate() + delta);
  return copy;
}

export function calcularProximaData(
  recorrencia: Recurrence,
  base: Date = new Date(),
  diaSemana?: number
): string {
  const b = new Date(base.getTime());
  if (recorrencia === Recurrence.SEMANAL && typeof diaSemana === "number") {
    return nextWeeklyOccurrence(diaSemana, b).toISOString();
  }
  let dias = 1;
  if (recorrencia === Recurrence.SEMANAL) dias = 7;
  else if (recorrencia === Recurrence.QUINZENAL) dias = 14;
  else if (recorrencia === Recurrence.MENSAL) {
    const targetDay = b.getDate();
    const baseMonth = b.getMonth();
    const tentative = new Date(b.getTime());
    tentative.setMonth(baseMonth + 1, targetDay);
    if (
      tentative.getMonth() === (baseMonth + 1) % 12 &&
      tentative.getDate() === targetDay
    ) {
      return tentative.toISOString();
    }
    // Overflow: pegar último dia do mês seguinte
    const lastDay = new Date(b.getFullYear(), baseMonth + 2, 0); // dia 0 do mês +2 = último dia do mês +1
    return lastDay.toISOString();
  }
  return addDays(b, dias).toISOString();
}

export function devidoHoje(proximaData?: string): boolean {
  if (!proximaData) return false;
  const hoje = new Date();
  const d = new Date(proximaData);
  return (
    d.getFullYear() === hoje.getFullYear() &&
    d.getMonth() === hoje.getMonth() &&
    d.getDate() === hoje.getDate()
  );
}
export function dentroDaQuinzenaAtual(proximaData?: string): boolean {
  if (!proximaData) return false;
  const d = new Date(proximaData);
  const hoje = new Date();
  if (
    d.getFullYear() !== hoje.getFullYear() ||
    d.getMonth() !== hoje.getMonth()
  )
    return false;
  const dia = d.getDate();
  const limite = hoje.getDate() <= 15 ? 15 : 31; // considera segunda quinzena completa até fim do mês
  if (hoje.getDate() <= 15) return dia <= 15; // primeira quinzena
  return dia > 15 && dia <= limite;
}

export function dentroDoMesAtual(proximaData?: string): boolean {
  if (!proximaData) return false;
  const d = new Date(proximaData);
  const hoje = new Date();
  return (
    d.getFullYear() === hoje.getFullYear() && d.getMonth() === hoje.getMonth()
  );
}

export function mesmoDiaSemanaHoje(diaSemana?: number): boolean {
  if (typeof diaSemana !== "number") return false;
  return new Date().getDay() === diaSemana;
}

export function naoConcluidaHoje(task: { ultimaConclusao?: string }): boolean {
  if (!task.ultimaConclusao) return true;
  const ultima = new Date(task.ultimaConclusao);
  const hoje = new Date();
  return !(
    ultima.getFullYear() === hoje.getFullYear() &&
    ultima.getMonth() === hoje.getMonth() &&
    ultima.getDate() === hoje.getDate()
  );
}
