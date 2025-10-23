import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "../../branding";
import { LABELS } from "@constants/strings";

// Itens antes do dropdown Histórico (Histórico deve vir antes de Config)
const navItemsAntesHistorico = [
  {
    to: "/tarefas/nova",
    label: LABELS.navigation.nova,
    highlight: true,
    first: true,
  },
  { to: "/", label: LABELS.navigation.inicio },
];
const navItemConfig = { to: "/config", label: LABELS.navigation.config };

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

  const navigate = useNavigate();
  const location = useLocation();

  // Determinar valor atual do select de histórico
  const historyValue = location.pathname.startsWith("/historico/desativadas")
    ? "desativadas"
    : location.pathname.startsWith("/historico/concluidas")
    ? "concluidas"
    : "";
  const isHistoryActive = historyValue !== "";

  // Dropdown custom para histórico
  // Estados separados para dropdown desktop e mobile (evita interferência)
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyOpenMobile, setHistoryOpenMobile] = useState(false);
  const historyBtnRef = useRef<HTMLButtonElement | null>(null);
  const historyMenuRef = useRef<HTMLUListElement | null>(null);
  const historyOptionRefs = useRef<HTMLButtonElement[]>([]);
  // Focus management index
  const [historyFocusIndex, setHistoryFocusIndex] = useState<number>(-1);
  function goHistory(value: string) {
    if (value === "concluidas") navigate("/historico/concluidas");
    else if (value === "desativadas") navigate("/historico/desativadas");
    else navigate("/");
    setHistoryOpen(false);
    // After navigation, restore focus to trigger button for continuity
    requestAnimationFrame(() => historyBtnRef.current?.focus());
  }
  function toggleHistory() {
    setHistoryOpen((o) => {
      const next = !o;
      if (next) {
        // Reset focus index when opening
        setHistoryFocusIndex(-1);
      }
      return next;
    });
  }
  function toggleHistoryMobile() {
    setHistoryOpenMobile((o) => !o);
  }
  useEffect(() => {
    function onDocKey(e: KeyboardEvent) {
      if (!historyOpen && !historyOpenMobile) return;
      if (e.key === "Escape") {
        if (historyOpen) {
          setHistoryOpen(false);
          historyBtnRef.current?.focus();
        }
        if (historyOpenMobile) {
          setHistoryOpenMobile(false);
        }
        return;
      }
      // Desktop dropdown only keyboard navigation
      if (historyOpen && historyMenuRef.current) {
        const options = historyOptionRefs.current;
        if (!options.length) return;
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHistoryFocusIndex((prev) => {
            const next = prev < options.length - 1 ? prev + 1 : 0;
            options[next]?.focus();
            return next;
          });
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHistoryFocusIndex((prev) => {
            const next = prev > 0 ? prev - 1 : options.length - 1;
            options[next]?.focus();
            return next;
          });
        } else if (e.key === "Home") {
          e.preventDefault();
          options[0]?.focus();
          setHistoryFocusIndex(0);
        } else if (e.key === "End") {
          e.preventDefault();
          const last = options.length - 1;
          options[last]?.focus();
          setHistoryFocusIndex(last);
        } else if (e.key === "Enter" || e.key === " ") {
          // Space or Enter activates focused option
          if (historyFocusIndex >= 0 && historyFocusIndex < options.length) {
            e.preventDefault();
            options[historyFocusIndex]?.click();
          }
        } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
          // Typeahead: jump to first option starting with typed letter
          const lower = e.key.toLowerCase();
          const idx = options.findIndex((btn) =>
            btn.textContent?.trim().toLowerCase().startsWith(lower)
          );
          if (idx >= 0) {
            options[idx]?.focus();
            setHistoryFocusIndex(idx);
          }
        }
      }
    }
    function onDocClick(e: MouseEvent) {
      if (!historyOpen && !historyOpenMobile) return;
      const target = e.target as Node;
      if (historyOpen) {
        if (
          historyMenuRef.current &&
          historyBtnRef.current &&
          !historyMenuRef.current.contains(target) &&
          !historyBtnRef.current.contains(target)
        ) {
          setHistoryOpen(false);
        }
      }
      // Mobile: fecha se click fora da área expandida (ex: abaixo do dropdown)
      if (historyOpenMobile) {
        const mobileArea = document.getElementById("history-mobile-area");
        if (mobileArea && !mobileArea.contains(target)) {
          setHistoryOpenMobile(false);
        }
      }
    }
    document.addEventListener("keydown", onDocKey);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("keydown", onDocKey);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [historyOpen, historyOpenMobile]);

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
          {navItemsAntesHistorico.map((item) => (
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
          {/* Dropdown Histórico (agora antes de Config) */}
          <div className="ml-2 relative" role="presentation">
            <button
              ref={historyBtnRef}
              type="button"
              className={`tab text-sm font-medium px-3 py-2 rounded flex items-center gap-1 ${
                isHistoryActive
                  ? "tab-active !bg-[var(--cc-bg-alt)] !text-[var(--cc-primary)]"
                  : ""
              } ${historyOpen ? "ring-1 ring-[var(--cc-focus)]" : ""}`}
              aria-haspopup="listbox"
              aria-expanded={historyOpen}
              aria-controls="history-menu"
              aria-label="Abrir menu de histórico"
              onClick={toggleHistory}
            >
              <span>
                {historyValue === "concluidas"
                  ? LABELS.navigation.concluidas
                  : historyValue === "desativadas"
                  ? LABELS.navigation.desativadas
                  : "Histórico"}
              </span>
              <span className="text-[10px] opacity-70" aria-hidden="true">
                {historyOpen ? "▴" : "▾"}
              </span>
            </button>
            {historyOpen && (
              <ul
                id="history-menu"
                ref={historyMenuRef}
                role="listbox"
                aria-label="Histórico de tarefas"
                className="absolute mt-1 min-w-[160px] z-50 rounded shadow bg-[var(--cc-bg-alt)] border border-[var(--cc-border)] focus:outline-none divide-y divide-[var(--cc-border)] dropdown-anim-enter"
              >
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={historyValue === ""}
                    aria-label="Ir para página inicial"
                    className={`dropdown-item w-full text-left px-3 py-2 text-xs hover:bg-[var(--cc-surface-2)] ${
                      historyValue === "" ? "active-option" : ""
                    }`}
                    onClick={() => goHistory("")}
                    ref={(el) => {
                      if (el) historyOptionRefs.current[0] = el;
                    }}
                  >
                    Início
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={historyValue === "concluidas"}
                    aria-label="Ver histórico de tarefas concluídas"
                    className={`dropdown-item w-full text-left px-3 py-2 text-xs hover:bg-[var(--cc-surface-2)] ${
                      historyValue === "concluidas" ? "active-option" : ""
                    }`}
                    onClick={() => goHistory("concluidas")}
                    ref={(el) => {
                      if (el) historyOptionRefs.current[1] = el;
                    }}
                  >
                    {LABELS.navigation.concluidas}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={historyValue === "desativadas"}
                    aria-label="Ver histórico de tarefas desativadas"
                    className={`dropdown-item w-full text-left px-3 py-2 text-xs hover:bg-[var(--cc-surface-2)] ${
                      historyValue === "desativadas" ? "active-option" : ""
                    }`}
                    onClick={() => goHistory("desativadas")}
                    ref={(el) => {
                      if (el) historyOptionRefs.current[2] = el;
                    }}
                  >
                    {LABELS.navigation.desativadas}
                  </button>
                </li>
              </ul>
            )}
          </div>
          {/* Link Config após Histórico */}
          <NavLink key={navItemConfig.to} to={navItemConfig.to} end={false}>
            {({ isActive }) => (
              <span
                role="tab"
                aria-selected={isActive}
                className={`tab text-sm font-medium ${
                  isActive
                    ? "!bg-[var(--cc-bg-alt)] !text-[var(--cc-primary)]"
                    : ""
                }`}
              >
                {navItemConfig.label}
              </span>
            )}
          </NavLink>
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
          {[...navItemsAntesHistorico, navItemConfig].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => closeMobileNav()}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm font-medium ${
                  isActive ? "navbar-overlay-btn" : "hover:navbar-overlay-btn"
                } ${
                  "first" in item && (item as any).first
                    ? "nav-mobile-after-first"
                    : ""
                }`
              }
            >
              {"highlight" in item && (item as any).highlight ? (
                <span className="cc-anim-add-task-text">{item.label}</span>
              ) : (
                item.label
              )}
            </NavLink>
          ))}
          {/* Dropdown histórico versão mobile */}
          <div className="pt-2" id="history-mobile-area">
            <label
              htmlFor="history-select-mobile"
              className="text-[10px] uppercase tracking-wide opacity-80 block mb-1"
            >
              Histórico
            </label>
            <div className="relative">
              <button
                type="button"
                className={`w-full text-left tab text-sm font-medium px-3 py-3 rounded flex items-center justify-between ${
                  isHistoryActive
                    ? "tab-active !bg-[var(--cc-bg-alt)] !text-[var(--cc-primary)]"
                    : ""
                }`}
                aria-haspopup="listbox"
                aria-expanded={historyOpenMobile}
                onClick={toggleHistoryMobile}
              >
                <span className="text-sm">
                  {historyValue === "concluidas"
                    ? LABELS.navigation.concluidas
                    : historyValue === "desativadas"
                    ? LABELS.navigation.desativadas
                    : "Selecionar..."}
                </span>
                <span className="text-[10px] opacity-70" aria-hidden="true">
                  {historyOpenMobile ? "▴" : "▾"}
                </span>
              </button>
              {historyOpenMobile && (
                <ul
                  role="listbox"
                  aria-label="Histórico de tarefas"
                  className="absolute mt-1 w-full z-50 rounded shadow bg-[var(--cc-bg-alt)] border border-[var(--cc-border)] divide-y divide-[var(--cc-border)] dropdown-anim-enter"
                >
                  <li>
                    <button
                      type="button"
                      role="option"
                      aria-selected={historyValue === ""}
                      className={`dropdown-item w-full text-left px-3 py-2 text-xs hover:bg-[var(--cc-surface-2)] ${
                        historyValue === "" ? "active-option" : ""
                      }`}
                      onClick={() => {
                        goHistory("");
                        closeMobileNav();
                        setHistoryOpenMobile(false);
                      }}
                    >
                      Início
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      role="option"
                      aria-selected={historyValue === "concluidas"}
                      className={`dropdown-item w-full text-left px-3 py-2 text-xs hover:bg-[var(--cc-surface-2)] ${
                        historyValue === "concluidas" ? "active-option" : ""
                      }`}
                      onClick={() => {
                        goHistory("concluidas");
                        closeMobileNav();
                        setHistoryOpenMobile(false);
                      }}
                    >
                      {LABELS.navigation.concluidas}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      role="option"
                      aria-selected={historyValue === "desativadas"}
                      className={`dropdown-item w-full text-left px-3 py-2 text-xs hover:bg-[var(--cc-surface-2)] ${
                        historyValue === "desativadas" ? "active-option" : ""
                      }`}
                      onClick={() => {
                        goHistory("desativadas");
                        closeMobileNav();
                        setHistoryOpenMobile(false);
                      }}
                    >
                      {LABELS.navigation.desativadas}
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
