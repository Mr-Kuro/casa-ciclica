import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME, AUTHOR_NAME, AUTHOR_LINK, TECH_STACK } from "../../branding";
import { LABELS } from "@constants/strings";

export const Footer: React.FC = () => {
  return (
    <footer
      className="mt-auto border-t text-sm"
      style={{
        background: "var(--cc-bg-alt)",
        color: "var(--cc-text)",
        borderColor: "var(--cc-border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-5 text-sm">
        <div className="space-y-2">
          <h2
            className="font-semibold text-sm"
            style={{ color: "var(--cc-text)" }}
          >
            Aplicação
          </h2>
          <p className="text-xs leading-relaxed">
            Gerenciador de tarefas domésticas recorrentes para rotina da casa.
          </p>
        </div>
        <div className="space-y-2">
          <h3
            className="font-semibold text-sm"
            style={{ color: "var(--cc-text)" }}
          >
            Navegação
          </h3>
          <ul className="space-y-1">
            <li>
              <Link
                to="/"
                className="hover:underline"
                style={{ color: "var(--cc-text)" }}
              >
                {LABELS.navigation.inicio}
              </Link>
            </li>
            <li>
              <Link
                to="/tarefas/nova"
                className="hover:underline"
                style={{ color: "var(--cc-text)" }}
              >
                {LABELS.navigation.novaTarefa}
              </Link>
            </li>
            <li>
              <Link
                to="/desativadas"
                className="hover:underline"
                style={{ color: "var(--cc-text)" }}
              >
                {LABELS.navigation.desativadas}
              </Link>
            </li>
            <li>
              <Link
                to="/config"
                className="hover:underline"
                style={{ color: "var(--cc-text)" }}
              >
                {LABELS.campos.config}
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h3
            className="font-semibold text-sm"
            style={{ color: "var(--cc-text)" }}
          >
            Tecnologias
          </h3>
          <ul className="space-y-1 text-xs">
            {TECH_STACK.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h3
            className="font-semibold text-sm"
            style={{ color: "var(--cc-text)" }}
          >
            Status
          </h3>
          <ul className="space-y-1 text-xs">
            <li>{LABELS.feedback.persistencia}</li>
            <li>{LABELS.feedback.seedsDinamicos}</li>
            <li>{LABELS.feedback.filtrosResumo}</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h3
            className="font-semibold text-sm"
            style={{ color: "var(--cc-text)" }}
          >
            Créditos
          </h3>
          <p className="text-xs leading-relaxed">
            Desenvolvido por{" "}
            <a
              href={AUTHOR_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
              style={{ color: "var(--cc-link)" }}
            >
              {AUTHOR_NAME}
            </a>
          </p>
          <p className="text-xs">Feito com foco em simplicidade incremental.</p>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} {APP_NAME}
          </p>
        </div>
      </div>
      <div
        className="text-[11px] py-3 text-center"
        style={{
          background: "var(--cc-bg)",
          borderTop: "1px solid var(--cc-border)",
          color: "var(--cc-muted)",
        }}
      >
        <span>{LABELS.feedback.designNota}</span>
      </div>
    </footer>
  );
};
