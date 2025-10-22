export type AppTheme = "light" | "dark";

const KEY = "cc_theme";

export function getStoredTheme(): AppTheme | null {
  const v = localStorage.getItem(KEY);
  return v === "dark" || v === "light" ? v : null;
}

export function applyTheme(theme: AppTheme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function storeTheme(theme: AppTheme) {
  localStorage.setItem(KEY, theme);
  applyTheme(theme);
}

export function initTheme(): AppTheme {
  let t = getStoredTheme();
  if (!t) {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    t = prefersDark ? "dark" : "light";
    storeTheme(t);
  } else {
    applyTheme(t);
  }
  return t;
}
