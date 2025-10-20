import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "../../branding";
import { LABELS } from "../../constants/strings";

const navItems = [
  { to: "/", label: LABELS.navigation.inicio },
  { to: "/tarefas/nova", label: LABELS.navigation.nova },
  { to: "/concluidas", label: LABELS.navigation.concluidas },
  { to: "/desativadas", label: LABELS.navigation.desativadas },
  { to: "/config", label: LABELS.navigation.config },
];

export const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("prefTheme");
    if (stored === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggleTheme() {
    setDark((d) => {
      const next = !d;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("prefTheme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("prefTheme", "light");
      }
      return next;
    });
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
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "navbar-overlay-btn shadow-inner"
                    : "hover:navbar-overlay-btn"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={toggleTheme}
            className="ml-2 px-3 py-2 rounded text-sm font-medium navbar-overlay-btn focus:outline-none focus:ring transition-colors duration-300"
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
            className="px-3 py-2 rounded text-sm font-medium navbar-overlay-btn focus:outline-none focus:ring transition-colors duration-300"
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
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
