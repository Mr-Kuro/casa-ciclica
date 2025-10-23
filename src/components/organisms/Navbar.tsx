import React, { useEffect, useRef, useState } from "react";
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
  // Logical open state (for ARIA / button label)
  const [open, setOpen] = useState(false);
  // Keeps mobile nav mounted during exit animation to avoid abrupt removal
  const [showMobileNav, setShowMobileNav] = useState(false);
  // Current animation class (enter/exit)
  const [animClass, setAnimClass] = useState<string>("");
  const exitTimerRef = useRef<number | null>(null);
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

  function openMobileNav() {
    // Cancel any pending exit cleanup
    if (exitTimerRef.current) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    setShowMobileNav(true);
    // Next frame to ensure element is mounted before animation
    requestAnimationFrame(() => {
      setOpen(true);
      setAnimClass("nav-mobile-enter");
    });
  }

  function closeMobileNav() {
    setOpen(false);
    setAnimClass("nav-mobile-exit");
    // Unmount after exit animation duration (~180ms)
    exitTimerRef.current = window.setTimeout(() => {
      setShowMobileNav(false);
      setAnimClass("");
      exitTimerRef.current = null;
    }, 190);
  }

  function toggleMobileNav() {
    if (open) closeMobileNav();
    else openMobileNav();
  }

  return (
    // Tornar a navbar sticky para permanecer visível durante scroll
    <header className="sticky top-0 z-40 navbar shadow">
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
            onClick={toggleMobileNav}
            className="menu-toggle focus:outline-none focus:ring-0"
            aria-label={
              open ? LABELS.navigation.fechar : LABELS.navigation.menu
            }
            aria-pressed={open}
          >
            {open ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="15" y2="18" />
              </svg>
            )}
            <span className="sr-only">
              {open ? LABELS.navigation.fechar : LABELS.navigation.menu}
            </span>
          </button>
        </div>
      </div>
      {showMobileNav && (
        <div
          className={
            "md:hidden navbar-vertical px-4 py-2 space-y-1 nav-mobile-base nav-mobile-overlay " +
            animClass
          }
          aria-hidden={!open}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => closeMobileNav()}
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
