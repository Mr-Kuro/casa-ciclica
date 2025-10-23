import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "../../branding";
import { LABELS } from "@constants/strings";

const navItems = [
  {
    to: "/tarefas/nova",
    label: LABELS.navigation.nova,
    highlight: true,
    first: true,
  },
  { to: "/", label: LABELS.navigation.inicio },
  { to: "/desativadas", label: LABELS.navigation.desativadas },
  { to: "/config", label: LABELS.navigation.config },
];

export const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState<boolean>(
    () =>
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("cc_theme") === "dark"
  );
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);
  function toggleTheme() {
    const next = !dark;
    const theme = next ? "dark" : "light";
    localStorage.setItem("cc_theme", theme);
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    setDark(next);
  }

  return (
    <header className="relative z-30 navbar shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded bg-white/10 backdrop-blur text-xs font-semibold">
            CC
          </span>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold tracking-wide">{APP_NAME}</h1>
            <span className="text-[10px] uppercase tracking-wider opacity-80">
              {APP_TAGLINE}
            </span>
          </div>
        </div>
        <nav
          className="hidden md:flex items-center gap-1 tabs nav-tabs-container"
          role="tablist"
          aria-label="Navegação principal"
        >
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"}>
              {({ isActive }) => (
                <span
                  role="tab"
                  aria-selected={isActive}
                  className={`tab text-sm font-medium ${
                    isActive
                      ? "!bg-[var(--cc-bg-alt)] !text-[var(--cc-primary)]"
                      : ""
                  } ${item.first ? "nav-separator-right" : ""}`}
                >
                  {item.highlight ? (
                    <span className="cc-anim-add-task-text">{item.label}</span>
                  ) : (
                    item.label
                  )}
                </span>
              )}
            </NavLink>
          ))}
          <button
            onClick={toggleTheme}
            className="ml-2 theme-toggle focus:outline-none focus:ring-0"
            aria-label="Alternar tema"
            aria-pressed={dark}
          >
            <span className="inline-flex items-center gap-1">
              {dark ? (
                <>
                  <span role="img" aria-hidden="true">
                    ☀️
                  </span>
                  <span className="sr-only">Mudar para modo claro</span>
                  <span className="text-xs">Claro</span>
                </>
              ) : (
                <>
                  <span role="img" aria-hidden="true">
                    🌙
                  </span>
                  <span className="sr-only">Mudar para modo escuro</span>
                  <span className="text-xs">Escuro</span>
                </>
              )}
            </span>
          </button>
        </nav>
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="theme-toggle focus:outline-none focus:ring-0"
            aria-label="Alternar tema"
            aria-pressed={dark}
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="px-3 py-2 rounded text-sm font-medium navbar-overlay-btn"
            aria-label={
              open ? LABELS.navigation.fechar : LABELS.navigation.menu
            }
          >
            {open ? LABELS.navigation.fechar : LABELS.navigation.menu}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden navbar-vertical px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm font-medium ${
                  isActive ? "navbar-overlay-btn" : "hover:navbar-overlay-btn"
                } ${item.first ? "nav-mobile-after-first" : ""}`
              }
            >
              {item.highlight ? (
                <span className="cc-anim-add-task-text">{item.label}</span>
              ) : (
                item.label
              )}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
