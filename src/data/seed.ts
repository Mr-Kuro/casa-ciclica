import { Recurrence } from "../types";
import { Task } from "../models/Task";
import { calcularProximaData } from "../utils/recurrence";

// Configuração de âncoras (podem ser sobrescritas via localStorage)
export interface SeedAnchors {
  quinzena1: number; // 1..15
  quinzena2: number; // 16..31
  mensal1: number; // 1..15
  mensal2: number; // 16..31
}

const DEFAULT_ANCHORS: SeedAnchors = {
  quinzena1: 10,
  quinzena2: 20,
  mensal1: 15,
  mensal2: 28,
};

export function computeAnchors(
  hoje: Date,
  overrides?: Partial<SeedAnchors>
): SeedAnchors {
  const merged: SeedAnchors = { ...DEFAULT_ANCHORS, ...(overrides || {}) };
  // sanidade: clamp valores
  function clamp(v: number, min: number, max: number) {
    return Math.min(Math.max(v, min), max);
  }
  merged.quinzena1 = clamp(merged.quinzena1, 1, 15);
  merged.quinzena2 = clamp(merged.quinzena2, 16, 31);
  merged.mensal1 = clamp(merged.mensal1, 1, 15);
  merged.mensal2 = clamp(merged.mensal2, 16, 31);
  return merged;
}

function loadAnchors(): SeedAnchors {
  if (typeof localStorage === "undefined") return DEFAULT_ANCHORS; // testes / SSR
  try {
    const raw = localStorage.getItem("seedAnchors");
    if (!raw) return DEFAULT_ANCHORS;
    const parsed = JSON.parse(raw);
    return computeAnchors(new Date(), parsed);
  } catch {
    return DEFAULT_ANCHORS;
  }
}

// Mapeamento de dias da semana PT -> number
// Segunda=1 Terça=2 Quarta=3 Quinta=4 Sexta=5 (Domingo=0 Sábado=6)

// Evitar capturar "hoje" no topo para permitir regeneração dinâmica

function seedDiarias(hoje: Date): Task[] {
  const itens = [
    "Arrumar a cama",
    "Varrer ou aspirar o chão",
    "Lavar e guardar as louças",
    "Limpar a pia e o fogão",
    "Passar o pano na cama",
    "Guardar o que estiver fora do lugar",
    "Retirar o lixo",
  ];
  return itens.map((t) => ({
    id: crypto.randomUUID(),
    titulo: t,
    recorrencia: Recurrence.DIARIA,
    ativa: true,
    proximaData: calcularProximaData(Recurrence.DIARIA, hoje),
  }));
}

function semanal(hoje: Date, diaSemana: number, tarefas: string[]): Task[] {
  return tarefas.map((t) => ({
    id: crypto.randomUUID(),
    titulo: t,
    recorrencia: Recurrence.SEMANAL,
    diaSemana,
    ativa: true,
    proximaData: calcularProximaData(Recurrence.SEMANAL, hoje, diaSemana),
  }));
}

function seedSemanais(hoje: Date): Task[] {
  return [
    ...semanal(hoje, 1, [
      // Segunda
      "Trocar e lavar roupas de cama",
      "Aspirar tapetes e estofados",
      "Limpeza de superfícies (mesas, bancadas, prateleiras)",
      "Higienizar vaso sanitário, pia e box",
    ]),
    ...semanal(hoje, 2, [
      // Terça
      "Organizar o guarda-roupa",
      "Passar pano",
      "Lavar as roupas",
      "Fazer lista de compras",
    ]),
    ...semanal(hoje, 3, [
      // Quarta
      "Limpar eletrodomésticos",
      "Passar pano húmido nas superfícies",
      "Limpar janelas",
      "Limpar espelhos",
    ]),
    ...semanal(hoje, 4, [
      // Quinta
      "Lavar toalhas e panos de prato",
      "Limpar a máquina de lavar",
      "Limpar a área de serviço",
    ]),
    ...semanal(hoje, 5, [
      // Sexta
      "Lavar o banheiro",
      "Limpar portas, maçanetas e interruptores",
      "Passar pano húmido em rodapés",
      "Limpar varanda ou quintal",
    ]),
  ];
}

function seedQuinzenais(hoje: Date, anchors: SeedAnchors): Task[] {
  const itens = [
    "Trocar todas as roupas de cama e fronhas.",
    "Lavar capas de almofadas e cortinas leves.",
    "Limpar rodapés e cantos com pano úmido.",
    "Higienizar lixeiras (cozinha e banheiros).",
    "Limpar ventiladores e filtros simples de ar-condicionado.",
    "Desinfetar maçanetas, interruptores e controles remotos.",
    "Higienizar brinquedos, objetos de uso frequente e tapetes pequenos.",
    "Organizar e checar despensa por prazo de validade.",
  ];
  // Garantir que proximaData esteja na quinzena atual: se cálculo cair na próxima quinzena, ajustar para hoje.
  const hojeDia = hoje.getDate();
  const primeiraQuinzena = hojeDia <= 15;
  const anchorDay = primeiraQuinzena ? anchors.quinzena1 : anchors.quinzena2;
  return itens.map((t) => {
    // Próxima data dentro da quinzena atual fixa em anchorDay
    const prox = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      anchorDay
    ).toISOString();
    return {
      id: crypto.randomUUID(),
      titulo: t,
      recorrencia: Recurrence.QUINZENAL,
      ativa: true,
      proximaData: prox,
    };
  });
}

function seedMensais(hoje: Date, anchors: SeedAnchors): Task[] {
  const itens = [
    "Limpeza profunda de tapetes e carpetes (aspirar com força e, se possível, lavar a seco ou com máquina).",
    "Limpar estofados com aspirador ou produto específico.",
    "Lavar cortinas pesadas.",
    "Limpar geladeira por dentro e remover alimentos vencidos; limpar borrachas.",
    "Limpeza profunda do banheiro: rejuntes, box, ralos e desincrustação se necessário.",
    "Limpar coifa, exaustor e filtros do fogão.",
    "Limpar dentro de armários e gavetas (cozinha e banheiros) e reorganizar.",
    "Limpar paredes e rodapés mais altos, trocar lâmpadas queimadas.",
    "Limpeza externa de janela e varandas; varrer quintal e recolher folhas.",
  ];
  const hojeDia = hoje.getDate();
  const anchorDay = hojeDia <= 15 ? anchors.mensal1 : anchors.mensal2;
  return itens.map((t) => ({
    id: crypto.randomUUID(),
    titulo: t,
    recorrencia: Recurrence.MENSAL,
    ativa: true,
    proximaData: new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      anchorDay
    ).toISOString(),
  }));
}

export function gerarSeed(): Task[] {
  const hoje = new Date();
  const anchors = loadAnchors();
  return [
    ...seedDiarias(hoje),
    ...seedSemanais(hoje),
    ...seedQuinzenais(hoje, anchors),
    ...seedMensais(hoje, anchors),
  ];
}
