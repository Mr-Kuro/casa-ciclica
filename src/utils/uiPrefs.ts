export interface UIPrefs {
  mostrarInativas?: boolean;
  mostrarAtrasadas?: boolean;
}

const KEY = "uiPrefs";

export function loadUIPrefs(): UIPrefs {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UIPrefs;
  } catch {
    return {};
  }
}

export function saveUIPrefs(patch: Partial<UIPrefs>) {
  if (typeof localStorage === "undefined") return;
  try {
    const current = loadUIPrefs();
    const merged = { ...current, ...patch };
    localStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    /* ignore */
  }
}
