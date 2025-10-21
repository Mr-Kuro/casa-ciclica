export interface SortPrefs {
  key: string;
  dir: "asc" | "desc";
}

const STORAGE_KEY = "taskSortPrefs";

export function loadSortPrefs(): SortPrefs | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed &&
      typeof parsed.key === "string" &&
      (parsed.dir === "asc" || parsed.dir === "desc")
    ) {
      return { key: parsed.key, dir: parsed.dir };
    }
  } catch {
    // ignore parse errors
  }
  return undefined;
}

export function saveSortPrefs(prefs: SortPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore write errors
  }
}
